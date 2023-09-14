const sqlite3 = require("sqlite3").verbose();

// Connecting to or creating a new SQLite database file
const db = new sqlite3.Database(
    "./collection.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Connected to the SQlite database.");
    }
);

// Serialize method ensures that database queries are executed sequentially
db.serialize(() => {
    // Create the items table if it doesn't exist
    db.run(
        `CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY,
            product_name varchar(255) NOT NULL UNIQUE,
            code varchar(255) NOT NULL UNIQUE,
            available_qty INT
        )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created products table.");

        }
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS vendors(
            id INTEGER PRIMARY KEY, 
            vendor_name varchar(255) NOT NULL
           )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created vendors table.");

        }
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS locations(
            id INTEGER PRIMARY KEY,
            name varchar(255) NOT NULL UNIQUE,
            address varchar(255) NOT NULL,
            state varchar(255) NOT NULL,
            city varchar(255) NOT NULL,
            vendor_id INT NOT NULL,
            CONSTRAINT fk_vendor
                 FOREIGN KEY(vendor_id) 
                 REFERENCES vendors(id)
                 ON DELETE SET NULL
           )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created locations table.");

        }
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS invoices(
            id INTEGER PRIMARY KEY,
            invoice_number varchar(255) NOT NULL UNIQUE,
            vendor_id INT,
            location_id INT,
            created_at TEXT NOT NULL,
            CONSTRAINT fk_vendor
                 FOREIGN KEY(vendor_id) 
                 REFERENCES vendors(id)
                 ON DELETE SET NULL,
            CONSTRAINT fk_location
                 FOREIGN KEY(location_id) 
                 REFERENCES locations(id)
                 ON DELETE SET NULL
           )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created invoices table.");

        }
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS invoice_details(
            invoice_id INT,
            product_id INT,
            ordered_qty INT,
            scanned_qty INT,
            CONSTRAINT fk_invoice
                 FOREIGN KEY(invoice_id) 
                 REFERENCES invoices(id)
                 ON DELETE SET NULL,
            CONSTRAINT fk_product
                 FOREIGN KEY(product_id) 
                 REFERENCES products(id)
                 ON DELETE SET NULL
           )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created invoice_details table.");

        }
    );
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
});