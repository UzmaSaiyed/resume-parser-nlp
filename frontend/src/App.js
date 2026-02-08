import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true); // SIGNUP FIRST

  // resume parser
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);

  // ---------------- SESSION ----------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- SIGN UP ----------------
  const handleSignup = async () => {
    const {error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful! Please login.");
    setIsSignup(false);
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      alert(error.message);
    }
  };


  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setResult(null);
  };

  // ---------------- RESUME PARSER ----------------
  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://resume-parser-backend-t1g0.onrender.com/parse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: resume,
            job_description: jobDesc,
          }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend error");
      console.error(error);
    }
  };

 // ---------------- AUTH UI ----------------
    if (!session) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "420px",
              padding: "35px",
              borderRadius: "12px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
              Resume Parser
            </h2>

            <p style={{ textAlign: "center", color: "#666", marginBottom: "25px" }}>
              {isSignup
                ? "Create your HR account"
                : "Login to continue"}
            </p>

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Action Button */}
            {isSignup ? (
              <button
                onClick={handleSignup}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            ) : (
              <button
                onClick={handleLogin}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            )}

            {/* Toggle */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setIsSignup(!isSignup)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {isSignup
                  ? "Already have an account? Login"
                  : "New user? Create an account"}
              </button>
            </div>
          </div>
        </div>
      );
    }

  // ---------------- MAIN APP ----------------
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            width: "100%",
            maxWidth: "900px",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: 0 }}>Resume Parser</h2>
            <p style={{ color: "#555" }}>
              Logged in as <b>{session.user.email}</b>
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: "#e53e3e",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

          <hr />

          {/* Resume Input */}
          <div style={{ marginTop: "20px" }}>
            <h3>📄 Resume Text</h3>
            <textarea
              rows="6"
              placeholder="Paste the candidate's resume text here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
          </div>

          {/* Job Description */}
          <div style={{ marginTop: "20px" }}>
            <h3>🧾 Job Description / Keywords</h3>
            <textarea
              rows="4"
              placeholder="Paste job description or required skills..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
          </div>

          {/* Action Button */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={handleSubmit}
              style={{
                background: "#667eea",
                color: "white",
                padding: "12px 30px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              🔍 Parse Resume
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                background: "#f7fafc",
                borderRadius: "10px",
              }}
            >
              <h3>📊 Parsing Result</h3>
              <p>
                <b>Skills Found:</b>{" "}
                {result.skills_found.length > 0
                  ? result.skills_found.join(", ")
                  : "No matching skills found"}
              </p>
              <p>
                <b>Match Percentage:</b> {result.match_percentage}%
              </p>
            </div>
          )}
        </div>
      </div>
    );


}

export default App;
