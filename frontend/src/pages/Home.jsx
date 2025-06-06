import React, { useState } from "react";
import api from "../api";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const [lunchAmount, setLunchAmount] = useState("");
  const [dinnerAmount, setDinnerAmount] = useState("");
  const [transportAmount, setTransportAmount] = useState("");
  const [otherReference, setOtherReference] = useState("");
  const [otherDate, setOtherDate] = useState(new Date().toISOString().split('T')[0]);
  const [otherAmount, setOtherAmount] = useState("");

  const createNote = (title, using_date, amount, onSuccess) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      alert("Invalid amount provided.");
      return;
    }

    api
      .post("/api/notes/", { title, using_date, amount: numericAmount })
      .then((res) => {
        if (res.status === 201) {
          //alert("Note created!");
          onSuccess?.(); // Clear relevant inputs
        } else {
          alert("Failed to create note. Status: " + res.status);
        }
      })
      .catch((err) => {
        console.error("Error creating note:", err.response ? err.response.data : err.message);
        alert("Failed to create note. Check console for details.");
      });
  };

  return (
    <div className="container">
      <header className="home-header">
        <Link to="/insight" className="btn btn-secondary">
          Insight
        </Link>
      </header>

      <main className="home-main-content">
        {["Lunch", "Dinner"].map((meal) => (
          <section key={meal}>
            <h2>{meal}</h2>
            <div className="preset-buttons">
              {[60, 65, 70].map((amt) => (
                <button
                  key={amt}
                  className="btn amount-btn"
                  onClick={() =>
                    createNote(meal, new Date().toISOString().split('T')[0], amt)
                  }
                >
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
                onChange={(e) =>
                  meal === "Lunch"
                    ? setLunchAmount(e.target.value)
                    : setDinnerAmount(e.target.value)
                }
              />
              <button
                className="btn"
                onClick={() =>
                  createNote(
                    meal,
                    new Date().toISOString().split('T')[0],
                    meal === "Lunch" ? lunchAmount : dinnerAmount,
                    () => {
                      if (meal === "Lunch") {
                        setLunchAmount("");
                      } else {
                        setDinnerAmount("");
                      }
                    }
                  )
                }
              >
                Submit
              </button>
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
            <button
              className="btn"
              onClick={() =>
                createNote("Transport", new Date().toISOString().split('T')[0], transportAmount, () =>
                  setTransportAmount("")
                )
              }
            >
              Submit
            </button>
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
            <button
              className="btn"
              onClick={() =>
                createNote(otherReference, otherDate, otherAmount, () => {
                  setOtherReference("");
                  setOtherDate(new Date().toISOString().split('T')[0]);
                  setOtherAmount("");
                })
              }
            >
              Submit
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
