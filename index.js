// imports the Express,Sqlite3 module
const express = require("express");
const path = require("path");
//Test LS
const path_dev = require("path");

const sqlite3 = require("sqlite3").verbose();

// Instantiate the Express server
const app = express();

// Server configuration and set EJS template engine
app.set("view engine", "ejs");
//Specify that the views Ejs are saved in the “views” folder
app.set("views", path.join(__dirname, "views"));

//create a Dev views that point to a copy of views dir "views_dev" so I can separate the Env from Dev to Production

app.set("views", path.join(__dirname, "views_dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Define db varible and Connection to the SQlite database "apptest.db"
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

// Creating the Bugs table (Bug_ID, User, Type, Description, Timestamp) and manage exception for default error
const sql_create = `CREATE TABLE IF NOT EXISTS Bugs (
  Bug_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User VARCHAR(100) NOT NULL,
  Type VARCHAR(100) NOT NULL,
  Description TEXT,
  Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Bugs' table");
  // Database seeding
  const sql_insert = `INSERT INTO Bugs (Bug_ID, User, Type, Description, Timestamp) VALUES
  (1, 'Luca', 'High', 'Production Problem', 'CURRENT_TIMESTAMP'),
  (2, 'Peter', 'Medium', 'Dev Problem', 'CURRENT_TIMESTAMP'),
  (3, 'Jack', 'Low', 'Reset Pwd', 'CURRENT_TIMESTAMP');`;
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

// GET / root app
app.get("/", (req, res) => {
  // res.send index
  res.render("index");
});

// GET /about test url
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /data test url
app.get("/data", (req, res) => {
  const test = {
    titre: "Test",
    items: ["one", "two", "three"]
  };
  res.render("data", { model: test });
});

// GET list all BUGS
app.get("/bugs", (req, res) => {
  const sql = "SELECT * FROM Bugs ORDER BY User";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("bugs", { model: rows });
  });
});

//GET List all BUGS in DEV mode
// GET /Bugs
app.get("/bugs_dev", (req, res) => {
  const sql = "SELECT * FROM Bugs ORDER BY User";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("bugs_dev", { model: rows });
  });
});

// GET point to new bug in DEV Mode
app.get("/create_dev", (req, res) => {
  res.render("create_dev", { model: {} });
});

// POST for create a new bug in DEV Mode
app.post("/create_dev", (req, res) => {
  const sql = "INSERT INTO Bugs (User, Type, Description, Timestamp) VALUES (?, ?, ?, ?)";
  const bug = [req.body.User, req.body.Type, req.body.Description, req.body.Timestamp];
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs_dev");
  });
});

// GET /edit_dev/5 in DEV MODE by id
app.get("/edit_dev/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Bugs WHERE Bug_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit_dev", { model: row });
  });
});


// POST /edit_dev/5 in DEV MODE for edit by id bug
app.post("/edit_dev/:id", (req, res) => {
  const id = req.params.id;
  const bug = [req.body.User, req.body.Type, req.body.Description, req.body.Timestamp, id];
  const sql = "UPDATE Bugs SET User = ?, Type = ?, Description = ?, Timestamp = ? WHERE (Bug_ID = ?)";
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs_dev");
  });
});


// GET /delete/5 delete in DEV MODE
app.get("/delete_dev/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Bugs WHERE Bug_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete_dev", { model: row });
  });
});

// POST /delete/id in DEV MODE by id bug
app.post("/delete_dev/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Bugs WHERE Bug_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs_dev");
  });
});

// GET /create Bug
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create Bug
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Bugs (User, Type, Description, Timestamp) VALUES (?, ?, ?, ?)";
  const bug = [req.body.User, req.body.Type, req.body.Description, req.body.Timestamp];
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs");
  });
});

// GET /edit/5 edit Bug
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

// POST /edit/id edit Bug by id
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const bug = [req.body.User, req.body.Type, req.body.Description, req.body.Timestamp, id];
  const sql = "UPDATE Bugs SET User = ?, Type = ?, Description = ?, Timestamp = ? WHERE (Bug_ID = ?)";
  db.run(sql, bug, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/bugs");
  });
});

// GET delete/id by id bug
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

// POST /delete/id by id bug
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
