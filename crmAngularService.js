// Create the CRM service module. 
var crmModule = angular.module('crmModule', []);

// common functions will be used by both the rest and soap services. 
crmModule.factory('crmCommon', function(){
    return {
        getCrmContext : function () {
            // this will return the CRM context 
        },
        getOrgSrvUrl : function () {
            // ...
        }
    };
});

crmModule.factory('crmRestSvc', function (crmCommon, $http) {

    function create (entitySchemaName, record) {
    }
    
    function update (entitySchemaName, record) {
    }    

    function deleteRecord (entitySchemaName, recordId) {
    }

    return {
        delete : deleteRecord,
        update : update,
        create : create
    };
});

crmModule.factory('crmSoapSvc', function (crmCommon, $http) {

    function create (entityLogicalName, record) {
    }
    
    function update (entityLogicalName, record) {
    }    

    function deleteRecord (entityLogicalName, recordId) {
    }

    return {
        delete : deleteRecord,
        update : update,
        create : create
    };
});
