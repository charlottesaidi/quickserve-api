function validateRegister(req, res, next) {
  const { email, password, firstname, lastname, role } = req.body;
  
  // Validation basique des champs requis
  if (!email || !password || !firstname || !lastname || !role) {
    return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
  }
  
  // Validation du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide' });
  }
  
  // Validation du rôle
  if (!['client', 'provider'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide, doit être "client" ou "provider"' });
  }
  
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }
  
  next();
}

function validateProfileUpdate(req, res, next) {
  const { firstname, lastname } = req.body;
  
  if (!firstname || !lastname) {
    return res.status(400).json({ message: 'Le prénom et le nom sont requis' });
  }
  
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate
};