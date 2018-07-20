let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
    let event = new CustomEvent("filled");
    document.dispatchEvent(event);
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.classList.add("restaurant-img");
  image.classList.add("lazy");
  image.alt = `restaurant ${restaurant.name} image`;
  image.src = "/img/placeholder.webp";
  const original_image = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("data-src", original_image);
  // image.setAttribute(
  //   "data-srcset",
  //   `${original_image.replace(
  //     "-original",
  //     "-small"
  //   )} 400w, ${original_image.replace(
  //     "-original",
  //     "-medium"
  //   )} 800w, ${original_image.replace("-original", "-large")} 1000w`
  // );
  // image.sizes = "(min-width: 800px) 40vw, 95vw";

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;
  // cuisine.setAttribute('style', `width: ${document.getElementById('restaurant-img').width}px`)

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviews().then(_ => {
    fillReviewsHTML();
  });

  // create reviews form
  fillFormHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById("reviews-container");
  if (!container.querySelector("h2")) {
    const title = document.createElement("h2");
    title.innerHTML = "Reviews";
    container.appendChild(title);
  }

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    if (!document.getElementById(`review${review.id}`))
      ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  li.id = `review${review.id}`;
  const div = document.createElement("div");
  div.id = "black-band";
  div.role = "Tabpanel";

  const name = document.createElement("p");
  name.innerHTML = review.name;
  name.id = "name";
  // li.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = new Date(review.createdAt).toDateString();
  date.id = "date";
  // li.appendChild(date);

  div.appendChild(name);
  div.appendChild(date);
  li.appendChild(div);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.id = "rating";
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  comments.id = "comments";
  li.appendChild(comments);

  return li;
};

/**
 * Create review form
 */
fillFormHTML = (restaurant = self.restaurant) => {
  const container = document.getElementById("review-form");
  [...Array(6).keys()].slice(1).forEach(e => {
    document
      .getElementById(`star-${e}`)
      .setAttribute("onClick", `handleStars("star-${e}")`);
  });
};

submitting = () => {
  let name = document.getElementById("form-name").value;
  let comments = document.getElementById("form-comment").value;
  if (!name || !comments) {
    const old_message = document.getElementsByClassName("message");
    if (old_message[0]) return;
    else {
      const container = document.getElementById("review-form");
      let message = document.createElement("p");
      message.classList.add("message");
      message.innerHTML = "You have to fill the form";
      container.appendChild(message);
      setTimeout(() => {
        message.parentNode.removeChild(message);
      }, 3000);
      return;
    }
  }
  postReview(self.restaurant.id, name, countStars(), comments);
};

handleStars = id => {
  [...Array(6).keys()].slice(1).forEach(e => {
    document.getElementById(`star-${e}`).classList.remove("checked");
  });
  [...Array(parseInt(id[5]) + 1).keys()].slice(1).forEach(e => {
    document.getElementById(`star-${e}`).classList.add("checked");
  });
};

countStars = () => {
  let counter = 0;
  [...Array(6).keys()].slice(1).forEach(e => {
    if (document.getElementById(`star-${e}`).classList.contains("checked"))
      counter++;
  });
  return counter;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * Fetch restaurant reviews
 */
fetchReviews = () => {
  return new Promise((res, rej) => {
    DBHelper.fetchReviewsDb(self.restaurant.id)
      .then(reviews => {
        if (reviews) {
          let promises = reviews.map(review => {
            return postReview(
              review.restaurant_id,
              review.name,
              review.rating,
              review.comments
            );
          });
          return Promise.all(promises);
        } else return null;
      })
      .then(resp => {
        return fetch(
          `http://localhost:1337/reviews/?restaurant_id=${self.restaurant.id}`
        );
      })
      .then(resp => resp.json())
      .then(data => {
        self.restaurant.reviews = data;
        res(data);
      })
      .catch(err => rej(err));
  });
};

/**
 * Create a new restaurant review
 */
postReview = (id, name, rating, comments) => {
  const body = {
    restaurant_id: id,
    name: name,
    rating: rating,
    comments: comments
  };
  fetch("http://localhost:1337/reviews/", {
    method: "POST",
    body: JSON.stringify(body)
  })
    .then(resp => resp.json())
    .then(data => {
      console.log("POST RESPONSE", data);
      handleReview();
      return fetchReviews();
    })
    .then(reviews => {
      fillReviewsHTML(reviews);
    })
    .catch(err => {
      console.log("Error in request, caching review", err);
      //I need to cache body in indexed db and retry when user reconnect
      DBHelper.appendReview(body);
      handleReview();
      body.id =
        Math.max(
          ...Array.from(document.querySelectorAll('[id^="review"]'))
            .filter(e => /review\d+/.test(e.id))
            .map(e => parseInt(e.id.replace("review", "")))
        ) + 1;
      fillReviewsHTML([body]);
    });
};

handleReview = () => {
  document.getElementById("form-name").value = "";
  document.getElementById("form-comment").value = "";
  [...Array(6).keys()].slice(1).forEach(e => {
    document.getElementById(`star-${e}`).classList.remove("checked");
  });
  const old_message = document.getElementsByClassName("message");
  if (old_message[0]) return;
  else {
    const container = document.getElementById("review-form");
    let message = document.createElement("p");
    message.classList.add("message");
    message.innerHTML = "Review submitted";
    container.appendChild(message);
    setTimeout(() => {
      message.parentNode.removeChild(message);
    }, 3000);
  }
};
