let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

DBHelper.DBHelper();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById("neighborhoods-select");
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById("cuisines-select");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById("cuisines-select");
  const nSelect = document.getElementById("neighborhoods-select");

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    }
  );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById("restaurants-list");
  ul.innerHTML = "";

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById("restaurants-list");
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement("li");

  const image = document.createElement("img");
  image.className = "restaurant-img";
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `restaurant ${restaurant.name} image`;
  const original_image = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = original_image;
  image.srcset = `${original_image.replace(
    "-original",
    "-small"
  )} 200w, ${original_image.replace(
    "-original",
    "-medium"
  )} 400w, ${original_image.replace("-original", "-large")} 600w`;
  // image.sizes = '(min-width: 800px) 50vw, 85vw';
  li.append(image);

  const name = document.createElement("h2");
  name.innerHTML = restaurant.name;
  li.append(name);

  const heart_icon = document.createElement("div");
  let argument = `heartRestaurant(${restaurant.id}, ${restaurant.is_favorite})`;
  heart_icon.setAttribute("onClick", argument);
  heart_icon.setAttribute("role", "button");
  heart_icon.setAttribute("id", `heart${restaurant.id}`);
  const heart = document.createElement("i");
  heart.setAttribute(
    "class",
    restaurant.is_favorite ? "fas fa-heart" : "far fa-heart"
  );
  heart_icon.appendChild(heart);
  li.append(heart_icon);

  const neighborhood = document.createElement("p");
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement("p");
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  more.innerHTML = "View Details";
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute("role", "button");
  more.setAttribute("aria-label", more.innerHTML);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, "click", () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

heartRestaurant = (restaurant, is_favorite) => {
  return fetch(
    `http://localhost:1337/restaurants/${restaurant}/?is_favorite=${is_favorite ? false : true}`,
    { method: "PUT" }
  )
    .then(resp => {
      console.log(resp);
      let icon = document.getElementById(`heart${restaurant}`);
      let heart = icon.childNodes[0];
      heart.setAttribute("class", is_favorite ? "far fa-heart" : "fas fa-heart");
    })
    .catch(err => console.log(err));
};