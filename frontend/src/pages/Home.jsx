
import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css"; // Ensure this file exists or is created
import { Link } from "react-router-dom"; // Import Link

const Home = () => {
  const [notes, setNotes] = useState([]);

  // State for Lunch section
  const [lunchAmount, setLunchAmount] = useState("");

  // State for Dinner section
  const [dinnerAmount, setDinnerAmount] = useState("");

  // State for Transport section
  const [transportAmount, setTransportAmount] = useState("");

  // State for Others section
  const [otherReference, setOtherReference] = useState("");
  const [otherDate, setOtherDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [otherAmount, setOtherAmount] = useState("");

  // const navigate = useNavigate(); // No longer needed for the Insight button link

  useEffect(() => {
    getNotes();
  }, []);

  const getNotes = () => {
    api
      .get("/api/notes/")
      .then((res) => res.data)
      .then((data) => {
        setNotes(data);
        console.log(data); // Optional: for debugging
      })
      .catch((err) => alert(err));
  };

  const createNote = (title, using_date, amount) => {
    // Ensure amount is a number before sending
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        alert("Invalid amount provided.");
        return;
    }

    api
        .post("/api/notes/", { title, using_date, amount: numericAmount })
        .then((res) => {
            if (res.status === 201) {
                alert("Note created!");
                getNotes(); // Refresh notes list
            } else {
                alert("Failed to make note. Status: " + res.status);
            }
        })
        .catch((err) => {
            console.error("Error creating note:", err.response ? err.response.data : err.message);
            alert("Failed to make note. Check console for details.");
        });
  };

  // handleInsightClick is no longer needed as <Link> will handle navigation.

  return (
    <div className="container">
      {/* The menu button is now globally handled by App.jsx */}
      {/* The header in Home.jsx will now only contain the "Insight" button and potentially other page-specific controls. */}
      {/* Adjust padding or margins if the fixed menu button from App.jsx overlaps. */}
      <header className="home-header"> {/* Renamed to avoid conflict if "header" is too generic */}
        {/* "Insight" button using Link component */}
        <Link to="/insight" className="btn btn-secondary">
          Insight
        </Link>
      </header>

      <main className="home-main-content"> {/* Added a class for potentially specific main content styling */}
        {["Lunch", "Dinner"].map((meal) => (
          <section key={meal}>
            <h2>{meal}</h2>
            <div className="preset-buttons">
              {[60, 65, 70].map((amt) => (
                <button key={amt} className="btn amount-btn" onClick={() => createNote(meal, new Date().toISOString().split('T')[0], amt)}>
                  {amt} {/* Ensure this button also gets generic .btn styles if not specific .amount-btn styles */}
                </button>
              ))}
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Enter Amount"
                className="input-field" // Assuming .input-field styles exist or will be added
                value={meal === "Lunch" ? lunchAmount : dinnerAmount}
                onChange={(e) => meal === "Lunch" ? setLunchAmount(e.target.value) : setDinnerAmount(e.target.value)}
              />
              <button className="btn" onClick={() => createNote(meal, new Date().toISOString().split('T')[0], meal === "Lunch" ? lunchAmount : dinnerAmount)}>Submit</button>
            </div>
          </section>
        ))}

        <section>
          <h2>Transport</h2>
          <div className="input-group">
            <input
              type="number"
              placeholder="Enter Amount"
              className="input-field"
              value={transportAmount}
              onChange={(e) => setTransportAmount(e.target.value)}
            />
            <button className="btn" onClick={() => createNote("Transport", new Date().toISOString().split('T')[0], transportAmount)}>Submit</button>
          </div>
        </section>

        <section>
          <h2>Others</h2>
          <div className="others-input"> {/* Assuming .others-input styles exist or will be added */}
            <input
              type="text"
              placeholder="Enter Reference"
              className="input-field"
              value={otherReference}
              onChange={(e) => setOtherReference(e.target.value)}
            />
            <input
              type="date"
              className="input-field"
              value={otherDate}
              onChange={(e) => setOtherDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              placeholder="Enter Amount"
              className="input-field"
              value={otherAmount}
              onChange={(e) => setOtherAmount(e.target.value)}
            />
            <button className="btn" onClick={() => createNote(otherReference, otherDate, otherAmount)}>Submit</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
