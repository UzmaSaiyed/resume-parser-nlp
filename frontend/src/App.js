import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // -------- LOGIN --------
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // -------- RESUME PARSER --------
  const handleSubmit = async () => {
    const response = await fetch("http://127.0.0.1:5000/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: resume,
        job_description: jobDesc,
      }),
    });

    const data = await response.json();
    setResult(data);

    // save result to Supabase DB
    await supabase.from("parsed_results").insert([
      {
        user_email: session.user.email,
        skills: data.skills_found.join(", "),
        experience: data.experience,
        match_percentage: data.match_percentage,
      },
    ]);
  };

  // -------- UI --------
  if (!session) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resume Parser</h2>
      <p>Logged in as: {session.user.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <br /><br />

      <textarea
        rows="6"
        cols="60"
        placeholder="Paste Resume Text"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="4"
        cols="60"
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
          <p><b>Experience:</b> {result.experience}</p>
          <p><b>Match %:</b> {result.match_percentage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
