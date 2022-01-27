const bodyParser = require("body-parser");
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const express = require("express");
const app = express();

const defaultPort = 8080;

require("dotenv").config();
const sdk = require("./dataProvider.js")
const wrapper = new sdk.SDKWrapper();
wrapper.init();

app.use(bodyParser.json());
app.use(bodyParserErrorHandler());
app.set("view engine", "pug");
app.set("views", "./resources/views");

app.use("/images", express.static("resources/images"));

// ====== Widget setup
app.get("/widgets/weather", (req, res) => { res.render("weather/weatherpanel"); });
app.get("/data/weather", (req, res) => {
    let data = wrapper.getWeatherInfo();
    return res.json(data); 
});

app.get("/widgets/position", (req, res) => { res.render("position/positionpanel"); });
app.get("/data/position", (req, res) => {
    let data = wrapper.getPositionInfo();
    return res.json(data);
});

app.get("/widgets/timing", (req, res) => { res.render("timing/timingpanel"); });
app.get("/data/timing", (req, res) => {
    let type = req.query.type;
    let data = wrapper.getTimingInfo(type);;
    return res.json(data);
});

// ====== Some Debugging information
app.get("/debug/session", (req, res) => {
    res.json(wrapper.getSessionInfoDebug());
});
app.get("/debug/telemetry", (req, res) => {
    res.json(wrapper.getTelemetryDebug());
});



// ====== Run App
app.listen(process.env.PORT || defaultPort, () => {
    console.log(`Listening to port ${process.env.PORT || defaultPort}`);
});