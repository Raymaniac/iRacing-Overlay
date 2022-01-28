const BaseController = require("./BaseController.js");

class TimingController extends BaseController {
    constructor(dataProvider) { super(dataProvider) }

    handleUIRequest(req, res) {
        res.render("timing/timingpanel");
    }

    handleDataRequest(req, res) {
        let type = req.query.type;
        let data = this.getDataProvider().getTimingInfo(type);
        return res.json(data);
    }
}

module.exports = TimingController;