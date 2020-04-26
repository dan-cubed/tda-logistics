"use-strict";

const shortHandToDayMap = {m: "monday", tu: "tuesday", w: "wednesday", tr: "thursday", f: "friday", sa: "saturday", su: "sunday"};

function getDays(dayString) {
    const sanitizedString = dayString.toLowerCase();
    const days = [];

    for (shortHand of Object.keys(shortHandToDayMap)) {
        if (sanitizedString.includes(shortHand)) {
            days.push(shortHandToDayMap[shortHand])
        }
    }

    return days;
}

exports.weekMap = shortHandToDayMap;
exports.getDays = getDays;
