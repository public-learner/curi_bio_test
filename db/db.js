const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = "usersdb.sqlite";
const bcrypt = require("bcryptjs");

let db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    var salt = bcrypt.genSaltSync(10);

    db.run(
      `CREATE TABLE Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text, 
            email text, 
            password text,             
            Salt text,    
            Token text,
            deleted_at DATE,
            created_at DATE,
            info text
            )`,
      err => {
        if (err) {
          // Table already created
          console.log("Table already created");
        } else {
          // Table just created, creating some rows
          var insert =
            "INSERT INTO Users (username, email, password, Salt, created_at) VALUES (?,?,?,?,?)";
          db.run(insert, [
            "user1",
            "user1@example.com",
            bcrypt.hashSync("user1", salt),
            salt,
            Date("now"),
          ]);
          db.run(insert, [
            "user2",
            "user2@example.com",
            bcrypt.hashSync("user2", salt),
            salt,
            Date("now"),
          ]);
          db.run(insert, [
            "user3",
            "user3@example.com",
            bcrypt.hashSync("user3", salt),
            salt,
            Date("now"),
          ]);
          db.run(insert, [
            "user4",
            "user4@example.com",
            bcrypt.hashSync("user4", salt),
            salt,
            Date("now"),
          ]);
        }
      }
    );
  }
});

module.exports = db;
