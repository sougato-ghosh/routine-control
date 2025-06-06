import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  // For icons, you would typically use an icon library like Material Icons, Font Awesome, etc.
  // For example: <span className="material-icons">home</span>
  // Since we don't have one set up, we'll use text placeholders or omit them.

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        {/* User name will be displayed here */}
        <h2>User Name</h2>
      </div>
      <button onClick={toggleSidebar} className="close-btn">
        {/* Using a text 'X' or a proper icon font/SVG would go here */}
        &times;
      </button>
      <nav className="sidebar-nav">
        <ul>
          <li>
            {/* Example with a placeholder for an icon */}
            {/* <a href="/insight" className="sidebar-link"><span className="material-icons">lightbulb</span>Insight</a> */}
            <a href="/insight" className="sidebar-link">Insight</a>
          </li>
          <li>
            <a href="/download-data" className="sidebar-link">Download data</a>
          </li>
          <li>
            <a href="/logout" className="sidebar-link">Logout</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
