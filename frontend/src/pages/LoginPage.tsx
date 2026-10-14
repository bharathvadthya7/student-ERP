import React, { useState } from "react";
import { Student } from "../types";
import { loginStudent } from "../services/api";

interface LoginPageProps {
  onLoginSuccess: (student: Student) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("25R21A05JP");
  const [password, setPassword] = useState("25R21A05JP");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleRollChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setUsername(clean);
    // Automatically match password to roll number per requirement
    setPassword(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanRoll = username.trim().toUpperCase();
    if (!cleanRoll) {
      setLoginError("Please enter your Hall Ticket / Roll Number.");
      return;
    }

    setLoading(true);
    try {
      // Login with roll number (password defaults to roll number)
      const data = await loginStudent(cleanRoll, password || cleanRoll);
      if (data.success && data.student) {
        onLoginSuccess(data.student);
      } else {
        setLoginError("Login failed. Check your roll number.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication error.";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const setQuickRoll = (roll: string) => {
    setUsername(roll);
    setPassword(roll);
    setLoginError("");
  };

  return (
    <main className="login-screen">
      <div className="login-decoration decoration-one" />
      <div className="login-decoration decoration-two" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="college-mark">
          <span>MLR</span>
        </div>
        <div className="login-eyebrow">MLR INSTITUTE OF TECHNOLOGY (UGC AUTONOMOUS)</div>
        <h1>Student Portal</h1>
        <p className="login-subtitle">
          Computer Science & Engineering — II/I Sem (Section - G)
        </p>

        <div className="field">
          <label htmlFor="roll-number">Roll Number / Hall Ticket</label>
          <input
            id="roll-number"
            type="text"
            value={username}
            onChange={(e) => handleRollChange(e.target.value)}
            placeholder="e.g. 25R21A05JP or 25R21A05KG"
            autoComplete="username"
            autoCapitalize="characters"
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            Password <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "11px" }}>(Same as Roll Number)</span>
          </label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your roll number"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {loginError && (
          <div className="login-error" role="alert">
            {loginError}
          </div>
        )}

        <button
          className="button button-primary login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign in with Roll Number"} <span>→</span>
        </button>

        <div className="demo-box" style={{ marginTop: "20px" }}>
          <strong>Quick Student Selection (CSE-G Section):</strong>
          <p style={{ margin: "4px 0 10px", fontSize: "11px", color: "var(--muted)" }}>
            Click any roll number below to autofill and sign in:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <button
              type="button"
              className="pill blue"
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setQuickRoll("25R21A05JP")}
              title="ALAGANE GANESH GOUD (87.42%)"
            >
              25R21A05JP (87%)
            </button>
            <button
              type="button"
              className="pill green"
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setQuickRoll("25R21A05KG")}
              title="KODIPATHINA VAISHNAVI (91.41%)"
            >
              25R21A05KG (91%)
            </button>
            <button
              type="button"
              className="pill purple"
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setQuickRoll("25R21A05LH")}
              title="VITTAL ROHITH (92.38%)"
            >
              25R21A05LH (92%)
            </button>
            <button
              type="button"
              className="pill orange"
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setQuickRoll("25R21A05JX")}
              title="BEKKAM BHANUPRASAD (36.50%)"
            >
              25R21A05JX (36%)
            </button>
            <button
              type="button"
              className="pill blue"
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setQuickRoll("26R25A0538")}
              title="DEVADI VENNELA (74.38%)"
            >
              26R25A0538 (74%)
            </button>
          </div>
        </div>

        <div className="login-footer">
          Class Incharge: Mrs. T. Sai Priyanka · MLRIT CSE-G Portal
        </div>
      </form>
    </main>
  );
};
