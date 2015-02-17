/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../lib/gameup.ts" />

QUnit.config.reorder = false;

var g: GameUp.Client = new GameUp.Client("6fb004d4289748199cb858ab0905f657");
var token: string = "";
var storageKey: string = "profile_info";
var achievementId: string = "70c99a8e6dff4a6fac7e517a8dd4e83f";
var leaderboardId: string = "6ded1e8dbf104faba384bb659069ea69";

function createErrorAssert(assert: any, done: any) {
  return function(status: number, response: any) {
    var message : any = {}
    if (!!response) {
      message = response.message;
    }
    assert.push(status > 0 && status < 400, status, 200, status + ": " + JSON.stringify(message))
    done();
  }
}

QUnit.test("GET /", function(assert) {
  var done = assert.async();
  g.ping({
    success: function(status: number, data: any) {
      assert.equal(status, 200, "Ping successful");  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /server/", function(assert) {
  var done = assert.async();
  g.getServerInfo({
    success: function(status: number, data: any) {
      assert.notEqual(data.time, 0, "Successfully retrieved server time: " + data.time);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /game/", function(assert) {
  var done = assert.async();
  g.getGame({
    success: function(status: number, game: any) {
      assert.notEqual(game.created_at, 0, "Successfully retrieved game data: " + JSON.stringify(game));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /game/achievement/"+achievementId, function(assert) {
  var done = assert.async();
  g.getAchievements({
    success: function(status: number, achievements: any) {
      assert.notEqual(achievements, null, "Successfully retrieved game achievements: " + JSON.stringify(achievements));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /game/leaderboard/"+leaderboardId, function(assert) {
  var done = assert.async();
  g.getLeaderboard(leaderboardId, {
    success: function(status: number, leaderboard: any) {
      assert.notEqual(leaderboard, null, "Successfully retrieved game leaderboard: " + JSON.stringify(leaderboard));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("POST /gamer/login/anonymous/", function(assert) {
  var done = assert.async();
  g.loginAnonymous("gameup-js-test-anonymous-id-login", {
    success: function(status: number, gamerToken: any) {
      token = gamerToken;
      assert.notEqual(gamerToken.length, 0, "Successfully logged in login anonymously: " + gamerToken);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("POST /gamer/login/oauth2", function(assert) {
  var done = assert.async();
  g.loginOAuthFacebook("facebook-access-token", {
    success: function(status: number, gamerToken: any) {
      token = gamerToken;
      assert.notEqual(gamerToken.length, 0, "Successfully logged in through OAuth2 Facebook: " + gamerToken);  
      done();
    },
    error: function(status: number, gamerToken: any) {
      token = gamerToken;
      assert.ok(status == 0 || status == 500, "Bad Facebook Access Token");  
      done();
    },
  }, token); 
});

QUnit.test("BROWSER /v0/gamer/login/facebook", function(assert) {
  var done = assert.async();
  g.loginFacebook({
    success: function(status: number, gamerToken: any) {
      token = gamerToken;
      assert.notEqual(gamerToken.length, 0, "Successfully logged in through Facebook: " + gamerToken);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("BROWSER /v0/gamer/login/gameup", function(assert) {
  var done = assert.async();
  g.loginGameUp({
    success: function(status: number, gamerToken: any) {
      token = gamerToken;
      assert.notEqual(gamerToken.length, 0, "Successfully logged in through GameUp: " + gamerToken);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /gamer/", function(assert) {
  var done = assert.async();
  g.getGamer(token, {
    success: function(status: number, gamer: any) {
      assert.notEqual(gamer.name, 0, "Successfully retrieved gamer profile: " + JSON.stringify(gamer));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("DEL /gamer/storage/"+storageKey, function(assert) {
  var done = assert.async();
  g.storageDelete(token, storageKey, {
    success: function(status: number) {
      assert.equal(status, 204, "Successfully deleted storage: " + storageKey);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("PUT /gamer/storage/"+storageKey, function(assert) {
  var done = assert.async();
  var storageData = {
    'level' : 6,
    'level_name' : 'bloodline',
    'bosses_killed' : ['mo', 'chris', 'andrei'],
    'coins_collected' : 9001,
    'meters_jumped' : 1.44,
    'killed' : 10
  };
  
  g.storagePut(token, storageKey, JSON.stringify(storageData), {
    success: function(status: number) {
      assert.equal(status, 204, "Successfully storaged data: " + JSON.stringify(storageData));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /gamer/storage/"+storageKey, function(assert) {
  var done = assert.async();
  g.storageGet(token, storageKey, {
    success: function(status: number, data: any) {
      assert.notEqual(data, null, "Successfully retrieved storage: " + JSON.stringify(data));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /gamer/achievement/"+achievementId, function(assert) {
  var done = assert.async();
  g.getGamerAchievements(token, {
    success: function(status: number, achievements: any) {
      assert.notEqual(achievements, null, "Successfully retrieved gamer achievements: " + JSON.stringify(achievements));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("POST /gamer/achievement/"+achievementId, function(assert) {
  var done = assert.async();
  g.updateAchievement(token, achievementId, 10, {
    success: function(status: number) {
      assert.ok(status >= 200, "Successfully updated achievement: " + achievementId);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("GET /gamer/leaderboard/"+leaderboardId, function(assert) {
  var done = assert.async();
  g.getLeaderboardWithRank(token, leaderboardId, {
    success: function(status: number, leaderboardAndRank: any) {
      assert.notEqual(leaderboardAndRank, null, "Successfully retrieved gamer leaderboard and rank: " + JSON.stringify(leaderboardAndRank));  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});

QUnit.test("POST /gamer/leaderboard/"+leaderboardId, function(assert) {
  var done = assert.async();
  g.updateLeaderboardRank(token, leaderboardId, new Date().getTime(), {
    success: function(status: number) {
      assert.ok(status >= 200, "Successfully updated leaderboard: " + leaderboardId);  
      done();
    },
    error: createErrorAssert(assert, done)
  }); 
});
