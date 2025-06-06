import React, { useState } from "react"; // Import useState
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Insight from "./pages/Insight"; // Import the new Insight component
import Sidebar from "./components/Sidebar"; // Import Sidebar

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // CSS for the menu button, can be moved to a CSS file later
  const menuButtonStyle = {
    zIndex: 1001, // Above sidebar overlay but potentially below a modal
    position: 'fixed',
    top: '15px',
    left: '15px',
    background: 'transparent', // Usually hamburger icons are on a transparent background or part of a header bar
    color: '#1f2937', // Dark color for the icon, assuming light page background
    border: 'none',
    padding: '8px', // Adjust padding for an icon button
    borderRadius: '50%', // Circular or rounded for icon buttons
    cursor: 'pointer',
    fontSize: '24px' // Icon size
  };

  return (
    <BrowserRouter>
      {/* Overlay div */}
      <div
        className={`overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar} // Close sidebar when overlay is clicked
      ></div>

      {/* Sidebar component, rendered for all routes that should have it */}
      {/* Adjust logic here if sidebar should not be on login/register pages */}
      {/* For this example, it's outside <Routes> to be persistent, but visibility is controlled by ProtectedRoute logic indirectly */}

      {/* A global toggle button can be part of a Navbar or a fixed element */}
      {/* This button is placed here for demonstration. In a real app, it might be inside ProtectedRoute or a Layout component */}
      {/* We need to ensure this button is only visible/usable on pages where the sidebar is relevant */}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <button onClick={toggleSidebar} style={menuButtonStyle} aria-label="Toggle menu">
                  <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <Home />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insight" // Add new route for /insight
          element={
            <ProtectedRoute>
              <>
                <button onClick={toggleSidebar} style={menuButtonStyle} aria-label="Toggle menu">
                  <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <Insight />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
