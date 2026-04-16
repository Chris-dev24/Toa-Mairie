# 🚀 IDENTIFIANTS DE DÉMO - Toa Mairie

## 🔐 Accès Rapide

```
┌─────────────────────────────────────────────────────────┐
│ ADMINISTRATEUR                                          │
├─────────────────────────────────────────────────────────┤
│ Email:     admin@mairie.mg                             │
│ Password:  Admin@123                                   │
│ Accès:     Tous les services                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AGENT DE TERRAIN                                        │
├─────────────────────────────────────────────────────────┤
│ Email:     agent@mairie.mg                             │
│ Password:  Agent@123                                   │
│ Accès:     Formulaires, Tâches                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CHEF DE SERVICE                                         │
├─────────────────────────────────────────────────────────┤
│ Email:     chief@mairie.mg                             │
│ Password:  Chief@123                                   │
│ Accès:     Projets, Équipe                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECRÉTAIRE                                              │
├─────────────────────────────────────────────────────────┤
│ Email:     secretary@mairie.mg                         │
│ Password:  Secretary@123                               │
│ Accès:     Documents, Messagerie                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIRECTEUR                                               │
├─────────────────────────────────────────────────────────┤
│ Email:     director@mairie.mg                          │
│ Password:  Director@123                                │
│ Accès:     Vue d'ensemble complète                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Comment Modifier les Identifiants

### Méthode Rapide (Recommandée) - 3 étapes

**1️⃣ Ouvrir le fichier:**
```
/backend/src/seeds/index.js
```

**2️⃣ Trouver la section `demoUsers` et modifier:**
```javascript
{
  email: 'votre-email@mairie.mg',     // ← Changez ici
  password: 'VotreMotDePasse@123',    // ← Et ici
  firstName: 'Votre nom',              // ← Et ici
  role: 'ADMIN'
}
```

**3️⃣ Réappliquer les modifications:**
```bash
# Terminal - à la racine du projet
rm backend/toa_mairie.db
cd backend
npm run seed
npm start
```

**Voilà!** Les nouveaux identifiants fonctionnent 🎉

---

## 🎯 Cas d'Usage Courants

### Créer 3 utilisateurs personnalisés:
```javascript
const demoUsers = [
  {
    email: 'john.doe@mairie.mg',
    firstName: 'John',
    lastName: 'Doe',
    password: 'John@2026',
    role: 'ADMIN'
  },
  {
    email: 'jane.smith@mairie.mg',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'Jane@2026',
    role: 'SERVICE_HEAD'
  },
  {
    email: 'bob.wilson@mairie.mg',
    firstName: 'Bob',
    lastName: 'Wilson',
    password: 'Bob@2026',
    role: 'FIELD_AGENT'
  }
];
```

### Rôles disponibles:
- `ADMIN` - Administrateur système (tous les droits)
- `DIRECTOR` - Directeur (vue complète)
- `SERVICE_HEAD` - Chef de service (gestion projets)
- `SECRETARY` - Secrétaire (gestion administrative)
- `FIELD_AGENT` - Agent de terrain (formulaires et tâches)
- `COMMUNICATION` - Responsable communication

---

## 🪄 Commander pour personnaliser:

Si vous voulez que je crée des identifiants personnalisés, donnez-moi:

```
1. Email préféré: _______________
2. Nom d'utilisateur: _______________
3. Mot de passe: _______________
4. Rôle: _______________
```

Et je le ferai pour vous! 😉

---

## ⚡ Raccourcis Utiles

| Besoin | Solution |
|--------|----------|
| Réinitialiser tout | `rm backend/toa_mairie.db && cd backend && npm run seed` |
| Voir la base de données | `sqlite3 backend/toa_mairie.db` |
| Changer mot de passe après login | Profil → Changer mot de passe |
| Radoucir rapidement | `rm backend/toa_mairie.db` |

---

**L'application utilise:** http://localhost:3000

Toute modification du fichier seed nécessite de :
1. Supprimer `toa_mairie.db`
2. Relancer le seed
3. Redémarrer l'application
