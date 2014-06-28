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
    
    function getOdataPath(){
        return crmCommon.getServerUrl() + '/XRMServices/2011/Organization.svc/';
    }
    
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
  
        var url = getOdataPath() + entitySchemaName + "Set(guid'" + id + "')" + systemQueryOptions;

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
        
        var url = getOdataPath() + entitySchemaName + "Set";
        
        return $http({
            method: "GET", 
            url: url,
        });
    }
    
    function create (entitySchemaName, record) {
        var url = getOdataPath() + entitySchemaName + "Set";
        
        return $http({
            method: "POST", 
            url: url,
            data: record
        });
    }
    
    function update (entitySchemaName, recordId, record) {
        var url = getOdataPath() + entitySchemaName + "Set(guid'" + recordId + "')";
        
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
        var url = getOdataPath() + entitySchemaName + "Set(guid'" + recordId + "')";
        
        return $http({
            method: "POST", 
            url: url,
            headers: {
               "X-HTTP-Method": "DELETE" 
            },
        });
    }

    function associate (parentId, parentEntitySchemaName, relationshipName, childId, cildEntitySchemaName) {
  
        var url = getOdataPath() + parentEntitySchemaName + "Set(guid'" + parentId + 
        "')/$links/" + relationshipName;
        
        var childEntityReference = {
            uri: getOdataPath() + "/" + childEntitySchemaName + "Set(guid'" + childId + "')"
        }
        
        return $http({
            method: "POST", 
            url: url,
            data: childEntityReference
        });
    }
    
    function disassociate (parentId, parentEntitySchemaName, relationshipName, childId) {
  
        var url = getOdataPath() + parentEntitySchemaName + "Set(guid'" + parentId + 
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
    var soapEndPoint = = 

    function execute(requestXml) {

        var xml = ['<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">',
                    '  <s:Body>',
                    '    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" ',
                    '           xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">',
                    requestXml,
                    '    </Execute>',
                    '  </s:Body>',
                    '</s:Envelope>'].join('');
                    
        return $http({
            method: 'POST',
            data: xml,
            url: crmCommon.getServerUrl() + '/XRMServices/2011/Organization.svc/web';
            headers: {
                "Accept": "application/xml, text/xml, */*",
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute"
            }
        });
    }
    
    ///
    /// Assigns the reocrd to another system-user 
    ///
    function assign(recordId, recordEntityLogicalname, assigneeid) {

        var assignRequest = ['<request i:type=\"b:AssignRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" ',
                        '           xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">',
                        '        <a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">',
                        '          <a:KeyValuePairOfstringanyType>',
                        '            <c:key>Target</c:key>',
                        '            <c:value i:type=\"a:EntityReference\">',
                        '              <a:Id>' + recordId + '</a:Id>',
                        '              <a:LogicalName>' + recordEntityLogicalName + '</a:LogicalName>',
                        '              <a:Name i:nil=\"true\" />',
                        '            </c:value>',
                        '          </a:KeyValuePairOfstringanyType>',
                        '          <a:KeyValuePairOfstringanyType>',
                        '            <c:key>Assignee</c:key>',
                        '            <c:value i:type=\"a:EntityReference\">',
                        '              <a:Id>' + assigneeid + '</a:Id>',
                        '              <a:LogicalName>systemuser</a:LogicalName>',
                        '              <a:Name i:nil=\"true\" />',
                        '            </c:value>',
                        '          </a:KeyValuePairOfstringanyType>',
                        '        </a:Parameters>',
                        '        <a:RequestId i:nil=\"true\" />',
                        '        <a:RequestName>Assign</a:RequestName>',
                        '      </request>'].join('');

        return execute(assignRequest);
    }

    return {
        execute : execute,
        assign : assign
    };
});
