const bodyParser = require("body-parser");
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const express = require("express");
const app = express();

const defaultPort = 8080;

require("dotenv").config();
const sdk = require("./src/dataProvider.js")
const wrapper = new sdk.SDKWrapper();
wrapper.init();

/*====== Require Controller ======*/
const PositionController = require("./src/controller/PositionController.js");
const TimingController = require("./src/controller/TimingController.js");
const WeatherController = require("./src/controller/WeatherController.js");
const ClassmentController = require("./src/controller/ClassmentController.js");

/*====== Express Setup*/
app.use(bodyParser.json());
app.use(bodyParserErrorHandler());
app.set("view engine", "pug");
app.set("views", "./resources/views");

app.use("/images", express.static("resources/images"));

// ====== Widget setup
const weatherController = new WeatherController(wrapper);
app.get("/widgets/weather", weatherController.handleUIRequest.bind(weatherController));
app.get("/data/weather", weatherController.handleDataRequest.bind(weatherController));

const positionController = new PositionController(wrapper);
app.get("/widgets/position", positionController.handleUIRequest.bind(positionController) );
app.get("/data/position", positionController.handleDataRequest.bind(positionController) );

const timingController = new TimingController(wrapper);
app.get("/widgets/timing", timingController.handleUIRequest.bind(timingController));
app.get("/data/timing", timingController.handleDataRequest.bind(timingController));

const classmentController = new ClassmentController(wrapper);
app.get("/widgets/classment", classmentController.handleUIRequest.bind(classmentController));
app.get("/data/classment", classmentController.handleDataRequest.bind(classmentController));

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