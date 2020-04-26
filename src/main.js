"use strict";

// Author: Daniel Barton
// Description: Assigns TDA Logistics drivers to vehicles for a given week.

const args = require("minimist")(process.argv.slice(2));
const DriverAssigner = require("./schedule/DriverAssigner");
const csv = require("csvtojson");

const printHelp = () => {
    console.log("----------------Driver Assignment----------------")
    console.log("Required Parameters:");
    console.log("-n - The number of vans availiable.")
    console.log("-p - Path to the CSV containing all data.");
    console.log("-f - Gmail account the email should be sent from.");
    console.log("-w - Password for the gmail account.");
    console.log("-t - Email address the schedule will be sent to.");
    console.log("-------------------------------------------------")
};

if (args["help"] || args["h"] || !args["n"] ||!args["p"] || !args["f"] || !args["w"] || !args["t"]) {
    printHelp();
    process.exit(1);
} else {
    csv({checkType:true}).fromFile(args.p).then((json) => {
        const assigner = new DriverAssigner({numVehicles: args.n, drivers: json});
        assigner.sendScheduleEmail("gmail", args["f"], args["w"], args["t"]);
    });
}


