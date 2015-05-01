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
        'mdThemeColors'
      ]
    )
    .value('timeouts', {})
    .value('appData', {
      isReview: false,
      cardSwipe: false,
      magStripe: []
    })
    .constant('angularMomentConfig', {
      preprocess: 'utc',
      timezone: 'America/Chicago'
    })
    .run(
      function($rootScope, $state, serialport, server, appData) {
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
          //Restangular.setBaseUrl(server.get());
          
        } else {
          $rootScope.$broadcast('settings:none');
        }
        $state.transitionTo('dashboard');
      }
    )
    .config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, DSProvider) {
      DSProvider.defaults.basePath = 'http://localhost:3001/api';
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