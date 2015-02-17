/*
 * Copyright 2014-2015 GameUp
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="../typings/tsd.d.ts" />
declare var $: JQueryStatic;

/**
 * The official Web SDK for the [GameUp](https://gameup.io/) service.
 *
 * GameUp is a scalable, reliable, and fast gaming service for game developers.
 *
 * The service provides the features and functionality provided by game servers
 * today. Our goal is to enable game developers to focus on being as creative as
 * possible and building great games. By leveraging the GameUp service you can
 * easily add social login, gamer profiles, cloud game storage, and many other
 * features.
 *
 * For the full list of features check out our [main documentation](https://gameup.io/docs/).
 *
 * __Note:__ All documentation examples are in JavaScript.
 */
module GameUp {

  /**
   * The callback which handles API responses from the GameUp service.
   */
  export interface ResponseHandler {
    /**
     * Return the successful AJAX response and HTTP status for the request.
     *
     * @param status The status code for the response.
     * @param data   The response object for the successful request.
     */
    success? (status: number, data?: any): any;

    /**
     * Return the failed AJAX response and HTTP status for the request.
     *
     * @param status   The status code for the response.
     * @param response The response object for the failed request.
     */
    error? (status: number, response?: any): any;
  };

  /**
   * A GameUp client to interact with the GameUp Game API.
   *
   * __Note:__ All documentation examples are in JavaScript.
   */
  export class Client {
    /** The base URI for the Accounts service. */
    private ACCOUNTS_URL:string = "https://accounts.gameup.io/v0";
    /** The base URI for the Game API. */
    private API_URL:string = "https://api.gameup.io/v0";

    /**
     * Create a new GameUp client with an [API Key](https://gameup.io/docs/authentication/).
     *
     * ```javascript
     * var client = new GameUp.Client("Your API Key");
     * ```
     *
     * @param apikey The [API Key](https://gameup.io/docs/authentication/) for your game.
     */
    constructor(private apikey: string) {}

    private loginThroughBrowser(provider: string, callback: ResponseHandler, tokenToLink?: string) {
      if (!tokenToLink) {
        tokenToLink = "";
      }

      var w :number = 1000;
      var h :number = 500;
      var l :number = (window.outerWidth / 2) - (w / 2);
      var t :number = (window.outerHeight / 2) - (h / 2);

      var settings :string = 'toolbar=no,location=no,directories=no,status=no,menubar=no,resizable=no' +
        ',copyhistory=no,scrollbars=yes' +
        ',width=' + w +
        ',height=' + h +
        ',top=' + t +
        ',left=' + l;

      var url: string = this.ACCOUNTS_URL + "/gamer/login/" + provider + "/?apiKey=" + this.apikey + "&token="+tokenToLink;
      var popup = window.open(url, 'GameUp Social Login', settings);

      // hack to capture window close event on cross-domain popups
      var interval = window.setInterval(function() {
        try {
          if (!popup || popup.closed) {
            window.clearInterval(interval);
            callback.error(400, 'Window popup was closed.');
          }
        } catch (e) {}
      }, 1000);

      window.addEventListener('message', function(event) {
        var gamerToken = event.data;
        if (typeof callback.success == 'function') {
          callback.success(200, gamerToken);
        }
      });
    }

    private sendRequest(callback: ResponseHandler, to: string, method: string, gamerToken ?: string, payload ?: any) {
      if (!gamerToken) {
        gamerToken = "";
      }

      var ajaxSettings : JQueryAjaxSettings = {
        contentType: "application/json",
        dataType: 'json',
        crossDomain: true,
        timeout: 3000,
        data: payload,
        type: method,
        url: to,
        headers: {
          "Authorization": "Basic " + btoa(this.apikey + ":" + gamerToken)
        },
        success: function(data: any, status: string, jqXHR: JQueryXHR) {
          if (typeof callback.success == 'function') {
            callback.success(jqXHR.status, data);
          }
        },
        error: function(jqXHR: JQueryXHR, status: string, errorThrown: string) {
          if (typeof callback.error == 'function') {
            callback.error(jqXHR.status, jqXHR.responseJSON);
          }
        }
      };

      $.ajax(ajaxSettings);
    }

    private sendApiRequest(callback: ResponseHandler, to: string, method: string, gamerToken ?: string, payload ?: any) {
      this.sendRequest(callback, this.API_URL + to, method, gamerToken, payload);
    }

    private sendLoginRequest(callback: ResponseHandler, to: string, payload: any, token?:string) {
      this.sendRequest(callback, this.ACCOUNTS_URL + "/gamer/login/" + to, "POST", token, payload);
    }

    /**
     * Ping the GameUp service to check it is reachable.
     *
     * ```javascript
     * client.ping({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param callback The callback to handle the API response.
     * @param token    A gamer token (if you've logged in the gamer).
     */
    ping(callback: ResponseHandler, token?: string) {
      this.sendApiRequest(callback, "/", "HEAD");
    }

    /**
     * Get global service information (like server time).
     *
     * ```javascript
     * client.getServerInfo({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param callback The callback to handle the API response.
     */
    getServerInfo(callback: ResponseHandler) {
      this.sendApiRequest(callback, "/server/", "GET");
    }

    /**
     * Retrieve information about the game.
     *
     * ```javascript
     * client.getGame({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param callback The callback to handle the API response.
     */
    getGame(callback: ResponseHandler) {
      this.sendApiRequest(callback, "/game/", "GET");
    }

    /**
     * Perform an anonymous login; with a unique ID if you have one.
     *
     * ```javascript
     * client.loginAnonymous("some unique ID", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param uniqueId A unique ID which can be used to re-login the gamer into
     *                 their session later. See our documentation for [more
     *                 information](https://gameup.io/docs/features/gamer-accounts/#anonymous-login).
     * @param callback The callback to handle the API response.
     */
    loginAnonymous(uniqueId: string, callback: ResponseHandler) {
      this.sendLoginRequest(callback, "anonymous", JSON.stringify({id: uniqueId}));
    }

    /**
     * Display a `window.popup` for Twitter login; with an existing gamer token
     * if you have one.
     *
     * ```javascript
     * client.loginTwitter({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Twitter account to their gamer account.
     */
    loginTwitter(callback: ResponseHandler, tokenToLink?: string) {
      this.loginThroughBrowser("twitter", callback, tokenToLink);
    }

    /**
     * Display a `window.popup` for Google login; with an existing gamer token
     * if you have one.
     *
     * ```javascript
     * client.loginGoogle({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Google account to their gamer account.
     */
    loginGoogle(callback: ResponseHandler, tokenToLink?: string) {
      this.loginThroughBrowser("google", callback, tokenToLink);
    }

    /**
     * Display a `window.popup` for Facebook login; with an existing gamer token
     * if you have one.
     *
     * ```javascript
     * client.loginFacebook({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Facebook account to their gamer account.
     */
    loginFacebook(callback: ResponseHandler, tokenToLink?: string) {
      this.loginThroughBrowser("facebook", callback, tokenToLink);
    }

    /**
     * Display a `window.popup` for GameUp login; with an existing gamer token
     * if you have one.
     *
     * ```javascript
     * client.loginGameUp({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Google account to their gamer account.
     */
    loginGameUp(callback: ResponseHandler, tokenToLink?: string) {
      this.loginThroughBrowser("gameup", callback, tokenToLink);
    }

    /**
     * Perform login with GameUp using a Facebook OAuth Access Token; with an 
     * existing gamer token if you have one.
     *
     * ```javascript
     * client.loginOAuthFacebook("Facebook OAuth Access Token", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param accessToken An OAuth access token from the Facebook SDK.
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Facebook account to their gamer account.
     */
    loginOAuthFacebook(accessToken: string, callback: ResponseHandler, tokenToLink?: string) {
      var payload: string = JSON.stringify({
        'type': "facebook",
        'access_token': accessToken
      });

      this.sendLoginRequest(callback, "oauth2", payload, tokenToLink);
    }

    /**
     * Perform login with GameUp using a Google OAuth Access Token; with an 
     * existing gamer token if you have one.
     *
     * ```javascript
     * client.loginOAuthGoogle("Google OAuth Access Token", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * }, "a gamer token");
     * ```
     *
     * @param accessToken An OAuth access token from the Google SDK.
     * @param callback    The callback to handle the API response.
     * @param tokenToLink A gamer token which enables the gamer to link their
     *                    Google account to their gamer account.
     */
    loginOAuthGoogle(accessToken: string, callback: ResponseHandler, tokenToLink?: string) {
      var payload: string = JSON.stringify({
        'type': "google",
        'access_token': accessToken
      });
    
      this.sendLoginRequest(callback, "oauth2", payload, tokenToLink);
    }

    /**
     * Get information about the gamer who is currently logged in.
     *
     * ```javascript
     * client.getGamer("a gamer token", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token    The gamer token for the currently logged in gamer.
     * @param callback The callback to handle the API response.
     */
    getGamer(token: string, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/gamer/", "GET", token);
    }

    /**
     * Fetch the object from Cloud Storage with the supplied key.
     *
     * ```javascript
     * client.storageGet("a gamer token", "SAVE_GAME_1", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token      The gamer token for the currently logged in gamer.
     * @param storageKey The key for the object to fetch from Cloud Storage.
     * @param callback   The callback to handle the API response.
     */
    storageGet(token: string, storageKey: string, callback: ResponseHandler) {
      var encodedKey: string = encodeURIComponent(storageKey);
      this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "GET", token);
    }

    /**
     * Store a JSON object in Cloud Storage with the supplied key.
     *
     * ```javascript
     * client.storagePut("a gamer token", "SAVE_GAME_1", {
     *   level: 10,
     *   coins: 1000
     * }, {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token      The gamer token for the currently logged in gamer.
     * @param storageKey The key for the object to store in Cloud Storage.
     * @param payload    The JSON object to store in Cloud Storage.
     * @param callback   The callback to handle the API response.
     */
    storagePut(token: string, storageKey: string, payload: any, callback: ResponseHandler) {
      var encodedKey: string = encodeURIComponent(storageKey);
      this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "PUT", token, payload);
    }

    /**
     * Delete the object from Cloud Storage with the supplied key.
     *
     * ```javascript
     * client.storageDelete("a gamer token", "SAVE_GAME_1", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token      The gamer token for the currently logged in gamer.
     * @param storageKey The key for the object to delete from Cloud Storage.
     * @param callback   The callback to handle the API response.
     */
    storageDelete(token: string, storageKey: string, callback: ResponseHandler) {
      var encodedKey: string = encodeURIComponent(storageKey);
      this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "DELETE", token);
    }

    /**
     * Get a list of achievements available for the game, excluding any gamer
     * data such as progress or completed timestamps.
     *
     * ```javascript
     * client.getAchievements({
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param callback The callback to handle the API response.
     */
    getAchievements(callback: ResponseHandler) {
      this.sendApiRequest(callback, "/game/achievement", "GET");
    }

    /**
     * Get a list of achievements completed and in-progress for the gamer.
     *
     * ```javascript
     * client.getGamerAchievements("a gamer token", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token    The gamer token for the currently logged in gamer.
     * @param callback The callback to handle the API response.
     */
    getGamerAchievements(token: string, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/gamer/achievement", "GET", token);
    }

    /**
     * Update progress towards an achievement.
     *
     * ```javascript
     * client.updateAchievement("a gamer token", "some achievement ID", 1, {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token            The gamer token for the currently logged in gamer.
     * @param achievementId    The identifier for the achievement to update (the
     *                         achievement ID can be found in the Dashboard).
     * @param achievementCount The number of points to add to an achievement's
     *                         progress towards completion.
     * @param callback         The callback to handle the API response.
     */
    updateAchievement(token: string, achievementId: string, achievementCount: number, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/gamer/achievement/" + achievementId, "POST", token, JSON.stringify({'count': achievementCount}));
    }

    /**
     * Get the leaderboard and it's current top ranked gamers.
     *
     * ```javascript
     * client.getLeaderboard("some leaderboard ID", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param leaderboardId The identifier for the leaderboard to get rankings
     *                      for (the leaderboard ID can be found in the Dashboard).
     * @param callback      The callback to handle the API response.
     */
    getLeaderboard(leadeboardId: string, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/game/leaderboard/" + leadeboardId, "GET");
    }

    /**
     * Get the leaderboard, it's current top ranked gamers, and the current
     * gamer's position in the rankings.
     *
     * ```javascript
     * client.getLeaderboardWithRank("a gamer token", "some leaderboard ID", {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token         The gamer token for the currently logged in gamer.
     * @param leaderboardId The identifier for the leaderboard to get rankings
     *                      for (the leaderboard ID can be found in the Dashboard).
     * @param callback      The callback to handle the API response.
     */
    getLeaderboardWithRank(token: string, leadeboardId: string, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/gamer/leaderboard/" + leadeboardId, "GET", token);
    }

    /**
     * Update the score for a gamer on the specified leaderboard. The new score
     * will only overwrite any previously submitted value if it's "better"
     * according to the sorting rules of the leaderboard, but updated ranking
     * details are returned in all cases.
     *
     * ```javascript
     * client.updateLeaderboardRank("a gamer token", "some leaderboard ID", 100, {
     *   success: function(status, data) {
     *   },
     *   error: function(status, data) {
     *   }
     * });
     * ```
     *
     * @param token         The gamer token for the currently logged in gamer.
     * @param leaderboardId The identifier for the leaderboard to get rankings
     *                      for (the leaderboard ID can be found in the Dashboard).
     * @param score         The updated score for the gamer on the leaderboard.
     * @param callback      The callback to handle the API response.
     */
    updateLeaderboardRank(token: string, leadeboardId: string, score: number, callback: ResponseHandler) {
      this.sendApiRequest(callback, "/gamer/leaderboard/" + leadeboardId, "POST", token, JSON.stringify({'score': score}));
    }
  };

};
