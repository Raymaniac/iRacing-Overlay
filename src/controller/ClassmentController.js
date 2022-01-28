const BaseController = require("./BaseController.js");

class ClassmentController extends BaseController {
    constructor(dataProvider) {super(dataProvider);}

    handleUIRequest(req, res) {
        let positionsPerClass = req.params.DisplayCount || 10;
    
        res.render("classment/classmentpanel", {
            DisplayCount: positionsPerClass
        });
    }

    handleDataRequest(req, res) {
        return super.handleDataRequest(req, res);
    }
}

module.exports = ClassmentController;