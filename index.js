require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("node:dns");

// Basic Configuration
const port = 80;
const urls = [];

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/invalidURL", function (req, res) {
	res.json({ error: "URL was not found" });
});

app.get("/api/shorturl/:id", function (req, res) {
	console.log(req.params.id, urls);
	const url = urls[req.params.id];
	if (url) res.redirect(url);
	else res.redirect("/");
});

function parseBody(req, res, next) {
	const url = new URL(req.body.url);
	dns.lookup(url.host, (err, _) => {
		if (err) return res.redirect("/api/invalidURL");
		if (!urls.includes(url.toString())) {
			urls.push(url.toString());
			next();
		} else {
			const id = urls.indexOf(url);
			res.redirect("api/newURL/" + id);
		}
	});
}

app.get("/api/newURL/:id", (req, res) => {
	const id = req.params.id;
	res.json({
		original_url: urls[id],
		id: id,
		short_url: req.headers.referer + "api/shorturl/" + id,
	});
});

app.post("/api/shorturl", parseBody, function (req, res) {
	const id = urls.length - 1;
	res.redirect("/api/newUrl/" + id);
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
