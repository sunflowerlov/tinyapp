const getUserByEmail = function (email, userDatabase) {
  for (const eachUser in userDatabase) {
    if (userDatabase[eachUser].email === email) {
      return userDatabase[eachUser].id;
    }
  }
};

const urlForUser = function (userId, urlDatabase) {
  for (const eachId in urlDatabase) {
    if (urlDatabase[eachId].userID === userId) {
      return urlDatabase[eachId].longURL;
    }
  }
};

const urlsForUser = function (userId, urlDatabase) {
  const urls = {};
  for (const eachId in urlDatabase) {
    if (urlDatabase[eachId].userID === userId) {
      urls[eachId] = urlDatabase[eachId];
    }
  }
  return urls;
};

module.exports = {getUserByEmail, urlForUser, urlsForUser}