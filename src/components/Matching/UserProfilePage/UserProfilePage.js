import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserDetails } from "../../../services/account";
import ProfileCard from "../ProfileCard/ProfileCard";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const info = await fetchUserDetails(uid);

        if (!alive) return;

        setProfile(info || null);

        if (!info) {
          setErrMsg("Profile not found (fetchUserDetails returned null).");
        }
      } catch (err) {
        console.error("UserProfilePage load error:", err);
        if (!alive) return;

        setErrMsg(err?.message || "Failed to load profile.");
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [uid]);

  return (
    <div className="user-profile-page">
      <div className="user-profile-page__inner">
        <button
          onClick={() => navigate(-1)}
          className="user-profile-page__back-btn"
          type="button"
        >
          BACK
        </button>

        {loading && <div className="user-profile-page__status">Loading profile...</div>}

        {!loading && errMsg && (
          <div className="user-profile-page__error">{errMsg}</div>
        )}

        {!loading && profile && (
          <div className="user-profile-page__card-wrap">
            <ProfileCard userData={profile} isActive={false} hideActions={true} />
          </div>
        )}
      </div>
    </div>
  );
}