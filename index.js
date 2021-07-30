require("dotenv").config();
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const pool = require("./dbpool.js");

const apiKey = process.env.API_KEY;

app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
app.get("/", async (req, res) => {
  let imageUrl = await getRandImg();
  console.log("/: " + imageUrl);
  res.render("index", { imageUrl: imageUrl });
});

app.get("/search", async (req, res) => {
  let keyword = "";
  if (req.query.keyword) {
    keyword = req.query.keyword.trim();
  }

  let apiUrl = `https://api.unsplash.com/photos/random/?count=10&client_id=${apiKey}&featured=true&orientation=landscape&query=${keyword}`;
  let response = await fetch(apiUrl);
  let data = await response.json();

  let imageUrlArray = [];
  for (let i = 0; i < data.length; i++) {
    imageUrlArray.push(data[i].urls.small);
  }

  res.render("results", {
    imageUrl: imageUrlArray.shift(),
    imageUrlArray: imageUrlArray,
  });
});

app.get("/api/updateFavorites", async (req, res) => {
  let sql;
  let sqlParams;
  switch (req.query.action) {
    case "add":
      sql = "INSERT INTO favorites (imageUrl, keyword) VALUES (?,?)";
      sqlParams = [req.query.imageUrl, req.query.keyword];
      break;
    case "delete":
      sql = "DELETE FROM favorites WHERE imageUrl = ?";
      sqlParams = [req.query.imageUrl];
      break;
  }
  let rows = await executeSQL(sql, sqlParams);
  res.send(rows.affectedRows.toString());
});

app.get("/getKeywords", async (req, res) => {
  let imageUrl = await getRandImg();
  let sql = "SELECT DISTINCT keyword FROM favorites ORDER BY keyword";
  let rows = await executeSQL(sql);
  res.render("favorites", { imageUrl: imageUrl, rows: rows });
});

app.get("/api/getFavorites", function (req, res) {
  let sql = "SELECT imageURL FROM favorites WHERE keyword = ?";
  let sqlParams = [req.query.keyword];
  pool.query(sql, sqlParams, function (err, rows, field) {
    if (err) throw err;
    res.send(rows);
  });
});

async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}

async function getRandImg() {
  let apiUrl = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&featured=true&orientation=landscape`;
  let response = await fetch(apiUrl);
  let data = await response.json();
  let imageUrl = data.urls.small;
  console.log("randImg(): " + imageUrl);
  return imageUrl;
}

//server listener
app.listen(3000, () => {
  console.log("Server started...");
});
