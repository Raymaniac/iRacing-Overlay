const BaseController = require("./BaseController.js");

class PositionController extends BaseController {

    constructor(dataProvider) { super(dataProvider); }

    handleUIRequest(req, res) {
        res.render("position/positionpanel");
    }

    handleDataRequest(req, res) {
        let data = this.getDataProvider().getPositionInfo();
        return res.json(data);
    }
}

// Set Default Export
module.exports = PositionController;