const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);

  });
  it('should return undefined with none existent email', function() {
    const user = getUserByEmail("fake@example.com", testUsers);
    assert.strictEqual(user, undefined);

  });
});


describe('urlsForUser', function() {
  it('should return an object containing that user\'s URLs', function() {
    const userURLObj = urlsForUser("t53s32", testUrlDatabase);
    const expectedURLObj = {n5xCn3: "http://www.ytmnd.com",
      c3km32: "http://www.staples.ca",
      g4s23f: "http://www.rottentomatoes.com"
    };
    assert.deepEqual(userURLObj, expectedURLObj);
  });
  it('should return an empty object if user has no URLs', function() {
    const userURLObj = urlsForUser("sr323d", testUrlDatabase);
    assert.deepEqual(userURLObj, {});

  });
});