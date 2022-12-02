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

// returns user or false if email doesn't exist in usersDb
const getUserByEmail = (email) => {
  let usersArr = Object.entries(users);
  for (const user of usersArr) {
    if (user[1].email === email) {
      return users[user[0]];
    }
  }
  return false;
};

// POSTS ---------------------------------------------

// logs user in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email) === false) {
    res.status(403).send("An account associated with that email does not exist. Please go back and try again.");
  }
  let checkAcc = getUserByEmail(email);
  if (email === checkAcc.email && password === checkAcc.password) {
    res.cookie('user_id', checkAcc.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Email and password do not match. Please go back and try again.");
  }
});

// logs user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

// user registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = "user" + generateRandomString(6);
  if (email === "" || password === "") {
    res.status(400).send("Email or password field left blank. Please go back and try again.");
  } else if (getUserByEmail(email) !== false) {
    res.status(400).send("Email already exists. Please go back and try again.");
  }
  users[userId] = {
    "id": userId,
    "email": email,
    "password": password
  };
  res.cookie('user_id', userId);
  res.redirect("/urls");
});


// creates new shorted url and adds to db
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.status(403).send("Unregistered users are not permitted to shorten urls.");
  } else { const id = generateRandomString(6);
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
  }
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
});

app.get("/registration", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    res.redirect("/urls");
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('registration', templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    res.redirect("/urls");
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('login', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.redirect("/login");
  }
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
  if (!longURL) {
    res.status(404).send("This shortened URL does not exists in our database.");
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

