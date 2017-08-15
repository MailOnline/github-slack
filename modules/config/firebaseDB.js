'use strict';

const firebase = require('firebase');

function getAuthFirebase() {
  if (!process.env.FIREBASE_API_KEY ||
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_DATABASE_NAME ||
      !process.env.FIREBASE_SENDER_ID) {
    return Promise.reject(new Error('No firebase persistance configured'));
  }

  let db;
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${process.env.FIREBASE_DATABASE_NAME}.firebaseio.com`,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_SENDER_ID
  };

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  } catch(err) {
    return Promise.reject(err);
  }

  return Promise.resolve(db.ref('github-slack'));
}

module.exports = getAuthFirebase();
