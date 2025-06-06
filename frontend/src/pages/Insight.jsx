import React, { useState, useEffect } from 'react';
import api from '../api';
import Note from '../components/Note'; // This will be modified later
import '../styles/Insight.css'; // To be created

function Insight() {
    const [notes, setNotes] = useState([]);
    const [currentMonthNotes, setCurrentMonthNotes] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [deleteActive, setDeleteActive] = useState(false);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api.get("/api/notes/")
            .then((res) => res.data)
            .then((data) => {
                setNotes(data);
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-indexed

        const filtered = notes.filter(note => {
            const noteDate = new Date(note.using_date);
            // Adjust for timezone differences if note.using_date is just YYYY-MM-DD
            // One way is to create date object in UTC
            const noteUTCDate = new Date(noteDate.getUTCFullYear(), noteDate.getUTCMonth(), noteDate.getUTCDate());
            return noteUTCDate.getFullYear() === currentYear && noteUTCDate.getMonth() === currentMonth;
        });

        setCurrentMonthNotes(filtered);

        const sum = filtered.reduce((acc, note) => acc + parseFloat(note.amount || 0), 0);
        setTotalAmount(sum);

    }, [notes]);

    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    alert("Note deleted!");
                    getNotes(); // Refresh notes
                } else {
                    alert("Failed to delete note.");
                }
            })
            .catch((error) => alert(error));
    };

    const toggleDeleteActive = () => {
        setDeleteActive(!deleteActive);
    };

    return (
        <div className="insight-container">
            <h1>Monthly Insight</h1>
            <div className="insight-summary">
                <h2>Total for Current Month: {totalAmount.toFixed(2)}</h2>
                <button onClick={toggleDeleteActive} className="btn-activate-delete">
                    {deleteActive ? 'Deactivate Delete' : 'Activate Delete'}
                </button>
            </div>

            <div className="notes-list-container">
                <div className="notes-header">
                    <span>Title</span>
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Action</span>
                </div>
                <div className="notes-body">
                    {currentMonthNotes.map((note) => (
                        <Note
                            note={note}
                            onDelete={deleteNote}
                            deleteActive={deleteActive} // Pass this new prop
                            key={note.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Insight;
