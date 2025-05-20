const ClientModel = require('../models/clientModel');

class ClientController {
  async getAllClients (req, res, next) {
    try {
      const clients = await ClientModel.getAllClients();
      res.status(200).json({ clients });
    } catch (error) {
      next(error);
    }
  } 
}

module.exports = new ClientController();