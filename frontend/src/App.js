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
  const [resumeFile, setResumeFile] = useState(null);   // ⭐ NEW
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
    const { error } = await supabase.auth.signUp({ email, password });

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

      // ⭐ IF FILE SELECTED → SEND FILE
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume_file", resumeFile);
        formData.append("job_description", jobDesc);

        response = await fetch(
          "https://resume-parser-backend-t1g0.onrender.com/parse",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      // ⭐ ELSE SEND TEXT
      else {
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

  // ---------------- AUTH UI ----------------
  if (!session) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "350px"
        }}>
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{width:"100%", padding:"10px", marginBottom:"10px"}}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{width:"100%", padding:"10px", marginBottom:"10px"}}
          />

          {isSignup ?
            <button onClick={handleSignup}>Create Account</button>
            :
            <button onClick={handleLogin}>Login</button>
          }

          <br/><br/>

          <button onClick={()=>setIsSignup(!isSignup)}>
            {isSignup ? "Already have account? Login" : "New user? Sign Up"}
          </button>

          <hr/>

          <button onClick={handleGoogleLogin}>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <div style={{padding:"30px"}}>
      <h2>Resume Parser</h2>
      <p>Logged in as {session.user.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <hr/>

      {/* TEXT OPTION */}
      <h3>Paste Resume Text</h3>
      <textarea
        rows="5"
        value={resume}
        onChange={(e)=>setResume(e.target.value)}
        style={{width:"100%", marginBottom:"10px"}}
      />

      {/* FILE OPTION */}
      <h3>OR Upload Resume PDF</h3>
      <input
        type="file"
        accept=".pdf"
        onChange={(e)=>setResumeFile(e.target.files[0])}
      />

      <hr/>

      <h3>Job Description</h3>
      <textarea
        rows="4"
        value={jobDesc}
        onChange={(e)=>setJobDesc(e.target.value)}
        style={{width:"100%"}}
      />

      <br/><br/>

      <button onClick={handleSubmit}>Parse Resume</button>

      {result && (
        <div style={{marginTop:"20px"}}>
          <h3>Result</h3>
          <p>Skills: {result.skills_found.join(", ")}</p>
          <p>Match %: {result.match_percentage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
