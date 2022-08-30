const getUserByEmail = function (email, userDatabase) {
  for (const eachUser in userDatabase) {
    if (userDatabase[eachUser].email === email) {
      return userDatabase[eachUser].id;
    }
  }
  //return false;
};

module.exports = {getUserByEmail}