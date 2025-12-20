"use client";

import { useState, useEffect } from "react";
import ClassList from "@/components/ClassList";
import WeekScheduler from "@/components/WeekScheduler";

export default function AdminPage() {
    const [selected, setSelected] = useState(null);
    const [classData, setClassData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!selected) return;
        fetch(`/api/classes/${selected}`)
            .then((r) => r.json())
            .then((j) => setClassData(j));
    }, [selected, refreshKey]);

    async function handleCreate(e) {
        e.preventDefault();
        const form = new FormData(e.target);
        const id = String(form.get("id")).trim();
        const title = String(form.get("title")).trim();
        if (!id || !title) return alert("id and title required");
        const res = await fetch("/api/classes", {
            method: "POST",
            body: JSON.stringify({ id, title }),
            headers: { "Content-Type": "application/json" }
        });
        const json = await res.json();
        if (res.ok) {
            alert("Class created");
            setRefreshKey((k) => k + 1);
        } else {
            alert(json.error || "Failed");
        }
    }

    return (
        <div className="container py-4">
            <h2>Admin Panel</h2>

            <div className="row">
                <div className="col-md-4">
                    <form onSubmit={handleCreate} className="mb-3">
                        <div className="mb-2">
                            <label className="form-label">Class ID</label>
                            <input name="id" className="form-control" placeholder="python-intro" />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Title</label>
                            <input name="title" className="form-control" placeholder="Python Introduction" />
                        </div>
                        <button className="btn btn-primary" type="submit">Create Class</button>
                    </form>

                    <h5>Classes</h5>
                    <ClassList onSelect={(id) => { setSelected(id); setClassData(null); }} />
                </div>

                <div className="col-md-8">
                    {selected ? (
                        classData ? (
                            <>
                                <h4>{classData.title} ({classData.id})</h4>
                                <p>Click any cell to toggle active/inactive</p>
                                <WeekScheduler classData={classData} mode="admin" onChange={() => setRefreshKey(k=>k+1)} />
                                <div className="mt-3">
                                    <button className="btn btn-danger me-2" onClick={async () => {
                                        if (!confirm("Clear class (reset calendar)?")) return;
                                        const res = await fetch(`/api/classes/${selected}`, { method: "DELETE" });
                                        if (res.ok) { alert("Cleared"); setRefreshKey(k=>k+1); setClassData(null); }
                                        else alert("Failed");
                                    }}>Clear Calendar</button>

                                    <button className="btn btn-outline-danger" onClick={async () => {
                                        if (!confirm("Remove class permanently?")) return;
                                        const res = await fetch(`/api/classes/${selected}?mode=remove`, { method: "DELETE" });
                                        if (res.ok) { alert("Removed"); setSelected(null); setClassData(null); setRefreshKey(k=>k+1); }
                                        else alert("Failed");
                                    }}>Remove Class</button>
                                </div>
                            </>
                        ) : <div>Loading class...</div>
                    ) : <div>Select a class from left</div>}
                </div>
            </div>
        </div>
    );
}
