# Social App - Application Mobile Étudiante

Bienvenue dans le projet **Social App**, une application mobile sociale construite avec **React Native**, **Expo** et **Firebase**. Cette application permet aux étudiants de se connecter, de partager des posts et de discuter en temps réel.

## 🚀 Fonctionnalités

- **Authentification** : Inscription et connexion sécurisées via Firebase Auth.
- **Fil d'actualité** : Partagez des posts avec la communauté.
- **Profil Utilisateur** : Personnalisez votre profil et gérez vos amis.
- **Messagerie Instantanée** : Discutez en temps réel avec vos amis.
- **Notifications** : Restez informé des interactions.

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version LTS recommandée)
- [Expo Go](https://expo.dev/client) sur votre appareil mobile (Android ou iOS)

## 📦 Installation

1.  **Cloner le projet** :
    ```bash
    git clone https://github.com/votre-utilisateur/social-app.git
    cd social-app
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    # ou
    yarn install
    ```

## ⚙️ Configuration Firebase (IMPORTANT)

Pour que l'application fonctionne, vous devez configurer votre propre projet Firebase.

### 1. Créer un projet Firebase
Rendez-vous sur la [Console Firebase](https://console.firebase.google.com/) et créez un nouveau projet.

### 2. Configuration Web (Pour l'application Expo)
1.  Dans votre projet Firebase, ajoutez une nouvelle application **Web** (`</>`).
2.  Copiez l'objet de configuration (`firebaseConfig`).
3.  Ouvrez le fichier `firebaseConfig.ts` à la racine du projet.
4.  Remplacez la constante `firebaseConfig` par vos propres identifiants :

    ```typescript
    // firebaseConfig.ts
    const firebaseConfig = {
        apiKey: "VOTRE_API_KEY",
        authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
        projectId: "VOTRE_PROJECT_ID",
        storageBucket: "VOTRE_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "VOTRE_SENDER_ID",
        appId: "VOTRE_APP_ID",
        measurementId: "VOTRE_MEASUREMENT_ID"
    };
    ```

### 3. Configuration Android (Optionnel pour Expo Go, Requis pour Build Native)
Si vous prévoyez de compiler l'application pour Android ou d'utiliser des fonctionnalités natives avancées :
1.  Ajoutez une application **Android** dans la console Firebase.
2.  Téléchargez le fichier `google-services.json`.
3.  Placez ce fichier à la racine du projet (ou à l'emplacement configuré dans `app.json`).

> **Note** : Assurez-vous d'activer **Firebase Authentication** (Email/Password) et **Cloud Firestore** dans la console Firebase.

## 📱 Lancer l'application

Une fois la configuration terminée, lancez le serveur de développement :

```bash
npx expo start
```

- Scannez le QR code avec l'application **Expo Go** (Android) ou l'appareil photo (iOS).
- Appuyez sur `a` pour ouvrir sur un émulateur Android.
- Appuyez sur `w` pour ouvrir dans le navigateur web.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une "Issue" ou une "Pull Request".

---
Développé avec ❤️ utilisant [Expo](https://expo.dev) et [Firebase](https://firebase.google.com).
