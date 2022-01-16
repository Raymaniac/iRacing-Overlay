class WidgetController {
    IMG_BASE_PATH = location.origin + "/resources/images";
    
    _trackName;
    _trackConfig;
    _weatherImage;
    _airTemp;
    _trackTemp;
    _sessionLength;
    _sessionType;
    _intervall = null;

    _request = null;

    constructor() {
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
                      this._intervall = setInterval(this._fetchUpdate.bind(this), 5000);
                    }
                }
            };
        }
        
        this._request.open("GET", location.origin + "/data/weather")
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {
        this._trackName.innerText = data.TrackName;
        this._trackConfig.innerText = `${data.TrackConfig} (${data.TrackLength})`;
        this._airTemp.innerText = data.AirTemp;
        this._trackTemp.innerText = data.TrackTemp;
        let sessionLength = data.SessionLength;
        let timeInMinutes = parseFloat(sessionLength.split(" ")[0]) / 60;
        let timeUnit = sessionLength.split(" ")[1] === "sec" ? "min" : "Laps";
        this._sessionLength.innerText = `${ timeInMinutes }${timeUnit}`;
        this._sessionType.innerText = data.Session;
    }

    _displayPlaceholders() {
        this._trackName.innerText = "Watkins Glen";
        this._trackConfig.innerText = "Boot ";
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}