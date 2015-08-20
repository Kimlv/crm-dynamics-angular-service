crm-dynamics-angular-service
============================

Access CRM Rest and soap services using AngularJs

There are three main things which could be injected using the angular dependency injection.
* crmRestSvc : make calls to crm server using the rest protocole
* crmSoapSvc : make calls to crm server using the soap protocole
* crmCommon : common functions shared by the above services

## crmRestSvc
#### crmRestSvc.retrieveMultiple 
Retrives multiple records from CRM 
```javascript
  crmRestSvc.retrieveMultiple("Account", { $select : "Name,Telephone1", $top : 1 })
  .then(function (accounts){
  // use accounts
  }, function (errors){
  // something went wrong
  })
```

#### crmRestSvc.retrieve
Retrieve single record from CRM
```javascript
  crmRestSvc.retrieve("Contact", "{eee1c358-06ca-4ee3-afad-ddfb45a473e5}")
  .then(function(contact){
  // use contact
  })
```

Additional options could also be passed to the retrieve function 

```javascript
  // will fetch the contact only with fullname.
  crmRestSvc.retrieve("Contact", "{eee1c358-06ca-4ee3-afad-ddfb45a473e5}" , { $select : "FullName" })
  .then(function(contact){
  // use contact
  })
```
#### crmRestSvc.create
Creates a new record in CRM. Pass the schema name of the entity and the entity as an object.
```javascript
crmRestSvc.create("Contact", { FirstName : "John", LastName : "Doe" });
```
### crmRestSvc.update
```javascript
crmRestSvc.update("Contact", "{eee1c358-06ca-4ee3-afad-ddfb45a473e5}", { FirstName : "John", LastName : "Doe" });
```
### crmRestSvc.remove
```javascript
crmRestSvc.remove("Contact", "{eee1c358-06ca-4ee3-afad-ddfb45a473e5}");
```
### crmRestSvc.delete
Same as remove. This might not work in older browsers because delete is a reserved word so use the remove method instead.

### crmRestSvc.associate
```javascript
crmRestSvc.associate(accountId,	"Account", "Referencedaccount_parent_account", childId, "Account");
```

### crmRestSvc.disassociate: disassociate,
```javascript
crmRestSvc.disassociate(accountId, "Account", "Referencedaccount_parent_account", childId);
```






