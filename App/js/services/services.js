'use strict';

/* Services */

angular.module('myApp.services', []).
  value('version', '0.1')
.factory('Weather',function ($http) {  

    return {
        getWeather: function (city,success, error) {

            var url = 'https://api.worldweatheronline.com/free/v1/weather.ashx';
            return $http.jsonp(url, {
                params: {
                    callback: 'JSON_CALLBACK',
                    q: city,
                    format:'json',
                    num_of_days: 5,
                    key: '0d3adb0317ed889492b2dd0e2dc3ba10c95562a6'
                }
            })
            .success(function (data) {
                success(data.data);
            }
            ).error(function (error) {
                console.log(error);
            });
        }
    }

})

.factory('FavoritesListService',['$http', '$q', '$resource', '$timeout', function ($http, $q, $resource,$timeout) {
    var siteContextInfoResource = $resource('_api/contextinfo?$select=FormDigestValue', {}, {
        post: {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose;',
                'Content-Type': 'application/json;odata=verbose;'
            }
        }
    });

    var securityValidation;
    refreshSecurityValidation();
    var spAppWebUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
    function refreshSecurityValidation() {
        // request validation
        siteContextInfoResource.post({}, function (data) {
            // obtain security digest timeout & value & store in service
            var validationRefreshTimeout = data.d.GetContextWebInformation.FormDigestTimeoutSeconds - 10;
            securityValidation = data.d.GetContextWebInformation.FormDigestValue;
            console.log("refreshed security validation");
            console.log("next refresh of security validation: " + validationRefreshTimeout + " seconds");

            // repeat this in FormDigestTimeoutSeconds-10
            $timeout(function () {
                refreshSecurityValidation();
            }, validationRefreshTimeout * 1000);
        }, function (error) {
            console.log("response from contextinfo " + error);
        });

    }
    //function to get a parameter value by a specific key
    function getQueryStringParameter(urlParameterKey) {
        var params = document.URL.split('?')[1].split('&');
        var strParams = '';
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split('=');
            if (singleParam[0] == urlParameterKey)
                return decodeURIComponent(singleParam[1]);
        }
    }

    return {
        getFavorites: function (success, error) {

            $http({
                method: 'GET',
                url: spAppWebUrl+ '/_api/web/lists/getbytitle(\'Favorites\')/items?$select=Id,Title&$orderby=Title',
                headers: { "Accept": "application/json;odata=verbose" }
            }).success(function (data) {
                success(data.d.results);
            }).error(function (error) {
                console.log(' getFavorites Error: ' + error);
            });
        },
        getFavorite: function (id,success, error) {
            $http({
                method: 'GET',
                url: spAppWebUrl + '/_api/web/lists/getbytitle(\'Favorites\')/items(' + id + ')?$select=Id,Title',
                headers: { "Accept": "application/json;odata=verbose" }
            }).success(function (data) {
                //**HACK** The previous call uses data.d.results but in this function the values are returned in data.d***
                success(data.d);
            }).error(function (error) {
                console.log('getFavorite Error: ' + error);
            });
        },
        addFavorite: function (city, success, error) {
            refreshSecurityValidation();
            var item = {
                '__metadata': { 'type': 'SP.Data.FavoritesListItem' }, 'Title': city
            };
            $http({
                method: 'POST',
                url: spAppWebUrl + '/_api/web/lists/getbytitle(\'Favorites\')/items',
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(item) ,
                headers: {
                    'Accept': 'application/json;odata=verbose;',
                    'Content-Type': 'application/json;odata=verbose;',
                    'X-RequestDigest': securityValidation,
                    'X-HTTP-Method': 'MERGE',
                    'If-Match': '*'
                }
            }).success(function (data) {
                //**HACK** The previous call uses data.d.results but in this function the values are returned in data.d***
                success(data.d);
                console.log('Favorite added');
            }).error(function (error) {
                console.log('addFavorite Error: ' + error.error.message.value);
            });
        },
        securityValidation: securityValidation
    }
}]);
