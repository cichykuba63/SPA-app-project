import { auth } from "./firebase.js"
import { addFavouritePlace, addUserLocation, deleteUserLocation, displayFavouritePlaces } from "./db.js"

document.addEventListener("DOMContentLoaded", () => {
	// login
	const loginForm = document.querySelector(".login-form")
	const registerForm = document.querySelector(".register-form")
	const createAccountBtn = document.getElementById("create-account-btn")
	const backToLoginBtn = document.getElementById("back-to-login-btn")
	const registerFormElement = document.querySelector(".register-form")
	const passwordInput = document.getElementById("register-password")
	const passwordError = document.getElementById("password-error")
	const navLinks = document.querySelectorAll(".navbar-nav .nav-link")
	const navbarCollapse = document.querySelector(".navbar-collapse")
	const mapContainer = document.getElementById("map")
	const gpsButton = document.getElementById("enable-gps")
	const favPlacesBtn = document.getElementById("favourite-places")
	const favPlacesTable = document.getElementById("favPlaces-box")
	const AddFavPlaceform = document.getElementById("add-favourite-place-form")
	const AddFavPlaceBtn = document.getElementById("add-place-btn")
	const toggleFlashlightBtn = document.getElementById("toggle-flashlight")
	let map
	let marker
	let userPosition
	let locationDocId = null
	let track

	function validatePassword(password) {
		const length = password.length >= 6
		const upper = /[A-Z]/.test(password)
		const lower = /[a-z]/.test(password)
		const digit = /\d/.test(password)
		const special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
		return length && upper && lower && digit && special
	}

	favPlacesBtn.addEventListener("click", () => {
		favPlacesTable.classList.toggle("d-none")
	})

	AddFavPlaceform.addEventListener("submit", async e => {
		e.preventDefault() // Zapobiega domyślnej akcji formularza

		// Pobieranie danych z formularza
		const name = document.getElementById("place-name").value
		const location = document.getElementById("place-location").value
		const description = document.getElementById("place-description").value

		try {
			// Wywołaj funkcję z db.js do dodania nowego miejsca
			await addFavouritePlace(name, location, description)

			// Wyświetl komunikat o sukcesie
			document.getElementById("form-message").textContent = "Miejsce zostało dodane!"
			AddFavPlaceform.reset() // Zresetuj formularz
		} catch (error) {
			// Obsłuż błędy i wyświetl je
			document.getElementById("form-message").textContent = "Błąd: " + error.message
		}
	})

	createAccountBtn.addEventListener("click", e => {
		e.preventDefault()
		loginForm.classList.add("d-none")
		registerForm.classList.remove("d-none")
	})

	backToLoginBtn.addEventListener("click", e => {
		e.preventDefault()
		registerForm.classList.add("d-none")
		loginForm.classList.remove("d-none")
	})

	registerFormElement.addEventListener("submit", e => {
		const password = passwordInput.value
		const isValid = validatePassword(password)

		if (!isValid) {
			e.preventDefault()
			passwordError.textContent =
				"Password must be at least 6 characters, include uppercase, lowercase, a number and special character."
		} else {
			passwordError.textContent = ""
		}
	})

	// nav-btn show
	navLinks.forEach(link => {
		link.addEventListener("click", () => {
			if (navbarCollapse.classList.contains("show")) {
				const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse)
				bsCollapse?.hide()
			}
		})
	})

	// map
	if (mapContainer) {
		map = L.map("map").setView([52.2297, 21.0122], 13) // Warszawa

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map)
	}

	gpsButton.addEventListener("click", async e => {
		e.preventDefault()

		if (gpsButton.dataset.status === "enabled") {
			// Wyłącz GPS
			if (marker) {
				map.removeLayer(marker)
				marker = null
			}
			map.setView([52.2297, 21.0122], 13)
			gpsButton.textContent = "Enable GPS"
			gpsButton.dataset.status = "disabled"

			if (locationDocId) {
				await deleteUserLocation(locationDocId)
				locationDocId = null
			}

			return
		}

		// Włącz GPS
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async position => {
					const user = auth.currentUser
					const email = user ? user.email : "Nieznany użytkownik"
					const { latitude, longitude } = position.coords

					userPosition = [latitude, longitude]

					map.setView(userPosition, 16)

					if (marker) map.removeLayer(marker)

					marker = L.marker(userPosition).addTo(map).bindPopup("Tu jesteś!").openPopup()

					gpsButton.textContent = "Disable GPS"
					gpsButton.dataset.status = "enabled"

					locationDocId = await addUserLocation(email, latitude, longitude)
				},
				error => {
					alert("Nie udało się pobrać lokalizacji.")
					console.error(error)
				}
			)
		} else {
			alert("Twoja przeglądarka nie wspiera geolokalizacji.")
		}
	})

	displayFavouritePlaces()

	AddFavPlaceBtn.addEventListener("click", () => {
		displayFavouritePlaces()
	})
	// flashlight toggle
	toggleFlashlightBtn?.addEventListener("click", async () => {
		try {
			if (!track) {
				const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
				track = stream.getVideoTracks()[0]
			}

			const capabilities = track.getCapabilities()
			if (!capabilities.torch) {
				alert("Twoje urządzenie nie obsługuje latarki.")
				return
			}

			const settings = track.getSettings()
			await track.applyConstraints({
				advanced: [{ torch: !settings.torch }]
			})
		} catch (error) {
			console.error("Błąd latarki:", error)
			alert("Nie można włączyć/wyłączyć latarki.")
		}
	})
})
