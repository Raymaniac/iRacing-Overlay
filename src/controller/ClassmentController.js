const BaseController = require("./BaseController.js");
const DefaultDisplayCountPerClass = 10;

class ClassmentController extends BaseController {
    _classmentApi = null;
    

    constructor(dataProvider) {
        super(dataProvider);
        this._classmentApi = this.getDataProvider().getClassmentApi();
    }

    handleUIRequest(req, res) {
        console.log(req.query);
        let positionsPerClass = (Number)(req.query.displayCount || DefaultDisplayCountPerClass);
        let positionIDs = [];

        //let iterations = req.query.debug === "true" ? 2 : this._classmentApi.getNumberOfClasses();
        let iterations = 1;
        let panelWidth = req.query.width || 150;

        for(let i = 1; i <= positionsPerClass * iterations; i++) {
            positionIDs.push("pos-" + i);
        }

        res.render("classment/classmentpanel", {
            PositionIDs: positionIDs,
            PanelWidth: panelWidth
        });
    }

    handleDataRequest(req, res) {
        let returnData = {
            classment: []
        };
        let ownCar = this._classmentApi.getCar(this.getDataProvider().getOwnCarID());
        let totalClassment = this._classmentApi.getClassmentDataArray(true);

        let displayedCars = (Number)(req.query.displayCount || 20);
        let driverCarOutOfRange = false;
        if(ownCar.Position > displayedCars) {
            displayedCars -= 1;
            driverCarOutOfRange = true;
        }

        // In team events, display the teams name. TeamName for the full name, TeamShort for 3 letters generated
        let isTeamEvent = this.getDataProvider().getPositionInfo().IsTeamEvent;
        for(let i = 0; i < displayedCars; i++) {
            returnData.classment.push({ 
                ID: totalClassment[i].ID, 
                Position: totalClassment[i].Position, 
                Class: totalClassment[i].CarClass,
                ClassColor: this.getDataProvider().getClassColor(totalClassment[i].CarClass),
                DisplayText: isTeamEvent ? totalClassment[i].TeamName : totalClassment[i].DriverShort
            }); 
        }
        // Add the driver if necessary
        if(driverCarOutOfRange) {
            returnData.classment.push({ 
                ID: ownCar.ID, 
                Position: ownCar.Position, 
                Class: ownCar.CarClass,
                ClassColor: this.getDataProvider().getClassColor(ownCar.CarClass),
                DisplayText: isTeamEvent ? ownCar.TeamName : ownCar.DriverShort
            });
        }
/*        // In team events, display the teams name. TeamName for the full name, TeamShort for 3 letters generated
        if(this.getDataProvider().getPositionInfo().IsTeamEvent) {
            classmentData.forEach(data => { 
                returnData.classment.push({ 
                    ID: data.ID, 
                    Position: data.Position, 
                    Class: data.CarClass,
                    ClassColor: this.getDataProvider().getClassColor(data.CarClass),
                    DisplayText: data.TeamName
                }); 
            });
        } else {
            classmentData.forEach(data => { 
                returnData.classment.push({ 
                    ID: data.ID, 
                    Position: data.Position, 
                    Class: data.CarClass,
                    ClassColor: this.getDataProvider().getClassColor(data.CarClass),
                    DisplayText: data.DriverShort
                }); 
            });
        }
*/
        return res.json(returnData);
    }
}

module.exports = ClassmentController;