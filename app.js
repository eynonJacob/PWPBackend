const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const usersStore = require("./store/users");
const validateWith = require("./middleware/validation");

//Create connection
const connection = mysql.createConnection({
  host: "pwdatabase-3.cjfnssvllilw.eu-west-2.rds.amazonaws.com",
  user: "admin",
  password: "je102004",
  database: "PaddleWestProject",
});
//Forms connection to SQL Database
connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("mysql connected");
});

const app = express();
app.use(bodyParser.json());

// PORT for server enviroment
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

//app.___()
// get
// post
// put
// delete

//HIRES
app.get("/api/hires", (req, res) => {
  let sql = "SELECT * FROM Hires WHERE returned = 0 ORDER BY hireID desc";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/api/historichires", (req, res) => {
  let sql = "SELECT * FROM Hires ORDER BY hireID desc";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/api/addhire", async (req, res) => {
  let hire = {
    equipmentID: req.body.equipmentID,
    staffID: req.body.staffID,
    dateOfHire: req.body.dateOfHire,
    dateOfReturn: req.body.dateOfReturn,
    customerName: req.body.customerName,
    customerPhone: req.body.customerPhone,
    customerEmail: req.body.customerEmail,
    returned: req.body.returned,
  };
  let sql = "INSERT INTO Hires SET ?";
  connection.query(sql, hire, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(201).send(hire);
  });
});

app.post("/api/returnhire", async (req, res) => {
  let hire = {
    hireID: req.body.hireID,
  };
  let sql = `UPDATE Hires SET returned = 1 WHERE hireID = ${hire.hireID}`;
  connection.query(sql, hire, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(201).send(hire);
  });
});

//EQUIPMENT
app.get("/api/equipment", (req, res) => {
  let sql = "SELECT * FROM Equipment";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/api/addequipment", async (req, res) => {
  let equipment = {
    productName: req.body.productName,
    dateOfPurchase: req.body.dateOfPurchase,
    active: req.body.active,
    usesSinceLast: req.body.usesSinceLast,
    checkDate: req.body.checkDate,
    hirePrice: req.body.hirePrice,
  };
  let sql = "INSERT INTO Equipment SET ?";
  connection.query(sql, equipment, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(201).send(equipment);
  });
});

//MAINTENANCE
app.get("/api/needmaintenance", (req, res) => {
  let date = new Date().toJSON();
  let sql = `SELECT * FROM Equipment WHERE checkDate < "${date.substring(
    0,
    10
  )}"`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/api/ismaintained", async (req, res) => {
  let date = new Date().toJSON();
  //THIS DATE NEEDS TO ADD 3 MONTHS
  let equipment = {
    equipmentID: req.body.equipmentID,
  };
  let sql = `UPDATE Equipment SET checkDate = "${date.substring(
    0,
    10
  )}" WHERE equipmentID = ${equipment.equipmentID}`;
  connection.query(sql, equipment, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(201).send(equipment);
  });
});

//-----AUTH & STAFF
const schema = {
  email: Joi.string().required(),
  password: Joi.string().required().min(5),
};

app.post("/api/auth", validateWith(schema), (req, res) => {
  const { email, password } = req.body;
  const user = usersStore.getUserByEmail(email);
  if (!user || user.password !== password)
    return res.status(400).send({ error: "Invalid email or password." });

  const token = jwt.sign(
    { userId: user.id, name: user.name, email },
    "jwtPrivateKey"
  );
  res.send(token);
});

app.get("/api/staff", (req, res) => {
  res.send(usersStore.getUsers());
});

app.post("/api/addstaff", (req, res) => {
  const { name, email, password } = req.body;
  if (usersStore.getUserByEmail(email))
    return res
      .status(400)
      .send({ error: "A user with the given ID already exists." });

  const user = { name, email, password };
  usersStore.addUser(user);

  res.status(201).send(user);
});
