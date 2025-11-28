/**
 * Script to check if email exists in Firebase Authentication
 * Usage: node scripts/check-firebase-user.js <email>
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/check-firebase-user.js <email>');
  process.exit(1);
}

async function checkUser() {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ User exists in Firebase Authentication:');
    console.log({
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User NOT found in Firebase Authentication');
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkUser();
