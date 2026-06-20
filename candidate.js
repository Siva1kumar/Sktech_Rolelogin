// candidate.js
// This script populates the candidate dashboard with booked and available interview
// slots by fetching data from the existing Google Apps Script API. It displays
// summary counts and separates slots into two tables: booked and available.

// Reuse functions from dashboard.js for date and time formatting
function formatDate(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN");
}

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

// API endpoint (same as dashboard.js)
const API_URL = "https://script.google.com/macros/s/AKfycbwxpMoYA7gmul9iMk9eA2Cae07sxynCp6Ff73BhXFAdJoOMBmNzZP2-5ck2qRyqjm7W/exec";

// Load data and render the tables
function loadCandidateData() {
  fetch(API_URL)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      // Filter to upcoming dates
      const today = new Date();
      today.setHours(0,0,0,0);
      const upcoming = data.filter(function(item) {
        const dateObj = new Date(item["Interview Date"]);
        if (isNaN(dateObj)) return false;
        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        return dateOnly >= today;
      });
      // Compute count of today's interviews
      const todayCount = upcoming.filter(function(item) {
        const dateObj = new Date(item["Interview Date"]);
        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        return dateOnly.getTime() === today.getTime();
      }).length;
      document.getElementById('todayCount').textContent = todayCount;

      // Determine booked vs available
      const booked = [];
      const available = [];
      upcoming.forEach(function(item) {
        const regId = (item["Sk Tech Register ID"] || "").toString().trim();
        const tech = (item[" Technologies Required"] || "").trim();
        const dateVal = item["Interview Date"];
        const timeFrom = item["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"];
        const timeTo = item["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"];
        const timeSlot = formatTime(timeFrom) + ' - ' + formatTime(timeTo);
        const slotObj = {
          registerId: regId || 'Available',
          technology: tech,
          date: formatDate(dateVal),
          timeSlot: timeSlot
        };
        if (regId) {
          slotObj.status = 'Booked';
          booked.push(slotObj);
        } else {
          slotObj.status = 'Available';
          available.push(slotObj);
        }
      });
      // Populate tables
      const bookedBody = document.getElementById('bookedBody');
      const availableBody = document.getElementById('availableBody');
      bookedBody.innerHTML = '';
      availableBody.innerHTML = '';
      booked.forEach(function(slot) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${slot.registerId}</td><td>${slot.technology}</td><td>${slot.date}</td><td>${slot.timeSlot}</td><td class="status-booked">\uD83D\uDD34 Booked</td>`;
        bookedBody.appendChild(tr);
      });
      available.forEach(function(slot) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${slot.registerId}</td><td>${slot.technology}</td><td>${slot.date}</td><td>${slot.timeSlot}</td><td class="status-available">\uD83D\uDFE2 Available</td>`;
        availableBody.appendChild(tr);
      });
      document.getElementById('availableCount').textContent = available.length;
    })
    .catch(function(err) {
      console.error('Error loading data:', err);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCandidateData();
  // Refresh every 60 seconds to keep counts up-to-date
  setInterval(loadCandidateData, 60000);
});