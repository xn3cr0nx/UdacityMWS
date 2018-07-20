let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("load", event => {
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

  // DBHelper.fetchRestaurantByCuisineAndNeighborhood(
  //   cuisine,
  //   neighborhood,
  //   (error, restaurants) => {
  //     if (error) {
  //       // Got an error!
  //       console.error(error);
  //     } else {
  //       resetRestaurants(restaurants);
  //       fillRestaurantsHTML();
  //     }
  //   }
  // );

  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
    let event = new CustomEvent("filled");
    document.dispatchEvent(event);
  });
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
    if (!document.getElementById(`restaurant${restaurant.id}`))
      ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement("li");
  li.id = `restaurant${restaurant.id}`;

  const image = document.createElement("img");
  image.classList.add("restaurant-img");
  image.classList.add("lazy");
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `restaurant ${restaurant.name} image`;
  image.src = "/img/placeholder.webp";
  const original_image = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("data-src", original_image);
  // image.setAttribute(
  //   "data-srcset",
  //   `${original_image.replace(
  //     "-original",
  //     "-small"
  //   )} 200w, ${original_image.replace(
  //     "-original",
  //     "-medium"
  //   )} 400w, ${original_image.replace("-original", "-large")} 600w`
  // );
  // image.sizes = '(min-width: 800px) 50vw, 85vw';
  li.append(image);

  const name = document.createElement("h2");
  name.innerHTML = restaurant.name;
  li.append(name);

  const heart_icon = document.createElement("div");
  let argument = `heartRestaurant(${restaurant.id})`;
  heart_icon.setAttribute("onClick", argument);
  heart_icon.setAttribute("role", "button");
  heart_icon.setAttribute("aria-label", `heart_restaurant_${restaurant.id}`);
  heart_icon.setAttribute("id", `heart${restaurant.id}`);
  const heart = document.createElement("i");
  heart.setAttribute(
    "class",
    restaurant.is_favorite === true || restaurant.is_favorite === "true"
      ? "fas fa-heart"
      : "far fa-heart"
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

heartRestaurant = restaurant => {
  const is_favorite =
    self.restaurants[self.restaurants.findIndex(e => e.id === restaurant)]
      .is_favorite;
  return fetch(
    `http://localhost:1337/restaurants/${restaurant}/?is_favorite=${
      is_favorite === true || is_favorite === "true" ? false : true
    }`,
    { method: "PUT" }
  )
    .then(resp => resp.json())
    .then(_ => {
      handleHeart(is_favorite, restaurant);
    })
    .catch(err => {
      console.log(err);
      handleHeart(is_favorite, restaurant);
    });
};

handleHeart = (is_favorite, restaurant) => {
  let heart = document.getElementById(`heart${restaurant}`);
  if (is_favorite === true || is_favorite === "true") {
    heart.childNodes[0].classList.remove("fas");
    heart.childNodes[0].classList.add("far");
    self.restaurants[
      self.restaurants.findIndex(e => e.id === restaurant)
    ].is_favorite = false;
  } else {
    heart.childNodes[0].classList.remove("far");
    heart.childNodes[0].classList.add("fas");
    self.restaurants[
      self.restaurants.findIndex(e => e.id === restaurant)
    ].is_favorite = true;
  }
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
