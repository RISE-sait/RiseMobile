/**
 * Script to delete user from Firebase Authentication
 * Usage: node scripts/delete-firebase-user.js <email>
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
  console.error('Usage: node scripts/delete-firebase-user.js <email>');
  process.exit(1);
}

async function deleteUser() {
  try {
    // First check if user exists
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);
    
    // Delete the user
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`✅ Successfully deleted user: ${email}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User NOT found in Firebase Authentication');
    } else {
      console.error('Error:', error.message);
    }
  }
}

deleteUser();
