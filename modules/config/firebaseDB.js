'use strict';

const firebase = require('firebase');

function getAuthFirebase() {
  if (!process.env.FIREBASE_DBNAME ||
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY) {
    return Promise.reject(new Error('No firebase persistance configured'));
  }

  let db;
  const firebaseServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: JSON.parse(`"${process.env.FIREBASE_PRIVATE_KEY}"`), // unescape escape chars
    clientEmail: process.env.FIREBASE_EMAIL,
  };

  try {
    firebase.initializeApp({
      databaseURL: `https://${process.env.FIREBASE_DBNAME}.firebaseio.com/`,
      serviceAccount: firebaseServiceAccount
    });
    db = firebase.database();

  } catch(err) {
    return Promise.reject(err);
  }

  return Promise.resolve(db.ref('github-slack'));
}

module.exports = getAuthFirebase();