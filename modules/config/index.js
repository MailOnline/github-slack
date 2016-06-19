'use strict';

const firebaseDB = require('./firebaseDB');

module.exports = {
  get: (key) => {
    return firebaseDB
      .then((firebase) => {
        return new Promise((resolve, reject) => {
          firebase.child(key)
            .once('value', resolve, reject);
        });
      })
      .then(firebaseData => firebaseData.val());
  },
  set: (key, value) => {
    return firebaseDB
      .then((firebase) => {
        return new Promise((resolve, reject) => {
          firebase.child(key)
            .set(value, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(value);
              }
            });
        });
      });
  }
};
