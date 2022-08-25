const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
var cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  let result = Math.random().toString(36).substr(2, 6);
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

const getUserByEmail = function (email) {
  for (const eachUser in users) {
    if (users[eachUser].email === email) {
      return true
    }
  }
  return false
};

const getUserByPassword = function (password) {
  for (const eachUser in users) {
    if (users[eachUser].password === password) {
      return true
    }
  }
  return false
};

const getUserId = function (email) {
  for (const eachUser in users) {
    if (users[eachUser].email === email) {
      return eachUser
    }
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user: users[id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get('/login', (req, res) => {
  res.render('urls_login')
})

app.post("/urls/:id", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.params", req.params);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.send("ok");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const findUserByEmail = getUserByEmail(email)
  const findUserByPassword = getUserByPassword(password)
  if (!findUserByEmail) {
    return res.status(403).send('invalid email or password')
  }
  if (!findUserByPassword) {
    return res.status(403).send('invalid email or password')
  }
  const findUserId = getUserId(email)
  res.cookie("user_id", findUserId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("something wrong");
  }
  const findUserByEmail = getUserByEmail(email)
  if (findUserByEmail) {
    return res.status(400).send("same email")  
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
