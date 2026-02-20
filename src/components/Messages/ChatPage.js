// ChatPage.js
import React, { useState } from "react";
import Messages from "./Messages";
import Sidebar from "./Sidebar/Sidebar";
import ProfileCardMessaging from "./ProfileCardMessaging";
import "./ChatPage.css";

const ChatPage = ({ currentUserUid }) => {
  // this is the OTHER user's uid (match uid)
  const [selectedChatUid, setSelectedChatUid] = useState(null);

  const handleChatSelect = (otherUserUid) => {
    setSelectedChatUid(otherUserUid);
  };

  return (
    <div className={`chat-page-container ${selectedChatUid ? "has-chat" : ""}`}>
      <Sidebar
        currentUserUid={currentUserUid}
        onChatSelect={handleChatSelect}
        selectedUid={selectedChatUid}   // optional highlight
      />

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