// ProfileCard.js
import React from "react";
import "./ProfileCard.css";

const ProfileCard = ({
  userData,
  isActive,
  onLike,
  onDislike,
  hideActions = false,
}) => {
  const {
    name = "",
    pastCourses = [],
    preferredSchedule = "",
    learningStyle = "",
    yearsOfStudy = "",
    description = "",
    currentCourses = [],
    major = "",
    uid = "",
    image = "",
  } = userData || {};

  const scheduleText =
    preferredSchedule || (Array.isArray(pastCourses) ? pastCourses.join(", ") : "");

  const subjectsText = (Array.isArray(currentCourses) ? currentCourses : []).join(", ");

  return (
    <div
      id={`profileCard_${uid}`}
      className={`ProfileCard ${isActive ? "active" : ""} ${hideActions ? "viewMode" : ""}`}
    >
      <div className="ProfileCardHeaderr">
        <h2>{name}</h2>
      </div>

      <div className="ProfileCardBodyy">
        {image && (
          <div className="ProfileCardImage">
            {/* removed extra space after comma */}
            <img src={`data:image/png;base64,${image}`} alt="User" />
          </div>
        )}

        <div className="ProfileCardInfo">
          <p>
            <strong>Year:</strong> {yearsOfStudy}
          </p>
          <p>
            <strong>Major:</strong> {major}
          </p>
        </div>

        <div style={{ margin: "0px" }}>
          <p>
            <strong>Preferred Schedule:</strong> {scheduleText}
          </p>
          <p>
            <strong>Subjects:</strong> {subjectsText}
          </p>
          <p>
            <strong>Learning Style:</strong> {learningStyle}
          </p>
        </div>

        <div className="ProfileCardDescriptionn">
          <p>{description}</p>
        </div>
      </div>

      {!hideActions && (
        <div className="ProfileCardFooter">
          <button className="like" onClick={onLike} type="button">
            Interested!
          </button>
          <button className="dislike" onClick={onDislike} type="button">
            Another time...
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
