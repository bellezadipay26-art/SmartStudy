// ProfileCard.js

import React from "react";
import "./ProfileCard.css";

const ProfileCard = ({ userData, isActive, onLike, onDislike }) => {
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
  } = userData;
  console.log(userData);

  const scheduleText =
  preferredSchedule ||
  (Array.isArray(pastCourses) ? pastCourses.join(", ") : "");

  const subjectsText = (Array.isArray(currentCourses) ? currentCourses : []).join(", ");

  return (
    <div
      id={`profileCard_${uid}`}
      className={`ProfileCard ${isActive ? "active" : ""}`}
    >
      <div className="ProfileCardHeaderr">
        <h2>{name}</h2>
      </div>
      <div className="ProfileCardBodyy">
        {image && (
          <div className="ProfileCardImage">
            <img src={`data:image/png;base64, ${image}`} alt="User" />
          </div>
        )}
        <div className="ProfileCardInfo">
          <p>
            <strong>Year:</strong> U{yearsOfStudy}
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
      <div className="ProfileCardFooter">
        <button className="like" onClick={onLike}>
          Interested!
        </button>
        <button className="dislike" onClick={onDislike}>
          Another time...
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
