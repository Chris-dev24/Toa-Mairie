# ⚡ QUICK START - Toa Mairie

## 🎯 Pour démarrer immédiatement

### Vos identifiants de démo:
```
Email:    admin@mairie.mg
Password: Admin@123
```

### Démarrage facile (choisissez une option):

**Option 1: Script automatisé (Recommandé)**
```bash
cd /workspaces/Toa-Mairie
./start-app.sh          # Linux/Mac
# OU
start-app.bat           # Windows
```

**Option 2: Manuellement (2 terminaux)**
```bash
# Terminal 1
cd /workspaces/Toa-Mairie/backend
npm start

# Terminal 2
cd /workspaces/Toa-Mairie/frontend
npm start
```

**Application:** http://localhost:3000

---

## 🖥️ Installer sur votre ordinateur

```bash
# 1. Cloner
git clone https://github.com/Chris-dev24/Toa-Mairie.git
cd Toa-Mairie

# 2. Installer Node.js
# Téléchargez depuis https://nodejs.org/

# 3. Installer les dépendances
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Démarrer
./start-app.sh          # ou start-app.bat sur Windows
```

**Accès:** http://localhost:3000

---

## 🆘 Problèmes?

| Problème | Solution |
|----------|----------|
| Port 5000 en cours d'utilisation | `lsof -i :5000` puis `kill -9 <PID>` |
| Node pas installé | https://nodejs.org/ |
| "Cannot find module" | `cd backend && npm install` + `cd frontend && npm install` |
| CORS error | Vérifiez votre `.env` |
| Base de données corrompue | `rm backend/toa_mairie.db` puis redémarrez |

---

## 📚 Documentation Complète

- [DEMARRAGE.md](DEMARRAGE.md) - Guide détaillé de démarrage
- [RUNNING_NOW.md](RUNNING_NOW.md) - État et statut actuel
- [README.md](README.md) - Vue d'ensemble du projet

---

**Status:** ✅ Application prête!
