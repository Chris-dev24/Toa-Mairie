# 👥 Gestion des Utilisateurs - Toa Mairie

## 📋 Table des matières
1. [Identifiants de démo](#identifiants-de-démo)
2. [Modifier les identifiants](#modifier-les-identifiants)
3. [Créer de nouveaux utilisateurs](#créer-de-nouveaux-utilisateurs)
4. [Changer son mot de passe](#changer-son-mot-de-passe)
5. [Gérer les utilisateurs en base de données](#gérer-les-utilisateurs-en-base-de-données)

---

## 🔐 Identifiants de Démo

### Administrateur
```
Email:    admin@mairie.mg
Password: Admin@123
Rôle:     ADMIN (Accès complet à tous les services)
```

### Agent de Terrain
```
Email:    agent@mairie.mg
Password: Agent@123
Rôle:     FIELD_AGENT (Gestion des formulaires et tâches)
```

### Chef de Service
```
Email:    chief@mairie.mg
Password: Chief@123
Rôle:     SERVICE_HEAD (Gestion des projets)
```

### Secrétaire
```
Email:    secretary@mairie.mg
Password: Secretary@123
Rôle:     SECRETARY (Gestion administrative)
```

### Directeur
```
Email:    director@mairie.mg
Password: Director@123
Rôle:     DIRECTOR (Vue d'ensemble complète)
```

---

## 🔧 Modifier les Identifiants

### **Méthode 1: Modifier le fichier seed (Recommandé)**

Éditer `/backend/src/seeds/index.js`:

```javascript
const demoUsers = [
  {
    email: 'votre@email.mg',                    // ← Changez l'email
    firstName: 'Votre',                         // ← Changez le prénom
    lastName: 'Nom',                            // ← Changez le nom
    password: 'VotreMotDePasse@123',           // ← Changez le mot de passe
    role: 'ADMIN'                               // ← Changez le rôle
  },
  // ... autres utilisateurs
];
```

### **Puis réappliquer le seed:**

```bash
# Supprimer la base de données existante
rm backend/toa_mairie.db

# Lancer le seed
cd backend
npm run seed

# Relancer l'application
npm start
```

### **Rôles disponibles:**
- `ADMIN` - Administrateur système
- `DIRECTOR` - Directeur
- `SERVICE_HEAD` - Chef de service
- `SECRETARY` - Secrétaire
- `FIELD_AGENT` - Agent de terrain
- `COMMUNICATION` - Responsable communication

---

## ➕ Créer de Nouveaux Utilisateurs

### **Option 1: Via l'interface (En tant qu'admin)**

1. Connectez-vous avec `admin@mairie.mg`
2. Allez dans **Gestion des utilisateurs**
3. Cliquez sur **Créer un nouvel utilisateur**
4. Remplissez le formulaire:
   - Email
   - Prénom
   - Nom
   - Rôle
   - Mot de passe temporaire

### **Option 2: Via l'API**

```bash
# Générer un token d'authentification
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mairie.mg","password":"Admin@123"}' \
  | jq -r '.token')

# Créer un nouvel utilisateur
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@mairie.mg",
    "firstName": "Nouveau",
    "lastName": "Utilisateur",
    "password": "SecurePassword@123",
    "role": "FIELD_AGENT",
    "department": "Services Techniques"
  }'
```

### **Option 3: Directement en base de données**

```bash
# Accéder à la base de données SQLite
sqlite3 backend/toa_mairie.db

# Voir tous les utilisateurs
SELECT email, firstName, lastName, role FROM users;

# Insérer un nouvel utilisateur
INSERT INTO users (
  id, email, firstName, lastName, password, role, 
  createdAt, updatedAt
) VALUES (
  randomblob(16),
  'test@mairie.mg',
  'Test',
  'Utilisateur',
  '[hash du mot de passe]',
  'FIELD_AGENT',
  datetime('now'),
  datetime('now')
);
```

---

## 🔑 Changer son Mot de Passe

### **Via l'interface**
1. Connectez-vous
2. Cliquez sur **Profil** (coin supérieur droit)
3. Cliquez sur **Changer le mot de passe**
4. Entrez:
   - Ancien mot de passe
   - Nouveau mot de passe
   - Confirmez le nouveau mot de passe

### **Via l'API**
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "AncienMotDePasse@123",
    "newPassword": "NouveauMotDePasse@123"
  }'
```

---

## 🗄️ Gérer les Utilisateurs en Base de Données

### **Connexion à SQLite**
```bash
cd backend
sqlite3 toa_mairie.db
```

### **Commandes utiles**

**Voir tous les utilisateurs:**
```sql
SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users;
```

**Chercher un utilisateur spécifique:**
```sql
SELECT * FROM users WHERE email = 'admin@mairie.mg';
```

**Désactiver un utilisateur:**
```sql
UPDATE users SET isActive = 0 WHERE email = 'test@mairie.mg';
```

**Réactiver un utilisateur:**
```sql
UPDATE users SET isActive = 1 WHERE email = 'test@mairie.mg';
```

**Supprimer un utilisateur:**
```sql
DELETE FROM users WHERE email = 'test@mairie.mg';
```

**Voir les détails d'un utilisateur:**
```sql
SELECT * FROM users WHERE email = 'admin@mairie.mg';
```

---

## 📊 Exemple Complet de Modification

### Scénario: Vous voulez créer 3 nouveaux utilisateurs de démo

**Étape 1:** Éditer `backend/src/seeds/index.js`

```javascript
const demoUsers = [
  {
    email: 'directeur@toamasina.mg',
    firstName: 'Jean',
    lastName: 'Rakoto',
    password: 'Directeur@2026',
    role: 'DIRECTOR'
  },
  {
    email: 'chef.technique@toamasina.mg',
    firstName: 'Marie',
    lastName: 'Ramirez',
    password: 'ChefTech@2026',
    role: 'SERVICE_HEAD'
  },
  {
    email: 'agent.terrain@toamasina.mg',
    firstName: 'Paul',
    lastName: 'Durand',
    password: 'AgentTerrain@2026',
    role: 'FIELD_AGENT'
  }
];
```

**Étape 2:** Réappliquer le seed

```bash
# Supprimer l'ancienne base
rm backend/toa_mairie.db

# Lancer le seed
cd backend
npm run seed

# Redémarrer
npm start
```

**Étape 3:** Tester les connexions

```
directeur@toamasina.mg / Directeur@2026
chef.technique@toamasina.mg / ChefTech@2026
agent.terrain@toamasina.mg / AgentTerrain@2026
```

---

## ⚠️ Consignes de Sécurité

✅ **À FAIRE:**
- Utiliser des mots de passe forts (minimum 8 caractères, avec majuscules, minuscules, chiffres, caractères spéciaux)
- Changer le mot de passe admin en production
- Utiliser HTTPS en production
- Ne pas commiter les mots de passe dans Git

❌ **À ÉVITER:**
- Ne pas utiliser les identifiants de démo en production
- Ne pas laisser le `JWT_SECRET` par défaut
- Ne pas stocker les mots de passe en clair
- Ne pas commiter les fichiers `.env`

---

## 🔐 Réinitialiser Tout (Urgence)

Si vous vous êtes bloqué accidentellement:

```bash
# 1. Supprimer la base de données
rm backend/toa_mairie.db

# 2. Réinitialiser le seed
cd backend
npm run seed

# 3. Redémarrer l'application
npm start

# Vous pouvez te reconnecter avec les identifiants par défaut
```

---

## 📞 Aide Rapide

| Action | Commande |
|--------|----------|
| Créer utilisateurs de démo | `npm run seed` |
| Voir tous les utilisateurs | `sqlite3 backend/toa_mairie.db` puis `SELECT * FROM users;` |
| Modifier les identifiants | Éditer `backend/src/seeds/index.js` |
| Réinitialiser la BD | `rm backend/toa_mairie.db && npm run seed` |
| Changer mot de passe | Via l'interface (Profil > Changer mot de passe) |

---

**Dernière mise à jour:** 16 avril 2026
