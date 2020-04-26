"use strict";

// Author: Daniel Barton
// Description: Assigns drivers to car IDs for a given week.

const nodemailer = require("nodemailer");
const WeekSchedule = require("./WeekSchedule");
const Utilities = require("../util/Utilities");

module.exports = class DriverAssigner {
    constructor(data, options) {
        this.options = options;
        this.data = data;
        this.schedule = new WeekSchedule();
        this.availiableVehicles = new WeekSchedule();

        this.initAvailiableVehicles(this.data.numVehicles);
        this.assignDrivers(this.data.drivers);
    }

    initAvailiableVehicles(numVehicles) {
        for (let day of Object.keys(this.availiableVehicles)) {
            for (let i = 1; i <= numVehicles; i++) {
                this.availiableVehicles[day][i] = true;
            }
        }
    }

    assignDrivers(drivers) {
        // Sort the drivers by rank so we can iterate and assign in order.
        drivers.sort((a,b) => {return a.rank > b.rank ? 1 : -1;})

        for (const driver of drivers) {
            for (const day of Utilities.getDays(driver.days)) {
                let assigned = this.assignFromChoices(day, driver);
                if (!assigned) {
                    this.assignFromAvailiable(day, driver);
                }
            }
        }
    }

    assignFromChoices(day, driver) {
        if (!this.schedule[day][driver.choice_1]) {
            this.schedule[day][driver.choice_1] = driver.name;
            this.availiableVehicles[day][driver.choice_1] = false;
            return true;
        } else if (!this.schedule[day][driver.choice_2]) {
            this.schedule[day][driver.choice_2] = driver.name;
            this.availiableVehicles[day][driver.choice_2] = false;
            return true;
        } else if (!this.schedule[day][driver.choice_3]) {
            this.schedule[day][driver.choice_3] = driver.name;
            this.availiableVehicles[day][driver.choice_3] = false;
            return true;
        }

        return false;
    }

    assignFromAvailiable(day, driver) {
        if (!this.availiableVehicles[day].allOccupied) {
            for(const vehicle of Object.keys(this.availiableVehicles[day])) {
                if(this.availiableVehicles[day][vehicle]) {
                    this.schedule[day][vehicle] = driver.name;
                    this.availiableVehicles[day][vehicle] = false;
                    return true;
                }
            }
    
            // All vehicles taken for a day.
            this.availiableVehicles[day].allOccupied = true;
            this.schedule[day].unassigned = [driver.name];
        } else {
            this.schedule[day].unassigned.push(driver.name);
            return false;
        }
    }

    sendScheduleEmail(service, fromAdress, fromPassword, toAdress) {
        const transporter = nodemailer.createTransport({
            service: service,
            auth: {
              user: fromAdress,
              pass: fromPassword
            }
          });

        const mailOptions = {
            from: fromAdress,
            to: toAdress,
            subject: 'TDA Logistics Weekly Schedule',
            html: this.generateScheduleHtml()
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }

    generateScheduleHtml() {
        return (`
        <html>
            <head>
                <style>
                    #schedule {
                        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    
                    #schedule td, #schedule th {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                    
                    #schedule tr:nth-child(even){background-color: #f2f2f2;}
                    
                    #schedule tr:hover {background-color: #ddd;}
                    
                    #schedule th {
                        padding-top: 12px;
                        padding-bottom: 12px;
                        text-align: left;
                        background-color: #4287f5;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <h1>TDA Weekly Schedule</h1>
                <table id="schedule">
                    <tr>
                        <th>Van ID</th>
                        ${Object.keys(this.schedule).map(key => (
                            `<th>${key.toUpperCase()}</th>`
                        )).join("")}
                    </tr>
                    ${this.generateScheduleRows()}
                </table>
            </body>
        </html>
        `);       
    }

    generateScheduleRows() {
        let rows = "";

        for (let i = 1; i <= this.data.numVehicles; i++) {
            rows += `<tr><td>${i}</td>`;
            for(const day of Object.keys(this.schedule)) {
                rows += `<td>${this.schedule[day][i] ? this.schedule[day][i] : "NONE"}</td>`;
            }
            rows += "</tr>";
        }

        rows += `<tr><td>Unassigned</td>`;

        for(const day of Object.keys(this.schedule)) {
            rows += `<td>${this.schedule[day].unassigned ? this.schedule[day].unassigned.join("") : ""}</td>`;
        }

        rows += "</tr>";

        return rows;
    }

}