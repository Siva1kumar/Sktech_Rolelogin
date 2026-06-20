const API_URL = "https://script.google.com/macros/s/AKfycbwxpMoYA7gmul9iMk9eA2Cae07sxynCp6Ff73BhXFAdJoOMBmNzZP2-5ck2qRyqjm7W/exec";

let allData = [];

// Format Date
function formatDate(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-IN");
}

// Format Time
function formatTime(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

// Convert time string like "03:30 pm" to minutes past midnight
function toMinutes(timeStr) {
    if (!timeStr) return 0;
    timeStr = timeStr.toString().trim().toLowerCase();
    if (timeStr === "00:00" || timeStr === "0:00") return 0;
    let parts = timeStr.split(":");
    let hour = parseInt(parts[0]);
    let minutePart = parts[1] || "0";
    let minute = 0;
    let ampm = "";
    if (minutePart.includes(" ")) {
        const arr = minutePart.split(" ");
        minute = parseInt(arr[0]);
        ampm = arr[1];
    } else {
        minute = parseInt(minutePart);
    }
    if (isNaN(hour)) hour = 0;
    if (isNaN(minute)) minute = 0;
    if (ampm === "pm" && hour < 12) {
        hour += 12;
    }
    if (ampm === "am" && hour === 12) {
        hour = 0;
    }
    return hour * 60 + minute;
}

// Render Table
function renderTable(data) {

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    for (let i = 0; i < data.length; i++) {

        // Data item may be wrapped with rowClass property
        let obj = data[i];
        let item = obj.item || obj;
        let rowClass = obj.rowClass || "";

        let row = "<tr";
        if (rowClass) {
            row += " class=\"" + rowClass + "\"";
        }
        row += ">";

        // ID column
        row += "<td>" + (item["Sk Tech Register ID"] || "") + "</td>";
        // Name column removed per new requirements
        // Round
        row += "<td>" + (item["Round"] || "") + "</td>";
        // Technology
        row += "<td>" + (item[" Technologies Required"] || "") + "</td>";
        // Company column removed per new requirements
        // Date
        row += "<td>" + formatDate(item["Interview Date"]) + "</td>";
        // Time From
        row += "<td>" + formatTime(item["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"]) + "</td>";
        // Time To
        row += "<td>" + formatTime(item["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"]) + "</td>";
        // Batch
        row += "<td>" + (item["Batch"] || "") + "</td>";

        row += "</tr>";

        table.innerHTML += row;
    }
}

// Load Data (NO async/await → no errors)
function loadData() {

    fetch(API_URL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log("DATA:", data);

        allData = data;

        // Today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter upcoming (today and future) and count today's
        let upcomingData = [];
        let todayCount = 0;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const dateVal = item["Interview Date"];
            const dateObj = new Date(dateVal);
            if (isNaN(dateObj)) continue;
            const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            if (dateOnly >= today) {
                upcomingData.push(item);
                if (dateOnly.getTime() === today.getTime()) {
                    todayCount++;
                }
            }
        }

        // Detect time conflicts within upcoming data
        const conflictIndices = new Set();
        for (let i = 0; i < upcomingData.length; i++) {
            const item1 = upcomingData[i];
            const date1Val = item1["Interview Date"];
            const date1Obj = new Date(date1Val);
            const dateOnly1 = new Date(date1Obj.getFullYear(), date1Obj.getMonth(), date1Obj.getDate());
            const id1 = ((item1["Sk Tech Register ID"] || "").toString()).toLowerCase().trim();
            const start1 = toMinutes(item1["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"]);
            const end1 = toMinutes(item1["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"]);
            for (let j = i + 1; j < upcomingData.length; j++) {
                const item2 = upcomingData[j];
                const date2Val = item2["Interview Date"];
                const date2Obj = new Date(date2Val);
                const dateOnly2 = new Date(date2Obj.getFullYear(), date2Obj.getMonth(), date2Obj.getDate());
                if (dateOnly1.getTime() !== dateOnly2.getTime()) continue;
                const id2 = ((item2["Sk Tech Register ID"] || "").toString()).toLowerCase().trim();
                if (!id1 || !id2 || id1 !== id2) continue;
                const start2 = toMinutes(item2["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"]);
                const end2 = toMinutes(item2["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"]);
                // Overlap: start1 < end2 && start2 < end1
                if (start1 < end2 && start2 < end1) {
                    conflictIndices.add(i);
                    conflictIndices.add(j);
                }
            }
        }

        // Build row objects with classification
        const rows = [];
        for (let i = 0; i < upcomingData.length; i++) {
            const itm = upcomingData[i];
            const dateVal = itm["Interview Date"];
            const dateObj = new Date(dateVal);
            const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            let rowClass = "";
            if (conflictIndices.has(i)) {
                rowClass = "conflict-row";
            } else if (dateOnly.getTime() === today.getTime()) {
                rowClass = "today-row";
            } else {
                rowClass = "future-row";
            }
            rows.push({ item: itm, rowClass: rowClass });
        }

        // Update counters (Upcoming + Today)
        document.getElementById("totalCount").innerText = upcomingData.length;
        document.getElementById("todayCount").innerText = todayCount;

        renderTable(rows);

    })
    .catch(function(error) {
        console.error("ERROR:", error);
    });
}

// Search functionality removed as per new requirements

// Init
loadData();
setInterval(loadData, 60000);