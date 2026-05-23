# 🖨️ Remote Printing System

A secure, real-time cloud-based printing platform where users can remotely 
upload documents, make payments, track print status, and collect printed 
documents from nearby print shops.

## 🚀 Features
- User Authentication (Firebase)
- PDF Upload & Page Detection (PDF.js)
- Dynamic Price Calculation
- Queue Management with Token Generation
- Real-Time Status Updates (Firestore)
- Admin Dashboard with Analytics (Chart.js)
- Cloudinary File Storage
- Payment Simulation

## 🛠️ Tech Stack
HTML | CSS | JavaScript | Firebase Auth | Firestore | Cloudinary | PDF.js | Chart.js

## 📸 Screenshots

### 👤 User Dashboard
![User Dashboard](screenshorts/user-dashboard.png)

### 🛠️ Admin Dashboard
![Admin Dashboard](screenshorts/admin-dashboard.png)

### 📊 Analytics
![Analytics](screenshorts/Analytics.png)

### 🧾 Receipt Generation
![Receipt](screenshots/recepit.png)

### 💳 Payment Section
![Payment](screenshots/Payment.png)


## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Pooja-Naik7799/remote-printing-system.git
cd remote-printing-system
```

---

### 2️⃣ Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Go to **Project Settings → General → Your Apps → Web App**
4. Copy your config and create `firebase-config.js`:

```javascript
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
```



---

### 3️⃣ Configure Firestore Rules

Go to **Firebase Console → Firestore Database → Rules** and publish:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /printRequests/{docId} {
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;
      allow read, update: if request.auth != null
                          && request.auth.uid == resource.data.userId;
      allow read, write: if request.auth != null
                         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

---

### 4️⃣ Configure Cloudinary

1. Go to [Cloudinary Console](https://cloudinary.com/)
2. Copy your **Cloud Name** from the dashboard
3. Go to **Settings → Upload → Add upload preset**
   - Set mode to **Unsigned**
   - Name it `remote_print_preset`
4. In `dashboard.js`, update:

```javascript
https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload
```

---

### 5️⃣ Run the Project

Open in **VS Code** and use the **Live Server** extension.
OR open `index.html` directly in your browser.

---

### 6️⃣ Admin Access Setup

1. Register a user via Firebase Authentication
2. In Firestore, manually create:
