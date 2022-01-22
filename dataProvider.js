const irsdk = require("node-irsdk");
const fs = require("fs");
const classmentApi = require("./classmentAPI.js");
const moment = require("moment");

class SDKWrapper {

    _replaceID = 208718;

    _classment;

    _instance = null;
    _sessionData = new SessionData();
    _positionData = new PositionData();
    _timingData = new TimingData();
    _isConnnected = false;

    _dataSaved = false;

    _driverCarIndex = 0;
    _runningDrivers = 0;

    _sessionFlags = [];

    _debugData = {
        sessionInfo: null,
        telemetry: null
    };

    init() {
        ClassHandler.loadData("./config/Classes.json");
        SkiesHandler.loadData("./config/Skies.json");
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
        //this._sessionData.CurrentWeather = sessionData.data.WeekendInfo.TrackSkies;
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

        this._positionData.IsOnPitroad = telemetry.values.OnPitRoad;
        this._sessionData.IsOnPitroad = telemetry.values.OnPitRoad;
        this._positionData.IsInGarage = !telemetry.values.IsOnTrack;
        this._sessionData.IsInGarage = !telemetry.values.IsOnTrack;

        this._sessionData.TrackTemp = telemetry.values.TrackTemp;
        this._sessionData.AirTemp = telemetry.values.AirTemp;
        this._sessionData.CurrentWeather = SkiesHandler.getSkyName(telemetry.values.Skies);

        let flags = telemetry.values.SessionFlags;
        this._timingData.FlagStatus = flags[0];
        //this._timingData.FlagStatus = flags[flags.length-1]; // Last flag should be main priority
        this._updateSessionFlags(telemetry.values.SessionFlags);

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
                AirTemp: this._sessionData.AirTemp.toFixed(1),
                TrackTemp: this._sessionData.TrackTemp.toFixed(1),
                IsOnPitroad: this._sessionData.IsOnPitroad,
                IsInGarage: this._sessionData.IsInGarage
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
                TrackTemp: "34°C",
                IsOnPitroad: true,
                IsInGarage: true
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
                IsTeamEvent: this._positionData.IsTeamRace,
                IsOnPitroad: this._positionData.IsOnPitroad,
                IsInGarage: this._positionData.IsInGarage
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
                IsTeamRace : false,
                IsOnPitroad: true,
                IsInGarage: true
            };
        }
    }

    getTimingInfo(timingType) {
        if(this._isConnnected) {
            if(timingType === "LAP") {
                return {
                    SessionAmount: this._timingData.LapsTotal,
                    AmountLeft: this._timingData.LapsLeft,
                    FlagStatus: this._timingData.FlagStatus
                };
            } else if(timingType === "TIME") {
                return {
                    SessionAmount: this._getTimeString(this._timingData.TimeTotal),
                    AmountLeft: this._getTimeString(this._timingData.TimeLeft),
                    FlagStatus: this._timingData.FlagStatus
                };
            }else {
                return {
                    SessionAmount: "--",
                    AmountLeft: "--",
                    FlagStatus: this._timingData.FlagStatus
                };
            }
        }else {
            return {
                SessionAmount: "--",
                AmountLeft: "--",
                FlagStatus: this._timingData.FlagStatus
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
        let dateTime = moment.utc(timeSec*1000);

        let hours = dateTime.hours();
        let minutes = dateTime.minutes();
        let seconds = dateTime.seconds();

        return `${
            hours < 10 ? "0" + hours : hours}:${ minutes < 10 ? "0" + minutes : minutes }:${ seconds < 10 ? "0" + seconds : seconds }h`;

    }

    _updateSessionFlags(sessionFlags) {
        let hasChanged = false;

        if(this._sessionFlags.length === 0) {
            hasChanged = true;
            this._sessionFlags = sessionFlags;
        }else {
            sessionFlags.forEach(flag => {
                let found = false;
                this._sessionFlags.forEach(savedFlag => {
                    if(savedFlag === flag) {
                        found = true;
                    }
                });
                if(!found) {
                    this._sessionFlags.push(flag);
                    hasChanged = true;
                }
            });
        }

        if (hasChanged) {
            console.log(this._sessionFlags);
        }
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
    IsOnPitroad = true;
    IsInGarage = true;
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
    IsOnPitroad = true;
    IsInGarage = true;
    Drivers = [];
}

class TimingData {
    LapsTotal = "";
    LapsLeft = "";
    TimeTotal = "";
    TimeLeft = "";
    FlagStatus = "";
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

class SkiesHandler {
    static _data = null;

    static loadData(path) {
        let stringData = fs.readFileSync(path);
        this._data = JSON.parse(stringData);
    }

    static getSkyName(skyID) {
        return this._data[skyID].Name;
    }
}

module.exports = {
    SDKWrapper: SDKWrapper,
    SessionData: SessionData,
    PositionData: PositionData
}