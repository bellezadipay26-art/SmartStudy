/*TopMatchCard.js*/

import React from "react";
import "./TopMatches.css";

const TopMatchCard = ({ userData, onViewProfile, onConnect }) => {
  const {
    name = "",
    preferredSchedule = "",
    learningStyle = "",
    yearsOfStudy = "",
    currentCourses = [],
    major = "",
    uid = "",
    image = "",
    matchPercent = 0,
  } = userData || {};

  const subjectsText = Array.isArray(currentCourses)
    ? currentCourses.join(", ")
    : "";

  const scheduleText = preferredSchedule || "No schedule set";

  return (
    <div className="tm-card" id={`topmatch_${uid}`}>
      <div className="tm-row">
        <div className="tm-avatar">
          {image ? (
            <img src={`data:image/png;base64,${image}`} alt="User" />
          ) : (
            <div className="tm-avatar-placeholder" />
          )}
        </div>

        <div className="tm-main">
          <div className="tm-topline">
            <div className="tm-nameblock">
              <div className="tm-name">{name}</div>
              <div className="tm-subtitle">
                {major || "No major"}, Year {yearsOfStudy || "N/A"}
              </div>
            </div>

            <div className="tm-badge">{Number(matchPercent) || 0}% Match</div>
          </div>

          <div className="tm-details">
            <div className="tm-detail">
              <span className="tm-icon">📘</span>
              <span className="tm-text">{subjectsText || "No subjects listed"}</span>
            </div>

            <div className="tm-detail">
              <span className="tm-icon">✨</span>
              <span className="tm-text">{learningStyle || "No learning style set"}</span>
            </div>

            <div className="tm-detail">
              <span className="tm-icon">🕒</span>
              <span className="tm-text">{scheduleText}</span>
            </div>
          </div>

          <div className="tm-actions">
            <button
              className="tm-btn tm-btn-outline"
              type="button"
              onClick={() => onViewProfile?.(userData)}
            >
              View Profile
            </button>

            <button
              className="tm-btn tm-btn-solid"
              type="button"
              onClick={() => onConnect?.(userData)}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMatchCard;
