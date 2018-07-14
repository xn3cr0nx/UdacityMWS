/**
 * Common database helper functions.
 */
class DBHelper {
  static DBHelper() {
    this.dbPromise = DBHelper.createDatabase();
    this.dbReviews = DBHelper.createReviewsDatabase();
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Method to open the indexedDB
   * @return {Promise}
   */
  static createDatabase() {
    console.log("Opening IndexedDB");
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open("restaurant", 1, function(upgradeDb) {
      var store = upgradeDb.createObjectStore("restaurants", {
        keyPath: "id"
      });
      store.createIndex("by-id", "id");
    });
  }

  /**
   * Method to open the indexedDB
   * @return {Promise}
   */
  static createReviewsDatabase() {
    console.log("Opening Reviews IndexedDB");
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open("review", 1, function(upgradeDb) {
      var store = upgradeDb.createObjectStore("reviews", {
        keyPath: "restaurant_id"
      });
      store.createIndex("by-id", "restaurant_id");
    });
  }

  /**
   * Method to insert a review in the indexed db
   */
  static appendReview(review) {
    this.dbReviews.then(db => {
      if (!db) return;

      var tx = db.transaction("reviews", "readwrite");
      var store = tx.objectStore("reviews");
      store.put(review);
    });
  }

  /**
   * Method to fetch reviews from db
   */
  static fetchReviewsDb(restaurant_id) {
    return this.dbReviews.then(db => {
      if (!db) return;
      var index = db
        .transaction("reviews")
        .objectStore("reviews")
        .index("by-id");

      return index.getAll().then(reviews => {
        db.transaction("reviews", "readwrite")
          .objectStore("reviews")
          .delete(restaurant_id);
        return reviews;
      });
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // DBHelper.getIndexedRestaurants(callback).then(_ => {
    //   fetch(DBHelper.DATABASE_URL)
    //     .then(resp => resp.json())
    //     .then(data => {
    //       DBHelper.putRestaurantsIndexedDB(data);
    //       return data;
    //     })
    //     .catch(err => {
    //       const error = `Request failed. Returned error ${err}`;
    //       return error;
    //       // callback(error, null);
    //     });
    // });
    DBHelper.getIndexedRestaurants()
      .then(restaurants => {
        fetch(DBHelper.DATABASE_URL)
          .then(resp => resp.json())
          .then(data => {
            DBHelper.putRestaurantsIndexedDB(data);
            callback(null, data);
          })
          .catch(err => {
            const error = `Request failed. Returned error ${err}`;
            callback(error, restaurants);
          });
      })
      .catch(err => {
        const error = `Request failed. Returned error ${err}`;
        callback(error, null);
      });
  }

  /**
   * Gets restaurants in the indexed db
   */
  static getIndexedRestaurants() {
    return this.dbPromise.then(db => {
      if (!db) return;
      var index = db
        .transaction("restaurants")
        .objectStore("restaurants")
        .index("by-id");

      return index.getAll().then(restaurants => {
        // callback(null, restaurants);
        return restaurants;
      });
    });
  }

  /**
   * Stores restaurants in the indexed db
   * @param  {Object} restaurants
   */
  static putRestaurantsIndexedDB(restaurants) {
    this.dbPromise.then(db => {
      if (!db) return;

      var tx = db.transaction("restaurants", "readwrite");
      var store = tx.objectStore("restaurants");
      restaurants.forEach(restaurant => {
        store.put(restaurant);
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/resp/${
      restaurant.photograph ? restaurant.photograph : 10
    }-original.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
