const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Connection to the SQlite database
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

// Creating the Bugs table (Bug_ID, User, Type, Description)
const sql_create = `CREATE TABLE IF NOT EXISTS Bugs (
  Bug_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User VARCHAR(100) NOT NULL,
  Type VARCHAR(100) NOT NULL,
  Description TEXT
);`;
db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Bugs' table");
  // Database seeding
  const sql_insert = `INSERT INTO Bugs (Bug_ID, User, Type, Description) VALUES
  (1, 'Luca', 'High', 'Production Proble'),
  (2, 'Peter', 'Medium', 'Dev Problem'),
  (3, 'Jack', 'Low', 'Reset Pwd');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 Bugs");
  });
});

// Starting the server
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  // res.send("Hello world...");
  res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /data
app.get("/data", (req, res) => {
  const test = {
    titre: "Test",
    items: ["one", "two", "three"]
  };
  res.render("data", { model: test });
});

// GET /Bugs
app.get("/bugs", (req, res) => {
  const sql = "SELECT * FROM Bugs ORDER BY User";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("bugs", { model: rows });
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Bugs (User, Type, Description) VALUES (?, ?, ?)";
  const bug = [req.body.User, req.body.Type, req.body.Description];
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs");
  });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Bugs WHERE Bug_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const bug = [req.body.User, req.body.Type, req.body.Description, id];
  const sql = "UPDATE Bugs SET User = ?, Type = ?, Description = ? WHERE (Bug_ID = ?)";
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Bugs WHERE Bug_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Bugs WHERE Bug_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs");
  });
});
