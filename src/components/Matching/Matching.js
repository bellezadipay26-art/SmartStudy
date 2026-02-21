// Matching.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import { fetchUserDetails } from "../../services/account";
import {
  getRandomUsers,
  likeUser,
  dislikeUser, // kept in import if you plan to use skip later
  haveMutualLike,
} from "../../services/matching";

import "./Matching.css";
import TopMatchCard from "./TopMatches/TopMatchCard";
import MatchPopup from "./Popup/Popup";

function Matching() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [myInfo, setMyInfo] = useState(null);

  const navigate = useNavigate();

  const computeMatchPercent = (me, other) => {
    if (!me || !other) return 0;

    const meSubs = new Set(me.currentCourses || []);
    const otherSubs = new Set(other.currentCourses || []);

    const overlap = [...meSubs].filter((s) => otherSubs.has(s)).length;
    const maxSubs = Math.max(meSubs.size, otherSubs.size, 1);
    const subjectScore = overlap / maxSubs;

    const scheduleScore =
      me.preferredSchedule &&
      other.preferredSchedule &&
      me.preferredSchedule === other.preferredSchedule
        ? 1
        : 0;

    const styleScore =
      me.learningStyle &&
      other.learningStyle &&
      me.learningStyle === other.learningStyle
        ? 1
        : 0;

    const majorScore =
      me.major &&
      other.major &&
      me.major.trim().toLowerCase() === other.major.trim().toLowerCase()
        ? 1
        : 0;

    const yearScore =
      me.yearsOfStudy &&
      other.yearsOfStudy &&
      String(me.yearsOfStudy) === String(other.yearsOfStudy)
        ? 1
        : 0;

    let pct =
      subjectScore * 50 +
      scheduleScore * 20 +
      styleScore * 20 +
      majorScore * 5 +
      yearScore * 5;

    pct = Math.round(pct);

    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    return pct;
  };

  const sortUsersByMatchDesc = (list) => {
    return [...(list || [])].sort((a, b) => {
      const aPct = Number(a?.matchPercent ?? 0);
      const bPct = Number(b?.matchPercent ?? 0);

      // Highest percentage first
      if (bPct !== aPct) return bPct - aPct;

      // Tie breaker for stable/clean ordering
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  };

  // Auth guard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setCurrentUser(authUser);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load current user's profile details
  useEffect(() => {
    const loadMyInfo = async () => {
      if (!currentUser?.uid) return;

      try {
        const info = await fetchUserDetails(currentUser.uid);
        setMyInfo(info || null);
      } catch (error) {
        console.error("Error loading current user info:", error);
        setMyInfo(null);
      }
    };

    loadMyInfo();
  }, [currentUser]);

  // Fetch match candidates + compute % + sort descending
  useEffect(() => {
    const fetchRandomUsersList = async () => {
      try {
        if (!currentUser?.uid || !myInfo) return;

        const randomizedUsers = await getRandomUsers(10, currentUser.uid);

        const usersWithMatch = (randomizedUsers || []).map((u) => ({
          ...u,
          matchPercent: computeMatchPercent(myInfo, u),
        }));

        setUsers(sortUsersByMatchDesc(usersWithMatch));
      } catch (error) {
        console.error("Error fetching randomized users:", error);
      }
    };

    fetchRandomUsersList();
  }, [currentUser, myInfo]);

  // View Profile button
  const handleViewProfile = (userData) => {
    console.log("UID:", userData?.uid, userData);
    if (!userData?.uid) return;
    navigate(`/user/${userData.uid}`);
  };

  // Connect button (LIKE)
  const handleConnect = async (userData) => {
    try {
      if (!currentUser?.uid || !userData?.uid) return;

      await likeUser(currentUser.uid, userData.uid);

      const mutual = await haveMutualLike(currentUser.uid, userData.uid);
      if (mutual) {
        setShowMatchPopup(true);
        setTimeout(() => setShowMatchPopup(false), 2400);
      }

      // Remove connected user from list
      setUsers((prev) => prev.filter((u) => u.uid !== userData.uid));
    } catch (error) {
      console.error("Error on connect:", error);
    }
  };

  // OPTIONAL SKIP (if you want it later)
  // const handleSkip = async (userData) => {
  //   try {
  //     if (!currentUser?.uid || !userData?.uid) return;
  //     await dislikeUser(currentUser.uid, userData.uid);
  //     setUsers((prev) => prev.filter((u) => u.uid !== userData.uid));
  //   } catch (error) {
  //     console.error("Error on skip:", error);
  //   }
  // };

  return (
    <div className="Matching">
      <div style={{ textAlign: "left", maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 6 }}>Your Top Matches</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Based on your preferences and study goals.
        </p>
      </div>

      <div className="TopMatchesContainer">
        {users.map((userData) => (
          <TopMatchCard
            key={userData.uid}
            userData={userData}
            onViewProfile={handleViewProfile}
            onConnect={handleConnect}
          />
        ))}
      </div>

      {showMatchPopup && (
        <MatchPopup onClose={() => setShowMatchPopup(false)} />
      )}

      <div style={{ maxWidth: 520, margin: "10px auto 0" }}>
        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#2f8cff",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
          type="button"
        >
          BACK
        </button>
      </div>
    </div>
  );
}

export default Matching;