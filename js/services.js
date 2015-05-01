(function () {
  "use strict";
    
    angular
    .module('CheckinApp.services', [])
    .factory('Registrants', function(DS) {
      return DS.defineResource({
        name: 'registrants',
        endpoint: '/registrants',
        idAttribute: 'registrantId'
      });
    })
    .factory('Badge', function(DS) {
      return DS.defineResource({
        name: 'badge',
        endpoint: '/badge',
        relations: {
          belongsTo: {
            registrants: {
              parent: true,
              localKey: 'registrantId',
              localField: 'registrants'
            }
          }
        }
      });
    })
    .factory('Receipt', function(DS) {
      return DS.defineResource({
        name: 'receipt',
        endpoint: '/receipt',
        relations: {
          belongsTo: {
            registrants: {
              parent: true,
              localKey: 'registrantId',
              localField: 'registrants'
            }
          }
        }
      });
    })
    .factory('Onsite', function(DS) {
      return DS.defineResource({
        name: 'onsite',
        endpoint: '/events/onsite',
        idAttribute: 'slabId'
      });
    })
    .factory('Fields', function(DS) {
      return DS.defineResource({
        name: 'fields',
        endpoint: '/fields',
        idAttribute: 'id'
      });
    })
    .factory('ExhibitorCompanies', function(DS) {
      return DS.defineResource({
        name: 'exhibitorCompanies',
        endpoint: '/exhibitors/companies',
        idAttribute: 'id'
      });
    })
    .factory('Payment', function(DS) {
      return DS.defineResource('payment');
    })
    .factory('convertDataToBinary', function() {
      var self = this;
      self.BASE64_MARKER = ';base64,';

      self.convert = function(data) {
        //var base64Index = dataURI.indexOf(self.BASE64_MARKER) + self.BASE64_MARKER.length;
        //var base64 = dataURI.substring(base64Index);
        var raw = window.atob(data),
            rawLength = raw.length,
            array = new Uint8Array(new ArrayBuffer(rawLength));

        for(var i = 0; i < rawLength; i++) {
          array[i] = raw.charCodeAt(i);
        }
        return array;
      };
      
      return self;
    })
    .factory('serialport', function($rootScope, $q, appData) {
      var self = this;
      self.serialport = require('serialport');
      self.SerialPort = self.serialport.SerialPort;
      
      self.open = function(port) {
        port = port || self.getPort();
        var sp = new self.SerialPort(
              port, 
              {
                parser: self.serialport.parsers.readline("\n")
              }
            );

        sp.on("data", function (data) {
          $rootScope.$emit('serialport:data', data.toString('ascii'));
        });
      };
      
      self.listPorts = function() {
        var ports = [],
            deferred = $q.defer();
        self.serialport.list(
          function (error, results) {
            if (error) {
              return deferred.reject(error);
            } else {
              for (var i = 0; i < results.length; i++) {
                var item = results[i];
                ports.push({name: item.manufacturer, device: item.comName, pnpId: item.pnpId});
              }
              return deferred.resolve(ports);
            }

          }
        );
        return deferred.promise;
      };
      self.getPort = function() {
        return window.localStorage.getItem("port");
      };

      self.setPort = function(port) {
        window.localStorage.setItem("port", port);
        $rootScope.$emit('serialport:ready', port);
        return port;
      };
      
      return self;
    })
    .factory('server', function($rootScope, $q, appData) {
      var self = this;
  
      self.get = function() {
        return window.localStorage.getItem("serverUrl");
      };

      self.set = function(url) {
        window.localStorage.setItem("serverUrl", url);
        $rootScope.$emit('server:ready', url);
        return url;
      };
      
      return self;
    })
    .factory('keypress', function($rootScope, $q, appData) {
      var self = this;
      self.hold = "";
      
      self.init = function() {
        document.onkeydown = function (e) {
          /// check ctrl + f key
          e.preventDefault();
          if (e.keyCode !== 13) {
            self.hold += String.fromCharCode(e.keyCode);
          } else {
            console.log(self.hold);
            self.hold = "";
          }
          return false;
        };
      };
      
      return self;
    })
    .filter('trim', function () {
      return function (value) {
          return (!value) ? '' : value.trim();
      };
    });
}());