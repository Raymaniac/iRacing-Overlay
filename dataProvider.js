const irsdk = require("node-irsdk");
const fs = require("fs");
const { time } = require("console");
const { env } = require("process");

class SDKWrapper {

    _replaceID = 208718;

    _instance = null;
    _sessionData = new SessionData();
    _positionData = new PositionData();
    _timingData = new TimingData();
    _isConnnected = false;

    _dataSaved = false;

    _driverCarIndex = 0;
    _runningDrivers = 0;

    _debugData = {
        sessionInfo: null,
        telemetry: null
    };

    init() {
        ClassHandler.loadData("./config/Classes.json");
        if(this._instance === null) {
            this._instance = irsdk.init({sessionInfoUpdateInterval: process.env.SESSION_INFO_UPDATE_INTERVAL});
            this._instance.on("SessionInfo", this._onSessionData.bind(this));
            this._instance.on("Telemetry", this._onTelemetryData.bind(this));
            this._instance.on("Connected", () => this._isConnnected = true );
            this._instance.on("Disconnected", () => this._isConnnected = false );
        }
    }

    _onSessionData(sessionData) {
        // Update Session Data
        this._debugData.sessionInfo = sessionData;

        if(!this._dataSaved) {
            let date = Date.now();
            let fileName = `./samples/${date.toString()}_session.json`;
            fs.writeFileSync(fileName, JSON.stringify(sessionData));
            this._dataSaved = true;
        }
        this._sessionData.TrackName = sessionData.data.WeekendInfo.TrackDisplayName;
        this._sessionData.TrackConfig = sessionData.data.WeekendInfo.TrackConfigName;
        this._sessionData.TrackLength = sessionData.data.WeekendInfo.TrackLength;
        this._sessionData.CurrentWeather = sessionData.data.WeekendInfo.TrackSkies;
        this._sessionData.TrackTemp = sessionData.data.WeekendInfo.TrackSurfaceTemp;
        this._sessionData.AirTemp = sessionData.data.WeekendInfo.TrackAirTemp;
        // Evaluate current session and session type
        let sessionKeys = Object.keys(sessionData.data.SessionInfo.Sessions);
        for(let i = 0; i < sessionKeys.length; i++) {
            let session = sessionData.data.SessionInfo.Sessions["" + i];
            if(session.ResultsOfficial === 0) {
                this._sessionData.SessionType = session.SessionType;
                this._sessionData.SessionLength = session.SessionTime;
                this._timingData.LapsTotal = session.SessionLaps;
                this._timingData.TimeTotal = session.SessionTime;
                break;
            }
        }

        // ====== Fetch position data
        this._driverCarIndex = sessionData.data.DriverInfo.DriverCarIdx;
        let driverKeys = Object.keys(sessionData.data.DriverInfo.Drivers);
        let highestCarId = 0;
        for(let i = 0; i < driverKeys.length; i++) {
            let driver = sessionData.data.DriverInfo.Drivers["" + i];
            if(driver.CarIdx > highestCarId) {
                highestCarId = driver.CarIdx;
            }

            if(driver.CarIdx === this._driverCarIndex) {
                if(driver.UserID === this._replaceID && process.env.REPLACE_DRIVER_NAME === "true") {
                    this._positionData.CurrentDriver = process.env.PLAYER_REPLACEMENT_NAME;
                } else {
                    this._positionData.CurrentDriver = driver.UserName;
                }

                if(driver.TeamID !== 0) {
                    this._positionData.TeamName = driver.TeamName;
                }else {
                    this._positionData.TeamName = "Personal"
                }

                this._positionData.CarNumber = driver.CarNumber;
                this._positionData.CarName = driver.CarScreenName;
                this._positionData.Class = ClassHandler.getClassName(driver.CarClassID);
                this._positionData.ClassColor = ClassHandler.getClassColor(driver.CarClassID);
                this._positionData.IsTeamRace = sessionData.data.WeekendInfo.TeamRacing === 0 ? false : true;
                //break;
            }
        }

        this._runningDrivers = highestCarId;
    }

    _onTelemetryData(telemetry) {
        this._debugData.telemetry = telemetry;
        // ====== Fetch Timing Data
        this._timingData.LapsLeft = telemetry.values.SessionLapsRemain;
        this._timingData.TimeLeft = telemetry.values.SessionTimeRemain;

        let driverPosition = telemetry.values.CarIdxPosition[this._driverCarIndex];
        if(driverPosition === 0) {
            let driverKeys = Object.keys(telemetry.values.CarIdxPosition);
            let highestPosition = 0;
            let carsWithoutLap = 0;
            for(var i = 0; i < this._runningDrivers; i++) {
                if(telemetry.values.CarIdxPosition[driverKeys[i]] === 0) {
                    carsWithoutLap++;
                }
                if(telemetry.values.CarIdxPosition[driverKeys[i]] > highestPosition) {
                    highestPosition = telemetry.values.CarIdxPosition[driverKeys[i]];
                }
            }
            this._positionData.Position = highestPosition + 1;
        }else {
            this._positionData.Position = driverPosition;
        }
    }

    getWeatherInfo() {
        if(this._isConnnected) {
            return {
                TrackName: this._sessionData.TrackName,
                TrackConfig: this._sessionData.TrackConfig,
                TrackLength: this._sessionData.TrackLength,
                Session: this._sessionData.SessionType,
                SessionLength: this._sessionData.SessionLength,
                Weather: this._sessionData.CurrentWeather,
                DayTime: this._sessionData.CurrentDayTime,
                AirTemp: this._sessionData.AirTemp,
                TrackTemp: this._sessionData.TrackTemp
            };
        } else {
            return {
                TrackName: "Watkins Glen",
                TrackConfig: "Boot",
                TrackLength: "42 km",
                Session: "Practice",
                Weather: "None",
                DayTime: "Afternoon",
                AirTemp: "24°C",
                TrackTemp: "34°C"
            };
        }
    }

    getPositionInfo() {
        if(this._isConnnected) {
            return {
                CurrentDriver : this._positionData.CurrentDriver,
                TeamName : this._positionData.TeamName,
                CarName : this._positionData.CarName,
                CarNumber : this._positionData.CarNumber,
                Class : this._positionData.Class,
                ClassColor : this._positionData.ClassColor,
                Position : this._positionData.Position,
                IsTeamEvent: this._positionData.IsTeamRace
            };
        }else {
            return {
                CurrentDriver : "n.a",
                TeamName : "n.a",
                CarName : "n.a",
                CarNumber : "0",
                Class : "n.a",
                ClassColor : "n.a",
                Position : 0,
                IsTeamRace : false
            };
        }
    }

    getTimingInfo(timingType) {
        if(this._isConnnected) {
            if(timingType === "LAP") {
                return {
                    SessionAmount: this._timingData.LapsTotal,
                    AmountLeft: this._timingData.LapsLeft
                };
            } else if(timingType === "TIME") {
                return {
                    SessionAmount: this._getTimeString(this._timingData.TimeTotal),
                    AmountLeft: this._getTimeString(this._timingData.TimeLeft)
                };
            }else {
                return {
                    SessionAmount: "--",
                    AmountLeft: "--"
                };
            }
        }else {
            return {
                SessionAmount: "--",
                AmountLeft: "--"
            };
        }
    }

    getSessionInfoDebug() {
        return this._debugData.sessionInfo;
    }

    getTelemetryDebug() {
        return this._debugData.telemetry;
    }

    _getTimeString(timeSec) {
        let secFloat;
        if(typeof timeSec === "string") {
            secFloat = parseFloat(timeSec.split(" ")[0]);
        }else {
            secFloat = timeSec;
        }

        let minutes = Math.floor(secFloat / 60);
        let hours = Number((secFloat / 60 / 60).toFixed(0));
        let seconds = secFloat - ( minutes * 60 );
        seconds = Number(seconds.toFixed(0));
        return `${
            hours < 10 ? "0" + hours : hours}:${ minutes < 10 ? "0" + minutes : minutes }:${ seconds < 10 ? "0" + seconds : seconds }h`;
    }
}

class SessionData {
    TrackName = "";
    TrackConfig = "";
    TrackLength = "";
    SessionType = "";
    SessionLength = "";
    CurrentWeather = "";    // from "TrackSkies"
    CurrentDayTime = "Not Night";
    TrackTemp = "";         // from "TrackSurfaceTemp"
    AirTemp = "";           // from "TrackAirTemp"
}

class PositionData {
    CurrentDriver = "";
    TeamName = "";
    CarName = "";
    CarNumber = 0;
    Class = "";
    ClassColor = "";
    Position = 1;
    IsTeamRace = false;
    Drivers = [];
}

class TimingData {
    LapsTotal = "";
    LapsLeft = "";
    TimeTotal = "";
    TimeLeft = "";
}

class ClassHandler {
    static _data = null;

    static loadData(path) {
        let stringData = fs.readFileSync(path);
        this._data = JSON.parse(stringData);
    }

    static getClassName(classID) {
        try {
            return this._data[classID].Name;
        }catch {
            return "N.a.";
        }
    }

    static getClassColor(classID) { 
        try {
            return this._data[classID].Color;
        }catch {
            return process.env.CLASS_DEFAULT_COLOR;
        }
    }
}

module.exports = {
    SDKWrapper: SDKWrapper,
    SessionData: SessionData,
    PositionData: PositionData
}