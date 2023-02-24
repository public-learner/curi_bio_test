const md5 = require("md5");
const jwt = require("jsonwebtoken");
const auth = require("../middleware");   
const db = require("../db/db");
const bcrypt = require("bcryptjs")

module.exports = function (app) {
  app.get("/", (req, res) => res.send("API Root"));

  //*  G E T   A L L
  app.get("/api/users", (req, res, next) => {
    var sql = "SELECT * FROM Users";
    var params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({error: err});
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  });

  //* G E T   S I N G L E   U S E R
  app.get("/api/user/:id", (req, res, next) => {
    var sql = "SELECT * FROM Users WHERE id = ?";
    db.all(sql, req.params.id, (err, rows) => {
      if (err) {
        res.status(400).json({error: err});
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  });

  // * R E G I S T E R   N E W   U S E R
  app.post("/api/register", async (req, res) => {
    var errors = {};
    try {
      const {username, email, password, info} = req.body;

      if (!username) {
        errors.username = "username is missing";
      }
      if (!email) {
        errors.email = "email is missing";
      }
      if (!password) {
        errors.password = "password is missing";
      }
      if (Object.keys(errors).length) {
        res.status(400).json({error: errors});
        return;
      }
      let userExists = false;

      var sql = "SELECT * FROM Users WHERE email = ?";
      await db.all(sql, email, (err, result) => {
        if (err) {
          res.status(402).json({error: err});
          return;
        }

        if (result.length === 0) {
          var salt = bcrypt.genSaltSync(10);

          var data = {
            username: username,
            email: email,
            password: bcrypt.hashSync(password, salt),
            Salt: salt,
            created_at: Date("now"),
            info: info,
          };

          var sql =
            "INSERT INTO Users (username, email, password, Salt, created_at, info) VALUES (?,?,?,?,?,?)";
          var params = [
            data.username,
            data.email,
            data.password,
            data.Salt,
            data.created_at,
            data.info,
          ];
          var user = db.run(sql, params, function (err, innerResult) {
            if (err) {
              res.status(400).json({error: err});
              return;
            }
          });
        } else {
          userExists = true;
        }
      });

      setTimeout(() => {
        if (!userExists) {
          res.status(201).json("Success");
        } else {
          res.status(201).json("Record already exists. Please login");
        }
      }, 500);
    } catch (err) {
      console.log(err);
    }
  });

  // * L O G I N
  app.post("/api/login", async (req, res) => {
    try {
      const {email, password} = req.body;
      let errors = {};

      if (!email) {
        errors.email = "username is missing";
      }
      if (!password) {
        errors.password = "password is missing";
      }
      if (Object.keys(errors).length) {
        res.status(400).json({error: errors});
        return res.status(400).json({error: errors});
      }

      let user = [];

      var sql = "SELECT * FROM Users WHERE email = ?";
      db.all(sql, email, function (err, rows) {
        if (err) {
          res.status(400).json({error: err});
          return;
        }

        rows.forEach(function (row) {
          user.push(row);
        });

        if (!user.length) {
          return res.status(400).json({error: "user not found"});
        }

        var PHash = bcrypt.hashSync(password, user[0].Salt);

        if (PHash === user[0].password) {
          // * CREATE JWT TOKEN
          const token = jwt.sign(
            {user_id: user[0].id, username: user[0].username, email},
            process.env.TOKEN_KEY,
            {
              expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
            }
          );
          user[0].Token = token;
        } else {
          return res
            .status(404)
            .json({error: {password: "password incorrect"}});
        }

        return res.status(200).send(user);
      });
    } catch (err) {
      console.log(err);
    }
  });

  // * U P D A T E   N E W   U S E R
  app.put("/api/update", auth, async (req, res) => {
    try {
      const user = req.user;
      const {username, email, password, info} = req.body;

      const update_fields = Object.keys(req.body);

      const field_valid = update_fields.every(async field_name => {
        const sql = `PRAGMA table_info("Users")`;
        await db.all(sql, (err, result) => {
          let column_exist = result.some(field => {
            return field.name == field_name;
          });
          return column_exist;
        });
      });

      if (!field_valid) {
        return res.status(404).json({error: {field: "field doesn't match"}});
      } else {
        update_fields.forEach(async field_name => {
          let value = req.body[field_name];
          if (field_name == "password") {
            const salt = bcrypt.genSaltSync(10);
            value = bcrypt.hashSync(value, salt);
            await db.run(
              `Update Users SET Salt='${salt}' WHERE id=${user.user_id}`,
                err => {
                    if (err) {
                        return res.status(400).json({ error: err });
                    }
              }
            );
          }
          const sql = `Update Users SET ${field_name}='${value}' WHERE id=${user.user_id}`;

          let result = db.run(sql, err => {
            if (err) {
              res.status(400).json({error: err});
              return;
            }
          });
        });

        return res
          .status(200)
          .json({success: "user profile updated successfully"});
      }
    } catch (err) {
      console.log(err);
    }
  });

  // * D E L E T E   U S E R
  app.get("/api/delete", auth, async (req, res) => {
    try {
      const user = req.user;
      const sql = `DELETE FROM Users WHERE id=${user.user_id}`;
      await db.run(sql, err => {
        if (err) {
          return res.status(400).json({error: err});
        }
        return res
          .status(200)
          .json({success: "user profile deleted successfully"});
      });
    } catch (err) {
      console.log(err);
    }
  });

  // * G E T   U S E R   I N F O
  app.get("/api/info", auth, async (req, res) => {
    const user = req.user;
    var sql = "SELECT * FROM Users WHERE id = ?";

    db.all(sql, user.user_id, (err, rows) => {
      if (err) {
        res.status(400).json({error: err});
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  });

  // * T E S T

  app.post("/api/test", auth, (req, res) => {
    res.status(200).send("Token Works - Yay!");
  });
};
