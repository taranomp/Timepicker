import fs from "fs";
import path from "path";

/*
  DataManager: simple file-based manager.
  Methods are designed to be easily swap-able with a DB later.
*/
const DATA_PATH = path.join(process.cwd(), "src", "app", "data", "classes.json");

function safeReadFile() {
    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify({ classes: [] }, null, 2), "utf8");
    }
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw || '{"classes": []}');
}

function safeWriteFile(obj) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), "utf8");
}

export default class DataManager {
    // get all classes
    static getAllClasses() {
        const data = safeReadFile();
        return data.classes;
    }

    // get class by id
    static getClassById(id) {
        const classes = this.getAllClasses();
        return classes.find((c) => c.id === id) || null;
    }

    // generate default calendar (7 days, 3 slots)
    static generateDefaultCalendar() {
        const days = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
        const times = ["3-5","5-7","7-9"];
        const calendar = {};
        days.forEach((d) => {
            calendar[d] = {};
            times.forEach((t) => {
                calendar[d][t] = { active: true, count: 0, users: [] };
            });
        });
        return calendar;
    }

    // create a new class
    static createClass({ id, title }) {
        const data = safeReadFile();
        // prevent duplicate id
        if (data.classes.find((c) => c.id === id)) {
            throw new Error("Class with this id already exists");
        }
        const newClass = {
            id,
            title,
            calendar: this.generateDefaultCalendar(),
            createdAt: new Date().toISOString()
        };
        data.classes.push(newClass);
        safeWriteFile(data);
        return newClass;
    }

    // toggle slot active/inactive (admin)
    static toggleSlot(classId, day, time, enabled) {
        const data = safeReadFile();
        const cls = data.classes.find((c) => c.id === classId);
        if (!cls) throw new Error("Class not found");
        if (!cls.calendar[day] || !cls.calendar[day][time]) throw new Error("Slot not found");
        cls.calendar[day][time].active = !!enabled;
        safeWriteFile(data);
        return cls.calendar[day][time];
    }

    // student picks a slot: adds username (prevent duplicate) and increments count
    static addPick(classId, username, day, time) {
        const data = safeReadFile();
        const cls = data.classes.find((c) => c.id === classId);
        if (!cls) throw new Error("Class not found");
        if (!cls.calendar[day] || !cls.calendar[day][time]) throw new Error("Slot not found");
        const slot = cls.calendar[day][time];
        if (!slot.active) throw new Error("Slot is not active");
        // prevent duplicate same username for same slot
        if (!slot.users.includes(username)) {
            slot.users.push(username);
            slot.count = (slot.count || 0) + 1;
        }
        safeWriteFile(data);
        return slot;
    }

    // clear a class (reset calendar and users) - admin action
    static clearClass(classId) {
        const data = safeReadFile();
        const idx = data.classes.findIndex((c) => c.id === classId);
        if (idx === -1) throw new Error("Class not found");
        data.classes[idx].calendar = this.generateDefaultCalendar();
        // optionally preserve createdAt but remove users/count
        safeWriteFile(data);
        return true;
    }

    // remove an entire class
    static removeClass(classId) {
        const data = safeReadFile();
        data.classes = data.classes.filter((c) => c.id !== classId);
        safeWriteFile(data);
        return true;
    }
}
