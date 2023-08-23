/*
 * Script: Upgrade Utility Script
 * Author: Dale Stubblefield
 * Date: 24/Aug/2023
 *
 * Description:
 * This script is designed to analyze plugin and store app upgrades in a ServiceNow environment.
 * It retrieves attachment data, compares version numbers, and detects available upgrades.
 *
 * Usage:
 * 1. This script should be executed in a ServiceNow instance with appropriate permissions.
 * 2. The script will analyze plugin attachments and store app payloads for available upgrades.
 * 3. It outputs information about the number of plugins and store apps installed, upgrades detected,
 *    and total upgrades available.
 *
 * Notes:
 * - This script requires proper configuration of GlideRecords, attachment data, and JSON parsing.
 * - Make sure to adjust verbosity levels to control the amount of logging output.
 * - The script utilizes the ServiceNow platform to enhance upgrade tracking and management.
 *
 * Disclaimer:
 * This script is provided as-is without any warranties. Use it at your own risk and ensure
 * it's tested in a safe environment before applying to production instances.
 */
var upgradeUtil = Class.create();
upgradeUtil.prototype = {
    initialize: function () {},

    // more info => https://docs.servicenow.com/csh?topicname=cicd-api.html&version=latest

    ////////////////////////////////////////////////////////////////////////////////
    upgradeAllAvailable: function (loginType, loginKey) {

        // Recommend reading this if you have questions about CICD API:
        // https://docs.servicenow.com/bundle/utah-api-reference/page/integrate/inbound-rest/concept/cicd-api.html#title_cicd-POST-app-batch-install

        // This will go into your Batch Install Plan Notes
        var scriptName = 'Requested via bg script from https://github.com/dalestubblefield/sn-package-upgrade-util';

        // Only process this many packages
        var debug_limit = 200;

        var log = [];

        // Check if any inputs are missing
        if (!loginType) {
            log.push("No inputs were provided. Please provide the required inputs.");
            log.push("\nLike this:\ninstallSpecificAppsUtah(admin,password)");
            log.push("\n\nOr this:\ninstallSpecificAppsUtah(alias,sys_id)");
            gs.info(log);
            return;
        }


        // Get the list of upgrades
        var result = this.countUpgrades();

        var applicationsToUpgradeArr = result.prop1; // Array: packages
        /*
            EXAMPLE PACKAGE

            var packageDetails = {
                notes: notes,
                id: sys_id,
                requested_version: upgrade_version,
                load_demo_data: true,
                type: "application"
            
            };
        */

        var upgrades = result.prop2; // Integer: how many upgrades
        if (upgrades == "0") {
            log.push("\n --> No apps found to upgrade");
            gs.info(log);
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////
        // Build the payload 
        ////////////////////////////////////////////////////////////////////////////////
        notes = "Submitting " + upgrades + " apps to upgrade"; // This will go in the Batch Install Plan Notes

        // Create a JSON object containing the packages array
        var payload = {
            "name": "upgradeUtil Script on " + new GlideDateTime(),
            "notes": notes,
            "packages": applicationsToUpgradeArr
        };

        ////////////////////////////////////////////////////////////////////////////////
        // check login type: username or Connection & Credential Alias
        ////////////////////////////////////////////////////////////////////////////////
        var basicUserName = '';
        var basicPassword = '';

        if (loginType === "") {
            log.push("\n ERROR: loginType is blank");
            gs.info(log);
            this._makeCreds();
            return;
        }

        if (loginType == "alias") {
            log.push("\n\n --> AUTHTYPE: Connection & Credential Alias")
            var aliasId = loginKey;

            if (!aliasId) {
                log.push("\n --> WARNING: C&C Alias not provided, attempting to use default");
                aliasId = '752a91887740001038e286a2681061fb';
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
                    this._makeCreds();
                    return;
                }

                if (basicPassword == null) {
                    log.push("\n ERROR: Connection Alias password issue");
                    gs.info(log);
                    this._makeCreds();
                    return;
                }
            } else {
                log.push("\n --> Connection Alias unknown issue - ABORTING!!!");
                gs.info(log);
                this._makeCreds();
                return;
            }
        } else {
            log.push("\n\n --> Authentication will be with an account")
            var basicUserName = loginType.toString();
            var basicPassword = loginKey.toString();
            log.push("\n --> User will be => " + basicUserName);
            //log.push("\n --> Key will be => " + basicPassword);
        }

        if (basicUserName == '' || basicPassword == '') {
            log.push("\n --> credentials not found.");
            gs.info(log);
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////
        // for each package, call the API and create a Batch Install Plan per package
        ////////////////////////////////////////////////////////////////////////////////
        var limit = Math.min(applicationsToUpgradeArr.length, debug_limit);

        // Iterate through pkgsToUpgradeArray
        for (var i = 0; i < limit; i++) {

            //var packageDetails = pkgsToUpgradeArray.shift();
            var packageDetails = applicationsToUpgradeArr[i];

            // Create the payload object
            var payload = {
                "name": '',
                "notes": '',
                "packages": [packageDetails]
            };

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
            var allBatchPlans = this.callAPI(payload,basicUserName,basicPassword);
        }

        if (allBatchPlans) {
            log.push("\n\n --> Batch Plans: \n\n" + allBatchPlans);
        } else {
            log.push("\n\n --> Nothing submitted");
        }


        gs.info(log);

    },

    ////////////////////////////////////////////////////////////////////////////////
    // Call the API
    ////////////////////////////////////////////////////////////////////////////////
    callAPI: function(payload,basicUserName,basicPassword) {

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
    },

    ////////////////////////////////////////////////////////////////////////////////
    _makeCreds: function (log) {
        var instanceName = gs.getProperty('instance_name');
        var connection_url = 'https://' + instanceName + '.service-now.com/';
        var alias_url = 'https://' + instanceName + '.service-now.com/nav_to.do?uri=sys_alias.do?sys_id=752a91887740001038e286a2681061fb';
        var log = [];
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
    },

    ///////////////////////////////////////////////////////////////////////////////
    countUpgrades: function () {

        var log = [];

        ///////////////////////////////////////////////////////////////////////////
        // In sys_store_app records, compare version to latest_version to see if we can upgrade		
        ///////////////////////////////////////////////////////////////////////////
        var appsGr = new GlideRecord('sys_store_app');
        appsGr.orderBy('name');
        appsGr.addQuery('active', true);
        appsGr.addQuery('hide_on_ui', false);
        appsGr.addQuery('update_available', true);
        appsGr.query();

        var applicationsToUpgradeArr = []; // Create an empty JSON array
        var upgrades = 0;
        var total = appsGr.getRowCount();
        log.push("\n --> " + total + " apps found on [sys_store_app]");

        while (appsGr.next()) {
            var notes = appsGr.getValue('name');
            var upgrade = 0;
            var upgrade_version = '';
            var versionStr = appsGr.getValue('version');
            var assignedVersionStr = appsGr.getValue('assigned_version');
            var latestVersionStr = appsGr.getValue('latest_version');
            // Convert the strings to arrays of integers
            var versionArr = versionStr.split('.').map(Number);
            var assignedVersionArr = assignedVersionStr.split('.').map(Number);
gs.info(latestVersionStr);
            if (latestVersionStr !== null) {
    var latestVersionArr = latestVersionStr.split('.').map(Number);
    // Rest of the code that uses latestVersionArr
} else {
    // Handle the case where latestVersionStr is null
    // For example, you can set a default value or skip this part of the code
                var latestVersionStr = "0,0,0";
                 var latestVersionArr = latestVersionStr.split('.').map(Number);
}


            
            var latestVersionArr = latestVersionStr.split('.').map(Number);

            // Compare the arrays element-wise
            for (var i = 0; i < versionArr.length; i++) {
                if (versionArr[i] > assignedVersionArr[i] && versionArr[i] > latestVersionArr[i]) {
                    //log.push("\n --> " + notes + " version is highest value " + versionStr);
                    upgrade_version = versionStr;
                    upgrade = 1;
                    break;
                } else if (assignedVersionArr[i] > versionArr[i] && assignedVersionArr[i] > latestVersionArr[i]) {
                    ////log.push("\n --> " + notes + " assigned_version is highest value " + assignedVersionStr);
                    upgrade_version = assignedVersionStr;
                    upgrade = 1;
                    break;
                } else if (latestVersionArr[i] > versionArr[i] && latestVersionArr[i] > assignedVersionArr[i]) {
                    //log.push("\n --> " + notes + " latest_version is highest value " + latestVersionStr);
                    upgrade_version = latestVersionStr;
                    upgrade = 1;
                    break;
                } else {
                    continue; // version values are all the same. no upgrade	
                }
            }

            if (upgrade == 1) { // If upgrade found, add packageDetails to JSON to send to API later
                var packageDetails = {
                    notes: notes,
                    id: appsGr.getValue('sys_id'),
                    requested_version: upgrade_version,
                    load_demo_data: true,
                    type: "application"

                };
                applicationsToUpgradeArr.push(packageDetails);
                upgrades++;
            }
        }

        log.push("\n --> " + upgrades + " to upgrade");
        gs.info(log);

        return {
            prop1: applicationsToUpgradeArr,
            prop2: upgrades
        }

    },

    type: 'upgradeUtil'
};

////////////////////////////////////////////////////////////////////////////////
var upgradeUtil = new upgradeUtil();

// => FIND OUT HOW MANY APPS AVAILABLE FOR UPGRADE IN CACHE	
//upgradeUtil.countUpgrades();

// => OR DEFINE YOUR OWN CREDENTIALS
//upgradeUtil.upgradeAllAvailable('admin', 'password');

// =>OR USE A CONNECTION ALIAS
upgradeUtil.upgradeAllAvailable('alias', '752a91887740001038e286a2681061fb'); // sn_cicd_spoke.CICD

// For more info => https://docs.servicenow.com/csh?topicname=cicd-api.html&version=latest
