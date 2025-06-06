import React from "react";
import "../styles/Note.css";

function Note({ note, onDelete, deleteActive }) {
    const dateStr = note.using_date || note.created_at; // Prioritize using_date
    let formattedDate = "N/A";

    if (dateStr) {
        const parts = dateStr.split('-'); // Assuming YYYY-MM-DD
        if (parts.length === 3) {
            // Construct date as UTC to avoid timezone issues with toLocaleDateString
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const day = parseInt(parts[2], 10);
            const utcDate = new Date(Date.UTC(year, month, day));
            formattedDate = utcDate.toLocaleDateString("en-US", {
                year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
            });
        } else {
            // Fallback for unexpected date formats or if it's a full timestamp string
            formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
                year: 'numeric', month: '2-digit', day: '2-digit'
            });
        }
    }

    const amount = note.amount !== null && !isNaN(parseFloat(note.amount))
                   ? parseFloat(note.amount).toFixed(2)
                   : "0.00";

    return (
        <div className="note-item-row">
            <span className="note-title" title={note.title}>{note.title}</span>
            <span className="note-date">{formattedDate}</span>
            <span className="note-amount">{amount}</span>
            <button
                className="delete-button"
                onClick={() => onDelete(note.id)}
                disabled={!deleteActive}
            >
                Delete
            </button>
        </div>
    );
}

export default Note;
