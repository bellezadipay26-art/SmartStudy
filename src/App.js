import React, { useEffect } from "react";
import "./App.css";
import { auth } from "./services/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signin from "./components/Signin/Signin";
import Navbar from "./components/Navbar/Navbar";
import Matching from "./components/Matching/Matching.js";
import Accounts from "./components/Accounts/Accounts.js";
import ChatPage from "./components/Messages/ChatPage.js";
import UserProfilePage from "./components/Matching/UserProfilePage.js";

const App = () => {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    const platform = window.Capacitor?.getPlatform?.();
  const isAndroidUA = /Android/i.test(navigator.userAgent);

  if (platform === "android" || isAndroidUA) {
    document.documentElement.classList.add("android");
  } else {
    document.documentElement.classList.remove("android");
  }
}, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      ) : (
        <div className="App">
          <div className="navbar-container">
            <div className="navbar">
              <Navbar />
            </div>
          </div>

          <div className="content-container">
            <Routes>
              <Route path="/" element={<Navigate to="/match" replace />} />
              <Route path="/match" element={<Matching />} />
              <Route path="/messages" element={<ChatPage currentUserUid={user.uid} />} />
              <Route path="/accounts" element={<Accounts user={user} />} />
              <Route path="/user/:uid" element={<UserProfilePage />} />
              <Route path="*" element={<Navigate to="/match" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;