class Classment {

    _cars = [];
    _isWritten = false;

    initializeCars(cars) {
        cars.forEach(car => {
            let carBuffer = new Car();
            carBuffer.ID = car.CarIdx;
            carBuffer.class = car.CarClassID;
            carBuffer.Type = car.CarScreenName;
            carBuffer.Number = car.CarNumber;
            carBuffer.TeamName = car.TeamName;
            carBuffer.TeamShortName = "NAN";
            carBuffer.DriverID = car.UserID;
            carBuffer.DriverName = car.UserName;
            carBuffer.DriverShortName = "NAN";
            this._cars.push(carBuffer);
        });
        this._isWritten = true;
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
}

module.exports = {
    Classment : Classment
}