class WidgetController {
    IMG_BASE_PATH = location.origin + "/resources/images";
    
    _timeDisplay;
    _flagPanel;
    _flagText;
    _flagOpened = false;
    _intervall = null;

    _timingType = "TIME";

    _request = null;

    constructor() {
        let queryString = window.location.search;
        let params = new URLSearchParams(queryString);
        this._timingType = params.get("type");
        this._timeDisplay = document.getElementById("time-display");
        this._flagPanel = document.getElementById("flag-panel");
        this._flagText = document.getElementById("flag-text");
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
        if(!this._flagOpened) {
            if(data.FlagStatus === "Green" || data.FlagStatus === "GreenHeld") {
                this._flagOpened = true;
                this._flagText.innerText = "Green";
                this._flagPanel.classList.add("flag-green");
            }else if(data.FlagStatus === "YellowWaving") {
                this._flagOpened = true;
                this._flagText.innerHTML = "Caution";
                this._flagPanel.classList.add("flag-caution");
            }else if(data.FlagStatus === "White") {
                this._flagOpened = true;
                this._flagText = "Last Lap";
                this._flagPanel.classList.add("flag-lastlap");
            }

            if(this._flagOpened) {
                this._flagPanel.classList.toggle("flag-hidden");
                setTimeout(this._clearFlagStatus.bind(this), 2000);
            }
        }

        if(this._timingType === "LAP") {
            this._timeDisplay.innerText = `${data.SessionAmount}/${data.AmountLeft} LAPS`;
        } else {
            this._timeDisplay.innerText = `${data.AmountLeft}`;
        }
    }

    _clearFlagStatus() {
        this._flagPanel.classList.toggle("flag-hidden");
        this._flagPanel.classList.remove("flag-green");
        this._flagPanel.classList.remove("flag-caution");
        this._flagPanel.classList.remove("flag-lastlap");
        this._flagOpened = false;
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}