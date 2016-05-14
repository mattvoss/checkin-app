(function () {
  "use strict";
  
  angular
    .module(
      'CheckinApp', 
      [
        'ui.router', 
        'angularMoment', 
        'ngMaterial', 
        'ngMdIcons', 
        'js-data', 
        'CheckinApp.controllers', 
        'CheckinApp.services', 
        'CheckinApp.directives',
        'pdf',
        'mdThemeColors',
        'ngLodash',
        'angular-electron'
      ]
    )
    .value('timeouts', {})
    .value('appData', {
      isReview: false,
      cardSwipe: false,
      magStripe: [],
      checkedin: 0
    })
    .constant('angularMomentConfig', {
      timezone: 'America/Chicago'
    })
    .run(
      function($rootScope, $state, serialport, server, appData, DS) {
        $rootScope.$on('serialport:ready', 
          function(event, data){
            serialport.open();
          }
        );
        
        $(window).keypress(function(evt) {
          if (appData.cardSwipe) {
            evt = evt || window.event;
            var keyCode = evt.which;
            if (evt.keyCode !== 13) {
              appData.magStripe.push(String.fromCharCode(keyCode));
              console.log(appData.magStripe.join(""));
            } else {
              appData.cardSwipe = false;
              console.log(appData.magStripe.join(""));
              var data = appData.magStripe.join("");
              $rootScope.$broadcast('magstripe:data', data);
              $rootScope.$broadcast('magstripe:stop');
            }
          }
        });
        
        $rootScope.$on("$stateChangeError", console.log.bind(console));
        
        $rootScope.$on('server:ready', 
          function(event, data){
            DS.defaults.basePath = data;
          }
        );
        
        $rootScope.$on('magstripe:start', 
          function(event, data){
            console.log('magstripe:start');
            appData.cardSwipe = true;
          }
        );
        
        $rootScope.$on('magstripe:stop', 
          function(event, data){
            console.log('magstripe:stop');
            appData.cardSwipe = false;
            appData.magStripe = [];
          }
        );
        
        $rootScope.$on('serialport:data', 
          function(event, data){
            console.log(data);
            data = data.replace(/\r?\n|\r/g,"");
            if ($state.current === "dashboard") {
              $rootScope.$broadcast('barcode:data', data);
            } else {
              $state.transitionTo('dashboard', {scanData: data});
            }
          }
        );
        
        if (serialport.getPort() !== null) {
          serialport.open();
        } else {
          $rootScope.$broadcast('settings:none');
        }
        
        if (server.get() !== null) {
          DS.defaults.basePath = server.get();
          appData.socket = io.connect(server.get().replace("/api", ""));
          
          appData.socket.on('connect', function(data){
            appData.socket.emit('ready');
            console.log(data);
          });
          appData.socket.on('talk', function(data){
            if (data.objectType === "updates") {
              console.log(data);
              if (data.modType === "checkedIn") {
                appData.checkedin = data.objectId;
                $rootScope.$broadcast('updates:checkedin', data.objectId);
              }
            }
          });
        } else {
          $rootScope.$broadcast('settings:none');
        }
        $state.transitionTo('dashboard');
      }
    )
    .config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, DSProvider) {
      var url = window.localStorage.getItem("serverUrl"); 
      DSProvider.defaults.basePath = (url !== null) ? url : 'http://localhost:3001/api';
      $stateProvider
        .state('dashboard', {
          url: "/dashboard",
          templateUrl: "main.html",
          controller: 'DashboardCtrl',
          params: { scanData: null }
        })
        .state('registrant', {
          url: "/registrant/:id",
          templateUrl: "registrant.html",
          controller: 'RegistrantCtrl',
          params: { registrant: null }
        })
        .state('type', {
          url: "/type",
          templateUrl: "type.html",
          controller: 'TypeCtrl'
        })
        .state('add', {
          url: "/add",
          templateUrl: "add-registrant.html",
          controller: 'AddRegistrantCtrl',
          params: { event: null, biller: null }
        })
        .state('review', {
          url: "/review",
          templateUrl: "review.html",
          controller: 'ReviewCtrl'
        })
        .state('done', {
          url: "/done",
          templateUrl: "done.html",
          controller: 'DoneCtrl'
        });
  });
  
}());