require("dotenv").config();

// we'll need this later
function pascalCase(str) {
  return str
    .split(/_\s/g)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

const express = require("express");
const app = express();

app.use(express.json()); // allows json to be used to import data
app.set("view engine", "ejs");

app.use("/public", express.static("public"));

const db = require("./db");

// Endpoint to accept periodic reports
app.post("/api/report", express.json(), async (req, res) => {
  const report = req.body;

  function error(msg) {
    res.status(400).json({
      status: "error",
      message: msg,
    });
    return;
  }

  if (!report.time) {
    report.time = Date.now();
  }

  console.log(report);
  try {
    await db.addReport(report);
    console.log("Added report");
    res.status(200).json({
      status: "ok",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "error",
      message: e.message.replace(/"/g, "'"),
    });
  }
});

// Returns JSON for all of the reports so far
app.get("/api/report", async (req, res) => {
  try {
    const reports = await db.fetchAll();
    res.json(reports);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
});

// Return JSON for the specific type of reports, this data is structured to be put directly into the graph
app.get("/api/report/:type", async (req, res) => {
  try {
    const reports = await db.fetchAll();
    res.json(
      reports.map((r) => db.reportMap[req.params.type].map((k) => r[k]))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
});

// Returns the graph for the selected type of data
app.get("/report/:type", async (req, res) => {
  req.params.type = req.params.type.toUpperCase();
  try {
    const reports = await db.fetchAll();
    res.render("graph", {
      type: pascalCase(req.params.type),
      data: JSON.stringify(
        reports
          .map((r) => db.reportMap[req.params.type].map((k) => r[k]))
          .filter((r) => !r.includes(-1))
      ),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
});

// Listens on port 3000 by default
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
