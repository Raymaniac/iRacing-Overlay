class Classment {

    _cars = [];
    _carMap = new Map();
    _classes = [];
    _isWritten = false;

    updateCars(cars) {
        if(this._carMap.size === 0) {
            // First init. Save all
            cars.forEach(car => {
                this._addCar(car);
            });
            this._isWritten = true;
        } else {
            // Just update new cars
            /*cars.forEach(newCar => {
                if(!this._cars.includes(savedCar => savedCar.ID === newCar.CarIdx)) {
                    this._addCar(newCar);
                }
            });*/
            cars.forEach(newCar => {
                if(!this._carMap.has(newCar.CarIdx)) {
                    this._addCar(newCar);
                }
            });
        }
    }

    updatePosition(carID, position) {
        let car = this._carMap.get(carID);
        if(car) {
            car.Position = position;
        }
    }

    updateClassPosition(carID, position) {
        let car = this._carMap.get(carID);
        if(car) {
            car.ClassPosition = position;
        }
    }

    getNumberOfClasses() { return this._classes.length; }
    getClasses() {return this._classes;}

    getClassmentDataArray(orderByPosition) {
        let data = [];

        let iterator = this._carMap.values();
        
        let nextObject = iterator.next();
        while(!nextObject.done){
            let car = nextObject.value;
            data.push({
                ID: car.ID,
                CarClass: car.Class,
                TeamName: car.TeamName,
                TeamShort: car.TeamShortName,
                DriverShort: car.DriverShortName,
                Position: car.Position
            });

            nextObject = iterator.next();
        }

        if(orderByPosition) {
            data.sort(sortByPosition);
        }

        return data;
    }

    getClassIDForCar(carID) {
        return this._carMap.get(carID).Class;
    }

    getCarsInClass(classID) {
        let data = [];

        let iterator = this._carMap.values();
        
        let nextObject = iterator.next();

        while(!nextObject.done) {
            let car = nextObject.value;

            if(car.Class === classID) {
                data.push({
                    ID: car.ID,
                    CarClass: car.Class,
                    TeamName: car.TeamName,
                    TeamShort: car.TeamShortName,
                    DriverShort: car.DriverShortName,
                    Position: car.Position
                }); 
            }

            nextObject = iterator.next();
        }


        return data;
    }

    getCar(carID) { return this._carMap.get(carID); }

    getLowestPositionInClass(classID) {
        let lowestPosition = 1;

        let iterator = this._carMap.values();
        
        let nextObject = iterator.next();

        while(!nextObject.done) {
            let car = nextObject.value;
            
            if(car.Class === classID && car.Position > lowestPosition) {
                lowestPosition = car.Position;
            }   

            nextObject = iterator.next();
        }
        return lowestPosition;
    }

    isInitialized() { return this._isWritten; }

    _addCar(car) {
        let carBuffer = new Car();
        carBuffer.ID = car.CarIdx;
        carBuffer.Class = car.CarClassID;
        carBuffer.Type = car.CarScreenName;
        carBuffer.Number = car.CarNumber;
        carBuffer.TeamID = car.TeamID;
        carBuffer.TeamName = car.TeamName;
        carBuffer.TeamShortName = this._generateNameShort(carBuffer.TeamName);
        carBuffer.DriverID = car.UserID;
        // Anonymize driver name
        if(carBuffer.DriverID === process.env.REPLACE_DRIVER_ID && process.env.REPLACE_DRIVER_NAME === "true") {
            carBuffer.DriverName = process.env.PLAYER_REPLACEMENT_NAME || car.UserName;
            //Anonymize Team Name
            if(carBuffer.TeamID !== 0) {
                carBuffer.TeamName = driver.TeamName;
            }else {
                carBuffer.TeamName = "My Team"
            }
            carBuffer.TeamShortName = this._generateNameShort(carBuffer.TeamName);
        } else {
            carBuffer.Drivername = car.UserName;
        }
        carBuffer.DriverShortName = this._generateNameShort(carBuffer.DriverName);
        this._cars.push(carBuffer);
        this._carMap.set(carBuffer.ID, carBuffer);
    
        this._updateCarClasses(carBuffer.class);
    }

    _updateCarClasses(carClass) {
        if(this._classes.length === 0) {
            this._classes.push(carClass);
        }else {
            let found = false;
            this._classes.forEach(classID => {
                if(classID === carClass) {
                    found = true;
                    return;
                }
            });

            if(!found) {
                this._classes.push(carClass);
            }
        }
    }

    _generateNameShort(fullName) {
        return "ABC";
    }
}

class Car {
    ID;
    Number;
    Class;
    Type;
    DriverID;
    DriverName;
    DriverShortName;
    TeamName;
    TeamShortName;
    Position;
    ClassPosition;
}

function sortByPosition(carA, carB) {
    if(carA.Position < carB.Position) {
        return -1;                          // A comes first
    }

    if(carA.Position > carB.Position) {
        return 1;                           // B comes first
    }

    return 0;                               // current order stays
}

module.exports = {
    Classment : Classment
}