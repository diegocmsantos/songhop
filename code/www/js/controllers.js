angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {

  // helper function for loading
  var showLoading = function() {

    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });

  }

  var hideLoading = function() {
    $ionicLoading.hide();
  }

  // set loading to true first time while we retrieve songs from server
  showLoading();

	Recommendations.init()
    .then(function(){

      $scope.currentSong = Recommendations.queue[0];
      Recommendations.playCurrentSong();
      
    })
    .then(function(){

      // turn loading off
      hideLoading();
      $scope.currentSong.loaded = true;

    });

  // used for retrieving the next album image.
  // if there isn't an album image available next, return empty string.
  $scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }

    return '';
  }

  $scope.sendFeedback = function (bool) {

    if ( bool ) {

      User.addSongToFavorites( $scope.currentSong );

    }

    // prepare next song
    Recommendations.nextSong();

    // set variable for the correct animation sequence
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;

    $timeout(function() {

      // update current song in scope
      $scope.currentSong = Recommendations.queue[ 0 ];
      $scope.currentSong.loaded = false;

    }, 250);

    Recommendations.playCurrentSong().then(function(){
      $scope.currentSong.loaded = true;
    });

  }

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function( $scope, $window, $ionicPlatform, $cordovaSocialSharing, User ) {

  $scope.username = User.username;

  $scope.favorites = User.favorites;

  $scope.openSong = function( song ) {

    $window.open( song.open_url, "_system" );

  }

  $scope.removeSong = function( song, index ) {

    User.removeSongFromFavorites( song, index );

  }

  $scope.shareViaTwitter = function( song ) {

    var message = 'Listening to ' + song.title + ' by ' + song.artist + '.';
    message += ' This tweet was sent using @ionicframework. Thanks @gothinkster.'
    $cordovaSocialSharing.shareViaTwitter(message, song.image_small, song.open_url);
    
  }

})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function( $scope, $window, Recommendations, User ) {

  // expose the number of new favorites to scope
  $scope.favCount = User.favoriteCount;

  // stop audio when going to favorites page
  $scope.enteringFavorites = function () {

    User.newFavorites = 0;
    Recommendations.haltAudio();

  }

  $scope.leavingFavorites = function() {

    Recommendations.init();

  }

  $scope.logout = function() {

    User.destroySession();

    // instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached.
    $window.location.href = 'index.html';

  }

})

/*
Controller for our Splash screen
*/
.controller( 'SplashCtrl', function( $scope, $state, User ){

  // attempt to signup/login via User.auth
  $scope.submitForm = function( username, signingUp ) {

    User.auth( username, signingUp ).then(function(){

      // Session is now set, so lets redirect to discover page
      $state.go( 'tab.discover' );

    }, function() {

      alert( "Try another username." );

    });

  }

});