const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
  async createUser(userData) {
    const { email, password, firstname, lastname, phone_number, role } = userData;
    
    // Vérifier si l'utilisateur existe déjà
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      throw new Error('Cet email est déjà utilisé');
    }
    
    // Cryptage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Création de l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password, firstname, lastname, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, firstname, lastname, role',
      [email, hashedPassword, firstname, lastname, phone_number, role]
    );
    
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, firstname, lastname, phone_number, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async updateProfile(id, profileData) {
    const { firstname, lastname, phone_number } = profileData;
    
    const result = await pool.query(
      'UPDATE users SET firstname = $1, lastname = $2, phone_number = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, firstname, lastname, phone_number, role',
      [firstname, lastname, phone_number, id]
    );
    
    return result.rows[0];
  }

  async getAllUsers() {
    const result = await pool.query(
      'SELECT id, email, firstname, lastname, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async initializeTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table users initialisée');
  }
}

module.exports = new UserModel();