'use strict';
/**
 * Controller for the QUERY sub-tab DEGREE EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('DEQueryController', [
        '$scope',
        '$rootScope',
        'GlobalSharedData', 'QueryService', 'DESharedData',
        DEQueryController
    ]);

    /**
     * @namespace DEQueryController
     *
     * @desc Controller for the QUERY sub-tab in the DEGREE EXPLORER tab.
     *
     * @memberOf controllers
     */
    function DEQueryController($scope, $rootScope, GlobalSharedData, QueryService, DESharedData) {
        var vm = this;

        vm.sharedData = GlobalSharedData.data;

        vm.getTopGenes = getTopGenes;
        vm.initializeController = initializeController;
        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.DEQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = DESharedData.data;
            initializeVariables();
        }

        /**
         * @summary Initializes variables used within the tab for binding to the controls.
         *
         * @memberOf controllers.DEQueryController
         */
        function initializeVariables() {
            vm.topXSlider = 1;
            vm.minDegreeSlider = 0;

            vm.filterType = "top";
        }

        /**
         * @summary Retrievies a list of the top genes for row and col from the server
         * based on the specified query.
         *
         * @param {String} filterType The type of query to perform. This is a choice between top 
         * and min.
         *
         * @memberOf controllers.DEQueryController
         */
        function getTopGenes() {
            $rootScope.state = $rootScope.states.loadingDegreeExplorer;
            DESharedData.resetWTM();
            vm.sdWithinTab.filterType = vm.filterType;
            
            vm.sdWithinTab.filterAmount.top = vm.topXSlider;
            vm.sdWithinTab.filterAmount.min = vm.minDegreeSlider;

            QueryService.getTopGenes(vm).then(function(result) {
                $rootScope.state = $rootScope.states.finishedGettingTopGenes;

                if (result.topGenes == null) {
                    return;
                }

                vm.sdWithinTab.topGenes = result.topGenes;
                vm.sdWithinTab.dataLoaded = true;
            });
        }

        /**
         * @summary Watches the clearAllData variable and clears the data within the tab when 
         * it changes to true.
         *
         * @memberOf controllers.DEQueryController
         */
        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                DESharedData.resetWTM();
                initializeVariables();
            }
        });
    }
})();
