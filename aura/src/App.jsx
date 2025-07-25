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
  shadow: "0 8px 32px 0 rgba(139, 0, 0, 0.37)"
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
  color: #fff;
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
    background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
    opacity: 0;
    transform: scaleX(0.7);
    transition: opacity 0.18s, transform 0.18s;
    z-index: -1;
  }
  &:hover {
    color: #fff;
    background: rgba(139,0,0,0.10);
    box-shadow: 0 0 32px 8px #8B0000cc, 0 0 8px 2px #fff;
    &::after {
      opacity: 1;
      transform: scaleX(1);
    }
  }
  &:active {
    color: #fff;
    background: rgba(139,0,0,0.18);
    transform: scale(0.97);
    box-shadow: 0 0 40px 12px #8B0000ee, 0 0 12px 3px #fff;
  }
  &.active {
    color: #fff;
    background: rgba(139,0,0,0.18);
    box-shadow: 0 0 40px 12px #8B0000ee, 0 0 12px 3px #fff;
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

const GithubButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, #23283b 0%, #8B0000 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 2px 12px 0 #8B000055;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  margin-left: 1rem;
  &:hover {
    background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
    color: #ffe066;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  background: linear-gradient(135deg, #181c24 0%, #23283b 40%, #111 100%);
`;

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
        <GithubButton href="https://github.com/Bhuvilol/AURA" target="_blank" rel="noopener noreferrer" title="View Source on GitHub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.58 2 12.26C2 16.62 4.87 20.26 8.84 21.5C9.34 21.59 9.52 21.32 9.52 21.09C9.52 20.88 9.51 20.3 9.51 19.61C7 20.09 6.48 18.7 6.48 18.7C6.04 17.62 5.37 17.34 5.37 17.34C4.4 16.7 5.45 16.71 5.45 16.71C6.52 16.8 7.07 17.91 7.07 17.91C8.03 19.61 9.66 19.13 10.28 18.89C10.37 18.23 10.63 17.77 10.92 17.53C8.97 17.3 6.92 16.51 6.92 13.5C6.92 12.61 7.23 11.88 7.74 11.3C7.65 11.07 7.38 10.23 7.82 9.09C7.82 9.09 8.5 8.84 9.51 9.59C10.16 9.41 10.86 9.32 11.56 9.32C12.26 9.32 12.96 9.41 13.61 9.59C14.62 8.84 15.3 9.09 15.3 9.09C15.74 10.23 15.47 11.07 15.38 11.3C15.89 11.88 16.2 12.61 16.2 13.5C16.2 16.52 14.14 17.29 12.18 17.52C12.56 17.83 12.9 18.43 12.9 19.32C12.9 20.5 12.89 21.47 12.89 21.09C12.89 21.32 13.07 21.59 13.57 21.5C17.54 20.26 20.41 16.62 20.41 12.26C20.41 6.58 15.93 2 12 2Z" fill="currentColor"/></svg>
          GitHub
        </GithubButton>
        {user ? (
          <>
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }} />
            )}
            <button onClick={handleSignOut} style={{ background: "linear-gradient(90deg, #4b1c1c 0%, #8B0000 60%, #b22222 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 12px 0 #8B000055", transition: "background 0.2s" }}>Sign out</button>
          </>
        ) : (
          <button onClick={handleSignIn} style={{ background: "linear-gradient(90deg, #4b1c1c 0%, #8B0000 60%, #b22222 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 12px 0 #8B000055", transition: "background 0.2s" }}>Sign in with Google</button>
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
        <AppContainer>
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
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
