# 🚀 Quickstart - Toamasina Mairie

Démarrez l'application en 5 minutes !

## ✅ Prérequis

- **Node.js** 18+ : [https://nodejs.org](https://nodejs.org)
- **PostgreSQL** 12+ : [https://www.postgresql.org](https://www.postgresql.org)
- **Docker** (optionnel) : [https://www.docker.com](https://www.docker.com)

## 🐳 Option 1 : Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Attendre que PostgreSQL soit prêt (environ 10 secondes)
docker-compose logs postgres

# Seeder la base de données (optionnel)
docker exec toa-mairie-backend npm run seed
```

Accédez à:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Base de données**: localhost:5432

Identifiants par défaut:
- **Email**: admin@toamasina.local
- **Mot de passe**: Admin123!

## 🖥️ Option 2 : Installation Locale

### Backend Setup

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env (copie from .env.example)
cp .env.example .env

# Éditer .env avec vos paramètres PostgreSQL :
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=toa_mairie_db
# DB_USER=postgres
# DB_PASSWORD=votre_mot_de_passe

# Démarrer le serveur
npm run dev
```

Le backend démarre sur **http://localhost:5000**

### Frontend Setup

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Démarrer le serveur de développement
npm start
```

Le frontend démarre sur **http://localhost:3000**

## 📝 Variables d'Environnement Essentielles

### Backend (.env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toa_mairie_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🗄️ Configuration PostgreSQL

Si PostgreSQL n'est pas en Docker, créez la base manuellement :

```bash
psql -U postgres

CREATE DATABASE toa_mairie_db;
\q
```

## 🧪 Test l'API

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@toamasina.local",
    "password": "Admin123!"
  }'
```

### Lister les Projets

```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 Scripts Utiles

### Backend
```bash
npm run dev       # Mode développement avec hot reload
npm test          # Lancer les tests
npm run migrate   # Exécuter les migrations
npm run seed      # Seeder la base de données
```

### Frontend
```bash
npm start         # Mode développement
npm run build     # Build production
npm test          # Lancer les tests
```

## 🐛 Troubleshooting

### Erreur de connexion PostgreSQL
```
Vérifiez que PostgreSQL est démarré
Vérifiez les paramètres de .env
Vérifiez que la base de données existe
```

### Port 5000 déjà utilisé
```bash
# Changer le port dans .env
PORT=5001
```

### Port 3000 déjà utilisé
```bash
# Spécifier un port différent
PORT=3001 npm start
```

### Erreur de migration
```bash
# Réinitialiser la base
dropdb toa_mairie_db
createdb toa_mairie_db
npm run migrate
```

## 📚 Documentation

- [Architecture Complète](./docs/README.md)
- [API Reference](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)

## 🎯 Prochaines Étapes

1. ✅ Démarrer l'application
2. ✅ Se connecter avec les identifiants admin
3. ✅ Créer un projet
4. ✅ Créer une tâche
5. ✅ Explorer les dashboards

## 💬 Support

Pour toute question, consultez la documentation complète ou ouvrez une issue.

---

**Bienvenue dans Toamasina Mairie! 🏛️**
