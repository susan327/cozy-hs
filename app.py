from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory
import os, json, time
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = "cozyhair-super-secret"

UPLOAD_FOLDER = "static/uploads"
HOLIDAY_FILE = "static/holidays.json"
NEWS_FILE = "static/newsPosts.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# --- ページルート ---
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/concept")
def concept():
    return render_template("concept.html")

@app.route("/menu")
def menu():
    return render_template("menu.html")

@app.route("/color")
def color():
    return render_template("color.html")

@app.route("/straight")
def straight():
    return render_template("straight.html")

@app.route("/staff")
def staff():
    return render_template("staff.html")

@app.route("/access")
def access():
    return render_template("access.html")

@app.route("/line")
def line():
    return render_template("line.html")

@app.route("/news")
def news():
    return render_template("news.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

# --- SEOファイルルート ---
@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory(".", "sitemap.xml")

@app.route("/robots.txt")
def robots():
    return send_from_directory(".", "robots.txt")

# --- 管理画面・投稿関連 ---
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if request.form.get("password") == "cozypass":
            session["logged_in"] = True
            return redirect(url_for("calendar"))
        else:
            return render_template("login.html", error="パスワードが違います")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.pop("logged_in", None)
    return redirect(url_for("index"))

@app.route("/calendar")
def calendar():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    return render_template("calendar.html")

@app.route("/post", methods=["GET", "POST"])
def post_page():
    if not session.get("logged_in"):
        return redirect(url_for("login"))

    if request.method == "POST":
        title = request.form.get("title")
        body = request.form.get("body").replace("\r\n", "\n").replace("\r", "\n")
        file = request.files.get("image")
        print("📥 投稿受け取り成功！", title)  # ←ここ！

        image_url = ""
        if file and file.filename:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_url = f"/static/uploads/{filename}"

        new_post = {
            "id": int(time.time()),
            "title": title,
            "body": body,
            "image": image_url,
            "timestamp": datetime.now().isoformat()
        }

        posts = load_json(NEWS_FILE)
        print("📄 JSON読み込み成功！件数:", len(posts))  # ←ここ！

        posts.append(new_post)
        save_json(posts, NEWS_FILE)
        print("✅ JSON保存成功！")  # ←ここ！

        return redirect(url_for("post_page"))

    return render_template("post.html")


@app.route("/delete/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    posts = load_json(NEWS_FILE)
    posts = [post for post in posts if post.get("id") != post_id]
    save_json(posts, NEWS_FILE)
    return redirect(url_for("post_page"))

# --- API系 ---
@app.route("/api/holidays")
def get_holidays():
    try:
        data = load_json(HOLIDAY_FILE)
        if not isinstance(data, dict):
            data = {}
    except Exception as e:
        print("Error loading holidays:", e)
        return jsonify({}), 500
    return jsonify(data)

@app.route("/api/toggle", methods=["POST"])
def toggle_holiday():
    body = request.get_json()
    date = body.get("date")
    status = body.get("status")

    data = load_json(HOLIDAY_FILE)
    if not isinstance(data, dict):
        data = {}

    if status is None:
        if date in data:
            del data[date]
    else:
        data[date] = status

    save_json(data, HOLIDAY_FILE)
    return jsonify({"status": "ok", "date": date})

@app.route("/api/news", methods=["GET", "POST"])
def handle_news():
    if request.method == "POST":
        title = request.form.get("title")
        body = request.form.get("body").replace("\r\n", "\n").replace("\r", "\n")
        print("DEBUG: API body =", repr(body))

        file = request.files.get("image")
        image_url = ""

        if file and file.filename:
            filename = secure_filename(file.filename)
            path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(path)
            image_url = f"/static/uploads/{filename}"

        new_post = {
            "id": int(time.time()),
            "title": title,
            "body": body,
            "image": image_url,
            "timestamp": datetime.now().isoformat()
        }
        posts = load_json(NEWS_FILE)
        posts.append(new_post)
        save_json(posts, NEWS_FILE)
        return jsonify({"status": "ok"})
    else:
        return jsonify(load_json(NEWS_FILE))

# --- 起動 ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
