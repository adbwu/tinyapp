// returns user or false if email doesn't exist in usersDb
const getUserByEmail = (email, database) => {
  let usersArr = Object.entries(database);
  for (const user of usersArr) {
    if (user[1].email === email) {
      return database[user[0]];
    }
  }
  return undefined;
};

//creates an object of urls only belonging to user
const urlsForUser = (userId, database) => {
  let usersURLs = {};
  for (let url in database) {
    if (database[url]["userID"] === userId) {
      usersURLs[url] = database[url]["longURL"];
    }
  }
  return usersURLs;
};

module.exports = { getUserByEmail, urlsForUser };