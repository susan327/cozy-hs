const container = document.getElementById("calendar-container");
let holidayMap = {};

fetch("/api/holidays")
  .then(res => res.json())
  .then(data => {
    holidayMap = data;
    renderMultipleCalendars();
  });

function renderMultipleCalendars() {
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    renderCalendar(date);
  }
}

function renderCalendar(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const weeks = generateMonth(year, month);

  const table = document.createElement("table");
  table.className = "calendar";

  const caption = document.createElement("caption");
  caption.textContent = `${year}年 ${month + 1}月`;
  table.appendChild(caption);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  weekdays.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  weeks.forEach(week => {
    const tr = document.createElement("tr");
    week.forEach(dateObj => {
      const td = document.createElement("td");
      if (dateObj) {
        const dateStr = dateObj.toISOString().split("T")[0];
        const day = dateObj.getDate();
        td.dataset.date = dateStr;

        // 赤くする（休業日なら）
        if (holidayMap[dateStr] === "休業日") {
          td.classList.add("holiday");
        }

        // 中央に数字を置く
        const wrapper = document.createElement("div");
        wrapper.className = "cell-content";
        wrapper.textContent = day;
        td.appendChild(wrapper);

        // クリックでトグル処理
        td.addEventListener("click", () => handleToggle(td, dateStr));
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function handleToggle(td, dateStr) {
  const isHoliday = td.classList.contains("holiday");

  let newStatus = null;
  if (!isHoliday) {
    newStatus = "休業日";
    td.classList.add("holiday");
  } else {
    td.classList.remove("holiday");
  }

  fetch("/api/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: dateStr, status: newStatus })
  });
}

function generateMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks = [];
  let week = new Array(7).fill(null);
  let day = first;

  while (day <= last) {
    const dayOfWeek = day.getDay();
    week[dayOfWeek] = new Date(day);
    if (dayOfWeek === 6 || day.getTime() === last.getTime()) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  }

  return weeks;
}
