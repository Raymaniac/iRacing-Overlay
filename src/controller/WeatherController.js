const BaseController = require("./BaseController.js");

class WeatherController extends BaseController {
    constructor(dataProvider) { super(dataProvider); }

    handleUIRequest(req, res) {
        res.render("weather/weatherpanel");
    }

    handleDataRequest(req, res) {
        let data = this.getDataProvider().getWeatherInfo();
        return res.json(data); 
    }
}

module.exports = WeatherController;