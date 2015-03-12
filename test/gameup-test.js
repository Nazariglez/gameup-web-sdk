var jsdom  = require('jsdom'),
    assert = require('assert');

var client;

before(function(done) {
  jsdom.env({
    'html': '<html><body></body></html>',
    'scripts': [
      __dirname + '/../bower_components/jquery/dist/jquery.min.js',
      __dirname + '/../build/js/gameup.js'
    ],
    'done': function(errors, window) {
      // polyfill 'btoa' function support
      window.btoa = function(str) {
        return new Buffer(str.toString(), 'binary').toString('base64');
      };

      // necessary to allow xdomain requests in tests
      window.$.support.cors = true;

      window.$(window.document).ajaxError(function(event, jqXHR, settings, errorThrown) {
        console.log(errorThrown);
      });

      // TODO move API key to an Env Var
      client = new window.GameUp.Client('6fb004d4289748199cb858ab0905f657');
      done(errors);
    }
  });
});

// helper to invoke failure from JSON error responses
function errorAssert(done) {
  return function(status, response) {
    done(status);
  };
};

describe('Web SDK Tests', function() {
  var leaderboardId = '6ded1e8dbf104faba384bb659069ea69';

  it('Ping', function(done) {
    client.ping({
      success: function(status, data) {
        assert.strictEqual(status, 200);
        done();
      },
      error: errorAssert(done)
    });
  });

  it('Get Server Info', function(done) {
    client.getServerInfo({
      success: function(status, data) {
        assert.strictEqual(status, 200);
        done();
      },
      error: errorAssert(done)
    });
  });

  it('Get Game', function(done) {
    client.getGame({
      success: function(status, data) {
        assert.strictEqual(status, 200);
        done();
      },
      error: errorAssert(done)
    });
  });

  it('Get Game Achievements', function(done) {
    client.getAchievements({
      success: function(status, data) {
        assert.strictEqual(status, 200);
        done();
      },
      error: errorAssert(done)
    });
  });

  it('Get Game Leaderboard', function(done) {
    client.getLeaderboard(leaderboardId, {
      success: function(status, data) {
        assert.strictEqual(status, 200);
        done();
      },
      error: errorAssert(done)
    });
  });

  describe('Gamer Tests', function() {
    var storageKey    = 'profile_info';
    var achievementId = '70c99a8e6dff4a6fac7e517a8dd4e83f';
    var token;

    before(function(done) {
      client.loginAnonymous('gameup-js-test-anonymous-id-login', {
        success: function(status, data) {
          assert.strictEqual(status, 200);

          token = data.token;
          done();
        },
        error: errorAssert(done)
      });
    });

    it.skip('Facebook (OAuth2) Login', function(done) {
      var accessToken = 'facebook-access-token';

      client.loginOAuthFacebook(accessToken, {
        success: function(status, data) {
          assert.strictEqual(status, 200);
          assert.notEqual(data.length, 0);
          done();
        },
        error: function (status, response) {
          assert.ok(status == 0 || status == 400, "Bad Facebook Access Token");
          done();
        },
      }, token);
    });

    it('Get Gamer', function(done) {
      client.getGamer(token, {
        success: function(status, data) {
          assert.strictEqual(status, 200);
          assert.notEqual(data.nickname, 0);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Delete Object from Cloud Storage', function(done) {
      client.storageDelete(token, storageKey, {
        success: function(status, data) {
          assert.strictEqual(status, 204);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Add Object to Cloud Storage', function(done) {
      var object = {
        'level': 6,
        'level_name': 'bloodline',
        'bosses_killed': ['mo', 'chris', 'andrei']
      };

      client.storagePut(token, storageKey, object, {
        success: function(status, data) {
          assert.strictEqual(status, 204);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Get Object from Cloud Storage', function(done) {
      client.storageGet(token, storageKey, {
        success: function(status, data) {
          assert.strictEqual(status, 200);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Get Gamer Achievements', function(done) {
      client.getGamerAchievements(token, {
        success: function(status, data) {
          assert.strictEqual(status, 200);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Update Gamer Achievement', function(done) {
      client.updateAchievement(token, achievementId, 10, {
        success: function(status, data) {
          assert.ok(status === 201 || status === 204, "Bad Response Status.");
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Get Gamer Leaderboard', function(done) {
      client.getLeaderboardWithRank(token, leaderboardId, {
        success: function(status, data) {
          assert.strictEqual(status, 200);
          done();
        },
        error: errorAssert(done)
      });
    });

    it('Update Gamer Rank on Leaderboard', function(done) {
      var score = new Date().getTime();

      client.updateLeaderboardRank(token, leaderboardId, score, {
        success: function(status, data) {
          assert.ok(status === 200 || status === 201, "Bad Response Status.");
          done();
        },
        error: errorAssert(done)
      });
    });
  });
});
