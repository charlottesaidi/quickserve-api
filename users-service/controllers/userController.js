const userModel = require('../models/userModel');
const eventService = require('../services/eventService');
const authService = require('../services/authService');

class UserController {
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await userModel.createUser(userData);
      
      // Publier l'événement utilisateur créé
      eventService.publishUserCreated(user);
      
      res.status(201).json({ 
        message: 'Utilisateur créé avec succès',
        user,
      });
    } catch (error) {
      if (error.message === 'Cet email est déjà utilisé') {
        return res.status(409).json({ message: error.message });
      }
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      // Publier l'événement utilisateur connecté
      eventService.publishUserLoggedIn(result.user);
      
      res.status(200).json({
        message: 'Connexion réussie',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      if (error.message === 'Email ou mot de passe incorrect') {
        return res.status(401).json({ message: error.message });
      }
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userModel.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      res.status(200).json({ user });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedUser = await userModel.updateProfile(req.user.id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Publier l'événement profil mis à jour
      eventService.publishUserUpdated(updatedUser);
      
      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async getAllUsers(req, res) {
    try {
      // Vérifier si l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      const users = await userModel.getAllUsers();
      
      res.status(200).json({ users });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new UserController();