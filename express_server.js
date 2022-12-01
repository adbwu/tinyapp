const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = (num) => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let ranStr = "";
  for (let i = 0; i < num; i++) {
    ranStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ranStr;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// POSTS ---------------------------------------------

// logs user in
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// logs user out
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

// creates new shorted url and adds to db
app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// edits an existing longURL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// deletes existing shortened url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[(req.params.id)];
  res.redirect("/urls");
});


// GETS --------------------------------------------


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[(req.params.id)],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[(req.params.id)];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

