// navigator.serviceWorker.getRegistrations().then(resp => {
// if (navigator.serviceWorker && !resp[0]) {
if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("sw.js")
    .then(registration =>
      console.log("Service worker registered", registration)
    )
    .catch(err => console.log(err));
}
// });
