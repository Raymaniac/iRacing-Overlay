class WidgetController {
    IMG_BASE_PATH = location.origin + "/resources/images";
    
    _position;
    _class;
    _classDisplay;
    _carNumber;
    _currentDriver;
    _teamName;
    _carName;
    _addInfoDisplay;
    _intervall = null;

    _request = null;

    constructor() {
        
        this._position = document.getElementById("position");
        this._class = document.getElementById("class");
        this._classDisplay = document.getElementById("class-display");
        this._carNumber = document.getElementById("car-number");
        this._currentDriver = document.getElementById("current-driver");
        this._teamName = document.getElementById("team-name");
        this._carName = document.getElementById("car-name");
        this._addInfoDisplay = document.getElementById("add-info-display");
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
                      this._intervall = setInterval(this._fetchUpdate.bind(this), 1000);
                    }
                }
            };
        }
        
        this._request.open("GET", location.origin + "/data/position")
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {
        this._position.innerText = data.Position;
        this._class.innerText = data.Class;
        this._classDisplay.style.backgroundColor = data.ClassColor;
        this._carNumber.innerText = `${data.CarNumber}#`;
        this._currentDriver.innerText = data.CurrentDriver
        this._teamName.innerText = data.TeamName;
        this._carName.innerText = data.CarName;
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}