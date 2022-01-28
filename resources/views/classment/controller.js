class WidgetController {
    
    _intervall = null;
    _request = null;
    
    _displayCount = 10;
    _items = [];

    constructor() {
        this._initialize();
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
        
        this._request.open("GET", location.origin + "/data/classment?displayCount=" + this._displayCount)
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {
        if(data.classment.length > 0) {
            data.classment.forEach(car => {
                let item = this._items[car.Position];
                item.updateClassColor(car.ClassColor);
                item.updateDisplayText(car.DisplayText);
                if(car.DisplayText.length > 3) {
                    item.setTeamMode(true);
                }else {
                    item.setTeamMode(false);
                }
            });
        }
    }

    _initialize() {
        // URL Query Param = displayCount default auf 10
        let queryString = window.location.search;
        let params = new URLSearchParams(queryString);
        this._displayCount = (Number)(params.get("displayCount") || 10);

        for(let i = 1; i <= this._displayCount; i++) {
            this._items.push(new PositionItem(i, true));
        }
    }
}

class PositionItem {
    _positionNumberElement;
    _classColorLabel;
    _displayTextElement;

    constructor(index, isTeamMode) {
        this._positionNumberElement = document.getElementById("pos-" + index + "-position");
        this._positionNumberElement.innerText = index;
        this._classColorLabel = document.getElementById("pos-" + index + "-class");
        this._displayTextElement = document.getElementById("pos-" + index + "-text");
        this._displayTextElement.innerText = "Kabort Blue " + index;
        this.setTeamMode(isTeamMode);
    }

    updateClassColor(colorStr) {
        this._classColorLabel.style.backgroundColor = colorStr;
    }

    updateDisplayText(text) {
        this._displayTextElement.innerText = text;
    }

    setTeamMode(isTeamMode) {
        if(isTeamMode) {
            this._displayTextElement.classList.replace("driver-label", "team-label");
        } else {
            this._displayTextElement.classList.replace("team-label", "driver-label");
        }
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}