"use client";

import { useState, useEffect } from "react";

/*
  ClassList: lists classes and allows selection
  Props:
    - onSelect(classId)
*/
export default function ClassList({ onSelect }) {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetch("/api/classes")
            .then((r) => r.json())
            .then(setClasses)
            .catch(() => setClasses([]));
    }, []);

    if (!classes.length) return <div>No classes yet.</div>;

    return (
        <div className="list-group">
            {classes.map((c) => (
                <button key={c.id} className="list-group-item list-group-item-action" onClick={() => onSelect(c.id)}>
                    <div className="d-flex justify-content-between">
                        <div>{c.title}</div>
                        <small className="text-muted">{c.id}</small>
                    </div>
                </button>
            ))}
        </div>
    );
}
