/**
 * @enum {string} ReportType
 * @property {string} LIGHT
 * @property {string} TEMP
 * @property {string} PINS
 */

// This is used later on to determine the values that are used in the graphs
const reportMap = {
  LIGHT: ["time", "light_level"],
  TEMP: ["time", "temp"],
  PINS: ["time", "touch_pin0", "touch_pin1", "touch_pin2"],
};

/**
 * @typedef {Object} Report
 * @property {number?} time
 * @property {number?} accel_x
 * @property {number?} accel_y
 * @property {number?} accel_z
 * @property {number?} temp
 * @property {number?} light_level
 * @property {number?} touch_pin0
 * @property {number?} touch_pin1
 * @property {number?} touch_pin2
 */

const db = require("better-sqlite3")("reports.db");
db.pragma("journal_mode = WAL"); // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md

// Makes the table if it doesn't exist already
db.exec(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time INTEGER,
  accel_x REAL,
  accel_y REAL,
  accel_z REAL,
  temp REAL,
  light_level REAL,
  touch_pin0 INTEGER,
  touch_pin1 INTEGER,
  touch_pin2 INTEGER
  )`);

/**
 * Returns all of the reports sorted by date
 * @param {ReportType?} type
 * @returns {Promise<Report[]>}
 */
async function fetchAll() {
  return await db.prepare("SELECT * FROM reports ORDER BY time DESC").all();
}

/**
 * Adds a new report to the database
 * @param {Report} report
 */
async function addReport(report) {
  const stmt = db.prepare(`
    INSERT INTO reports (
      time,
      accel_x,
      accel_y,
      accel_z,
      temp,
      light_level,
      touch_pin0,
      touch_pin1,
      touch_pin2
    ) VALUES (
      :time,
      :accel_x,
      :accel_y,
      :accel_z,
      :temp,
      :light_level,
      :touch_pin0,
      :touch_pin1,
      :touch_pin2
    )
  `);
  return await stmt.run(
    Object.assign(
      {
        accel_x: 0,
        accel_y: 0,
        accel_z: 0,
        temp: -1,
        light_level: -1,
        touch_pin0: -1,
        touch_pin1: -1,
        touch_pin2: -1,
      },
      report
    )
  );
}

module.exports = {
  fetchAll,
  addReport,
  reportMap,
};
