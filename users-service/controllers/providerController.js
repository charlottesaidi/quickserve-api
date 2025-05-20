const ProviderModel = require('../models/providerModel');

class ProviderController {
  async getAllProviders (req, res, next) {
    try {
      const providers = await ProviderModel.getAllProviders();
      res.status(200).json({ providers });
    } catch (error) {
      next(error);
    }
  } 
}

module.exports = new ProviderController();