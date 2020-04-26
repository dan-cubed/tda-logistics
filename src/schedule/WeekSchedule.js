"use-strict";

// Author: Daniel Barton
// Description: Common week schedule object.

const weekDays = require("../util/Utilities").weekMap;

module.exports = class WeekSchedule {
    constructor() {
        for (const weekDay of Object.keys(weekDays)) {
            this[weekDays[weekDay]] = {}
        }
    }
}