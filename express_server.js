const { getUserByEmail } = require('./helpers')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
var cookieSession = require('cookie-session')
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 100
}));
const bcrypt = require("bcryptjs");

function generateRandomString() {
  let result = Math.random().toString(36).substr(2, 6);
  return result;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

const checkURLId = function (id) {
  for (const eachId in urlDatabase) {
    if (urlDatabase[eachId].longURL === urlDatabase[id].longURL) {
      return true;
    }
  }
  return false;
};

const urlForUser = function (userId) {
  for (const eachId in urlDatabase) {
    if (urlDatabase[eachId].userID === userId) {
      return urlDatabase[eachId].longURL;
    }
  }
};

const urlsForUser = function (userId) {
  const urls = {};
  for (const eachId in urlDatabase) {
    if (urlDatabase[eachId].userID === userId) {
      urls[eachId] = urlDatabase[eachId];
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const templateVars = {
      urls: urlsForUser(id),
      user: users[id],
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("please login first!");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const templateVars = {
      user: users[id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const longURL = urlForUser(userId);
    console.log("longURL", longURL);
    if (longURL) {
      const id = req.session.user_id;
      const templateVars = {
        id: req.params.id,
        longURL,
        user: users[id],
      };
      res.render("urls_show", templateVars);
    } else {
      res.send("not your url");
    }
  } else {
    res.send("please login first");
  }
});

app.get("/u/:id", (req, res) => {
  //console.log("id", req.params.id);
  const id = req.params.id;
  const findURLId = checkURLId(id);
  if (findURLId) {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else {
    res.send("id not exist");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    const urlObj = urlDatabase[req.params.id]
    if (urlObj) {
      if (urlObj.userID === req.session.user_id) {
        console.log("req.body", req.body);
        console.log("req.params", req.params);
        urlObj.longURL = req.body.url
        res.redirect("/urls");
      } else {
        res.send("you do not own this url");
      }
    } else {
      res.send("url does not exist");
    }
  } else {
    res.send("please login first!");
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect("/urls");
  } else {
    res.send("please login first");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id) {
    const urlObj = urlDatabase[req.params.id]
    if (urlObj) {
      if (urlObj.userID === req.session.user_id) {
        const shortURL = req.params.id;
        delete urlDatabase[shortURL];
        res.redirect("/urls");
      } else {
        res.send("you do not own this url");
      }
    } else {
      res.send("id does not exist");
    }
  } else {
    res.send("please login first");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const findUserByEmail = getUserByEmail(email, users);
  //console.log(findUserByEmail)
  //const findUserId = getUserId(email);  
  if (!findUserByEmail) {
    return res.status(403).send("invalid email");
  }
  //console.log(users[findUserId])
  if (!bcrypt.compareSync(password, users[findUserByEmail].password)) {
    return res.status(403).send("invalid password");
  }
  req.session.user_id = findUserByEmail;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("something wrong");
  }
  const findUserByEmail = getUserByEmail(email, users);
  console.log('fine', findUserByEmail)
  if (findUserByEmail) {
    return res.status(400).send("same email");
  }
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword,
  };
  //console.log('users obj', users)
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
