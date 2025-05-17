#!/usr/bin/env node

/**
 * Script pour convertir la spécification OpenAPI de YAML vers JSON
 * 
 * Usage: 
 * node convert-swagger.js
 * 
 * Dépendances:
 * npm install js-yaml fs-extra
 */

const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');

// Chemins des fichiers
const yamlFile = path.join(__dirname, 'swagger.yaml');
const jsonFile = path.join(__dirname, 'swagger.json');

try {
  // Lire le fichier YAML
  console.log(`Lecture du fichier YAML: ${yamlFile}`);
  const yamlContent = fs.readFileSync(yamlFile, 'utf8');
  
  // Convertir YAML en JSON
  console.log('Conversion YAML vers JSON...');
  const jsonContent = yaml.load(yamlContent);
  
  // Écrire le contenu JSON dans un fichier
  console.log(`Écriture du fichier JSON: ${jsonFile}`);
  fs.writeJsonSync(jsonFile, jsonContent, { spaces: 2 });
  
  console.log('Conversion terminée avec succès!');
} catch (error) {
  console.error('Erreur lors de la conversion:', error);
  process.exit(1);
}