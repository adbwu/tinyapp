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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

// user registration
app.post("/register", (req, res) => {
  //create user id
  const email = req.body.email;
  const password = req.body.password;
  const userId = "user" + generateRandomString(6);
  //add user to user database
  users[userId] = {
    "id": userId,
    "email": email,
    "password": password
  };
  //add coookies
  res.cookie('user_id', userId);
  res.redirect("/urls");
  console.log(users);
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
  const userId = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('urls_index', templateVars);
  console.log(users);
});

app.get("/registration", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('registration', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[(req.params.id)],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[(req.params.id)];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

