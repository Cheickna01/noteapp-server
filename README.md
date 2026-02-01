# ⚙️ NoteApp - Server (Backend)

L'API REST qui propulse NoteApp, construite avec Node.js et Express.

## ✨ Caractéristiques
- Base de données NoSQL avec MongoDB & Mongoose.
- Sécurité : Hachage de mots de passe avec Bcrypt et authentification JWT.
- Communications : Envoi d'emails transactionnels via l'API Brevo.
- CORS configuré pour autoriser le domaine frontend.

## 🛠️ Installation
1. git clone https://github.com/Cheickna01/noteapp-server.git
2. npm install
3. Créez un fichier .env à la racine :
   env
PORT=
MONGO_URI=
SECRET_TOKEN=
PASSWORD_SECRET_TOKEN=
USER=
PASSWORD=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
BREVO_API_KEY=

Lancez le serveur : node .

🚀 Déploiement
Hébergé sur Railway.
