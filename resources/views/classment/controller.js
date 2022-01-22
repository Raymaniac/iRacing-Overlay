class Controller {
    _positionPanel;
    _cars = [];

    constructor() {
        this._positionPanel = document.getElementById("positions-panel");
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
        
        this._request.open("GET", location.origin + "/data/classment")
        this._request.setRequestHeader('Content-Type', 'application/json')
        this._request.send();
        
    }

    _displayValues(data) {
        if(this._cars.length === 0) {
            this._fillCarTable(data);
        }else {

        }
    }

    _fillCarTable(drivers) {
        drivers.forEach(driver => {
            let positionItem = new PositionItem(driver.CarID, driver.ClassColor, driver.ShortName);
            positionItem
            this._cars.push(positionItem);
        });
    }
}

class PositionItem {
    _visualElement;
    _positionElement;
    _classColorElement;
    _driverShortElement;
    _carId;
    constructor(carID, classColor, driverShort) {
        this._carID = carID;
        // Create main element
        this._visualElement = document.createElement("div");
        this._visualElement.classList.add("position-item");
        // Create position element
        this._positionElement = document.createElement("div");
        this._positionElement.classList.add("position-number");
        this._visualElement.appendChild(this._positionElement);

        this._classColorElement = document.createElement("div");
        this._classColorElement.classList.add("class-color-panel");
        this._classColorElement.style.backgroundColor = classColor;
        this._visualElement.appendChild(this._classColorElement);

        this._driverShortElement = document.createElement("div");
        this._driverShortElement.classList.add("driver-short");
        this._driverShortElement.innerText = driverShort;
        this._visualElement.appendChild(this._driverShortElement);

    }

    getVisualElement() { return this._visualElement; }

    updateVisualPosition(position) {
        this._positionElement.innerText = position;
    }

    updateDriver(driverShort) {
        this._driverShortElement.innerText = driverShort; 
    }
}

// ====== Init Controller

window.onload = () => {
    const controller = new WidgetController();
}