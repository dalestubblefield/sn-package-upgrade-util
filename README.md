# Unofficial ServiceNow Package Upgrade Utility Script

## Table of contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Maintainers](#maintainers)

## Introduction

1) Log in to your ServiceNow instance using your admin credentials.
1) Navigate to the "System Definition" section in the application navigator.
1) Click on "Background Scripts" to open the background script editor.
1) In the background script editor, paste the contents of the script "upgradeUtil.js". 
1) Change "In Scope" to "Global".
1) Click Run Script.

Read further instructions in the script output. 

BONUS: I have an additional file named "Install_Utah_AppEngine_allProducts.js" to show you how to install specific packages in a repeatable manner. 

Submit bug reports and feature suggestions, or track changes by contacting [Dale Stubblefield](mailto:dale.stubblefield@servicenow.com).

## Requirements

ServiceNow San Diego or higher

## Installation

This is a background script. 

## Configuration

You will need an admin credential or the sys_id of a Connection & Credential Alias for a service account with the 'admin' role.  (Yes, this means you can run this against remote instances...)

## Troubleshooting

1) Begin your [ServiceNow Application Career Developer Journey](https://nowlearning.servicenow.com/lxp?id=journey_overview&journey_id=cbdb13f91b5aa5d013f9a6c1b24bcb44) at Now Learning
1) Complete the entire course from Associate Application Developer to Professional Application Developer to Expert Application Developer
1) Apply the skills you have acquired to your problem.


## FAQ

**Q:** What is a background script?

**A:** A ServiceNow background script is like a little program that you can write and run in the ServiceNow system. It allows you to automate certain tasks or perform custom operations on the data in your ServiceNow instance.

Think of it as a way to write your own instructions for the computer to follow. You can write a background script to do things like updating a bunch of records at once, calculating some complex data, or performing any other actions that you need.

When you write a background script, you use a special editor in ServiceNow. You give your script a name and then write the actual code or instructions that you want the computer to execute. The code you write can interact with the data in your ServiceNow instance, make calculations, or even connect to other systems if needed.

Once you've written your script, you can run it in the background. This means it will be executed by the computer without interrupting any other work you might be doing in the system. You can think of it as a separate task that is running in the background while you continue to use the ServiceNow system.

After the background script finishes running, you can check the results or any log messages it might have produced. This helps you ensure that the script did what you wanted it to do and that everything worked correctly.

Background scripts are useful because they can save you time and help automate repetitive tasks. They give you the power to customize and extend the functionality of your ServiceNow instance according to your specific needs.

It's important to note that when working with background scripts, you should be careful and test them thoroughly before running them in a live or production environment. This helps avoid unintended consequences and ensures the scripts work as intended.

## Maintainers

- Dale Stubblefield - https://github.com/dalestubblefield
