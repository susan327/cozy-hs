function previewImage() {
  const fileInput = document.getElementById("image");
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

fetch("/api/news")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("postList");
    data.reverse().forEach(post => {
      const div = document.createElement("div");
      div.className = "post-item";

      // タイトル
      const title = document.createElement("h3");
      title.textContent = post.title;
      div.appendChild(title);

      // 本文（改行対応）
      const body = document.createElement("p");
      body.innerHTML = (post.body || "").replace(/\n/g, "<br>");
      div.appendChild(body);

      // 画像（任意）
      if (post.image) {
        const img = document.createElement("img");
        img.src = post.image;
        img.alt = "投稿画像";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        div.appendChild(img);
      }

      // 投稿日時
      const timestamp = document.createElement("p");
      timestamp.style.fontSize = "0.8em";
      timestamp.style.color = "#888";
      timestamp.textContent = new Date(post.timestamp).toLocaleString();
      div.appendChild(timestamp);

      // 削除フォーム
      const form = document.createElement("form");
      form.action = `/delete/${post.id}`;
      form.method = "post";
      form.onsubmit = () => confirm("この投稿を削除しますか？");

      const btn = document.createElement("button");
      btn.type = "submit";
      btn.textContent = "削除";
      btn.style.padding = "0.4em 1.2em";
      btn.style.backgroundColor = "#cc0000";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";

      form.appendChild(btn);
      div.appendChild(form);

      div.appendChild(document.createElement("hr"));
      container.appendChild(div);
    });
  });
