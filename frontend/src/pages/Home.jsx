
import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css";

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

  return (
    <div className="container">
      <header className="header">
        <button className="icon-button">
          <span className="material-icons">menu</span>
        </button>
        <button className="btn btn-secondary">Insight</button>
      </header>

      <main>
        {["Lunch", "Dinner"].map((meal) => (
          <section key={meal}>
            <h2>{meal}</h2>
            <div className="preset-buttons">
              {[60, 65, 70].map((amt) => (
                <button key={amt} className="btn amount-btn" onClick={() => createNote(meal, new Date().toISOString().split('T')[0], amt)}>
                  {amt}
                </button>
              ))}
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Enter Amount"
                className="input-field"
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
          <div className="others-input">
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

      <footer className="footer">
        <button className="btn btn-secondary">UNDO</button>
      </footer>
    </div>
  );
};

export default Home;
