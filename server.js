const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
app.set("views", path.join(__dirname, "views"));

const dataFile = path.join(__dirname, "users.json");

function getUsers() {
  if (!fs.existsSync(dataFile)) return [];
  const data = fs.readFileSync(dataFile);
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

app.get("/", (req, res) => {
  const users = getUsers();
  res.render("index.html", { users });
});

app.post("/add", (req, res) => {
  const users = getUsers();
  const newUser = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
  };
  users.push(newUser);
  saveUsers(users);
  res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let users = getUsers();
  users = users.filter(user => user.id !== id);
  saveUsers(users);
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const users = getUsers();
  const user = users.find(u => u.id === id);
  res.render("edit.html", { user });
});

app.post("/update/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let users = getUsers();
  users = users.map(u => {
    if (u.id === id) {
      return { ...u, name: req.body.name, email: req.body.email };
    }
    return u;
  });
  saveUsers(users);
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});