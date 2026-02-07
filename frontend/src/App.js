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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // insert into users table
    if (data.user) {
      await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
        },
      ]);
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
      
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <h3 style={{ color: "red" }}>SIGNUP DEBUG ACTIVE</h3>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        {isSignup ? (
          <button onClick={handleSignup}>Create Account</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}

        <br /><br />

        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Already have an account? Login"
            : "New user? Sign Up"}
        </button>
      </div>
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <div style={{ padding: "30px" }}>
      <h2>Resume Parser</h2>
      <p>Logged in as <b>{session.user.email}</b></p>
      <button onClick={handleLogout}>Logout</button>

      <br /><br />

      <textarea
        rows="6"
        cols="70"
        placeholder="Paste Resume Text"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="4"
        cols="70"
        placeholder="Paste Job Description or Keywords"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Parse Resume</button>

      <br /><br />

      {result && (
        <div>
          <h3>Result</h3>
          <p><b>Skills:</b> {result.skills_found.join(", ")}</p>
          <p><b>Match %:</b> {result.match_percentage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
