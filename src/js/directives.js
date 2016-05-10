(function () {
  "use strict";
  function creditCardFormDirective () {
    return {
      restrict: 'A',
      scope: true,
      controller: function () {
        var ctrl = this;
        ctrl.fields = {};
        ctrl.setField = function (name, element) {
          ctrl.fields[name] = element;
        };
      },
      link: function (scope, element, attrs, ctrl) {
        // TODO check for ctrl.fields presence
        var card = new Card({
            form: element[0],
            container: ctrl.fields.container[0],
            formSelectors: {
              numberInput: '[credit-card-number]',
              expiryInput: '[credit-card-expiry]',
              cvcInput: '[credit-card-cvc]',
              nameInput: '[credit-card-name]',
            },
            debug: true
        });
      }
    };
  }

  function creditCardContainerDirective () {
    return {
      restrict: 'EA',
      require: '^creditCardForm',
      link: function (scope, element, attrs, ccForm) {
          ccForm.setField('container', element);
      }
    };
  }
  
  angular
  .module('CheckinApp.directives', [])
  .directive('mdTable', function () {
    return {
      restrict: 'E',
      scope: { 
        headers: '=', 
        content: '=', 
        sortable: '=', 
        filters: '=',
        customClass: '=customClass',
        thumbs:'=', 
        count: '=',
        sort: '&'
      },
      controller: function ($scope,$filter,$window) {
        var orderBy = $filter('orderBy');
        $scope.tablePage = 0;
        $scope.nbOfPages = function () {
          return Math.ceil($scope.content.length / $scope.count);
        };
        $scope.handleSort = function (field) {
            if ($scope.sortable.indexOf(field) > -1) { 
              return true; 
            } else { 
              return false; 
          }
        };
        $scope.order = function(predicate, reverse) {
            $scope.content = orderBy($scope.content, predicate, reverse);
            $scope.predicate = predicate;
        };
        $scope.order($scope.sortable[0],false);
        $scope.getNumber = function (num) {
          return new Array(num);
        };
        $scope.goToPage = function (page) {
          $scope.tablePage = page;
        };
      },
      templateUrl: '../templates/md-table.html', 
    };
  })
  .directive('mdColresize', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$evalAsync(function () {
          $timeout(function(){ $(element).colResizable({
            liveDrag: true,
            fixed: true

          });},100);
        });
      }
    };
  })
  .filter('startFrom',function (){
    return function (input,start) {
      start = +start;
      return input.slice(start);
    };
  })
  .directive('creditCardForm', 
    creditCardFormDirective
  )
  .directive('creditCardContainer', 
    creditCardContainerDirective
  );
}());