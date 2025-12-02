// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const SignUpPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/chat");
    } catch (err: any) {
      setError("Signup failed: " + (err.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: "450px", textAlign: "center" }}
      >
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <h1
            className="gradient-text"
            style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)" }}
          >
            Join the Chat!
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
            Create an account to start connecting
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(255, 107, 107, 0.2)",
              color: "var(--error)",
              padding: "var(--spacing-sm)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <input
              className="input-field"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <input
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <input
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button
            className="btn btn-primary animate-pulse"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "var(--spacing-md)",
              fontSize: "1.1rem",
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="animate-pulse">Signing up...</span>
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div style={{ marginTop: "var(--spacing-xl)", textAlign: "center" }}>
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
