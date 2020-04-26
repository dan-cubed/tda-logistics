"use-strict";

const weekDays = require("../util/Utilities").weekMap;

module.exports = class WeekSchedule {
    constructor() {
        for (const weekDay of Object.keys(weekDays)) {
            this[weekDays[weekDay]] = {}
        }
    }
}