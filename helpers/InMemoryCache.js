'use strict';

class InMemoryCache {
  constructor({
    name = 'InMemoryCache',
    ttl
  }) {
    this.name = name;
    this._cache = {};
    this._ttl = ttl;
  }

  set(key, value) {
    this._cache[key] = {
      value: value,
      date: Date.now()
    };
    return Promise.resolve(value);
  }

  get(key) {
    if (this.isValid(key)) {
      return Promise.resolve(this._cache[key].value);
    } else {
      delete this._cache[key];
      return Promise.reject(new Error(`[${this.name}] cache miss`));
    }
  }

  isValid(key) {
    if (!this._cache[key]) {
      return false;
    }

    if (!this._ttl) {
      return true;
    }

    const age = Date.now() - this._cache[key].date;
    return age < this._ttl;
  }

  delete(key) {
    return this.get(key)
      .then((value) => {
        delete this._cache[key];
        return value;
      })
      .catch(() => null);
  }
}

module.exports = InMemoryCache;
