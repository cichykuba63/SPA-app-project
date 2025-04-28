import { auth } from "./firebase.js";
import { addFavouritePlace, addUserLocation, deleteUserLocation, displayFavouritePlaces } from "./db.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");
  const createAccountBtn = document.getElementById("create-account-btn");
  const backToLoginBtn = document.getElementById("back-to-login-btn");
  const registerFormElement = document.querySelector(".register-form");
  const passwordInput = document.getElementById("register-password");
  const passwordError = document.getElementById("password-error");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const navbarCollapse = document.querySelector(".navbar-collapse");
  const mapContainer = document.getElementById("map");
  const gpsButton = document.getElementById("enable-gps");
  const favPlacesBtn = document.getElementById("favourite-places");
  const favPlacesTable = document.getElementById("favPlaces-box");
  const addFavPlaceForm = document.getElementById("add-favourite-place-form");
  const addFavPlaceBtn = document.getElementById("add-place-btn");
  const toggleFlashlightBtn = document.getElementById("toggle-flashlight");

  let map;
  let marker;
  let userPosition;
  let locationDocId = null;
  let track;
  let flashlightInterval = null;
  let flashlightOn = false;

  function validatePassword(password) {
    const length = password.length >= 6;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const digit = /\d/.test(password);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return length && upper && lower && digit && special;
  }

  createAccountBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("d-none");
    registerForm.classList.remove("d-none");
  });

  backToLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
  });

  registerFormElement.addEventListener("submit", (e) => {
    const password = passwordInput.value;
    const isValid = validatePassword(password);

    if (!isValid) {
      e.preventDefault();
      passwordError.textContent = "Password must be at least 6 characters, include uppercase, lowercase, a number and special character.";
    } else {
      passwordError.textContent = "";
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        bsCollapse?.hide();
      }
    });
  });

  if (mapContainer) {
    map = L.map("map").setView([52.2297, 21.0122], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }

  gpsButton.addEventListener("click", async (e) => {
    e.preventDefault();

    if (gpsButton.dataset.status === "enabled") {
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      map.setView([52.2297, 21.0122], 13);
      gpsButton.textContent = "Enable GPS";
      gpsButton.dataset.status = "disabled";

      if (locationDocId) {
        await deleteUserLocation(locationDocId);
        locationDocId = null;
      }
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const user = auth.currentUser;
          const email = user ? user.email : "Unknown user";
          const { latitude, longitude } = position.coords;

          userPosition = [latitude, longitude];

          map.setView(userPosition, 16);

          if (marker) map.removeLayer(marker);

          marker = L.marker(userPosition).addTo(map).bindPopup("You are here!").openPopup();

          gpsButton.textContent = "Disable GPS";
          gpsButton.dataset.status = "enabled";

          locationDocId = await addUserLocation(email, latitude, longitude);
        },
        (error) => {
          alert("Unable to retrieve location.");
          console.error(error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });

  favPlacesBtn.addEventListener("click", () => {
    favPlacesTable.classList.toggle("d-none");
  });

  addFavPlaceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("place-name").value;
    const location = document.getElementById("place-location").value;
    const description = document.getElementById("place-description").value;

    try {
      await addFavouritePlace(name, location, description);
      document.getElementById("form-message").textContent = "Place added successfully!";
      addFavPlaceForm.reset();
      displayFavouritePlaces();
    } catch (error) {
      document.getElementById("form-message").textContent = "Error: " + error.message;
    }
  });

  addFavPlaceBtn.addEventListener("click", () => {
    displayFavouritePlaces();
  });

  displayFavouritePlaces();

  toggleFlashlightBtn?.addEventListener("click", async () => {
    try {
      if (!track) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        track = stream.getVideoTracks()[0];
      }

      const capabilities = track.getCapabilities();
      if (!capabilities.torch) {
        alert("Your device does not support flashlight.");
        return;
      }

      if (flashlightInterval) {
        clearInterval(flashlightInterval);
        flashlightInterval = null;
        await track.applyConstraints({ advanced: [{ torch: false }] });
        flashlightOn = false;
        toggleFlashlightBtn.textContent = "Start Flashlight Blinking";
      } else {
        flashlightInterval = setInterval(async () => {
          flashlightOn = !flashlightOn;
          await track.applyConstraints({ advanced: [{ torch: flashlightOn }] });
        }, 500);
        toggleFlashlightBtn.textContent = "Stop Flashlight Blinking";
      }
    } catch (error) {
      console.error("Flashlight error:", error);
      alert("Error toggling flashlight.");
    }
  });
});