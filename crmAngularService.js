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

    function delete (entitySchemaName, recordId) {
    }

    return {
        delete : delete,
        update : update,
        create : create
    };
});

crmModule.factory('crmSoapSvc', function (crmCommon, $http) {

    function create (entityLogicalName, record) {
    }
    
    function update (entityLogicalName, record) {
    }    

    function delete (entityLogicalName, recordId) {
    }

    return {
        delete : delete,
        update : update,
        create : create
    };
});
