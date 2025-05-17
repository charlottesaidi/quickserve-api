# QuickServe - Architecture Microservices

Ce projet implémente l'architecture microservices décrite dans le cahier des charges pour la refonte de l'application QuickServe.

## Architecture

L'application est composée des éléments suivants :

1. **API Gateway** : Point d'entrée unique pour l'ensemble des services, gère l'authentification et le routage.
2. **Service Utilisateurs** : Gestion des comptes, authentification et profils utilisateurs.
3. **Service Géolocalisation** : Suivi en temps réel des prestataires et calcul de proximité.
4. **Service Prestations** : Gestion des demandes de services, des statuts et des évaluations.
5. **Service Paiement** : Traitement des paiements sécurisés via Stripe.
6. **Event Bus** : Communication asynchrone entre les services via RabbitMQ.
7. **PostgreSQL** : Base de données relationnelle pour le stockage persistant.

## Technologies utilisées

- **Backend** : Node.js avec Express
- **Base de données** : PostgreSQL
- **Messagerie** : RabbitMQ
- **Déploiement** : Docker et Docker Compose
- **Paiement** : Integration avec Stripe
- **Communication temps réel** : Socket.IO

## Structure du projet

```
quickserve-microservices/
├── api-gateway/                 # API Gateway - Port 3000
├── users-service/               # Service Utilisateurs - Port 3001
├── geolocation-service/         # Service Géolocalisation - Port 3002
├── services-service/            # Service Prestations - Port 3003
├── payment-service/             # Service Paiement - Port 3004
├── initdb/                      # Scripts d'initialisation pour PostgreSQL
│   └── create-databases.sh      # Script de création des bases de données
└── docker-compose.yml           # Configuration Docker Compose
```

## Démarrage

### Prérequis

- Docker et Docker Compose installés
- Compte Stripe (pour les fonctionnalités de paiement)

### Configuration

1. Clonez le dépôt :
   ```
   git clone https://github.com/votre-depot/quickserve-microservices.git
   cd quickserve-microservices
   ```

2. Configurez les variables d'environnement dans le fichier `docker-compose.yml` ou créez un fichier `.env` à la racine du projet.

3. Pour les tests, vous pouvez utiliser Stripe en mode test en générant des clés API de test dans votre tableau de bord Stripe.

### Lancement

Lancez l'ensemble des services avec :

```
docker-compose up -d
```

Pour suivre les logs :

```
docker-compose logs -f
```

Pour arrêter tous les services :

```
docker-compose down
```

## Points d'accès API

L'API est accessible via le point d'entrée unique de l'API Gateway sur `http://localhost:3000/api`.

### Authentification

- `POST /api/users/register` : Inscription d'un utilisateur
- `POST /api/users/login` : Connexion et génération de JWT

### Utilisateurs

- `GET /api/users/profile` : Obtenir le profil de l'utilisateur connecté
- `PUT /api/users/profile` : Mettre à jour le profil

### Prestations

- `GET /api/categories` : Liste des catégories de services
- `POST /api/services` : Créer une nouvelle demande de prestation
- `GET /api/services/available` : Liste des prestations disponibles (pour prestataires)
- `GET /api/clients/services` : Liste des prestations du client
- `GET /api/providers/services` : Liste des prestations du prestataire

### Géolocalisation

- `GET /api/providers/:id/location` : Dernière position d'un prestataire
- `GET /api/providers/nearby` : Prestataires à proximité
- `GET /api/services/:id/location-history` : Historique des positions pour un service

### Paiement

- `POST /api/payment-intents` : Créer une intention de paiement
- `POST /api/payments/confirm` : Confirmer un paiement
- `GET /api/payment-methods` : Liste des méthodes de paiement d'un client

## Communication en temps réel

Le service de géolocalisation expose des événements Socket.IO pour une communication en temps réel :

- Événement `provider_location_update` : Mise à jour de la position d'un prestataire
- Événement `update_location` : Envoyé par les prestataires pour mettre à jour leur position

## Déploiement en production

Pour un déploiement en production, il est recommandé d'utiliser :

1. Un orchestrateur Kubernetes pour la gestion des conteneurs
2. Des instances PostgreSQL et RabbitMQ managées (Azure Database, RabbitMQ as a Service)
3. Un service de journalisation centralisé (ELK, Prometheus/Grafana)
4. Des certificats SSL pour toutes les communications

## Maintenance et développement

Pour ajouter un nouveau microservice :

1. Créer un nouveau dossier pour le service avec la structure appropriée
2. Ajouter la configuration correspondante dans `docker-compose.yml`
3. Mettre à jour l'API Gateway pour router les requêtes vers ce nouveau service
4. S'assurer que le service peut se connecter à l'Event Bus (RabbitMQ) pour la communication asynchrone