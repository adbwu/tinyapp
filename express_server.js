const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: '0qIlsQBcTApmlQSnIhIa',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const generateRandomString = (num) => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let ranStr = "";
  for (let i = 0; i < num; i++) {
    ranStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ranStr;
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID:"userRandomID"
  },
  "9sm5xK" : {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "n5xCn3": {
    longURL: "http://www.ytmnd.com",
    userID:"t53s32"
  },
  "M5Th3s" : {
    longURL: "http://www.zombo.com",
    userID: "user2RandomID"
  },
  "c3km32": {
    longURL: "http://www.staples.ca",
    userID:"t53s32"
  },
  "g4s23f" : {
    longURL: "http://www.rottentomatoes.com",
    userID: "t53s32"
  }
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
  t53s32: {
    id: "t53s32",
    email: "fake@fake.com",
    password: "password",
  }
};

// POSTS ---------------------------------------------

// logs user in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email, users) === undefined) {
    res.status(403).send("An account associated with that email does not exist. Please go back and try again.");
  } else {
    let checkAcc = getUserByEmail(email, users);
    console.log(checkAcc);
    if (email === checkAcc.email && bcrypt.compareSync(password, checkAcc.password)) {
      req.session.user_id = checkAcc.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Email and password do not match. Please go back and try again.");
    }
  }
});

// logs user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// user registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = "user" + generateRandomString(6);
  if (email === "" || password === "") {
    res.status(400).send("Email or password field left blank. Please go back and try again.");
  } else if (getUserByEmail(email, users) !== undefined) {
    res.status(400).send("Email already exists. Please go back and try again.");
  }
  users[userId] = {
    "id": userId,
    "email": email,
    "password": bcrypt.hashSync(password, 10)
  };
  req.session.user_id = userId;
  res.redirect("/urls");
});


// creates new shorted url and adds to db
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).send("Unregistered users are not permitted to shorten urls.");
  } else {
    const id = generateRandomString(6);
    urlDatabase[id] = { "longURL" : req.body.longURL, "userID" : userId };
    res.redirect(`/urls/${id}`);
  }
});

// edits an existing longURL
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const userURLS = urlsForUser(userId, urlDatabase);
  if (!userId) {
    res.status(403).send("Unregistered users are not permitted to edit urls.");
  } else if (!urlDatabase[id]) {
    res.status(403).send("There is no entry for the corresponding TinyURL.");
  } else if (!userURLS[id]) {
    res.status(403).send("This TinyURL does not belong to you.");
  } else {
    urlDatabase[id] = req.body.urlDatabase[id].longURL;
    res.redirect(`/urls/${id}`);
  }
});

// deletes existing shortened url
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const userURLS = urlsForUser(userId, urlDatabase);
  if (!userId) {
    res.status(403).send("Unregistered users are not permitted to delete urls.");
  } else if (!urlDatabase[id]) {
    res.status(403).send("There is no entry for the corresponding TinyURL.");
  } else if (!userURLS[id]) {
    res.status(403).send("This TinyURL does not belong to you.");
  } else {
    delete urlDatabase[(req.params.id)];
    res.redirect("/urls");
  }
});


// GETS --------------------------------------------


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };
  res.render('urls_index', templateVars);
});

app.get("/registration", (req, res) => {
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  let templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  let message;
  if (!req.session.user_id) {
    message = "loggedout";
  }
  if (urlDatabase[req.params.id]["userID"] !== userId) {
    message = "notbelong";
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[(req.params.id)]["longURL"],
    user: users[userId],
    message: message
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[(req.params.id)].longURL;
  if (!longURL) {
    res.status(404).send("This shortened URL does not exists in our database.");
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

