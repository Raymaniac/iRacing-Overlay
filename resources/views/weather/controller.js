class WidgetController {
    IMG_BASE_PATH = location.origin + "/resources/images";

    _body;
    
    _trackName;
    _trackConfig;
    _weatherImage;
    _airTemp;
    _trackTemp;
    _sessionLength;
    _sessionType;
    _intervall = null;

    _request = null;
    _lastWeatherCondition = "";
    _lastdaylightCondition = "";

    constructor() {
        this._body = document.getElementById("body");
        this._trackName = document.getElementById("track-name");
        this._trackConfig = document.getElementById("track-config");
        this._weatherImage = document.getElementById("weather-image");
        this._airTemp = document.getElementById("air-temp");
        this._trackTemp = document.getElementById("track-temp");
        this._sessionLength = document.getElementById("session-length");
        this._sessionType = document.getElementById("session-type");
        this._fetchUpdate();
    }

    _fetchUpdate() {

        if(this._request === null) {
            this._request = new XMLHttpRequest();
            this._request.onload = () => {
                if( this._request.status === 200) {
                    let stringText = this._request.responseText;
                    let decoded = decodeURI(stringText);
                    this._displayValues(JSON.parse(decoded));
                    if(this._intervall === null) {
                      this._intervall = setInterval(this._fetchUpdate.bind(this), 500);
                    }
                }
            };
        }
        
        this._request.open("GET", location.origin + "/data/weather")
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {

        if(!data.IsInGarage) {
            this._body.style.visibility = "hidden";
        }else {
            this._body.style.visibility = "visible";
            this._trackName.innerText = data.TrackName;
            this._trackConfig.innerText = `${data.TrackConfig} (${data.TrackLength})`;
            this._airTemp.innerText = data.AirTemp;
            this._trackTemp.innerText = data.TrackTemp;
            try {
                let sessionLength = data.SessionLength;
                let timeInMinutes = parseFloat(sessionLength.split(" ")[0]) / 60;
                let timeUnit = sessionLength.split(" ")[1] === "sec" ? "min" : "Laps";
                this._sessionLength.innerText = `${ timeInMinutes }${timeUnit}`;
            } catch {}
            this._sessionType.innerText = data.Session;

            if(this._lastWeatherCondition !== data.Weather || this._lastdaylightCondition !== data.DayTime) {
                this._weatherImage.src = this._getWeatherIconSource(data.DayTime, data.Weather);
                this._lastWeatherCondition = data.Weather;
                this._lastdaylightCondition = data.DayTime;
            }
        }
        
    }

    _displayPlaceholders() {
        this._trackName.innerText = "Watkins Glen";
        this._trackConfig.innerText = "Boot ";
    }

    _getWeatherIconSource(daylight, weather) {
        switch(weather) {
            case "Clear":
                return daylight === "Night" ? 
                    location.origin + "/images/weather/night/clear.png":
                    location.origin + "/images/weather/day/clear.png";
            case "Mostly Cloudy":
                return daylight === "Night" ? 
                    location.origin + "/images/weather/night/mostly_cloudy.png":
                    location.origin + "/images/weather/day/mostly_cloudy.png";
            case "Overcast":
                return location.origin + "/images/weather/day/overcast.png";
            default: /* also "Partly Cloudy"*/
                return daylight === "Night" ? 
                    location.origin + "/images/weather/night/partly_cloudy.png" : 
                    location.origin + "/images/weather/day/partly_cloudy.png";
        }
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}