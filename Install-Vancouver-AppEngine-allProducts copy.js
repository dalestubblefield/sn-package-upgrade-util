// WARNING: ONLY USE THIS SCRIPT IF YOU WANT TO INSTALL ALL APP ENGINE PRODUCTS! 

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

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_app_eng_studio
    // Dependencies: 
    //   com.snc.apps_templates
    //   com.glide.ux.starter.experience
    //   sn_portal_starte_0
    //   sn_workspace_sta_0
    //   sn_aes_cat_builder
    //   sn_aes_flow_templa
    //   sn_app_obj_wizards
    //   sn_table_builder
    //   sn_table_bldr_wzd
    //   sn_app_eng_notify
    //   sn_app_intake
    //   sn_collab_request
    //   sn_aes_mobile
    //   sn_role_builder
    //   sn_deploy_pipeline
    //   sn_wzd_components
    //   sn_aes_notificatio
    packageDetails = {
        id: 'e046257545b47c84712b8779a9abd0cb',
        load_demo_data: true,
        notes: 'App Engine Studio',
        requested_version: '24.0.2',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_dtbl_bldr_tmpls
    //  Dependencies: 
    packageDetails = {
        id: '2b017207a3b80110e355f99246fcda3f',
        load_demo_data: true,
        notes: 'AES Decision Table Builder Templates',
        requested_version: '4.0.0',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_dtbl_bldr_wzd
    //  Dependencies: 
    packageDetails = {
        id: '82ea723aa3740110e355f99246fcda14',
        load_demo_data: true,
        notes: 'AES Decision Table Builder Wizard',
        requested_version: '4.0.0',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_aemc
    //  Dependencies: com.snc.uib.sn_dyn_rel_rec
    //                sn_app_eng_notify
    //                sn_collab_request
    //                sn_deploy_pipeline
    //                sn_app_intake
    packageDetails = {
        id: 'a1e3b7c3532120104733ddeeff7b1211',
        load_demo_data: true,
        notes: 'App Engine Management Center',
        requested_version: '24.0.1',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_decision_design
    // Dependencies:
    //     sn_decision_table
    packageDetails = {
        id: 'd0c792f26a23783e71e1585192ef920b',
        load_demo_data: true,
        notes: 'Decision Builder',
        requested_version: '5.0.0',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_pad_content
    // Dependencies:
    //     sn_playbook_exp
    packageDetails = {
        id: '05bf96091b2245107cc3ec26b04bcb73',
        load_demo_data: true,
        notes: 'Process Automation Content',
        requested_version: '23.0.5',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Plugin
    //  Package Name: com.glide.pad.shared
    packageDetails = {
        id: 'com.glide.pad.shared',
        notes: 'Process Automation Definition Shared',
        requested_version: '1.0.0',
        type: 'plugin'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_pa_designer
    // Dependencies:
    //     com.sn_pd_picker
    //     com.sn_pill_field
    //     com.glide.pad.core
    //     sn_diagram_builder
    packageDetails = {
        id: '1293c996ad48c7d88400c13afef3cdff',
        load_demo_data: true,
        notes: 'Process Automation Designer',
        requested_version: '24.1.2',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Plugin
    //  Package Name: com.glide.pad.core
    packageDetails = {
        id: 'com.glide.pad.core',
        notes: 'Process Automation Designer Core',
        requested_version: '1.0.0',
        type: 'plugin'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Plugin
    //  Package Name: com.glide.pad.core.model
    packageDetails = {
        id: 'com.glide.pad.core.model',
        notes: 'Process Automation Designer Core - Model',
        requested_version: '1.0.0',
        type: 'plugin'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Plugin
    //  Package Name: com.glide.pad.core.runtime
    packageDetails = {
        id: 'com.glide.pad.core.runtime',
        notes: 'Process Automation Designer Core - Runtime',
        requested_version: '1.0.0',
        type: 'plugin'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Plugin
    //  Package Name: com.glide.pad.core.license
    packageDetails = {
        id: 'com.glide.pad.license',
        notes: 'Process Automation Designer for App Engine',
        requested_version: '1.0.0',
        type: 'plugin'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_pad_demo
    // Dependencies:
    //     sn_playbook_exp
    packageDetails = {
        id: '8646b3507323001056dff358caf6a7ce',
        load_demo_data: true,
        notes: 'Process Automation Experience Demo',
        requested_version: '24.1.1',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_tbl_bldr_appeng
    // Dependencies:
    //     sn_table_builder
    //     sn_pdf_table_bldr
    packageDetails = {
        id: 'ef88d740da3f1e867efdffbdabc7fe13',
        load_demo_data: true,
        notes: 'Table Builder for App Engine',
        requested_version: '24.0.1',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;

    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_theme_builder
    // Dependencies:
    packageDetails = {
        id: 'c8d18ffa2b695cec36b671673e27938d',
        load_demo_data: true,
        notes: 'Theme Builder',
        requested_version: '1.1.2',
        type: 'application'
    };
    logEachPackage && log.push("\n     --> " + packageDetails.notes);
    pkgsToUpgradeArray.push(packageDetails);
    upgrades++;


    ////////////////////////////////////////////////////////////////////////////////
    // Package Class: Store App
    //  Package Name: sn_ws_builder
    // Dependencies:
    //     com.glide.form_builder_api
    //     sn_workspace_sta_0
    packageDetails = {
        id: 'eb4ae6d890a67573636aba5dd61ab370',
        load_demo_data: true,
        notes: 'Workspace Builder for App Engine',
        requested_version: '24.0.1',
        type: 'application'
    };
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
installSpecificAppsUtah('admin', 'password');
