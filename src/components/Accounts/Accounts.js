// Accounts.js
import React, { useEffect, useState } from "react";
import "./Accounts.css";
import { useNavigate } from "react-router-dom";

import { deleteUser } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  updateUserInformation,
  fetchUserDetails,
  addUserInformation,
} from "../../services/account";

/* =========================================================
   CLEAN GROUPED SUBJECT OPTIONS (for <optgroup>)
   ========================================================= */
const SUBJECT_GROUPS = [
  {
    label: "FIRST YEAR - First Semester",
    options: [
      "CS 111 - Introduction to Computing",
      "CS 112 - Fundamentals of Programming - C++",
      "GE-US - Understanding the Self",
      "GE-MMW - Mathematics in the Modern World",
      "GE-PC - Purposive Communication",
      "Math 1 - Basic Mathematics",
      "IT 1 - Living in the IT Era",
      "PE 1 - Self-testing Activities",
      "NSTP 1 - National Service Training Program 1",
    ],
  },
  {
    label: "FIRST YEAR - Second Semester",
    options: [
      "CS 121 - Discrete Structures 1",
      "CS 122 - Intermediate Programming - Java Programming",
      "CS 123 - Multimedia Systems",
      "GE-BC - Business Correspondence",
      "GE-STS - Science, Technology, and Society",
      "GE-E - Ethics",
      "GE-CW - The Contemporary World",
      "PE 2 - Rhythmic Activities",
      "NSTP 2 - National Service Training Program 2",
    ],
  },
  {
    label: "SECOND YEAR - First Semester",
    options: [
      "CS 211 - Discrete Structures 2",
      "CS 212 - Object-Oriented Programming - VB.Net",
      "CS 213 - Data Structures and Algorithms",
      "CS 214 - Embedded Systems",
      "Entrep 1 - The Entrepreneurial Mind",
      "GE-AA - Art Appreciation",
      "PE 3 - Individual and Dual Sports",
    ],
  },
  {
    label: "SECOND YEAR - Second Semester",
    options: [
      "CS 221 - Algorithms and Complexity",
      "CS 222 - Information Management",
      "CS 223 - Web Systems and Technologies 1",
      "Math-Elec - Theory of Computation",
      "Ecos 1 - People and the Earth's Ecosystem",
      "GE-RPH - Readings in Philippine History",
      "PE 4 - Recreational Activities",
    ],
  },
  {
    label: "THIRD YEAR - First Semester",
    options: [
      "CS 311 - Automata Theory and Formal Languages",
      "CS 312 - Architecture and Organization",
      "CS 313 - Information Assurance and Security",
      "CS 314 - System Fundamentals - Elective 1",
      "CS 315 - Application Development & Emerging Technologies",
      "CS 316 - Web Systems and Technologies 2",
      "Rizal - Life and Works of Rizal",
    ],
  },
  {
    label: "THIRD YEAR - Second Semester",
    options: [
      "CS 321 - Programming Languages",
      "CS 322 - Software Engineering 1",
      "CS 323 - Social Issues and Professional Practice 1",
      "CS 324 - Graphics and Visual Computing - Elective 2",
      "CS 325 - Mobile Computing 1",
      "CS 326 - Modeling and Simulation",
    ],
  },
  {
    label: "THIRD YEAR - Summer",
    options: ["CS 331 - Practicum (162 hours)"],
  },
  {
    label: "FOURTH YEAR - First Semester",
    options: [
      "CS 411 - Human Computer Interaction",
      "CS 412 - Operating Systems",
      "CS 413 - Software Engineering 2",
      "CS 414 - CS Thesis Writing 1",
      "CS 415 - Intelligent Systems - Elective 3",
      "CS 416 - Mobile Computing 2",
    ],
  },
  {
    label: "FOURTH YEAR - Second Semester",
    options: [
      "CS 421 - Networks and Communications",
      "CS 422 - CS Thesis Writing 2",
    ],
  },
];

const SCHEDULE_OPTIONS = [
  "Weekdays, 6 PM - 9 PM",
  "Weekdays, 7 PM - 10 PM",
  "Weekends, 9 AM - 12 PM",
  "Weekends, 1 PM - 4 PM",
  "Anytime (Flexible)",
];

const LEARNING_STYLE_OPTIONS = [
  "Visual Learner",
  "Auditory Learner",
  "Kinesthetic Learner",
];

const MAX_SUBJECTS = 5;
const IMAGE_MAX_BYTES = 1048487; // ~1MB

const Accounts = () => {
  // Profile fields
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [yearsOfStudy, setYearsOfStudy] = useState("");
  const [description, setDescription] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");

  // Subjects (selected chips)
  const [subjects, setSubjects] = useState([]);
  const [subjectPick, setSubjectPick] = useState("");

  // Image + auth state
  const [user, setUser] = useState(null);
  const [base64Image, setBase64Image] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  /* =========================================================
     LOAD USER
     ========================================================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      try {
        if (!authUser) {
          navigate("/");
          return;
        }

        setUser(authUser);

        const userDetails = await fetchUserDetails(authUser.uid);

        if (userDetails) {
          setName(userDetails.name || "");
          setMajor(userDetails.major || "");
          setYearsOfStudy(userDetails.yearsOfStudy || "");
          setDescription(userDetails.description || "");
          setLearningStyle(userDetails.learningStyle || "");
          setPreferredSchedule(userDetails.preferredSchedule || "");
          setSubjects(Array.isArray(userDetails.currentCourses) ? userDetails.currentCourses : []);

          // Stored image may be raw base64 (without data: prefix)
          setPreviewImage(userDetails.image || "");
          setBase64Image(userDetails.image || "");
        } else {
          await addUserInformation(authUser.uid);
        }
      } catch (err) {
        console.error("Error loading account data:", err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* =========================================================
     SUBJECTS (MAX 5)
     ========================================================= */
  const handleSubjectSelect = (e) => {
    const value = e.target.value;
    if (!value) return;

    // reset select UI
    setSubjectPick("");

    if (subjects.includes(value)) return;

    if (subjects.length >= MAX_SUBJECTS) {
      alert(`You can select up to ${MAX_SUBJECTS} subjects only.`);
      return;
    }

    setSubjects((prev) => [...prev, value]);
  };

  const removeSubject = (subj) => {
    setSubjects((prev) => prev.filter((s) => s !== subj));
  };

  /* =========================================================
     IMAGE PROCESSING
     ========================================================= */
  const convertImageToBase64 = (file, maxSizeInBytes) => {
    return new Promise((resolve, reject) => {
      setIsProcessing(true);

      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let width = img.width;
            let height = img.height;
            const aspectRatio = width / height;

            // Simple heuristic resize target
            const maxDimension = Math.max(600, Math.floor(Math.sqrt(maxSizeInBytes)));

            if (width > height) {
              width = Math.min(width, maxDimension);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxDimension);
              width = height * aspectRatio;
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setIsProcessing(false);
            resolve(dataUrl);
          } catch (err) {
            setIsProcessing(false);
            reject(err);
          }
        };

        img.onerror = (err) => {
          setIsProcessing(false);
          reject(err);
        };

        img.src = event.target.result;
      };

      reader.onerror = (err) => {
        setIsProcessing(false);
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // quick preview
      const previewReader = new FileReader();
      previewReader.onloadend = () => setPreviewImage(previewReader.result);
      previewReader.readAsDataURL(file);

      // compressed base64 for Firestore
      const dataUrl = await convertImageToBase64(file, IMAGE_MAX_BYTES);
      const rawBase64 = dataUrl.split(",")[1] || "";
      setBase64Image(rawBase64);
    } catch (err) {
      console.error("Image processing failed:", err);
      alert("Image processing failed. Please try another image.");
    }
  };

  /* =========================================================
     SAVE PROFILE
     ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      alert("No user is logged in.");
      return;
    }

    if (isProcessing) {
      alert("Image is still processing. Please wait.");
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        major: major.trim(),
        yearsOfStudy: yearsOfStudy ? String(yearsOfStudy) : "",
        description: description.trim(),
        currentCourses: subjects, // keep your existing Firestore field name
        preferredSchedule,
        learningStyle,
        image: base64Image || null,
      };

      await updateUserInformation(user.uid, userData);
      alert("Account updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Please try again.");
    }
  };

  /* =========================================================
     DELETE ACCOUNT
     ========================================================= */
  const deleteUserInformationByUid = async (uid) => {
    const q = query(collection(db, "user_information"), where("uid", "==", uid));
    const snap = await getDocs(q);

    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Delete account permanently? This cannot be undone.");
    if (!ok) return;

    try {
      setIsDeleting(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("No user is logged in.");
        return;
      }

      await deleteUserInformationByUid(currentUser.uid);
      await deleteUser(currentUser);

      alert("Account deleted successfully");
      navigate("/signin");
    } catch (err) {
      console.error("Delete failed:", err);

      if (err?.code === "auth/requires-recent-login") {
        alert("Please sign in again, then try Delete Account.");
      } else {
        alert("Delete failed. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /* =========================================================
     IMAGE PREVIEW SOURCE FIX
     ========================================================= */
  const previewSrc =
    previewImage && String(previewImage).startsWith("data:")
      ? previewImage
      : previewImage
      ? `data:image/png;base64,${previewImage}`
      : "";

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div className="UpdateProfileContainer">
      <h2>Update Account</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Major:
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
        </label>

        <label>
          Year Level:
          <input
            type="number"
            value={yearsOfStudy}
            onChange={(e) => setYearsOfStudy(e.target.value)}
          />
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Learning Style:
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
          >
            <option value="">Select your learning style</option>
            {LEARNING_STYLE_OPTIONS.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preferred Schedule:
          <select
            value={preferredSchedule}
            onChange={(e) => setPreferredSchedule(e.target.value)}
          >
            <option value="">Select your available schedule</option>
            {SCHEDULE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subjects (max {MAX_SUBJECTS}):
          <select value={subjectPick} onChange={handleSubjectSelect}>
            <option value="">Select subjects you are studying</option>

            {SUBJECT_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((subj) => (
                  <option
                    key={subj}
                    value={subj}
                    disabled={subjects.includes(subj)}
                  >
                    {subj}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="Chips">
            {subjects.map((subj) => (
              <span key={subj} className="Chip">
                {subj}
                <button type="button" onClick={() => removeSubject(subj)}>
                  ×
                </button>
              </span>
            ))}
          </div>

          <div style={{ fontSize: "12px", marginTop: "6px" }}>
            {subjects.length}/{MAX_SUBJECTS} selected
          </div>
        </label>

        <label>
          Profile Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {isProcessing && <div className="Loader">Processing...</div>}

        {previewSrc && (
          <div className="ImagePreview">
            <img
              src={previewSrc}
              alt="Preview"
              style={{ height: "400px", width: "auto", borderRadius: "10px" }}
            />
          </div>
        )}

        <button type="submit" disabled={isProcessing || isDeleting}>
          Update Account
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isProcessing || isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    </div>
  );
};

export default Accounts;