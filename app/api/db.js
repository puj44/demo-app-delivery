import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db = null;


const dbConnection = async (req, res) => {
    if (!db) {
        db = await open({
            filename: "./collection.db",
            driver: sqlite3.Database,
        });
    }
    return db;
}
export default dbConnection;