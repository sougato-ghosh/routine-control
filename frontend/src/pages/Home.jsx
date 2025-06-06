
import React from "react";
import "../styles/Home.css";

const Home = () => {
  const createNote = () => {
    console.log("createNote triggered");
    // Add your logic here
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
                <button key={amt} className="btn amount-btn" onClick={createNote}>
                  {amt}
                </button>
              ))}
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Enter Amount"
                className="input-field"
              />
              <button className="btn" onClick={createNote}>Submit</button>
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
            />
            <button className="btn" onClick={createNote}>Submit</button>
          </div>
        </section>

        <section>
          <h2>Others</h2>
          <div className="others-input">
            <input
              type="text"
              placeholder="Enter Reference"
              className="input-field"
            />
            <input
              type="date"
              className="input-field"
              defaultValue="2025-06-05"
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              placeholder="Enter Amount"
              className="input-field"
            />
            <button className="btn" onClick={createNote}>Submit</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <button className="btn btn-secondary" onClick={createNote}>UNDO</button>
      </footer>
    </div>
  );
};

export default Home;
