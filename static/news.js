document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("news-list");

  fetch("/api/news")
    .then(res => res.json())
    .then(posts => {
      posts.reverse().slice(0, 3).forEach(post => {
        const div = document.createElement("div");
        div.className = "card";

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = post.title || "(タイトルなし)";

        const date = document.createElement("div");
        date.className = "date";
        if (post.timestamp) {
          const [y, m, d] = post.timestamp.split("T")[0].split("-");
          date.textContent = `${y}年${m}月${d}日`;
        }

        const body = document.createElement("div");
        body.className = "body";
        body.innerHTML = (post.body || "").replace(/\n/g, "<br>");

        div.appendChild(title);
        div.appendChild(date);
        div.appendChild(body);

        if (post.image && !post.image.startsWith("data:image")) {
          const img = document.createElement("img");
          img.src = post.image;
          img.alt = "投稿画像";
         img.style.maxWidth = "300px";
img.style.width = "100%";
img.style.height = "auto";
img.style.borderRadius = "8px";
img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
img.style.marginTop = "0.5em";

          div.appendChild(img);
        }

        container.appendChild(div);
      });
    });
});
