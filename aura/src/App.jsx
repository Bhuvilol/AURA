import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// Placeholder imports for feature pages
import Dashboard from "./features/Dashboard";
import ChatAURA from "./features/ChatAURA";
import TaskOrganizer from "./features/TaskOrganizer";
import LearningSpace from "./features/LearningSpace";
import NotesSummarizer from "./features/NotesSummarizer";
import Toast from './components/Toast';


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    background: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
    transition: background 0.3s, color 0.3s;
  }
`;

const glassTheme = {
  bg: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  text: "#fff",
  card: "rgba(255,255,255,0.1)",
  border: "rgba(255,255,255,0.2)",
  shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
};

const GlassNav = styled.nav`
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  padding: 1rem 2rem;
  background: ${(props) => props.theme.card};
  border-radius: 16px;
  margin: 1rem auto;
  max-width: 1200px;
  box-shadow: ${(props) => props.theme.shadow};
  border: 1px solid ${(props) => props.theme.border};
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 700px) {
    gap: 0.5rem;
    padding: 0.7rem 0.5rem;
    max-width: 100vw;
  }
`;

const NavLink = styled(Link)`
  position: relative;
  color: #b6eaff;
  font-weight: 600;
  font-size: 1.13rem;
  text-decoration: none;
  padding: 0.4rem 1.1rem;
  border-radius: 10px;
  transition: color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.08s;
  z-index: 1;
  &::after {
    content: '';
    position: absolute;
    left: 18%;
    right: 18%;
    bottom: 7px;
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
    opacity: 0;
    transform: scaleX(0.7);
    transition: opacity 0.18s, transform 0.18s;
    z-index: -1;
  }
  &:hover {
    color: #fff;
    background: rgba(0,198,255,0.10);
    box-shadow: 0 0 12px #00c6ff55;
    &::after {
      opacity: 1;
      transform: scaleX(1);
    }
  }
  &:active {
    color: #00c6ff;
    background: rgba(0,198,255,0.18);
    transform: scale(0.97);
    box-shadow: 0 0 18px #00c6ff99;
  }
  &.active {
    color: #fff;
    background: rgba(0,198,255,0.18);
    box-shadow: 0 0 18px #00c6ff99;
    &::after {
      opacity: 1;
      transform: scaleX(1);
    }
  }
`;

const Placeholder = ({ name }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>{name} (Coming Soon)</h2>
  </div>
);

function RequireAuth({ user, children, showToast }) {
  const location = useLocation();
  useEffect(() => {
    if (!user) showToast('You must be signed in to access this page.', 'warning');
    // eslint-disable-next-line
  }, [user]);
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

// Navigation component that uses useLocation inside Router context
function Navigation({ user, handleSignIn, handleSignOut }) {
  const location = useLocation();
  
  return (
    <GlassNav>
      <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</NavLink>
      <NavLink to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>Ask AURA</NavLink>
      <NavLink to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>Task Organizer</NavLink>
      <NavLink to="/learning" className={location.pathname === '/learning' ? 'active' : ''}>Learning Space</NavLink>
      <NavLink to="/notes" className={location.pathname === '/notes' ? 'active' : ''}>Notes & Summarizer</NavLink>
      {/* Auth UI */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }} />
            )}
            <span style={{ color: "#b6eaff", fontWeight: 500, marginRight: 8 }}>{user.displayName || user.email}</span>
            <button onClick={handleSignOut} style={{ background: "#00c6ff", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
          </>
        ) : (
          <button onClick={handleSignIn} style={{ background: "#00c6ff", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", cursor: "pointer", fontWeight: 600 }}>Sign in with Google</button>
        )}
      </div>
    </GlassNav>
  );
}

// Main app content component that will be inside Router
function AppContent({ user, showToast, handleSignIn, handleSignOut }) {
  return (
    <>
      <Navigation user={user} handleSignIn={handleSignIn} handleSignOut={handleSignOut} />
      <Routes>
        <Route path="/" element={<Dashboard showToast={showToast} />} />
        <Route path="/chat" element={
          <RequireAuth user={user} showToast={showToast}>
            <ChatAURA showToast={showToast} />
          </RequireAuth>
        } />
        <Route path="/tasks" element={
          <RequireAuth user={user} showToast={showToast}>
            <TaskOrganizer showToast={showToast} />
          </RequireAuth>
        } />
        <Route path="/learning" element={
          <RequireAuth user={user} showToast={showToast}>
            <LearningSpace showToast={showToast} />
          </RequireAuth>
        } />
        <Route path="/notes" element={
          <RequireAuth user={user} showToast={showToast}>
            <NotesSummarizer showToast={showToast} />
          </RequireAuth>
        } />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast('Signed in successfully!', 'success');
    } catch (e) {
      showToast('Sign in failed: ' + e.message, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully!', 'success');
    } catch (e) {
      showToast('Sign out failed: ' + e.message, 'error');
    }
  };

  return (
    <ThemeProvider theme={glassTheme}>
      <GlobalStyle />
      <Router>
        <AppContent 
          user={user} 
          showToast={showToast} 
          handleSignIn={handleSignIn} 
          handleSignOut={handleSignOut} 
        />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
          position={toast.type === 'warning' ? 'top' : 'bottom'}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
