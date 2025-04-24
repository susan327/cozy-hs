const calendarContainer = document.getElementById("calendar-container");

fetch("/api/holidays")
  .then(res => res.json())
  .then(holidayMap => {
    const today = new Date();
    for (let i = 0; i < 2; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      calendarContainer.appendChild(renderCalendar(date, holidayMap));
    }
  });

function renderCalendar(baseDate, holidayMap) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const table = document.createElement("table");
  table.className = "calendar";

  const caption = document.createElement("caption");
  caption.textContent = `${year}年${month + 1}月`;
  table.appendChild(caption);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  weekdays.forEach(d => {
    const th = document.createElement("th");
    th.textContent = d;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let current = new Date(firstDay);
  let row = document.createElement("tr");

  for (let i = 0; i < current.getDay(); i++) {
    row.appendChild(document.createElement("td"));
  }

  while (current <= lastDay) {
    const td = document.createElement("td");
    const dateStr = current.toISOString().split("T")[0];
    const day = current.getDate();

    if (holidayMap[dateStr]) {
      td.classList.add("holiday");
    }

    const wrapper = document.createElement("div");
    wrapper.className = "cell-content";
    wrapper.textContent = day;

    td.appendChild(wrapper);
    row.appendChild(td);

    if (current.getDay() === 6) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }

    current.setDate(current.getDate() + 1);
  }

  if (row.children.length > 0) {
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  return table;
}
