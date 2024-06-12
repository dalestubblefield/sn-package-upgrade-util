// WARNING: ONLY USE THIS SCRIPT IF YOU WANT TO INSTALL ALL APP ENGINE PRODUCTS! 

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

        this.instanceName = gs.getProperty('instance_name');
        this.connection_url = 'https://' + this.instanceName + '.service-now.com/';
        this.alias_url = 'https://' + this.instanceName + '.service-now.com/nav_to.do?uri=sys_alias.do?sys_id=752a91887740001038e286a2681061fb';
        this.scriptName = 'Install-WashDC-OnePackage.js';
    },


    upgradeAllAvailable: function (loginType, loginKey) {

        // Check if any inputs are missing
        if (!loginType) {
            (this.verbosity >= 0) && this.log.push("\nNo inputs were provided. Please provide the required inputs.");
            (this.verbosity >= 0) && this.log.push("\nLike this:\ninstallSpecificAppsUtah('admin','password')");
            (this.verbosity >= 0) && this.log.push("\n\nOr this:\ninstallSpecificAppsUtah('alias','sys_id')");
            (this.verbosity >= 0) && gs.info(this.log);
            return;
        }

        // Define package details array
        var packages = [{
                id: '95ce73733bd11010d901655593efc495',
                load_demo_data: true,
                notes: 'Alumni Service Center',
                requested_version: '2.1.2',
                type: 'application'
            }
        ];

        /////////
        // check login type: username or Connection & Credential Alias
        /////////

        var basicUserName = '';
        var basicPassword = '';

        if (loginType === "") {
            this.log.push("\n ERROR: loginType is blank");
            gs.info(log);
            makeCreds();
            return;
        }

        if (loginType == "alias") {
            this.log.push("\n\n --> AUTHTYPE: Connection & Credential Alias");
            var aliasId = loginKey;

            if (!aliasId) {
                this.log.push("\n --> WARNING: C&C Alias not provided, attempting to use default");
                aliasId = '752a91887740001038e286a2681061fb'; // This is the default CICD C&C Alias
            }

            // Set basic authentication using a username and password
            var provider = new sn_cc.ConnectionInfoProvider();
            var connectionInfo = provider.getConnectionInfo(aliasId);
            if (connectionInfo != null) {
                basicUserName = connectionInfo.getCredentialAttribute("user_name");
                basicPassword = connectionInfo.getCredentialAttribute("password");

                //(this.verbosity >= 2) && gs.info("\nUsername: " + basicUserName);
                //(this.verbosity >= 2) && gs.info("\nPassword: " + basicPassword);

                if (!basicUserName || !basicPassword) {
                    this.log.push("\n ERROR: Connection Alias username or password issue");
                    gs.info(this.log);
                    makeCreds();
                    return;
                }
            } else {
                this.log.push("\n --> Connection Alias unknown issue - ABORTING!!!");
                gs.info(this.log);
                this._makeCreds();
                return;
            }
        } else {
            this.log.push("\n\n --> Authentication will be with an account");
            basicUserName = loginType.toString();
            basicPassword = loginKey.toString();
            this.log.push("\n --> User will be => " + basicUserName);
        }

        if (basicUserName == '' || basicPassword == '') {
            this.log.push("\n --> credentials not found.");
            gs.info(this.log);
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////
        // for each package, call the API and create a Batch Install Plan per package
        ////////////////////////////////////////////////////////////////////////////////
        var limit = Math.min(packages.length, this.limit);

        //(this.verbosity >= 2) && gs.info("\npackages.length: "+ packages.length);
        //(this.verbosity >= 2) && gs.info("\nlimit: "+ limit);
        //(this.verbosity >= 2) && gs.info("\nStarting For loop");

        // Iterate through packages array
        for (var i = 0; i < limit; i++) {
            var packageDetails = packages[i];

            (this.verbosity >= 2) && gs.info("\npackages["+i+"].id: "+ packages[i].id);
            (this.verbosity >= 2) && gs.info("\npackages["+i+"].notes: "+ packages[i].notes);
            (this.verbosity >= 2) && gs.info("\packageDetails.id: "+ packageDetails.id);

            //(this.verbosity >= 2) && gs.info("\nFor loop #" + i);

            // Create the payload object
            var payload = {
                name: '',
                notes: '',
                packages: [packageDetails]
            };

            // Check if package is already installed or needs an upgrade
            var packagesGr = new GlideRecord('sys_package');
            if (packagesGr.get(packageDetails.id) || packagesGr.get('source', packageDetails.id)) {
                var currentVersion = packagesGr.getValue('version');
                if (currentVersion != packageDetails.requested_version) {
                    this.log.push("\n[ ] " + packageDetails.notes + " <<< Upgrade requested ");
                    payload.name = 'Upgrade ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                    payload.notes = this.scriptName;
                } else {
                    this.log.push("\n[✓] " + packageDetails.notes);
                    continue;
                }
            } else {
                this.log.push("\n[ ] " + packageDetails.notes + " <<< Install requested ");
                payload.name = 'Install ' + packageDetails.notes + ' to ' + packageDetails.requested_version;
                payload.notes = this.scriptName;
            }

            (this.verbosity >= 2) && gs.info("\npayload.name: " + payload.name);
            (this.verbosity >= 2) && gs.info("\npayload.name: " + payload.name);
            (this.verbosity >= 2) && gs.info("\npayload.packageDetails.id: " + payload.packageDetails.id);

            /*
           
            var packages = [{
                id: '95ce73733bd11010d901655593efc495',
                load_demo_data: true,
                notes: 'Alumni Service Center',
                requested_version: '2.1.2',
                type: 'application'
            },
            */

           


            // Send the payload
            var allBatchPlans = this._callAPI(payload, basicUserName, basicPassword);

            if (allBatchPlans) {
                this.log.push("\n\n --> Batch Plans: \n\n" + allBatchPlans);
            }
        }

        gs.info(this.log);

        return;
    },

    ////////////////////////////////////////////////////////////////////////////////
    // Call the API
    ////////////////////////////////////////////////////////////////////////////////
    _callAPI: function (payload, basicUserName, basicPassword) {

        //(this.verbosity >= 2) && this.log.push("\nStarting _callAPI()");


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

    ////////////////////////////////////////////////////////////////////////////////
    _makeCreds: function () {
        this.log.push("\n\n --> NEED TO RECONFIGURE CICD CONNECTION ALIAS FOR SCRIPT");
        this.log.push("\n\n --> Go to this URL:\n" + this.alias_url + "\n");
        this.log.push("\n\n --> Change 'Type' to 'Connection and Credential and Save Record");
        this.log.push("\n     (Stay on page)");
        this.log.push("\n\n --> Create NEW Connection");
        this.log.push("\n     NAME: (enter name)");
        this.log.push("\n     Credential: (Create new record)");
        this.log.push("\n     Connection URL: " + this.connection_url);
        gs.info(this.log);
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