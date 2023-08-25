/**
 * Automate Package Installation on ServiceNow using CICD API
 *
 * This script automates the installation or upgrade of packages on the ServiceNow platform using the CICD API.
 * It supports multiple authentication methods and provides detailed logging of progress and batch plans.
 * For more information about CICD API and package installation, refer to the provided documentation links.
 *
 * Author: Dale Stubblefield (dale.stubblefield@servicenow.com)
 * Date: 25/Aug/2023
 *
 * Instructions:
 * 1. Fill in the necessary authentication details and parameters.
 * 2. Configure the desired behavior by adjusting variables and flags.
 * 3. Run the script in a suitable context, such as background scripts in ServiceNow.
 *
 * Resources:
 * - CICD API Documentation: https://docs.servicenow.com/bundle/utah-api-reference/page/integrate/inbound-rest/concept/cicd-api.html
 * - ServiceNow Store: https://store.servicenow.com/sn_appstore_store.do#!/store/application/<sys_id>
 *
 * Disclaimer: Use at your own risk. This script is provided as-is without warranty of any kind.
 */

function installSpecificAppsUtah(loginType, loginKey) {

    // Recommend reading this if you have questions about CICD API:
    // https://docs.servicenow.com/bundle/utah-api-reference/page/integrate/inbound-rest/concept/cicd-api.html#title_cicd-POST-app-batch-install

    // Want to look up a package in the Store?
    // https://store.servicenow.com/sn_appstore_store.do#!/store/application/<sys_id>

    // Only process this many packages
    var debug_limit = 200;

    // This will go into your Batch Install Plan Notes
    var scriptName = 'Requested via bg script';

    // ////////////////////////////////////////////////////////////////////////////////
    // packageDetails = {
    //     id: '2b017207a3b80110e355f99246fcda3f', // Required. Sys_id of the application or identifier of the plugin to install.
    //     load_demo_data: true, // Flag that indicates whether demo data is loaded when installing the package.
    //     notes: 'AES Application Object Templates',
    //     requested_version: '24.0.2', // Required if packages.type is set to application; ignored if set to plugin.
    //     type: 'application'
    // }

    var log = [];
    var logEachPackage = false; // set this to true for some extra verbose logging

    // Check if any inputs are missing
    if (!loginType) {
        log.push("No inputs were provided. Please provide the required inputs.");
        log.push("\nLike this:\ninstallSpecificAppsUtah('admin','password')");
        log.push("\n\nOr this:\ninstallSpecificAppsUtah('alias','sys_id')");
        gs.info(log);
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Build pkgsToUpgradeArray
    ////////////////////////////////////////////////////////////////////////////////

    var pkgsToUpgradeArray = []; // array of packages to install or upgrade
    var upgrades = 0;
    //log.push("\n --> Installing: ");

    var appsGr = new GlideRecord('sn_dependentclient_application');
    appsGr.addEncodedQuery('app_type=integration^scopeLIKEspoke^titleLIKEspoke');
    appsGr.orderBy('title');
    appsGr.query();

    while (appsGr.next()) {
        var id = appsGr.getValue('source_app_id');
        var load_demo_data = appsGr.getValue('demo_available');
        var notes = appsGr.getValue('title');
        var requested_version = appsGr.getValue('version');

        var packageDetails = {};

        packageDetails = {
            id: id,
            load_demo_data: load_demo_data,
            notes: notes,
            requested_version: requested_version,
            type: 'application'
        }

        logEachPackage && log.push("\n     --> " + packageDetails.notes);
        pkgsToUpgradeArray.push(packageDetails);
        upgrades++;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Wrap up the package adding
    ////////////////////////////////////////////////////////////////////////////////
    //log.push("\n --> Total packages " + upgrades);

    ////////////////////////////////////////////////////////////////////////////////
    // check login type: username or Connection & Credential Alias
    ////////////////////////////////////////////////////////////////////////////////
    var basicUserName = '';
    var basicPassword = '';

    if (loginType === "") {
        log.push("\n ERROR: loginType is blank");
        gs.info(log);
        makeCreds();
        return;
    }

    if (loginType == "alias") {
        log.push("\n\n --> AUTHTYPE: Connection & Credential Alias");
        var aliasId = loginKey;

        if (!aliasId) {
            log.push("\n --> WARNING: C&C Alias not provided, attempting to use default");
            aliasId = '752a91887740001038e286a2681061fb'; // This is the default CICD C&C Alias
        }

        // Set basic authentication using a username and password
        // https://developer.servicenow.com/dev.do#!/reference/api/tokyo/server/sn_cc-namespace/connectioninfo-api
        var provider = new sn_cc.ConnectionInfoProvider();
        var connectionInfo = provider.getConnectionInfo(aliasId);
        if (connectionInfo != null) {
            basicUserName = connectionInfo.getCredentialAttribute("user_name");
            basicPassword = connectionInfo.getCredentialAttribute("password");

            if (basicUserName == null) {
                log.push("\n ERROR: Connection Alias username issue");
                gs.info(log);
                makeCreds();
                return;
            }

            if (basicPassword == null) {
                log.push("\n ERROR: Connection Alias password issue");
                gs.info(log);
                makeCreds();
                return;
            }
        } else {
            log.push("\n --> Connection Alias unknown issue - ABORTING!!!");
            gs.info(log);
            makeCreds();
            return;
        }
    } else {
        log.push("\n\n --> Authentication will be with an account");
        basicUserName = loginType.toString();
        basicPassword = loginKey.toString();
        log.push("\n --> User will be => " + basicUserName);
        //log.push("\n --> Key will be => " + basicPassword);
    }

    if (basicUserName == '' || basicPassword == '') {
        log.push("\n --> credentials not found.");
        gs.info(log);
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // for each package, call the API and create a Batch Install Plan per package:w
    ////////////////////////////////////////////////////////////////////////////////
    var limit = Math.min(pkgsToUpgradeArray.length, debug_limit);

    // Iterate through pkgsToUpgradeArray
    for (var i = 0; i < limit; i++) {

        var packageDetails = pkgsToUpgradeArray.shift();

        // Create the payload object
        var payload = {
            name: '',
            notes: '',
            packages: []
        };

        // Add packageDetails to the payload packages array
        payload.packages.push(packageDetails);

        // See if this is not installed
        var packages = new GlideRecord('sys_package');
        if (packages.get(packageDetails.id) || packages.get('source', packageDetails.id)) {

            var currentVersion = packages.getValue('version');
            if (currentVersion != packageDetails.requested_version) {
                log.push("\n[ ] " + packageDetails.notes + " <<< Upgrade requested ");
                payload.name = 'Upgrade ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                payload.notes = scriptName;
            } else {
                log.push("\n[✓] " + packageDetails.notes);
                continue;
            }
        } else {
            log.push("\n[ ] " + packageDetails.notes + " <<< Install requested ");
            payload.name = 'Install ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
            payload.notes = scriptName;
        }

        // send the payload!
        var allBatchPlans = callAPI(payload);
    }

    if (allBatchPlans) {
        log.push("\n\n --> Batch Plans: \n\n" + allBatchPlans);
    } else {
        log.push("\n\n --> Nothing submitted");
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Call the API
    ////////////////////////////////////////////////////////////////////////////////
    function callAPI(payload) {

        var request = new sn_ws.RESTMessageV2();

        var instanceName = gs.getProperty('instance_name');
        if (instanceName.indexOf("nowlearning") !== -1) { // need to add .lab to URL
            instanceName = instanceName + ".lab";
        }

        request.setEndpoint('https://' + instanceName + '.service-now.com/api/sn_cicd/app/batch/install');
        request.setHttpMethod('POST');

        // Set basic authentication using a username and password
        request.setBasicAuth(basicUserName, basicPassword);

        // Set the request headers to accept JSON
        request.setRequestHeader("Accept", "application/json");

        // Set the request body to the JSON payload
        request.setRequestBody(JSON.stringify(payload));

        // Execute the REST API call and log the response body
        var response = request.execute();
        var statusCode = response.getStatusCode();

        // Lookup object for status code descriptions and error messages
        //         var statusMessages = {
        //             200: "200 SUCCESS: Successful. The request was successfully processed.",
        //             400: "400 ERROR: Bad Request response status code indicates that the server cannot or will not process the request due to something that is perceived to be a client error (for example, malformed request syntax, invalid request message framing, or deceptive request routing).",
        //             401: "401 ERROR: The user credentials are incorrect.",
        //             403: "403 ERROR: Forbidden. The user is not an admin or does not have the sn_cicd.sys_ci_automation role.",
        //             405: "405 ERROR: Invalid method. The functionality is disabled."
        //         };

        var statusMessages = {
            200: "200 SUCCESS",
            400: "400 ERROR: Bad Request response status code",
            401: "401 ERROR: The user credentials are incorrect.",
            403: "403 ERROR: Forbidden. The user is not an admin or does not have the sn_cicd.sys_ci_automation role.",
            405: "405 ERROR: Invalid method. The functionality is disabled."
        };

        // Check if the status code exists in the lookup object
        if (statusMessages.hasOwnProperty(statusCode)) {
            //log.push("..." + statusMessages[statusCode]);
            if (statusCode !== 200) {
                //log.push("... Batch Install Plan Submitted successfully.");
                //gs.info(log);
                //return;
            } else if (statusCode == 200) {
                //log.push("... Batch Install Plan Submitted successfully.");
                //return;
            }
        } else {
            // Unknown status code
            log.push("...ERROR: Request failed with unknown status code " + statusCode + "\n");
            //gs.info(log);
            return;
        }

        var responseBody = response.getBody();
        var responseBodyJSONObj = JSON.parse(responseBody);

        var responseBodyResultLinkResults = responseBodyJSONObj.result.links.results;
        for (var property in responseBodyResultLinkResults) {
            if (responseBodyResultLinkResults.hasOwnProperty(property)) {
                var value = responseBodyResultLinkResults[property];
                if (property == "id") {
                    var batchUrl = 'https://' + instanceName + '.service-now.com/nav_to.do?uri=sys_batch_install_plan.do?sys_id=' + value;
                    var allBatchPlans = 'https://' + instanceName + '.service-now.com/now/nav/ui/classic/params/target/sys_batch_install_plan_list';

                    // log.push("\n\n --> Batch Plan URL: \n" + batchUrl + "\n");
                    // log.push("\n\n --> All Batch Plans URL: \n" + allBatchPlans + "\n");
                }
            } else {
                log.push("\n --> UNKNOWN ERROR! responseBodyResultLinkResults.hasOwnProperty(property) did not have any properties");
            }
        }
        return allBatchPlans;
    }

    ////////////////////////////////////////////////////////////////////////////////
    function makeCreds(log) {
        var instanceName = gs.getProperty('instance_name');
        var connection_url = 'https://' + instanceName + '.service-now.com/';
        var alias_url = 'https://' + instanceName + '.service-now.com/nav_to.do?uri=sys_alias.do?sys_id=752a91887740001038e286a2681061fb';
        //var log = [];
        log.push("\n\n --> NEED TO RECONFIGURE CICD CONNECTION ALIAS FOR SCRIPT");
        log.push("\n\n --> Go to this URL:\n" + alias_url + "\n");
        log.push("\n\n --> Change 'Type' to 'Connection and Credential and Save Record");
        log.push("\n     (Stay on page)");
        log.push("\n\n --> Create NEW Connection");
        log.push("\n     NAME: (enter name)");
        log.push("\n     Credential: (Create new record)");
        log.push("\n     Connection URL: " + connection_url);
        gs.info(log);
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // The End

    gs.info(log);

    return;
}

// OPTION 1
var login = 'admin'; // An account with the 'admin' role
var password = 'password'; //Replace with your password
installSpecificAppsUtah(login, password);

// OPTION 2
// Use the default CICD Credential Alias
// - you MUST reconfigure the Alias to be a "Connection & Credentail" alias and configure accordingly 
// - keep the parameter as the string 'alias'
//installSpecificAppsUtah('alias'); 