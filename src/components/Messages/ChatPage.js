// ChatPage.js
import React, { useState, useEffect } from "react";
import Messages from "./Messages";
import Sidebar from "./Sidebar/Sidebar";
import ProfileCardMessaging from "./ProfileCardMessaging";
import "./ChatPage.css";

const ChatPage = ({ currentUserUid }) => {
  const [selectedChatUid, setSelectedChatUid] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleChatSelect = (otherUserUid) => setSelectedChatUid(otherUserUid);

  useEffect(() => {
    const compute = () => {
      const platform = window.Capacitor?.getPlatform?.();
      const isAndroidUA = /Android/i.test(navigator.userAgent);
      const small = window.innerWidth <= 900;
      setIsMobile(platform === "android" || isAndroidUA || small);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div
      className={`chat-page-container ${selectedChatUid ? "has-chat" : ""} ${
        isMobile ? "mobile" : ""
      }`}
    >
      <Sidebar currentUserUid={currentUserUid} onChatSelect={handleChatSelect} />

      {selectedChatUid && isMobile && (
        <div className="mobile-chat-topbar">
          <button className="mobile-back" onClick={() => setSelectedChatUid(null)}>
            Back
          </button>
          <div className="mobile-title">Chat</div>
        </div>
      )}

      {selectedChatUid && (
        <>
          <Messages currentUserUid={currentUserUid} matchUid={selectedChatUid} />
          <div className="profile-pane">
            <ProfileCardMessaging selected={selectedChatUid} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;