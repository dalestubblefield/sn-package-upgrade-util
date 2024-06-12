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
 * - CICD API Documentation: 
 *        https://docs.servicenow.com/bundle/utah-api-reference/page/integrate/inbound-rest/concept/cicd-api.html
 * 
 * - Look up an app in the store: ServiceNow Store: 
 *        https://store.servicenow.com/sn_appstore_store.do#!/store/application/<sys_id>
 *
 * Disclaimer: Use at your own risk! This script is provided as-is without warranty of any kind.
 * 
 *  Reference: 
 *      This is how the packageDetails should look that get passed to the CICD API
 * 
 *      packageDetails = {
 *           id: '2b017207a3b80110e355f99246fcda3f', // Required. Sys_id of the application or identifier of the plugin to install.
 *           load_demo_data: true, // Flag that indicates whether demo data is loaded when installing the package.
 *           notes: 'AES Application Object Templates',
 *           requested_version: '24.0.2', // Required if packages.type is set to application; ignored if set to plugin.
 *           type: 'application'
 *        }
 */
var spokeInstallerUtil = Class.create();
spokeInstallerUtil.prototype = {
    initialize: function () {
        this.limit = 10000; // make a very small value for debugging
        this.batch_install_plan_notes = "Requested via bg script"; 
        this.log = [];
        this.logEachPackage = true; // set this to true for some extra verbose logging
        this.live_fire = true; // false means only pretend to install things, like a test run
        this.basicUserName = '';
        this.basicPassword = '';
    },

    installApps: function (loginType, loginKey) {

        if (!this._validateInput(loginType,loginKey)) {
            gs.info(this.log);
            return false;
        }

        /**********************************************************************
         * This table has a list of all IntegrationHub spokes we can use
         *********************************************************************/
        var appsGr = new GlideRecord('sn_dependentclient_application');
        appsGr.addEncodedQuery('app_type=integration^scopeLIKEspoke^titleLIKEspoke');
        appsGr.orderBy('title');
        appsGr.query();

        var pkgsToUpgradeArray = []; // array of packages to install or upgrade
        var pkg_count = 0; // keep track of how many packages we are install/upgrading
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

            this.logEachPackage && this.log.push("\n     --> " + packageDetails.notes);
            pkgsToUpgradeArray.push(packageDetails);
            pkg_count++;
        }

        this.log.push("\n --> Total packages " + pkg_count);

        /*************************************************************
         * for each package, 
         *      call the API and create a Batch Install Plan per package
         *************************************************************/
        var limit = Math.min(pkgsToUpgradeArray.length, this.limit);
        //var limit = this.limit;

        var allBatchPlans = false;

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

            /*************************************************************
             * see if this is installed already so we can have nicer notes
             *************************************************************/
            var packages = new GlideRecord('sys_package');
            if (packages.get(packageDetails.id) || packages.get('source', packageDetails.id)) {

                var currentVersion = packages.getValue('version');
                if (currentVersion != packageDetails.requested_version) {
                    this.log.push("\n[ ] " + packageDetails.notes + " <<< Upgrade requested ");
                    payload.name = 'Upgrade ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                    payload.notes = this.batch_install_plan_notes;
                } else {
                    this.log.push("\n[✓] " + packageDetails.notes);
                    continue;
                }
            } else {
                this.log.push("\n[ ] " + packageDetails.notes + " <<< Install requested ");
                payload.name = 'Install ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                payload.notes = this.batch_install_plan_notes;
            }

            /*************************************************************
             * send the payload to the API
             *************************************************************/
            if (this.live_fire) { // Check the flag before making the API call
                allBatchPlans = this._callAPI(payload); // Use 'this._callAPI' with proper object reference
            } else {
                this.log.push("\n [Test Run] Package '" + packageDetails.notes + "' would be installed/upgraded."); // Simulation message
            }
        }

        if (allBatchPlans) {
            this.log.push("\n\n --> Batch Plans: \n\n" + allBatchPlans);
            gs.info("DEBUG1");
        } else {
            this.log.push("\n\n --> Nothing submitted");
            gs.info("DEBUG2");
        }

        gs.info("DEBUG3");

        //gs.info(this.log);
        gs.info(this.log.join("\n")); // Log the entire log


        return;
    },

    /**************************************************************************
    * Validates the input provided for authentication.
    *
    * @param {string} loginType - The type of authentication, either 'alias' or 'username'.
    * @param {string} loginKey - The authentication key. For 'alias', provide the alias sys_id; for 'username', provide the username.
    * @returns {boolean} valid_input - Indicates whether the provided input is valid (true) or not (false).
    */
    _validateInput: function (loginType, loginKey) {
        var valid_input = false;
        if (!loginType) {
            this.log.push("No inputs were provided. Please provide the required inputs.");
            this.log.push("\nLike this:\n installApps('admin','password')");
            this.log.push("\n\nOr this:\n installApps('alias','sys_id')");
            gs.info(this.log);
            return valid_input;
        }

        if (loginType === "") {
            this.log.push("\n ERROR: loginType is blank");
            gs.info(this.log);
            _howToMakeCreds();
            return valid_input;
        }

        if (loginType == "alias") {
            this.log.push("\n\n --> AUTHTYPE: Connection & Credential Alias");
            var aliasId = loginKey;

            if (!aliasId) {
                this.log.push("\n --> WARN: C&C Alias not provided, attempting to use default CICD Alias");
                aliasId = '752a91887740001038e286a2681061fb'; // This is the default CICD C&C Alias
            }

            var provider = new sn_cc.ConnectionInfoProvider();
            var connectionInfo = provider.getConnectionInfo(aliasId);
            if (connectionInfo != null) {
                this.basicUserName = connectionInfo.getCredentialAttribute("user_name");
                this.basicPassword = connectionInfo.getCredentialAttribute("password");

                if (this.basicUserName == null) {
                    this.log.push("\n ERROR: Connection Alias username issue");
                    gs.info(this.log);
                    _howToMakeCreds();
                    return false;
                }

                if (this.basicPassword == null) {
                    this.log.push("\n ERROR: Connection Alias password issue");
                    gs.info(this.log);
                    _howToMakeCreds();
                    return false;
                }
            } else {
                this.log.push("\n --> ERROR: Connection Alias unknown issue - ABORTING!!!");
                gs.info(this.log);
                _howToMakeCreds();
                return false;
            }
        } else {
            this.log.push("\n\n --> AUTHTYPE: username and password");
            this.basicUserName = loginType.toString();
            this.basicPassword = loginKey.toString();

            if (this.basicUserName === null || this.basicPassword === null) {
                this.log.push("\n --> ERROR: username or password is blank");
                gs.info(this.log);
                return false;
            }
            this.log.push("\n --> User will be => " + this.basicUserName);
        }

        /*************************************************************
         * Passed all checked, input is good
         *************************************************************/
        gs.info("input validated");
        return true;
    },

    /***************************************************************************
    * Provide instructions on how to configure the Connection & Credential alias for the script.
    *
    * This function guides the user through the steps required to configure the Connection & Credential alias
    * used by the script. It generates the necessary URLs and information to create a new connection with
    * appropriate credentials.
    */
    _howToMakeCreds: function () {
        var instanceName = gs.getProperty('instance_name');
        var connection_url = 'https://' + instanceName + '.service-now.com/';
        var alias_url = 'https://' + instanceName + '.service-now.com/nav_to.do?uri=sys_alias.do?sys_id=752a91887740001038e286a2681061fb';
        //var log = [];
        this.log.push("\n\n --> NEED TO RECONFIGURE CICD CONNECTION ALIAS FOR SCRIPT");
        this.log.push("\n\n --> Go to this URL:\n" + alias_url + "\n");
        this.log.push("\n\n --> Change 'Type' to 'Connection and Credential and Save Record");
        this.log.push("\n     (Stay on page)");
        this.log.push("\n\n --> Create NEW Connection");
        this.log.push("\n     NAME: (enter name)");
        this.log.push("\n     Credential: (Create new record)");
        this.log.push("\n     Connection URL: " + connection_url);
        return;
    },

    /***************************************************************************
     * Call the API
     **************************************************************************/
    _callAPI: function (payload) {

        var instanceName = gs.getProperty('instance_name');

        if (instanceName.indexOf("nowlearning") !== -1) { 
            instanceName = instanceName + ".lab";
        }

        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint('https://' + instanceName + '.service-now.com/api/sn_cicd/app/batch/install');
        request.setHttpMethod('POST');
        request.setBasicAuth(this.basicUserName, this.basicPassword); // Set basic authentication using a username and password
        request.setRequestHeader("Accept", "application/json"); // Set the request headers to accept JSON
        request.setRequestBody(JSON.stringify(payload)); // Set the request body to the JSON payload

        var response = request.execute(); // Execute the REST API call and log the response body
        var statusCode = response.getStatusCode();
        var statusMessages = {
            200: "200 SUCCESS",
            400: "400 ERROR: Bad Request response status code",
            401: "401 ERROR: The user credentials are incorrect.",
            403: "403 ERROR: Forbidden. The user is not an admin or does not have the sn_cicd.sys_ci_automation role.",
            405: "405 ERROR: Invalid method. The functionality is disabled."
        };

        if (statusMessages.hasOwnProperty(statusCode)) {
            if (statusCode !== 200) {
                this.log.push("... Batch Install Plan Submitted failure, code: " + statusCode);
                return;
            } else if (statusCode === 200) {
                this.log.push("... Batch Install Plan Submitted successfully.");
            }
        } else {
            this.log.push("...ERROR: Request failed with unknown status code " + statusCode + "\n");
            return;
        }

        var responseBody = response.getBody();
        var responseBodyJSONObj = JSON.parse(responseBody);

        var responseBodyResultLinkResults = responseBodyJSONObj.result.links.results;
        for (var property in responseBodyResultLinkResults) {
            if (responseBodyResultLinkResults.hasOwnProperty(property)) {
                var value = responseBodyResultLinkResults[property];
                if (property == "id") {
                    var allBatchPlans = 'https://' + instanceName + '.service-now.com/now/nav/ui/classic/params/target/sys_batch_install_plan_list';
                }
            } else {
                this.log.push("\n --> UNKNOWN ERROR! responseBodyResultLinkResults.hasOwnProperty(property) did not have any properties");
            }
        }
        return allBatchPlans;
    },

    type: 'spokeInstallerUtil'

};

var spokeInstallerUtil = new spokeInstallerUtil();

// OPTION 1
var login = 'admin'; // An account with the 'admin' role
var password = 'password'; //Replace with your password
//installApps(login, password);

// OPTION 2
// Use the default CICD Credential Alias
// - you MUST reconfigure the Alias to be a "Connection & Credential" alias and configure accordingly 
// - keep the parameter as the string 'alias'
spokeInstallerUtil.installApps('alias');