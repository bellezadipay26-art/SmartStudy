import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserDetails } from "../../services/account";
import ProfileCard from "./ProfileCard/ProfileCard";

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
        if (!info) setErrMsg("Profile not found (fetchUserDetails returned null).");
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
    <div style={{ marginLeft: 260, padding: 16 }}>
      <div style={{ maxWidth: 650, margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#2f8cff",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: 12,
          }}
          type="button"
        >
          BACK
        </button>

        {loading && <div>Loading profile…</div>}

        {!loading && errMsg && (
          <div style={{ color: "crimson", fontWeight: 700 }}>{errMsg}</div>
        )}

        {!loading && profile && (
          <ProfileCard userData={profile} isActive={false} hideActions={true} />
        )}
      </div>
    </div>
  );

}
