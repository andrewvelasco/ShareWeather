'use strict';

// declare app
angular.module('myApp', [
    // Angular Core Modules
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'ngSanitize',

    'ui.bootstrap',

    // Custom Modules
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
]).
config(['$routeProvider', function ($routeProvider) {
    // Configure routing
    $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
    $routeProvider.otherwise({redirectTo: '/home'});
}]);
