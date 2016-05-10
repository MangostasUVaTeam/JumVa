(function (){

    var app = angular.module('provider', []);

    app.factory('authInterceptor', function (API, auth) {
        return {
            // automatically attach Authorization header
            request: function(config) {
                var token = auth.getToken();
                if(config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            },

            // If a token was sent back, save it
            response: function(res) {
                if(res.config.url.indexOf(API) === 0 && res.data.token) {
                    auth.saveToken(res.data.token);
                }

                return res;
            },
        };
    });

    app.constant('API', 'http://localhost:8080/JumpVa/api');

    app.service('user', function userService($http, API, auth) {
        var self = this;
        self.user = {};
        self.getQuote = function() {
            return $http.get(API + '/auth/quote');
        };

        self.getShipmentList = function() {
            console.log("get shipment list");
            return $http.get(API + '/shipment');
        };

        self.getUnassignedShipmentList = function(filters){
            console.log(filters);
            return $http.post(API + '/search-unassigned-shipment', filters);
        }

        self.postCreatedShipment = function(newShipment){
            console.log(newShipment);
            return $http.post(API + '/create-shipment', newShipment);
        }

        self.postNewUser = function(newUser){
            console.log(newUser);
            var response = $http.post(API + '/create-user', newUser);

            response.then(function(responseData){
                self.user = responseData.data.user;
            });

            return response;
        }

        self.postBidToUnassignedShipment = function(shipment, bid){
            var request = {shipment: shipment, bid: bid};
            console.log(request);
            return $http.post(API + '/post-bid', request);
        }

        self.postNewHitoToShipment = function(shipment, milestone){
            milestone.carrier = self.nombre;
            var request = {'shipmentId': shipment.id, 'milestone': milestone};
            console.log(request);
            return $http.post(API + '/post-milestone', request);
        };

        self.login = function(email, password) {
            var credentials = {
                email: email,
                password: password
            };
            console.log(credentials);

            var response =  $http.post(API + '/authentication', credentials);
            response.then(function(responseData){
                self.user = responseData.data.user;
            });

            return response;
        };

    });

    app.service('auth', function authService($window) {
        var self = this;
        self.parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        };

        self.saveToken = function(token) {
            $window.localStorage['jwtToken'] = token;
        };

        self.getToken = function() {
            return $window.localStorage['jwtToken'];
        }

        self.isAuthed = function() {
            var token = self.getToken();
            if(token) {
                /*
                var params = self.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
                */
                return true;
            } else {
                return false;
            }
        };

        self.logout = function() {
            $window.localStorage.removeItem('jwtToken');
        };
    });

})();
