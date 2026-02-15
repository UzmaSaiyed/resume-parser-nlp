import * as pdfjsLib from "pdfjs-dist";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

function App() {
  const [session, setSession] = useState(null);

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);

  // resume parser
  const [resume, setResume] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
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

    return () => authListener.subscription.unsubscribe();
  }, []);

  // ---------------- SIGN UP ----------------
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    alert("Signup successful! Please login.");
    setIsSignup(false);
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert(error.message);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setResult(null);
  };

  // ---------------- RESUME PARSER ----------------
  const handleSubmit = async () => {
    try {
      let response;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume_file", resumeFile);
        formData.append("job_description", jobDesc);

        response = await fetch(
          "https://resume-parser-backend-t1g0.onrender.com/parse",
          { method: "POST", body: formData }
        );
      } else {
        response = await fetch(
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
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      alert("Backend error");
      console.error(error);
    }
  };

  // ⭐ COMMON PAGE STYLE
  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  };

  const cardStyle = {
    background: "#fff",
    width: "100%",
    maxWidth: "800px",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "10px"
  };

  // ---------------- AUTH UI ----------------
  if (!session) {
    return (
      <div style={pageStyle}>
        <div style={{...cardStyle, maxWidth:"400px"}}>
          <h2 style={{textAlign:"center"}}>Resume Parser</h2>
          <p style={{textAlign:"center", color:"#666"}}>
            {isSignup ? "Create account" : "Login to continue"}
          </p>

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={inputStyle}
          />

          {isSignup
            ? <button style={buttonStyle} onClick={handleSignup}>Create Account</button>
            : <button style={buttonStyle} onClick={handleLogin}>Login</button>
          }

          <button
            style={{...buttonStyle, background:"#444"}}
            onClick={()=>setIsSignup(!isSignup)}
          >
            {isSignup ? "Already have account? Login"
                      : "New user? Sign Up"}
          </button>

          <hr/>

          <button
            style={{...buttonStyle, background:"#fff", color:"#333", border:"1px solid #ccc"}}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Resume Parser</h2>
        <p style={{color:"#555"}}>
          Logged in as <b>{session.user.email}</b>
        </p>
        <button style={{...buttonStyle, background:"#e53e3e", width:"120px"}}
          onClick={handleLogout}>
          Logout
        </button>

        <hr/>

        <h3>📄 Paste Resume Text</h3>
        <textarea
          rows="5"
          value={resume}
          onChange={(e)=>setResume(e.target.value)}
          style={inputStyle}
        />

        <h3>OR Upload Resume PDF</h3>
        <input
          type="file"
          accept=".pdf"
          onChange={(e)=>setResumeFile(e.target.files[0])}
          style={{marginBottom:"20px"}}
        />

        <h3>🧾 Job Description</h3>
        <textarea
          rows="4"
          value={jobDesc}
          onChange={(e)=>setJobDesc(e.target.value)}
          style={inputStyle}
        />

        <button style={buttonStyle} onClick={handleSubmit}>
          🔍 Parse Resume
        </button>

        {result && (
          <div style={{
            marginTop:"25px",
            padding:"15px",
            background:"#f7fafc",
            borderRadius:"10px"
          }}>
            <h3>Result</h3>
            <p><b>Skills:</b> {result.skills_found.join(", ")}</p>
            <p><b>Match %:</b> {result.match_percentage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
