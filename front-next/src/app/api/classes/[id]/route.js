import { NextResponse } from "next/server";
import DataManager from "@/app/lib/DataManager";

/*
  GET    -> get class by id
  POST   -> student picks a slot (body: { username, day, time })
  PATCH  -> toggle slot active (body: { day, time, enabled })  -- admin
  DELETE -> clear class (reset) or remove class (query ?mode=remove)
*/

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const cls = DataManager.getClassById(id);
        console.log('cls:', cls)
        if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(cls);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { username, day, time } = body;
        if (!username || !day || !time) {
            return NextResponse.json({ error: "username, day and time required" }, { status: 400 });
        }
        const slot = DataManager.addPick(id, username, day, time);
        return NextResponse.json(slot);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { day, time, enabled } = body;
        if (!day || !time || typeof enabled === "undefined") {
            return NextResponse.json({ error: "day,time,enabled required" }, { status: 400 });
        }
        const slot = DataManager.toggleSlot(id, day, time, enabled);
        return NextResponse.json(slot);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const mode = url.searchParams.get("mode"); // ?mode=remove => delete class entirely
        if (mode === "remove") {
            DataManager.removeClass(id);
            return NextResponse.json({ ok: true });
        } else {
            DataManager.clearClass(id);
            return NextResponse.json({ ok: true });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
