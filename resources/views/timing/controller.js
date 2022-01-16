class WidgetController {
    IMG_BASE_PATH = location.origin + "/resources/images";
    
    _timeDisplay;
    _intervall = null;

    _timingType = "TIME";

    _request = null;

    constructor() {
        let queryString = window.location.search;
        let params = new URLSearchParams(queryString);
        this._timingType = params.get("type");
        this._timeDisplay = document.getElementById("time-display");
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
        
        this._request.open("GET", location.origin + "/data/timing?type=" + this._timingType)
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {
        if(this._timingType === "LAP") {
            this._timeDisplay.innerText = `${data.SessionAmount}/${data.AmountLeft} LAPS`;
        } else {
            this._timeDisplay.innerText = `${data.AmountLeft}`;
        }
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}