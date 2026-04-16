# 🔧 Résolution du Problème de Login - Toa Mairie

## 🎯 Problème Rencontré

**Symptôme:** "Login failed" même avec les identifiants corrects
```
Email: admin@mairie.mg
Password: Admin@123
---
Erreur: Invalid credentials
```

## 🔍 Cause Racine

Le problème venait de **deux issues** dans le système d'authentification:

### Issue 1: Utilisateurs pas créés en base de données
Les identifiants de démo **n'avaient jamais été insérés** dans la base de données SQLite. Même si le fichier `backend/src/seeds/index.js` existait, le seed **n'avait jamais été exécuté**.

### Issue 2: Getter du password qui retournait `undefined`
Le modèle User avait:
```javascript
password: {
  type: DataTypes.STRING,
  allowNull: false,
  get() {
    return undefined; // ← Ce getter causait le problème!
  }
}
```

Quand on essayait de vérifier le mot de passe avec `bcrypt.compare()`, il tentait de comparer :
```
bcrypt.compare("Admin@123", undefined)
↓
Error: "Illegal arguments: string, undefined"
```

## ✅ Solutions Appliquées

### Étape 1: Corriger le modèle User
Supprimer le getter qui retournait `undefined`:

```javascript
// ❌ AVANT
password: {
  type: DataTypes.STRING,
  allowNull: false,
  get() {
    return undefined;
  }
}

// ✅ APRÈS
password: {
  type: DataTypes.STRING,
  allowNull: false
}
```

Et modifier la méthode `comparePassword`:
```javascript
User.prototype.comparePassword = async function(password) {
  // Récupérer le hash stocké depuis dataValues
  const hashedPassword = this.dataValues.password || this.password;
  if (!hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};
```

### Étape 2: Supprimez l'ancienne base de données
```bash
rm backend/toa_mairie.db
```

### Étape 3: Redémarrez le backend
Le backend recréera la base de données avec les nouvelles tables.

### Étape 4: Exécutez le seed
```bash
cd backend
npm run seed
```

### Étape 5: Testez la connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mairie.mg","password":"Admin@123"}'
```

## ✅ Résultat Actuel

Tous les identifiants fonctionnent maintenant:

```
✅ admin@mairie.mg / Admin@123 (ADMIN)
✅ agent@mairie.mg / Agent@123 (FIELD_AGENT)
✅ chief@mairie.mg / Chief@123 (SERVICE_HEAD)
✅ secretary@mairie.mg / Secretary@123 (SECRETARY)
✅ director@mairie.mg / Director@123 (DIRECTOR)
```

---

## 📋 Procédure de Dépannage pour de Futurs Problèmes

Si vous rencontrez à nouveau **"Login failed"**, voici la procédure:

### ✓ Étape 1: Vérifier que le backend tourne
```bash
curl http://localhost:5000/health
```

### ✓ Étape 2: Vérifier que les utilisateurs existent
```bash
# Réappliquer le seed
cd backend && npm run seed
```

### ✓ Étape 3: Réinitialiser complètement (si nécessaire)
```bash
# À partir de la racine du projet
rm backend/toa_mairie.db
cd backend
npm start
# (dans un autre terminal)
npm run seed
```

### ✓ Étape 4: Tester un identifiant
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mairie.mg","password":"Admin@123"}' | jq .
```

Doit retourner:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "user": { ... }
}
```

---

## 🎁 Ce qui a été corrigé

1. ✅ Fichier modèle User (`backend/src/models/User.js`)
   - Suppression du getter `password` qui retournait `undefined`
   - Amélioration de `comparePassword()` pour accéder au hash stocké

2. ✅ Fichier seed amélioré (`backend/src/seeds/index.js`)
   - Ajout de tous les rôles d'utilisateurs
   - Meilleurs messages de log
   - Gestion des utilisateurs déjà existants

3. ✅ Base de données réinitialisée
   - Tables créées proprement
   - Utilisateurs de démo insérés avec mots de passe correctement hachés

---

## 💡 Prévention pour l'Avenir

Pour éviter ce problème:

1. **Toujours exécuter le seed après le premier démarrage**
   ```bash
   npm run seed
   ```

2. **Ne jamais modifier le getter de password sans tester**

3. **Vérifier que bcrypt.compare() a bien accès au hash**

4. **Garder un document de débogage** (comme celui-ci!)

---

## 📝 Résumé pour les Développeurs

| Aspect | Avant | Après |
|--------|-------|-------|
| **Utilisateurs créés** | ❌ Non | ✅ Oui |
| **Password getter** | ❌ Retournait `undefined` | ✅ Supprimé |
| **comparePassword()** | ❌ Recevait `undefined` | ✅ Accès à dataValues |
| **Connexion** | ❌ Échouait | ✅ Fonctionne |
| **Tous les rôles** | ❌ Seulement admin | ✅ 5+ rôles |

---

**Date de résolution:** 16 avril 2026  
**Applications affectées:** Toa Mairie  
**Statut:** ✅ RÉSOLU
