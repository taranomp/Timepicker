"use client";

import { useState, useEffect } from "react";

export default function WeekScheduler({ classData, mode = "student", onChange }) {
    // safe initial state
    const [local, setLocal] = useState(classData || { calendar: {} });

    // update local state when classData prop changes
    useEffect(() => {
        if (classData) setLocal(classData);
    }, [classData]);

    // safe optional chaining
    const days = Object.keys(local?.calendar || {});
    const times = days.length > 0 ? Object.keys(local.calendar[days[0]]) : [];

    // loading state
    if (!days.length) return <p>Loading calendar...</p>;

    async function handlePick(day, time) {
        if (mode !== "student") return;
        const username = prompt("Enter your name");
        if (!username) return;
        try {
            const res = await fetch(`/api/classes/${local.id}`, {
                method: "POST",
                body: JSON.stringify({ username, day, time }),
                headers: { "Content-Type": "application/json" },
            });
            const json = await res.json();
            if (res.ok) {
                setLocal((prev) => {
                    const copy = JSON.parse(JSON.stringify(prev));
                    copy.calendar[day][time] = json;
                    return copy;
                });
                if (onChange) onChange();
                alert("Selection saved");
            } else {
                alert(json.error || "Failed");
            }
        } catch (err) {
            alert("Network error");
        }
    }

    async function handleToggle(day, time) {
        if (mode !== "admin") return;
        try {
            const current = local.calendar[day][time];
            const res = await fetch(`/api/classes/${local.id}`, {
                method: "PATCH",
                body: JSON.stringify({ day, time, enabled: !current.active }),
                headers: { "Content-Type": "application/json" },
            });
            const json = await res.json();
            if (res.ok) {
                setLocal((prev) => {
                    const copy = JSON.parse(JSON.stringify(prev));
                    copy.calendar[day][time] = json;
                    return copy;
                });
                if (onChange) onChange();
            } else {
                alert(json.error || "Failed to toggle");
            }
        } catch (err) {
            alert("Network error");
        }
    }

    return (
        <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered text-center">
                <thead className="table-dark">
                <tr>
                    <th>Day / Time</th>
                    {times.map((t) => (
                        <th key={t}>{t}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {days.map((d) => (
                    <tr key={d}>
                        <td className="text-capitalize fw-bold">{d}</td>
                        {times.map((t) => {
                            const slot = local.calendar[d][t];
                            const className = slot.active ? "bg-primary text-white" : "bg-secondary text-white";
                            const clickable = mode === "student" ? slot.active : true;
                            return (
                                <td
                                    key={t}
                                    style={{ cursor: clickable ? "pointer" : "not-allowed" }}
                                    onClick={() => (mode === "student" ? handlePick(d, t) : handleToggle(d, t))}
                                    className={className}
                                >
                                    <div>{slot.count || 0}</div>
                                    <small>
                                        {mode === "student"
                                            ? slot.active
                                                ? "Available"
                                                : "Disabled"
                                            : slot.active
                                                ? "Active"
                                                : "Inactive"}
                                    </small>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
