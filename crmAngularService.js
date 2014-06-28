// Create the CRM service module. 
var crmModule = angular.module("crmModule", []);

// common functions will be used by both the rest and soap services. 
crmModule.factory("crmCommon", function(){
    return {
        getCrmContext : function () {
            // this will return the CRM context 
        },
        getOrgSrvUrl : function () {
            // ...
        }
    };
});

crmModule.factory("crmRestSvc", function (crmCommon, $http) {
    
    function retrieve (entitySchemaName, recordId, select, expand) {
        var systemQueryOptions = "";
        
        if (select || expand) {
            systemQueryOptions = "?";
            if (select) {
                var selectString = "$select=" + select;
                
                if (expand) {
                    selectString = selectString + "," + expand;
                }
                systemQueryOptions = systemQueryOptions + selectString;
            }
            if (expand) {
                systemQueryOptions = systemQueryOptions + "&$expand=" + expand;
            }
        }
  
        var url = crmCommon.getOrgSrvUrl() + entitySchemaName + "Set(guid'" + id + "')" + systemQueryOptions;

        return $http({
            method: "GET", 
            url: url
        });
    }
    
    function retrieveMultiple (entitySchemaName, options) {
        var optionsString = "";
        if (options) {
            if (options.charAt(0) !== "?") {
                optionsString = "?" + options;
            } else { 
                optionsString = options; 
            }
        }
        
        var url = crmCommon.getOrgSrvUrl() + entitySchemaName + "Set";
        
        return $http({
            method: "GET", 
            url: url,
        });
    }
    
    function create (entitySchemaName, record) {
        var url = crmCommon.getOrgSrvUrl() + entitySchemaName + "Set";
        
        return $http({
            method: "POST", 
            url: url,
            data: record
        });
    }
    
    function update (entitySchemaName, recordId, record) {
        var url = crmCommon.getOrgSrvUrl() + entitySchemaName + "Set(guid'" + recordId + "')";
        
        return $http({
            method: "POST", 
            url: url,
            data: record,
            headers: {
               "X-HTTP-Method": "MERGE" 
            },
        });
    }    

    function deleteRecord (entitySchemaName, recordId) {
        var url = crmCommon.getOrgSrvUrl() + entitySchemaName + "Set(guid'" + recordId + "')";
        
        return $http({
            method: "POST", 
            url: url,
            headers: {
               "X-HTTP-Method": "DELETE" 
            },
        });
    }

    function associate (parentId, parentEntitySchemaName, relationshipName, childId, cildEntitySchemaName) {
  
        var url = crmCommon.getOrgSrvUrl() + parentEntitySchemaName + "Set(guid'" + parentId + 
        "')/$links/" + relationshipName;
        
        var childEntityReference = {
            uri: crmCommon.getOrgSrvUrl() + "/" + childEntitySchemaName + "Set(guid'" + childId + "')"
        }
        
        return $http({
            method: "POST", 
            url: url,
            data: childEntityReference
        });
    }
    
    function disassociate (parentId, parentEntitySchemaName, relationshipName, childId) {
  
        var url = crmCommon.getOrgSrvUrl() + parentEntitySchemaName + "Set(guid'" + parentId + 
        "')/$links/" + relationshipName + "(guid'" + childId + "')");
        
        return $http({
            method: "POST", 
            url: url,
            headers: {
               "X-HTTP-Method": "DELETE" 
            },
        });
    }
  
    return {
        retrieveMultiple: retrieveMultiple,
        retrieve: retrieve,
        associate: associate,
        disassociate: disassociate,
        delete : deleteRecord,
        update : update,
        create : create
    };
});

crmModule.factory("crmSoapSvc", function (crmCommon, $http) {

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
