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
 * 
 * References: 
 * CICD API: https://docs.servicenow.com/csh?topicname=cicd-api.html&version=latest
 */
var upgradeUtil = Class.create();
upgradeUtil.prototype = {
    initialize: function () {

        // Batch Install Plan Notes;
        this.notes = 'Requested via bg script from https://github.com/dalestubblefield/sn-package-upgrade-util'

        this.log = [];

        // how many packages to process, SN only has less than 3000
        this.limit = 20000;

        this.verbosity = 2;
        /* 
         * 0 - only errors
         * 1 - extra details
         * 2 - debug
         */
    },

    /**
    * Upgrades All Available Applications
    *
    * @description This method initiates the process of upgrading available applications.
    * It checks for available upgrades, prepares a payload for each upgrade, and submits
    * upgrade requests using the ServiceNow REST API. The method supports both direct
    * username/password authentication and using a Connection & Credential Alias.
    *
    * @param {string} loginType - The authentication type ('username' or 'alias').
    * @param {string} loginKey - The username/password or Connection & Credential Alias ID.
    *
    * @memberof upgradeUtil
    * @method upgradeAllAvailable
    */
    upgradeAllAvailable: function (loginType, loginKey) {
        // Check if any inputs are missing
        if (!loginType) {
            (this.verbosity >= 0) && this.log.push("\nNo inputs were provided. Please provide the required inputs.");
            (this.verbosity >= 0) && this.log.push("\nLike this:\ninstallSpecificAppsUtah('admin','password')");
            (this.verbosity >= 0) && this.log.push("\n\nOr this:\ninstallSpecificAppsUtah('alias','sys_id')");
            (this.verbosity >= 0) && gs.info(this.log);
            return;
        }

        var result = this._analyzeUpgrades(); // Get the list of upgrades
        var applicationsToUpgradeArr = result.prop1; // Array: packages
        var upgrades = result.prop2; // Integer: how many upgrades

        if (upgrades === "0") {
            (this.verbosity >= 0) && this.log.push("\n --> No apps found to upgrade: Should quit here");
            return;
        }

        /*************************************************************
         * Build the payload 
         *************************************************************/
        var notes = "Submitting " + upgrades + " apps to upgrade"; // This will go in the Batch Install Plan Notes

        // Create a JSON object containing the packages array
        var payload = {
            "name": "upgradeUtil Script on " + new GlideDateTime(),
            "notes": notes,
            "packages": applicationsToUpgradeArr
        };
        /*
         *  EXAMPLE PACKAGE
         *  var packageDetails = {
         *      notes: notes,
         *      id: sys_id,
         *      requested_version: upgrade_version,
         *      load_demo_data: true,
         *      type: "application"
         *   };
         */

        /*************************************************************
         * check login type: username or Connection & Credential Alias
         */
        var basicUserName = '';
        var basicPassword = '';

        if (loginType === "") {
            this.log.push("\n ERROR: loginType is blank");
            this._makeCreds();
            (this.verbosity >= 0) && gs.info(this.log);
            return;
        }

        if (loginType == "alias") {
            var aliasId = loginKey;

            if (!aliasId) {
                this.log.push("\n --> WARNING: C&C Alias not provided, attempting to use default");
                aliasId = '752a91887740001038e286a2681061fb';
            }

            /*
             * Set basic authentication using a username and password
             * https://developer.servicenow.com/dev.do#!/reference/api/tokyo/server/sn_cc-namespace/connectioninfo-api
             */
            var provider = new sn_cc.ConnectionInfoProvider();
            var connectionInfo = provider.getConnectionInfo(aliasId);
            if (connectionInfo != null) {
                basicUserName = connectionInfo.getCredentialAttribute("user_name");
                basicPassword = connectionInfo.getCredentialAttribute("password");

                if (basicUserName == null) {
                    this.log.push("\n ERROR: Connection Alias username issue");
                    this._makeCreds();
                    gs.info(this.log);
                    return;
                }

                if (basicPassword == null) {
                    this.log.push("\n ERROR: Connection Alias password issue");
                    this._makeCreds();
                    gs.info(this.log);
                    return;
                }
            } else {
                this.log.push("\n --> Connection Alias unknown issue - ABORTING!!!");
                this._makeCreds();
                gs.info(this.log);
                return;
            }
        } else {
            this.log.push("\n\n --> Authentication will be with an account")
            var basicUserName = loginType.toString();
            var basicPassword = loginKey.toString();
            this.log.push("\n --> User will be => " + basicUserName);
        }

        if (basicUserName == '' || basicPassword == '') {
            this.log.push("\n --> credentials not found.");
            gs.info(this.log);
            return;
        }

        /* 
         * for each package, call the API and create a Batch Install Plan per package 
         */
        var limit = Math.min(applicationsToUpgradeArr.length, this.limit);

        // Iterate through applicationsToUpgradeArr
        for (var i = 0; i < limit; i++) {

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
                    //this.log.push("\n[ ] " + packageDetails.notes + " <<< Upgrade requested ");
                    this.log.push("\n[ ] " + packageDetails.notes);
                    payload.name = 'Upgrade ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                    payload.notes = this.notes;
                } else {
                    this.log.push("\n[✓] " + packageDetails.notes);
                    continue;
                }
            } else {
                this.log.push("\n[ ] " + packageDetails.notes + " <<< Install requested ");
                payload.name = 'Install ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                payload.notes = this.notes;
            }

            // send the payload!
            var allBatchPlans = this._callAPI(payload, basicUserName, basicPassword);
            //var allBatchPlans = '';
        }

        if (allBatchPlans) {
            this.log.push("\n\n --> Batch Plans: \n\n" + allBatchPlans);
        }

        gs.info(this.log);
        return;
    },

    ////////////////////////////////////////////////////////////////////////////////
    // Call the API
    ////////////////////////////////////////////////////////////////////////////////
    _callAPI: function (payload, basicUserName, basicPassword) {

        var request = new sn_ws.RESTMessageV2();

        var instanceName = gs.getProperty('instance_name');
        if (instanceName.indexOf("nowlearning") !== -1) { // need to add .lab to URL
            instanceName = instanceName + ".lab";
        }

        if (instanceName.indexOf("instructor") !== -1) { // need to add .lab to URL
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
            if (statusCode === 200) {
                //this.log.push("... Batch Install Plan Submitted successfully.");
                this.log.push(" | Upgrade requested");
            } else {
                (this.verbosity >= 0) && this.log.push("...ERROR: Request failed with unknown status code " + statusCode + "\n");
                (this.verbosity >= 0) && gs.info(this.log);
                return;
            }
        } else {
            // Unknown status code
            (this.verbosity >= 0) && this.log.push("...ERROR: Request failed with unknown status code " + statusCode + "\n");
            (this.verbosity >= 0) && gs.info(this.log);
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

                    // this.log.push("\n\n --> Batch Plan URL: \n" + batchUrl + "\n");
                    // this.log.push("\n\n --> All Batch Plans URL: \n" + allBatchPlans + "\n");
                }
            } else {
                this.log.push("\n --> UNKNOWN ERROR! responseBodyResultLinkResults.hasOwnProperty(property) did not have any properties");
            }
        }
        return allBatchPlans;
    },

    /**
    * Analyzes sys_store_app records to identify apps that can be upgraded.
    *
    * @description This method compares version numbers in sys_store_app records
    * and identifies applications that have available upgrades. It compiles a list
    * of applications with upgrade details for further processing.
    *
    * @returns {Object} An object containing information about applications
    * available for upgrade and the count of upgrades.
    *
    * @memberof upgradeUtil
    * @method _analyzeUpgrades
    */
    _analyzeUpgrades: function () {

        var log = [];

        ///////////////////////////////////////////////////////////////////////////
        // In sys_store_app records, compare version to latest_version to see if we can upgrade		
        ///////////////////////////////////////////////////////////////////////////
        var appsGr = new GlideRecord('sys_store_app');
        appsGr.orderBy('name');
        appsGr.addQuery('active', true);
        appsGr.addQuery('hide_on_ui', false);
        appsGr.query();

        var applicationsToUpgradeArr = []; // Create an empty JSON array
        var upgrades = 0;
        var total = appsGr.getRowCount();
        //this.log.push("\n --> " + total + " apps found on [sys_store_app]");

        while (appsGr.next()) {
            var notes = appsGr.getValue('name');
            var upgrade = 0;
            var upgrade_version = '';
            var versionStr = appsGr.getValue('version');
            var assignedVersionStr = appsGr.getValue('assigned_version');
            var latestVersionStr = appsGr.getValue('latest_version');

            var versionArr = versionStr.split('.').map(Number);
            var assignedVersionArr = assignedVersionStr.split('.').map(Number);

            if (latestVersionStr !== null) {
                var latestVersionArr = latestVersionStr.split('.').map(Number);
            } else {
                // Handle the case where latestVersionStr is null
                var latestVersionStr = "0,0,0";
                var latestVersionArr = latestVersionStr.split('.').map(Number);
            }

            // Compare the arrays element-wise
            for (var i = 0; i < versionArr.length; i++) {
                if (latestVersionArr[i] > assignedVersionArr[i] && latestVersionArr[i] > versionArr[i]) {
                    upgrade_version = latestVersionStr;
                    upgrade = 1;
                    break;
                } else {
                    continue;
                }
            }

            if (upgrade == 1) { // If upgrade found, add packageDetails to JSON to send to API later
                var packageDetails = {
                    id: appsGr.getValue('sys_id'),
                    notes: notes,
                    requested_version: upgrade_version,
                    load_demo_data: true,
                    type: "application"

                };
                applicationsToUpgradeArr.push(packageDetails);
                upgrades++;
            }
        }

        this.log.push("\n --> " + total + " apps found on [sys_store_app]");
        if (upgrades === 0) {
            this.log.push("\n --> No apps found to upgrade");
        } else {
            this.log.push("\n --> " + upgrades + " app(s) to upgrade");
        }

        return {
            prop1: applicationsToUpgradeArr,
            prop2: upgrades
        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    _makeCreds: function (log) {
        var instanceName = gs.getProperty('instance_name');
        var connection_url = 'https://' + instanceName + '.service-now.com/';
        var alias_url = 'https://' + instanceName + '.service-now.com/nav_to.do?uri=sys_alias.do?sys_id=752a91887740001038e286a2681061fb';
        var log = [];
        this.log.push("\n\n --> NEED TO RECONFIGURE CICD CONNECTION ALIAS FOR SCRIPT");
        this.log.push("\n\n --> Go to this URL:\n" + alias_url + "\n");
        this.log.push("\n\n --> Change 'Type' to 'Connection and Credential and Save Record");
        this.log.push("\n     (Stay on page)");
        this.log.push("\n\n --> Create NEW Connection");
        this.log.push("\n     NAME: (enter name)");
        this.log.push("\n     Credential: (Create new record)");
        this.log.push("\n     Connection URL: " + connection_url);
        //gs.info(this.log);
        return;
    },

    type: 'upgradeUtil'
};

////////////////////////////////////////////////////////////////////////////////
var upgradeUtil = new upgradeUtil();

// OPTION 1: DEFINE YOUR OWN CREDENTIALS
//upgradeUtil.upgradeAllAvailable('admin', 'password');

// OPTION 2: USE A CONNECTION ALIAS
upgradeUtil.upgradeAllAvailable('alias', '752a91887740001038e286a2681061fb'); // sn_cicd_spoke.CICD

// For more info => https://docs.servicenow.com/csh?topicname=cicd-api.html&version=latest