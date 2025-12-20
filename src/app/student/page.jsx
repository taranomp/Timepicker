"use client";

import { useState, useEffect } from "react";
import ClassList from "@/components/ClassList";
import WeekScheduler from "@/components/WeekScheduler";

export default function StudentPage() {
    const [selected, setSelected] = useState(null);
    const [classData, setClassData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!selected) return;
        fetch(`/api/classes/${selected}`)
            .then((r) => r.json())
            .then((j) => setClassData(j));
    }, [selected, refreshKey]);

    return (
        <div className="container py-4">
            <h2>Available Classes</h2>
            <div className="row">
                <div className="col-md-4">
                    <ClassList onSelect={(id) => { setSelected(id); setClassData(null); }} />
                </div>
                <div className="col-md-8">
                    {selected ? (
                        classData ? (
                            <>
                                <h4>{classData.title}</h4>
                                <p>Tap a blue cell to select (enter your name on prompt)</p>
                                <WeekScheduler classData={classData} mode="student" onChange={() => setRefreshKey(k=>k+1)} />
                            </>
                        ) : <div>Loading...</div>
                    ) : <div>Select a class to see schedule</div>}
                </div>
            </div>
        </div>
    );
}
