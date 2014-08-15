'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('HomeCtrl', ['$scope', 'Weather', 'FavoritesListService', function ($scope, Weather, FavoritesListService) {
      $scope.weather;
      $scope.SearchTerm = "New York";
      getWeather();
      getFavorites();
      
      $scope.favoritesWeather = [];
      $scope.favorites; 
      
    //  getFavoritesWeather();

      $scope.searchWeather = function () {
          getWeather();
      };

      $scope.AddFavorite = function () {
          addFavoriteToList();
          getFavorites();
      };

      $scope.setSearchTerm = function (searchTerm) {
          $scope.SearchTerm = searchTerm;
          getWeather();
      };

      
      function getFavoritesWeather() {
          var i;
          if ($scope.favorites) {
              for (i = 0; i < $scope.favorites.length; i++) {
                  Weather.getWeather($scope.favorites[i].Title,
                  function (data) {
                      $scope.favoritesWeather.push(data);
                  }, function (error) {
                      console.log(error);
                  });
              }
          }
      }

      function getFavorites() {
          FavoritesListService.getFavorites(
              function (data) {
                  $scope.favorites = data;
                  getFavoritesWeather();
              },
              function (error) {
                  console.log(error);
              });
      }

      function getWeather() {
          Weather.getWeather($scope.SearchTerm,
              function (data) {
                  $scope.weather = data;
                  console.log($scope.weather);
              }, function (error) {
                  console.log(error);
              });

      }

      function addFavoriteToList() {
          FavoritesListService.addFavorite($scope.SearchTerm,
              function (data) {
                  console.log("Favorite Saved");
              }, function (error) {
                  console.log(error);
              });
      }

      
  }]);
