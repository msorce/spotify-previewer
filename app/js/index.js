import "angular";
import "bootstrap/dist/css/bootstrap.css";
import "../stylesheets/main.scss";

var app = angular.module('app', []);
app.filter('songTime', function() {
  return function(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60 < 10 ? '0' + s % 60 : s % 60;
    s = (s - secs) / 60;
    var mins = s % 60 < 10 ? '0' + s % 60 : s % 60;
    var hrs = (s - mins) / 60;
    return mins + ':' + secs;
  };
});

app.service('spotifyService', spotifyService);

function spotifyService($q, $http, $timeout) {

  this.get = (url) => {
    return new Promise((resolve, reject) => {
      $http({
        method: 'GET',
        url: url
      }).then(function successCallback(response) {
        resolve(response);
      }, function errorCallback(response) {
        console.log(response);
      });
    });
  };

}


app.controller('mainCtrl', mainCtrl);

function mainCtrl($scope, $interval, $filter, $rootScope, spotifyService) {
  $scope.selector = 0;
  $scope.tracks = [];
  $scope.players = [];
  $scope.initTimes = [0, 0, 0];
  $scope.status = "paused";

  var p3 = spotifyService.get("https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp");
  var p2 = spotifyService.get("https://api.spotify.com/v1/tracks/4o0NjemqhmsYLIMwlcosvW");
  var p1 = spotifyService.get("https://api.spotify.com/v1/tracks/682cnKvTcXg59UvQUic4t2");

  Promise.all([p1, p2, p3]).then(artists => {
    $scope.art = artists.map(i => i.data.album.images[0].url);
    $scope.names = artists.map(i => i.data.artists[0].name);
    $scope.songs = artists.map(i => i.data.name);
    $scope.artists = artists;
    $scope.previews = artists.map(i => i.data.preview_url);
    $scope.durations = artists.map(i => i.data.duration_ms);
    $scope.$apply();
    buildPlayers(artists);
  });


  function buildPlayers(a) {

    a.forEach(function(i) {
      var mod = {
        init: function() {
          var _this = this;
          this.customPlayer = new Audio();
          this.customPlayer.src = i.data.preview_url;
          this.play = function() {
            if (_this.customPlayer.paused) {
              _this.customPlayer.play();
              $rootScope.startTime();
              $scope.status = "playing";
            } else {
              _this.customPlayer.pause();
              $rootScope.stopTime();
              $scope.status = "paused";
            }
          };
          this.pause = function() {
            _this.customPlayer.pause();
            $scope.status = "paused";
          };
        },
      };
      mod.init();

      $scope.players.push(mod);
    });
  }

  $scope.play = (i) => {
    $scope.players[i].play();
  };

  $scope.next = (i) => {
    if (i < $scope.players.length - 1) {
      $scope.selector++;
      $scope.pauseAll();
      $rootScope.stopTime();
      $rootScope.clearTime();
    }
  };
  $scope.previous = (i) => {
    if (i > 0) {
      $scope.selector--;
      $scope.pauseAll();
      $rootScope.stopTime();
      $rootScope.clearTime();
    }
  };
  $scope.pauseAll = () => {
    $scope.players.forEach((i) => {
      i.pause();
    });
  };
  $scope.format = 'mm:ss';
}
app.directive('timing', function($timeout, $rootScope) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      status: '=status'
    },
    controller: function($scope, $element) {
      var timeoutId;
      $scope.seconds = 0;
      $scope.minutes = 0;
      $scope.running = false;

      $rootScope.stopTime = function() {
        $timeout.cancel(timeoutId);
        $scope.running = false;
      };

      $rootScope.startTime = function() {
        timer();
        $scope.running = true;
      };

      $rootScope.clearTime = function() {
        $scope.seconds = 0;
        $scope.minutes = 0;
      };

      function timer() {
        timeoutId = $timeout(function() {
          updateTime(); // update Model
          timer();
        }, 1000);
      }

      function updateTime() {
        $scope.seconds++;
        if ($scope.seconds === 60) {
          $scope.seconds = 0;
          $scope.minutes++;
        }
      }
    },
    template: '<span>{{minutes|numberpad:2}}:{{seconds|numberpad:2}}</span>',
    replace: true
  };
}).
filter('numberpad', function() {
  return function(input, places) {
    var out = "";
    if (places) {
      var placesLength = parseInt(places, 10);
      var inputLength = input.toString().length;

      for (var i = 0; i < (placesLength - inputLength); i++) {
        out = '0' + out;
      }
      out = out + input;
    }
    return out;
  };
});
