import { deleteUser } from "firebase/auth";
import { db } from "../../services/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import "./Accounts.css";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import {
  updateUserInformation,
  fetchUserDetails,
  addUserInformation,
} from "../../services/account";

const SUBJECT_OPTIONS = [
  "Programming",
  "Physics",
  "Data Structures",
  "Algorithms",
  "Database Systems",
  "Web Development",
  "Networking",
  "Software Engineering",
  "Operating Systems",
];

const SCHEDULE_OPTIONS = [
  "Weekdays, 6 PM - 9 PM",
  "Weekdays, 7 PM - 10 PM",
  "Weekends, 9 AM - 12 PM",
  "Weekends, 1 PM - 4 PM",
  "Anytime (Flexible)",
];

const Accounts = () => {
  // State variables for user information
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [yearsOfStudy, setYearsOfStudy] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Current Courses -> Subjects (max 5)
  const [subjects, setSubjects] = useState([]);
  const [subjectPick, setSubjectPick] = useState("");

  // ✅ Past Courses -> Preferred Schedule (single)
  const [preferredSchedule, setPreferredSchedule] = useState("");

  const [user, setUser] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [base64Image, setBase64Image] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);

        const userDetails = await fetchUserDetails(authUser.uid);
        console.log(userDetails);

        if (userDetails) {
          setName(userDetails.name || "");
          setMajor(userDetails.major || "");
          setYearsOfStudy(userDetails.yearsOfStudy || "");
          setDescription(userDetails.description || "");

          // ✅ load subjects + schedule
          setSubjects(userDetails.currentCourses || []);
          setPreferredSchedule(userDetails.preferredSchedule || "");

          // image from firestore usually base64 (no "data:" prefix)
          setPreviewImage(userDetails.image || "");
          setBase64Image(userDetails.image || "");
        } else {
          addUserInformation(authUser.uid);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Subjects dropdown handler (max 5)
  const handleSubjectSelect = (e) => {
    const value = e.target.value;
    if (!value) return;

    // reset dropdown after pick
    setSubjectPick("");

    // no duplicates
    if (subjects.includes(value)) return;

    // max 5
    if (subjects.length >= 5) {
      alert("You can select up to 5 subjects only.");
      return;
    }

    setSubjects([...subjects, value]);
  };

  const removeSubject = (subj) => {
    setSubjects(subjects.filter((s) => s !== subj));
  };

  // Function to convert image file to base64 with downsampling
  const convertImageToBase64 = (imageFile, maxSizeInBytes) => {
    return new Promise((resolve, reject) => {
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;
          const aspectRatio = width / height;
          const maxDimension = Math.sqrt(maxSizeInBytes);

          if (width > height) {
            width = maxDimension;
            height = width / aspectRatio;
          } else {
            height = maxDimension;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const base64String = canvas.toDataURL("image/jpeg", 0.9);
          setIsProcessing(false);
          resolve(base64String);
        };
        img.src = event.target.result;
      };

      reader.onerror = (error) => {
        setIsProcessing(false);
        reject(error);
      };

      reader.readAsDataURL(imageFile);
    });
  };

  // Function to handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // preview as dataURL
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    const base64String = await convertImageToBase64(file, 1048487);
    const final = base64String.split(",")[1];
    setBase64Image(final);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isProcessing) {
      console.log("Image is still processing. Please wait.");
      return;
    }

    const userData = {
      name,
      major,
      yearsOfStudy,
      description,

      // ✅ store subjects in currentCourses field (same as before)
      currentCourses: subjects,

      // ✅ store schedule
      preferredSchedule,

      image: base64Image || null,
    };

    console.log(userData);

    await updateUserInformation(user.uid, userData);
    alert("Account updated successfully");
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

      const uid = currentUser.uid;

      await deleteDoc(doc(db, "users", uid));
      await deleteUser(currentUser);

      alert("Account deleted successfully");
    } catch (err) {
      console.error(err);

      if (err?.code === "auth/requires-recent-login") {
        alert("Please sign in again, then try Delete Account.");
      } else {
        alert("Delete failed. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ preview src fix:
  // if previewImage already starts with "data:", use it.
  // else assume it's base64 only.
  const previewSrc =
    previewImage && previewImage.startsWith("data:")
      ? previewImage
      : previewImage
      ? `data:image/png;base64,${previewImage}`
      : "";

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

        {/* ✅ Past Courses -> Preferred Schedule */}
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

        {/* ✅ Current Courses -> Subjects dropdown (max 5) */}
        <label>
          Subjects (max 5):
          <select value={subjectPick} onChange={handleSubjectSelect}>
            <option value="">Select subjects you are studying</option>
            {SUBJECT_OPTIONS.map((subj) => (
              <option key={subj} value={subj} disabled={subjects.includes(subj)}>
                {subj}
              </option>
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
            {subjects.length}/5 selected
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
              style={{ height: "400px", width: "auto", borderRadius: "10px" }}
              src={previewSrc}
              alt="Preview"
            />
          </div>
        )}

        <button disabled={isProcessing}>Update Account</button>

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
