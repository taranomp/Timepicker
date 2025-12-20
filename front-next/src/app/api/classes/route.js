import { NextResponse } from "next/server";
import DataManager from "@/app/lib/DataManager";

/*
  GET  -> list all classes
  POST -> create a new class (body: { id, title })
*/


export async function GET() {
    DataManager.getAllClasses();
    console.log('classes')
    try {
        const classes = DataManager.getAllClasses();
        console.log('classes', classes);
        return NextResponse.json(classes);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, title } = body;
        if (!id || !title) {
            return NextResponse.json({ error: "id and title required" }, { status: 400 });
        }
        const created = DataManager.createClass({ id, title });
        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
