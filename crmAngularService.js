// Create the CRM service module. 
var crmModule = angular.module("crmModule", []);

// common functions will be used by both the rest and soap services. 
crmModule.factory("crmCommon", function () {
    'use strict';


    function getContext() {
        if (window.GetGlobalContext) {
            return window.GetGlobalContext();
        }

        if (window.Xrm) {
            return window.Xrm.Page.context;
        }
        throw new Error("CRM Context is not available.");
    }

    var serverUrl;
    function getServerUrl() {

        if (!serverUrl) {

            var url,
                localServerUrl = window.location.protocol + "//" + window.location.host,
                context = getContext();

            if (context.getClientUrl !== undefined) {
                url = context.getClientUrl();
            } else if (context.isOutlookClient() && !context.isOutlookOnline()) {
                url = localServerUrl;
            } else {
                url = context.getServerUrl();
                url = url.replace(/^(http|https):\/\/([_a-zA-Z0-9\-\.]+)(:([0-9]{1,5}))?/, localServerUrl);
                url = url.replace(/\/$/, "");
            }

            serverUrl = url;
        }

        return serverUrl;
    }

    return {
        getCrmContext: getContext,
        getServerUrl: getServerUrl
    };
});

crmModule.factory("crmRestSvc", function (crmCommon, $http) {
    'use strict';

    function getOdataPath() {
        return crmCommon.getServerUrl() + '/XRMServices/2011/OrganizationData.svc/';
    }

    function buildUrl(url, params) {
        if (!params) {
            return url;
        }
        var parts = [];

        angular.forEach(params, function (value, key) {
            if (value === null || angular.isUndefined(value)) {
                return;
            }
            if (!angular.isArray(value)) {
                value = [value];
            }

            angular.forEach(value, function (v) {
                if (angular.isObject(v)) {
                    v = angular.toJson(v);
                }
                parts.push(key + '=' + v);
            });
        });
        if (parts.length > 0) {
            url += ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&');
        }
        return url;
    }

    function retrieve(entitySchemaName, recordId, options) {
        var url = (getOdataPath() + entitySchemaName + "Set(guid'" + recordId + "')");
        var urlWithOptions = buildUrl(url, options);

        return $http({
            method: "GET",
            url: urlWithOptions
        });
    }

    function retrieveMultiple(entitySchemaName, options) {
        var url = buildUrl((getOdataPath() + entitySchemaName + "Set"), options);

        return $http({
            method: "GET",
            url: url
        });
    }

    /// create a new record in CRM.
    /// example : to create a contact in CRM
    ///     create("Contact", { FirstName : "John", LastName : "Doe" });
    function create(entitySchemaName, record) {
        var url = getOdataPath() + entitySchemaName + "Set";

        return $http({
            method: "POST",
            url: url,
            data: record
        });
    }

    /// update a record in CRM
    /// Example: 
    ///     update("Contact","38a7e85e-d0ff-e311-aba1-00155d098400", { MiddleName : "Joe"}); 
    function update(entitySchemaName, recordId, record) {
        var url = getOdataPath() + entitySchemaName + "Set(guid'" + recordId + "')";

        return $http({
            method: "POST",
            url: url,
            data: record,
            headers: {
                "X-HTTP-Method": "MERGE"
            }
        });
    }

    /// delete a record in CRM
    /// Example: to delete a Contact in CRM
    ///     remove("Contact","38a7e85e-d0ff-e311-aba1-00155d098400"); 
    function remove(entitySchemaName, recordId) {
        var url = getOdataPath() + entitySchemaName + "Set(guid'" + recordId + "')";

        return $http({
            method: "POST",
            url: url,
            headers: {
                "X-HTTP-Method": "DELETE"
            }
        });
    }

    function associate(parentId, parentEntitySchemaName, relationshipName, childId, childEntitySchemaName) {

        var url = getOdataPath() + parentEntitySchemaName + "Set(guid'" + parentId +
        "')/$links/" + relationshipName;

        var childEntityReference = {
            uri: getOdataPath() + "/" + childEntitySchemaName + "Set(guid'" + childId + "')"
        };

        return $http({
            method: "POST",
            url: url,
            data: childEntityReference
        });
    }

    function disassociate(parentId, parentEntitySchemaName, relationshipName, childId) {

        var url = getOdataPath() + parentEntitySchemaName + "Set(guid'" + parentId +
        "')/$links/" + relationshipName + "(guid'" + childId + "')";

        return $http({
            method: "POST",
            url: url,
            headers: {
                "X-HTTP-Method": "DELETE"
            }
        });
    }

    return {
        retrieveMultiple: retrieveMultiple,
        retrieve: retrieve,
        associate: associate,
        disassociate: disassociate,
        "delete": remove, // delete and remove methods are the same. 'delete' might not work in some browsers
        remove: remove,
        update: update,
        create: create
    };
});

crmModule.factory("crmSoapSvc", function (crmCommon, $http) {
    'use strict';

    function htmlEncode(xml) {
        if (!xml) {
            return xml;
        }
        return String(xml).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function execute(requestXml) {

        var xml = ['<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">',
                    '  <s:Body>',
                    '    <Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" ',
                    '           xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
                    requestXml,
                    '    </Execute>',
                    '  </s:Body>',
                    '</s:Envelope>'].join('');

        return $http({
            method: 'POST',
            data: xml,
            url: crmCommon.getServerUrl() + '/XRMServices/2011/Organization.svc/web',
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

        var assignRequest = ['<request i:type="b:AssignRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" ',
                        '           xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">',
                        '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
                        // set the target value
                        '          <a:KeyValuePairOfstringanyType>',
                        '            <c:key>Target</c:key>',
                        '            <c:value i:type="a:EntityReference">',
                        '              <a:Id>' + recordId + '</a:Id>',
                        '              <a:LogicalName>' + recordEntityLogicalname + '</a:LogicalName>',
                        '              <a:Name i:nil="true" />',
                        '            </c:value>',
                        '          </a:KeyValuePairOfstringanyType>',
            
                        // set the assignee value
                        '          <a:KeyValuePairOfstringanyType>',
                        '            <c:key>Assignee</c:key>',
                        '            <c:value i:type="a:EntityReference">',
                        '              <a:Id>' + assigneeid + '</a:Id>',
                        '              <a:LogicalName>systemuser</a:LogicalName>',
                        '              <a:Name i:nil="true" />',
                        '            </c:value>',
                        '          </a:KeyValuePairOfstringanyType>',
            
                        '        </a:Parameters>',
                        '        <a:RequestId i:nil="true" />',
                        '        <a:RequestName>Assign</a:RequestName>',
                        '      </request>'].join('');

        return execute(assignRequest);
    }

    function fetchXmlRequest(fetchXml) {
        var fetchRequest = ['<request i:type="b:RetrieveMultipleRequest" xmlns:b="http://schemas.microsoft.com/xrm/2011/Contracts">',
            '             <b:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
            
            '             <b:KeyValuePairOfstringanyType>',
            '                 <c:key>Query</c:key>',
            '                 <c:value i:type="b:FetchExpression">',
            '                     <b:Query>',
            htmlEncode(fetchXml),
            '                     </b:Query>',
            '                 </c:value>',
            '             </b:KeyValuePairOfstringanyType>',
            
            '         </b:Parameters>',
            '         <b:RequestId i:nil="true"/>',
            '         <b:RequestName>RetrieveMultiple</b:RequestName>',
            '     </request>'].join('');

        return execute(fetchRequest);
    }


    return {
        execute: execute,
        assign: assign,
        fetchXmlRequest: fetchXmlRequest,
        htmlEncode: htmlEncode
    };
});
