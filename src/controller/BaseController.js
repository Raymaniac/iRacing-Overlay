class BaseController {
    _dataProvider = null;
    
    constructor(dataProvider) {
        this._dataProvider = dataProvider;
    }

    getDataProvider() { return this._dataProvider;}

    handleUIRequest(req, res) {
        // Send empty default response
        return res.json({});
    }

    handleDataRequest(req, res) {
        return res.json({});
    }
}

module.exports = BaseController;