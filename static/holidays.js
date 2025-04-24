const sheetId = "1y90ACSg_q6tpav-UQtMiag-pcxdpA6sNHRjnt6rlg_s";
const today = new Date();
const sheetNames = [
  `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}`,
  `${today.getFullYear()}_${String(today.getMonth() + 2).padStart(2, "0")}`
];

const calendarContainer = document.getElementById("calendar-container");


function createCalendar(year, month, holidays) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const table = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = `${year}年${month}月`;
  table.appendChild(caption);

  const thead = document.createElement("thead");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  thead.innerHTML = `<tr>${days.map(d => `<th>${d}</th>`).join("")}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  let row = document.createElement("tr");

  for (let i = 0; i < first.getDay(); i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const td = document.createElement("td");
    td.textContent = d;

    if (holidays.includes(date)) {
      td.classList.add("holiday");
    }

    row.appendChild(td);
    if ((first.getDay() + d) % 7 === 0 || d === last.getDate()) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }
  }

  table.appendChild(tbody);
  calendarContainer.appendChild(table);
}

async function fetchHolidays(sheetName) {
  const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data
      .filter(row => row["ステータス"] === "定休日" || row["ステータス"] === "臨時休業")
      .map(row => row["日付"]);
  } catch (e) {
    console.error(`取得失敗：${sheetName}`, e);
    return [];
  }
}

async function buildCalendars() {
  for (const name of sheetNames) {
    const [year, month] = name.split("_").map(Number);
    const holidays = await fetchHolidays(name);
    createCalendar(year, month, holidays);
  }
}

buildCalendars();
