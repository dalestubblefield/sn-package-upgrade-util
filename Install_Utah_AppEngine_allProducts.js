// ONLY USE THIS SCRIPT IF YOU WANT TO INSTALL ALL APP ENGINE PRODUCTS! 

function installSpecificAppsUtah(loginType, loginKey) {

    // Recommend reading this if you have questions about CICD API:
    // https://docs.servicenow.com/bundle/utah-api-reference/page/integrate/inbound-rest/concept/cicd-api.html#title_cicd-POST-app-batch-install

    // Only process this many packages
    var debug_limit = 200;

    // This will go into your Batch Install Plan Notes
    var scriptName = 'Requested via bg script';

    // ////////////////////////////////////////////////////////////////////////////////
    // var packageDetails = {
    //     id: '2b017207a3b80110e355f99246fcda3f', // Required. Sys_id of the application or identifier of the plugin to install.
    //     load_demo_data: true, // Flag that indicates whether demo data is loaded when installing the package.
    //     notes: 'AES Application Object Templates',
    //     requested_version: '23.2.1', // Required if packages.type is set to application; ignored if set to plugin.
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

//    ////////////////////////////////////////////////////////////////////////////////
//    var packageDetails = {
//        id: '888888888881a14ca26013ca80727ec5',
//        load_demo_data: true,
//        notes: 'Fake package',
//        requested_version: '23.2.1',
//        type: 'application'
//    }
//    logEachPackage && log.push("\n     --> " + packageDetails.notes);
//    pkgsToUpgradeArray.push(packageDetails);
//    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '99ed9462e9a1a14ca26013ca80727ec5',
        load_demo_data: true,
        notes: 'AES Application Object Templates',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '146c3999fff47cf0ba4fb113b3d1da65',
        load_demo_data: true,
        notes: 'AES Application Object Wizard Components',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '5a3e9e13530120105408ddeeff7b12b1',
        load_demo_data: true,
        notes: 'AES Catalog Builder',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '18e849d169284372d77ad961ee8fa009',
        load_demo_data: true,
        notes: 'AES Catalog Builder Wizard',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '2b017207a3b80110e355f99246fcda3f',
        load_demo_data: true,
        notes: 'AES Decision Table Builder Templates',
        requested_version: '4.0.0',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '82ea723aa3740110e355f99246fcda14',
        load_demo_data: true,
        notes: 'AES Decision Table Builder Wizard',
        requested_version: '4.0.0',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'f9a0de22c7022010d447c17cf4c260ea',
        load_demo_data: true,
        notes: 'AES Flow Templates',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'dd3f8d92e58c86398993bb50a3307c35',
        load_demo_data: true,
        notes: 'AES Flow Wizards',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '7ebe6d1d7c01301042ca6b61aa27d65a',
        load_demo_data: true,
        notes: 'AES Mobile Templates',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '45af43c9040181cef70ae44271cb842f',
        load_demo_data: true,
        notes: 'AES Mobile Wizards',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '284c35195bf9198f084ee79a76e157b9',
        load_demo_data: true,
        notes: 'AES Notification Builder Component',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '9262a139c39020100bf442583c40dd87',
        load_demo_data: true,
        notes: 'AES Portal UI Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '8df4249253123010fe92ddeeff7b120e',
        load_demo_data: true,
        notes: 'AES Role Builder',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '0efe46d8e4259e584faf352e99dca9ae',
        load_demo_data: true,
        notes: 'AES Role Builder Component',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '5fc95d0df025bde7fac20ba52d0ecc05',
        load_demo_data: true,
        notes: 'AES Table Builder Wizard',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'e5853b3a4bb94a808bd1e88d357b6f87',
        load_demo_data: true,
        notes: 'AES UI Template Wizards',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'a7caf0e3731020104cb09434c4f6a741',
        load_demo_data: true,
        notes: 'AES Workspace UI Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'a1e3b7c3532120104733ddeeff7b1211',
        load_demo_data: true,
        notes: 'App Engine Management Center',
        requested_version: '23.1.3',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '4cb87f6f53703010b846ddeeff7b1289',
        load_demo_data: true,
        notes: 'App Engine Notifications',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'e046257545b47c84712b8779a9abd0cb',
        load_demo_data: true,
        notes: 'App Engine Studio',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '3d3c2505c3e22010b83971e54440dd75',
        load_demo_data: true,
        notes: 'Application Intake',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.snc.apps_templates',
        notes: 'Application Templates',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'f6ad5d41c3222010a9f5e548fa40dd69',
        load_demo_data: true,
        notes: 'Collaboration Request',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'd0c792f26a23783e71e1585192ef920b',
        load_demo_data: true,
        notes: 'Decision Builder',
        requested_version: '4.1.2',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '13aa96a16bcefa78b16cc99ed9e4f1f4',
        load_demo_data: true,
        notes: 'Decision Table Builder',
        requested_version: '4.1.2',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.snc.document-approval-app-template
    var packageDetails = {
        id: '570d7fd277312010cb5bb73aba1061e8',
        load_demo_data: true,
        notes: 'Document Approval App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.snc.emergency-alert-app-template
    // * App Engine Studio Dependency
    var packageDetails = {
        id: 'a77e3ede4df92010f87774ecf02d44f3',
        load_demo_data: true,
        notes: 'Emergency Alert App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '97ebffc31543e410f877739e849b2f6a',
        load_demo_data: true,
        notes: 'Event Registration App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.i18n',
        load_demo_data: true,
        notes: 'I18N: Internationalization',
        requested_version: '1.0.2',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '629230f13dbd2010f877f7b0ed771739',
        load_demo_data: true,
        notes: 'Inventory Tracker App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '8e417ee064982b70a7bd187e6edb95f1',
        load_demo_data: true,
        notes: 'PDF Extractor',
        requested_version: '23.1.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.snc.performance-appraisal-app-template
    var packageDetails = {
        id: '91256a9899862010f8779b076766f4fb',
        load_demo_data: true,
        notes: 'Performance Appraisal App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '05bf96091b2245107cc3ec26b04bcb73',
        load_demo_data: true,
        notes: 'Process Automation Content',
        requested_version: '23.0.3',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.pad.shared',
        notes: 'Process Automation Definition Shared',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.pad.core',
        notes: 'Process Automation Designer Core',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.pad.core.model',
        notes: 'Process Automation Designer Core - Model',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.pad.core.runtime',
        notes: 'Process Automation Designer Core - Runtime',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'com.glide.pad.license',
        notes: 'Process Automation Designer for App Engine',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: '8646b3507323001056dff358caf6a7ce',
        load_demo_data: true,
        notes: 'Process Automation Experience Demo',
        requested_version: '22.1.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'fba263ebdc031110f8773424e2d33041',
        load_demo_data: true,
        notes: 'Service Request Management App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'f53f19bac362fa22ca2e93692d32f18f',
        load_demo_data: true,
        notes: 'Table Builder',
        requested_version: '23.1.2',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'ef88d740da3f1e867efdffbdabc7fe13',
        load_demo_data: true,
        notes: 'Table Builder for App Engine',
        requested_version: '23.1.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.snc.team-contacts-app-template
    var packageDetails = {
        id: '01ebede3c3212010a3a6ddaa7d40dd94',
        load_demo_data: true,
        notes: 'Team Contacts App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'c8d18ffa2b695cec36b671673e27938d',
        load_demo_data: true,
        notes: 'Theme Builder',
        requested_version: '1.1.2',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.snc.time-off-request-app-template
    var packageDetails = {
        id: 'bcf8f2906102e010f877c77d86901d9e',
        load_demo_data: true,
        notes: 'Time Off Request App Template',
        requested_version: '23.2.1',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // com.glide.ux.starter.experience
    var packageDetails = {
        id: 'com.glide.ux.starter.experience',
        load_demo_data: true,
        notes: 'UX Starter Experience',
        requested_version: '1.0.0',
        type: 'plugin'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    var packageDetails = {
        id: 'eb4ae6d890a67573636aba5dd61ab370',
        load_demo_data: true,
        notes: 'Workspace Builder for App Engine',
        requested_version: '23.2.0',
        type: 'application'
    }
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

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
        log.push("\n\n --> AUTHTYPE: Connection & Credential Alias")
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
        if (packages.get(packageDetails.id) || packages.get('source',packageDetails.id)) {

            var currentVersion = packages.getValue('version');
            if ( currentVersion != packageDetails.requested_version) {
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
    };

    ////////////////////////////////////////////////////////////////////////////////
    function makeCreds(log) {
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
    };

    ////////////////////////////////////////////////////////////////////////////////
    // The End

    gs.info(log);

    return;
}
installSpecificAppsUtah('alias');
