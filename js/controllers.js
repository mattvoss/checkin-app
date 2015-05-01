(function () {
  "use strict";
  
  function SettingsDialogController($scope, $mdDialog, appData, serialport, server) {
    $scope.values = {
      serialSelected: serialport.getPort(),
      url: server.get(),
      ports: []
    };
    serialport.listPorts().then(
      function(data) {
        $scope.values.ports = data;
      },
      function(error) {
       console.log(error); 
      }
    );
    $scope.serialPortChange = function() {
      if ($scope.values.serialSelected !== null) {
       serialport.setPort($scope.values.serialSelected);
      }
    };
    $scope.serverUrlChange = function() {
      if ($scope.values.url !== null) {
       server.set($scope.values.url);
      }
    };
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }
  
  function ManualEntryDialogController($scope, $mdDialog, appData) {
    $scope.values = {
      badgeId: null
    };
    
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.submit = function() {
      $mdDialog.hide($scope.values.badgeId);
    };
  }
  
  angular
  .module('CheckinApp.controllers', ['ngMaterial', 'mdThemeColors'])
  .controller('MainCtrl', function ($scope, $rootScope, $state, $mdDialog, $mdToast, mdThemeColors, timeouts, appData, keypress) {
    $scope.mdThemeColors = mdThemeColors;
    var showSettings = function(ev) { 
          $mdDialog.show({
            controller: SettingsDialogController,
            templateUrl: '../templates/settings.html',
            targetEvent: ev,
          })
          .then(function(answer) {
            $scope.alert = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
        },
        showCompanyDialog = function(ev, event) {
          $mdDialog.show(
            {
              controller: 'BillerDialogCtrl',
              templateUrl: '../templates/select-company-dialog.html',
              targetEvent: ev,
              locals:{event: event}
            }
          ).then(
            function(info) {
              $state.transitionTo('add', {event: event, biller: info});
            }, function(error) {
              console.log(error);
            }
          );
        },
        createAttendee = function(ev) {
          $mdDialog.show(
            {
              controller: 'CreateDialogCtrl',
              templateUrl: '../templates/create-attendee-dialog.html',
              targetEvent: ev,
            }
          )
          .then(
            function(data) {
              if (data !== null && data.reg_type === "E") {
                showCompanyDialog(ev, data);
              } else if (data.reg_type === "Z") {
                $state.transitionTo('add', {event: data, biller: null});
              }
            }, function(error) {
              console.log(error);
            }
          );
        };
    $scope.data = {
      showHome: true,
      goHome: function($event) {
         $state.transitionTo('dashboard');
      },
      createAttendee: createAttendee
    };
    $scope.$on(
      'settings:none', 
      function(event){
        showSettings(event);
      }
    );
    
    $rootScope.$on(
      'toast:show', 
      function(event, message){ 
       $mdToast.show({
          controller: 'ToastCtrl',
          templateUrl: '../templates/toast.html',
          hideDelay: 6000,
          locals: {message: message},
          position: 'top right'
        }); 
      }
    );
    
    $rootScope.$on(
      '$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams){ 
        //console.log(event, toState, fromState);
        /*
        if (toState.name !== "dashboard") {
          $scope.data.showHome = true;
        } else {
          $scope.data.showHome = false;
        }
        */
      }
    );
    
    $scope.showSettings = showSettings;
  })
  .controller('SheetActionsCtrl', function($scope, $mdBottomSheet, registrant, actions) {
    $scope.data = {
      registrant: registrant,
      items: actions,
      show: function(item) {
        if ("display" in item) {
          return item.display(item, registrant);
        } else {
          return true;
        }
      },
      listItemClick: function(item) {
        $mdBottomSheet.hide(item);
      }
    };
  })
  .controller('DashboardCtrl', function ($scope, $rootScope, $stateParams, $state, $mdDialog, $mdBottomSheet, timeouts, appData, Registrants) {
    var scanData = $stateParams.scanData,
        search = {
          category: "sortDate",
          search: 'all',
          page: 0,
          limit: 25
        },
        find = function(id, type) {
          type = type || 'other';
            if (type !== 'other') {
              search.category = type;
              search.search = id;
              Registrants.findAll(search, {bypassCache: true}).then(
                function (registrants) {
                  appData.registrants = registrants;
                  console.log(registrants);
                  $scope.data.count = registrants.length;
                  $scope.data.registrants = registrants;
                }, 
                function(error) {
                  console.log(error);
                }
              ); 
            } else {
              Registrants.findAll(search, {bypassCache: true}).then(
                function (registrants) {
                  appData.registrants = registrants;
                  console.log(registrants);
                  $scope.data.count = registrants.length;
                  $scope.data.registrants = registrants;
                }, 
                function(error) {
                  console.log(error);
                }
              ); 
            }
          };
    $scope.data = {
      edit: function(registrant, $event) {
        $state.transitionTo('registrant', {id: registrant.id, registrant: registrant});
      },
      searchVal: null,
      category: 'name',
      registrants: [],
      searchClick: function() {
        search.category = $scope.data.category;
        search.search = $scope.data.searchVal;
        find();
      },
      showSheet: function($event, registrant) {
        $mdBottomSheet.show({
          templateUrl: '../templates/sheet-actions.html',
          controller: 'SheetActionsCtrl',
          targetEvent: $event,
          locals: {
            registrant: registrant,
            actions: [
              { 
                id: 'checkin',
                name: 'Check In', 
                icon: 'check_circle', 
                display: function(item, registrant) {
                  return !registrant.attend;
                }
              },
              { 
                id: 'checkout',
                name: 'Check Out', 
                icon: 'highlight_remove', 
                display: function(item, registrant) {
                  return registrant.attend;
                }
              },
              { 
                id: 'edit',
                name: 'Edit', 
                icon: 'mode_edit' 
              },
              { 
                id: 'makePayment',
                name: 'Make Payment', 
                icon: 'payment' 
              },
              { 
                id: 'printBadge',
                name: 'Print Badge', 
                icon: 'print' 
              },
            ]
          }
        }).then(function(clickedItem) {
          if (clickedItem.id === "checkin") {
            registrant.DSUpdate(
              { 
                type: "status",
                event_id: registrant.eventId,
                groupMemberId: parseInt(registrant.groupMemberId, 10),
                registrantId: registrant.registrantId,
                groupUserId: parseInt(registrant.groupUserId, 10),
                fields: {
                  "attend": true
                } 
              }
            ); 
          } else if (clickedItem.id === "checkout") {
            registrant.DSUpdate(
              { 
                type: "status",
                event_id: registrant.eventId,
                groupMemberId: parseInt(registrant.groupMemberId, 10),
                registrantId: registrant.registrantId,
                groupUserId: parseInt(registrant.groupUserId, 10),
                fields: {
                  "attend": false
                } 
              }
            ); 
          } else if (clickedItem.id === "edit") {
            $state.transitionTo('registrant', {id: registrant.id, registrant: registrant});
          }
        });
      },
      clearInput: function($event) {
        $scope.data.searchVal = null;
      },
      count: 3
    };
    
    
    if (scanData !== null) {
      if (scanData.indexOf("|") > -1) {
        var id = scanData.split("|")[0];
        find(id, 'registrantid');
      } else {
        find(scanData, 'confirmation');
      }
    }
    
    $scope.$on(
      'barcode:data', 
      function(event, data){
        
        if (data.indexOf("|") > -1) {
          var id = data.split("|")[0];
          find(id, 'registrantid');
        } else {
          find(data, 'confirmation');
        }
      }
    );
    
  })
  .controller('RegistrantCtrl', function ($scope, $rootScope, $stateParams, $state, $mdDialog, $mdToast, $animate, $mdBottomSheet ,timeouts, appData, Registrants, Badge, convertDataToBinary, DS, Receipt, Payment) {
    var registrant = $stateParams.registrant,
        printReceipt = function() {
          DS.find(
            'receipt', 
            'print', 
            { 
              params: { 
                registrantId: registrant.registrantId 
              } 
            }
          ).then(
            function(data) {
              console.log(data);
              $rootScope.$broadcast('toast:show', "Receipt printing");
            }
          );
        },
        printBadge = function() {
         DS.find(
            'badge', 
            'print', 
            { 
              params: { 
                registrantId: registrant.registrantId 
              } 
            }
          ).then(
            function(data) {
              console.log(data);
              $rootScope.$broadcast('toast:show', "Badge printing");
            }
          ); 
        };
    $scope.data = {
      registrant: registrant,
      updateRegistrant: function() {
       registrant.DSUpdate(
          { 
            type: "values",
            event_id: registrant.eventId,
            groupMemberId: parseInt(registrant.groupMemberId, 10),
            registrantId: registrant.registrantId,
            groupUserId: parseInt(registrant.groupUserId, 10),
            fields: $scope.data.registrant.fields
          }
        ).then(
         function(data) {
           $rootScope.$broadcast('toast:show', "Registrant updated");
         }
       );
      },
      showSheet: function($event, registrant) {
        $mdBottomSheet.show({
          templateUrl: '../templates/sheet-actions.html',
          controller: 'SheetActionsCtrl',
          targetEvent: $event,
          locals: {
            registrant: registrant,
            actions: [
              { 
                id: 'checkin',
                name: 'Check In', 
                icon: 'check_circle', 
                display: function(item, registrant) {
                  return !registrant.attend;
                }
              },
              { 
                id: 'checkout',
                name: 'Check Out', 
                icon: 'highlight_remove', 
                display: function(item, registrant) {
                  return registrant.attend;
                }
              },
              { 
                id: 'makePayment',
                name: 'Payment', 
                icon: 'payment' 
              },
              { 
                id: 'printBadge',
                name: 'Badge', 
                icon: 'print' 
              },
              { 
                id: 'downloadBadge',
                name: 'Badge', 
                icon: 'file_download' 
              },
              { 
                id: 'printReceipt',
                name: 'Receipt', 
                icon: 'print' 
              },
              { 
                id: 'downloadReceipt',
                name: 'Receipt', 
                icon: 'file_download' 
              }
            ]
          }
        }).then(function(clickedItem) {
          if (clickedItem.id === "checkin") {
            registrant.DSUpdate(
              { 
                type: "status",
                event_id: registrant.eventId,
                groupMemberId: parseInt(registrant.groupMemberId, 10),
                registrantId: registrant.registrantId,
                groupUserId: parseInt(registrant.groupUserId, 10),
                fields: {
                  "attend": true
                } 
              }
            ); 
          } else if (clickedItem.id === "checkout") {
            registrant.DSUpdate(
              { 
                type: "status",
                event_id: registrant.eventId,
                groupMemberId: parseInt(registrant.groupMemberId, 10),
                registrantId: registrant.registrantId,
                groupUserId: parseInt(registrant.groupUserId, 10),
                fields: {
                  "attend": false
                } 
              }
            ); 
          } else if (clickedItem.id === "edit") {
            $state.transitionTo('registrant', {id: registrant.id, registrant: registrant});
          } else if(clickedItem.id === "makePayment") {
            $mdDialog.show({
              controller: 'PaymentDialogCtrl',
              templateUrl: '../templates/payment-dialog.html',
              locals: {
                registrant: registrant
              }
            })
            .then(function(data) {
              if (data !== null) {
                var payment = {
                  transaction: data,
                  registrant: registrant
                };
                Payment.create(payment).then(
                  function (transaction) {
                    console.log(transaction);
                    Registrants.refresh(registrant.registrantId).then(
                      function (registrant) {
                        if (parseInt(transaction.responseCode, 10) === 1) {
                          $rootScope.$broadcast('toast:show', "Credit Card was successfully charged");
                          printReceipt();
                          printBadge();
                        } else {
                          $rootScope.$broadcast('toast:show', "Credit Card was declined: "+transaction.responseReasonDescription);
                        }
                      }
                    );
                  }
                );
              }
            }, function() {
              $scope.alert = 'You cancelled the dialog.';
            }); 
           } else if (clickedItem.id === "printBadge") {
            //var test = Badge.update('download', {registrantId: registrant.registrantId}); 
            printBadge();
          } else if (clickedItem.id === "downloadBadge") {
            //var test = Badge.update('download', {registrantId: registrant.registrantId}); 
            DS.find(
              'badge', 
              'download', 
              { 
                params: { 
                  registrantId: registrant.registrantId 
                } 
              }
            ).then(
              function(data) {
                var pdf = convertDataToBinary.convert(data.pdf);
                $mdDialog.show({
                  controller: 'PdfDialogCtrl',
                  templateUrl: '../templates/pdf-dialog.html',
                  locals: {
                    pdfData: pdf 
                  }
                })
                .then(function(answer) {
                  $scope.alert = 'You said the information was "' + answer + '".';
                }, function() {
                  $scope.alert = 'You cancelled the dialog.';
                }); 
              }
            );
          } else if (clickedItem.id === "printReceipt") {
            //var test = Badge.update('download', {registrantId: registrant.registrantId}); 
            printReceipt();
          } else if (clickedItem.id === "downloadReceipt") {
            //var test = Badge.update('download', {registrantId: registrant.registrantId}); 
            DS.find(
              'receipt', 
              'download', 
              { 
                params: { 
                  registrantId: registrant.registrantId 
                } 
              }
            ).then(
              function(data) {
                var pdf = convertDataToBinary.convert(data.pdf);
                $mdDialog.show({
                  controller: 'PdfDialogCtrl',
                  templateUrl: '../templates/pdf-dialog.html',
                  locals: {
                    pdfData: pdf 
                  }
                })
                .then(function(answer) {
                  $scope.alert = 'You said the information was "' + answer + '".';
                }, function() {
                  $scope.alert = 'You cancelled the dialog.';
                }); 
              }
            );
          }
        });
      },
      showSheetLinked: function($event, lregistrant) {
        $mdBottomSheet.show({
          templateUrl: '../templates/sheet-actions.html',
          controller: 'SheetActionsCtrl',
          targetEvent: $event,
          locals: {
            registrant: lregistrant,
            actions: [
              { 
                id: 'checkin',
                name: 'Check In', 
                icon: 'check_circle', 
                display: function(item, registrant) {
                  return !registrant.attend;
                }
              },
              { 
                id: 'checkout',
                name: 'Check Out', 
                icon: 'highlight_remove', 
                display: function(item, registrant) {
                  return registrant.attend;
                }
              },
              { 
                id: 'edit',
                name: 'Edit', 
                icon: 'mode_edit' 
              },
              { 
                id: 'printBadge',
                name: 'Print Badge', 
                icon: 'print' 
              },
            ]
          }
        }).then(function(clickedItem) {
          if (clickedItem.id === "checkin") {
            lregistrant.DSUpdate(
              { 
                type: "status",
                event_id: lregistrant.eventId,
                groupMemberId: parseInt(lregistrant.groupMemberId, 10),
                registrantId: lregistrant.registrantId,
                groupUserId: parseInt(lregistrant.groupUserId, 10),
                fields: {
                  "attend": true
                } 
              }
            ); 
          } else if (clickedItem.id === "checkout") {
            lregistrant.DSUpdate(
              { 
                type: "status",
                event_id: lregistrant.eventId,
                groupMemberId: parseInt(lregistrant.groupMemberId, 10),
                registrantId: lregistrant.registrantId,
                groupUserId: parseInt(lregistrant.groupUserId, 10),
                fields: {
                  "attend": false
                } 
              }
            ); 
          } else if (clickedItem.id === "edit") {
            $state.transitionTo('registrant', {id: lregistrant.id, registrant: lregistrant});
          }
        });
      },
    };
  })
  .controller('ToastCtrl', function($scope, $mdToast, message) {
    $scope.data = {
      message: message,
      closeToast: function() {
        $mdToast.hide();
      }
    };
  })
  .controller('PdfDialogCtrl', function($scope, pdfData, $mdDialog) {
    $scope.pdfUrl = pdfData;
    $scope.onError = function(error) {
      // handle the error
      console.log(error);
    };
    $scope.getNavStyle = function(scroll) {
      if (scroll > 100) {
        return 'pdf-controls fixed';
      } else {
        return 'pdf-controls';
      }
    };
    $scope.close = function() {
      $mdDialog.hide();
    };
    
  })
  .controller('PaymentDialogCtrl', function($scope, $rootScope, $state, $mdDialog, appData) {
    $("#txtHidden").hide();
    $scope.data = {
      cardNumber: null,
      amount: null,
      expirationDate: null,
      security: null,
      name: null,
      check: null,
      track: null,
      swipeClick: function() {
        $rootScope.$broadcast('magstripe:start');
        $("#txtHidden").css({
            position: 'absolute',
            top: '-100px'
        });
        $("#txtHidden").show();
        $("#txtHidden").focus();
      },
      canSubmit: function() {
        var regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
        if (regex.test($scope.data.amount)) {
          return false; 
        } else {
          return true;
        }
      }
    };
    $scope.close = function(action) {
      
      if (action === 'pay') {
        $mdDialog.hide($scope.data);
      } else {
        $rootScope.$broadcast('magstripe:stop');
        $mdDialog.hide(null);
      }
    };
    
    $scope.$on(
      'magstripe:data', 
      function(event, data){
        console.log(data);
        var creditcard = new CreditCardTrackData(data);
        $scope.data.track = creditcard.track1.raw.replace("%","");
        $scope.data.firstName = creditcard.first_name.trim();
        $scope.data.lastName = creditcard.last_name.trim();
        $mdDialog.hide($scope.data);
      }
    );
    
    
  })
  .controller('CreateDialogCtrl', function($scope, $state, $mdDialog, Onsite) {
    $scope.data = {
      attendees: null,
      selected: null
    };
    $scope.close = function(action) {
      
      if (action === 'create') {
        console.log($scope.data.selected);
        $mdDialog.hide($scope.data.selected);
      } else {
        $mdDialog.hide(null);
      }
    };
    Onsite.findAll().then(
      function(events) {
        $scope.data.attendees = events;
      },
      function(error) {
        console.log(error);
      }
    );
    
  })
  .controller('BillerDialogCtrl', function($scope, $mdDialog, $q, $log, event, ExhibitorCompanies) {
    var querySearch = function(query) {
          var deferred = $q.defer();
          ExhibitorCompanies.findAll({search:query}, {cacheResponse: false}).then(
            function(data) {
              return deferred.resolve(data);
            },
            function(error) {
              return deferred.reject(error);
            }
          );
          return deferred.promise;
        },
        searchTextChange = function(text) {
          $log.info('Text changed to ' + text);
        },
        selectedItemChange = function(item) {
          $log.info('Item changed to ' + item);
        };
    $scope.data = {
      searchText: null,
      querySearch: querySearch,
      simulateQuery: false,
      isDisabled: false,
      selectedItemChange: selectedItemChange,
      searchTextChange: searchTextChange,
      selected: null
    };
    
    
    $scope.close = function(action) {
      if (action === 'create') {
        console.log($scope.data.selected);
        var data = {
          event: event, 
          biller: $scope.data.selected
        };
        $mdDialog.hide($scope.data.selected);
      } else {
        $mdDialog.hide(null);
      }
    };
    
  })
  .controller('AddRegistrantCtrl', function ($scope, $rootScope, $stateParams, $state, $mdToast, appData, Registrants, Fields, Badge, convertDataToBinary, DS) {
    var event = $stateParams.event,
        biller = $stateParams.biller;
    $scope.data = {
      registrant: {
       fields: {} 
      },
      fields: null,
      event: event,
      addRegistrant: function() {
       Registrants.create(
          { 
            type: event.reg_type,
            event: event,
            biller: biller,
            fields: $scope.data.registrant.fields
          }
        ).then(
         function(data) {
           $rootScope.$broadcast('toast:show', "Registrant added");
           $state.transitionTo('registrant', {id: data[0].id, registrant: data[0]});
         }
       );
      }
    };
    
    Fields.find(event.reg_type).then(
      function(fields) {
        $scope.data.fields = fields;
      },
      function(error) {
        console.log(error);
      }
    );
  });
}());