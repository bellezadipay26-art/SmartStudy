// Messages.js
import React, { useEffect, useMemo, useState } from "react";
import "./Messages.css";
import { db, storage } from "../../services/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Messages = ({ currentUserUid, matchUid }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // attachments
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // matchUid can be chatId already (example: uid_uid)
  const chatId = useMemo(() => {
    if (!currentUserUid || !matchUid) return null;

    // if already chatId, use it
    if (String(matchUid).includes("_")) return String(matchUid);

    // otherwise compute chatId from 2 uids
    return currentUserUid < matchUid
      ? `${currentUserUid}_${matchUid}`
      : `${matchUid}_${currentUserUid}`;
  }, [currentUserUid, matchUid]);

  // realtime listener
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(rows);
    });

    return () => unsub();
  }, [chatId]);

  const handlePickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    // optional limit
    const merged = [...files, ...picked].slice(0, 5);
    setFiles(merged);

    // allow re-pick same file
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadOneFile = async (file) => {
    const safeName = file.name.replace(/\s+/g, "_");
    const path = `chats/${chatId}/${Date.now()}_${safeName}`;
    const fileRef = ref(storage, path);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    return {
      url,
      name: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      path,
    };
  };

  const sendMessage = async () => {
    if (!chatId) return;

    const hasText = newMessage.trim() !== "";
    const hasFiles = files.length > 0;

    if (!hasText && !hasFiles) return;

    try {
      setUploading(true);

      let attachments = [];
      if (hasFiles) {
        attachments = await Promise.all(files.map(uploadOneFile));
      }

      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderUid: currentUserUid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        attachments,
      });

      setNewMessage("");
      setFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="messages-container">
      <div className="messages">
        {messages.map((message) => {
          const mine = message.senderUid === currentUserUid;

          return (
            <div
              key={message.id}
              className={mine ? "message right" : "message left"}
            >
              <strong>{mine ? "You" : "Other User"}:</strong>{" "}
              {message.text || ""}

              {/* attachments render */}
              {Array.isArray(message.attachments) &&
                message.attachments.length > 0 && (
                  <div className="msg-attachments">
                    {message.attachments.map((a, idx) => {
                      const isImage = a.contentType?.startsWith("image/");
                      return (
                        <div key={idx} className="msg-attachment">
                          {isImage ? (
                            <img className="msg-image" src={a.url} alt={a.name} />
                          ) : (
                            <a
                              className="msg-file"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              📎 {a.name}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* selected files preview */}
      {files.length > 0 && (
        <div className="file-preview">
          {files.map((f, i) => (
            <div key={i} className="file-chip">
              <span className="file-name">{f.name}</span>
              <button
                type="button"
                className="file-remove"
                onClick={() => removeFile(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-container">
        {/* attach button */}
        <label className="attach-btn" title="Attach files">
          📎
          <input
            type="file"
            multiple
            onChange={handlePickFiles}
            style={{ display: "none" }}
          />
        </label>

        <input
          className="text-field"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={uploading}
        />

        <button
          className="send-button"
          onClick={sendMessage}
          type="button"
          disabled={uploading}
        >
          {uploading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Messages;