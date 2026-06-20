// admin.js
// Populates the admin dashboard with detailed interview information. It
// fetches upcoming interviews from the API, counts today's and total upcoming
// interviews, identifies conflict rows, and builds a table with all relevant
// fields.

function formatDateAdmin(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN");
}
function formatTimeAdmin(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true });
}
function toMinutesAdmin(timeStr) {
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

const ADMIN_API_URL = "https://script.google.com/macros/s/AKfycbwxpMoYA7gmul9iMk9eA2Cae07sxynCp6Ff73BhXFAdJoOMBmNzZP2-5ck2qRyqjm7W/exec";

function loadAdminData() {
  fetch(ADMIN_API_URL)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const upcoming = [];
      let todayCount = 0;
      data.forEach(function(item) {
        const dateObj = new Date(item["Interview Date"]);
        if (isNaN(dateObj)) return;
        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        if (dateOnly >= today) {
          upcoming.push(item);
          if (dateOnly.getTime() === today.getTime()) {
            todayCount++;
          }
        }
      });
      document.getElementById('todayCountAdmin').textContent = todayCount;
      document.getElementById('totalUpcomingAdmin').textContent = upcoming.length;
      // Conflict detection
      const conflictIndices = new Set();
      for (let i = 0; i < upcoming.length; i++) {
        const item1 = upcoming[i];
        const date1Val = item1["Interview Date"];
        const date1Obj = new Date(date1Val);
        const dateOnly1 = new Date(date1Obj.getFullYear(), date1Obj.getMonth(), date1Obj.getDate());
        const id1 = ((item1["Sk Tech Register ID"] || "").toString()).toLowerCase().trim();
        const start1 = toMinutesAdmin(item1["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"]);
        const end1 = toMinutesAdmin(item1["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"]);
        for (let j = i + 1; j < upcoming.length; j++) {
          const item2 = upcoming[j];
          const date2Val = item2["Interview Date"];
          const date2Obj = new Date(date2Val);
          const dateOnly2 = new Date(date2Obj.getFullYear(), date2Obj.getMonth(), date2Obj.getDate());
          if (dateOnly1.getTime() !== dateOnly2.getTime()) continue;
          const id2 = ((item2["Sk Tech Register ID"] || "").toString()).toLowerCase().trim();
          if (!id1 || !id2 || id1 !== id2) continue;
          const start2 = toMinutesAdmin(item2["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"]);
          const end2 = toMinutesAdmin(item2["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"]);
          if (start1 < end2 && start2 < end1) {
            conflictIndices.add(i);
            conflictIndices.add(j);
          }
        }
      }
      // Build rows
      const tbody = document.getElementById('adminBody');
      tbody.innerHTML = '';
      upcoming.forEach(function(item, idx) {
        const regId = item["Sk Tech Register ID"] || '';
        const fullName = item["Full Name"] || '';
        const round = item["Round"] || '';
        const tech = item[" Technologies Required"] || '';
        const company = item["Company"] || '';
        const dateVal = item["Interview Date"];
        const dateStr = formatDateAdmin(dateVal);
        const timeFrom = item["Interview Time (From)  or  If Time Not confirmed plz select 00:00 like Assessment"];
        const timeTo = item["Interview Time (To) or  If Time Not confirmed plz select 00:00 like Assessment"];
        const timeSlot = formatTimeAdmin(timeFrom) + ' - ' + formatTimeAdmin(timeTo);
        const batch = item["Batch"] || '';
        let statusClass = 'status-future';
        let statusText = 'Upcoming';
        const dateObj = new Date(dateVal);
        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        if (conflictIndices.has(idx)) {
          statusClass = 'status-conflict';
          statusText = 'Conflict';
        } else if (dateOnly.getTime() === today.getTime()) {
          statusClass = 'status-today';
          statusText = 'Today';
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${regId}</td>` +
                       `<td>${fullName}</td>` +
                       `<td>${round}</td>` +
                       `<td>${tech}</td>` +
                       `<td>${company}</td>` +
                       `<td>${dateStr}</td>` +
                       `<td>${timeSlot}</td>` +
                       `<td>${batch}</td>` +
                       `<td class="${statusClass}">${statusText}</td>`;
        tbody.appendChild(tr);
      });
    })
    .catch(function(err) {
      console.error('Error loading admin data:', err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  loadAdminData();
  setInterval(loadAdminData, 60000);
});