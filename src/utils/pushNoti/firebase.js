// firebase.js
import admin from "firebase-admin";
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

firebaseConfig.private_key = firebaseConfig.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

export default admin;
