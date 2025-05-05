import { auth } from "./firebase.js"
import {
	addFavouritePlace,
	addUserLocation,
	deleteUserLocation,
	displayFavouritePlaces,
	fetchUserLocations,
	fetchAndDisplayHistoricLocations,
	addHistoricUserLocation,
} from "./db.js"

let map = null
let marker = null
let peopleMarkers = []

function removeMarker() {
	if (marker && map) {
		map.removeLayer(marker) // Usuwa marker z mapy
		marker = null // Ustawia marker na null
	}
}

function clearPeopleMarkers() {
	if (peopleMarkers.length > 0 && map) {
		peopleMarkers.forEach(marker => {
			map.removeLayer(marker)
		})
		peopleMarkers = []
	}

	const showPeopleBtn = document.getElementById("show-people")
	if (showPeopleBtn) {
		showPeopleBtn.textContent = "Show people"
	}
}

// dystans pomiędzy dwoma punktami
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371000 // promień Ziemi w metrach
	const toRad = deg => deg * (Math.PI / 180)

	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	return R * c // odległość w metrach
}

document.addEventListener("DOMContentLoaded", async () => {
	// Usuwanie lokalizacji z poprzedniej sesji
	const previousLocationId = localStorage.getItem("userLocationDocId")
	if (previousLocationId) {
		await deleteUserLocation(previousLocationId)
		localStorage.removeItem("userLocationDocId")
	}

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
	const addFavPlaceForm = document.getElementById("add-favourite-place-form")
	const addFavPlaceBtn = document.getElementById("add-place-btn")
	const showPeopleBtn = document.getElementById("show-people")
	const toggleFlashlightBtn = document.getElementById("toggle-flashlight")

	let userPosition = null
	let locationDocId = null
	let track
	let flashlightInterval = null
	let flashlightOn = false

	// Zdarzenie przed przeładowaniem strony
	window.addEventListener("beforeunload", async () => {
		// Usuwamy lokalizację przed przeładowaniem strony
		await deleteUserLocation(locationDocId)
	})

	// Zdarzenie przy zamknięciu przeglądarki
	window.addEventListener("unload", async () => {
		// Usuwamy lokalizację przy zamknięciu przeglądarki
		await deleteUserLocation(locationDocId)
	})

	async function toggleUserMarkers() {
		if (gpsButton.dataset.status !== "enabled") {
			// Jeśli lokalizacja nie jest włączona, wyświetlamy komunikat
			alert("Aby zobaczyć użytkowników na mapie, musisz włączyć lokalizację.")
			return // Zatrzymujemy dalsze wykonywanie funkcji
		}
		// Jeśli markery są już na mapie, usuwamy je
		if (peopleMarkers.length > 0) {
			peopleMarkers.forEach(marker => {
				map.removeLayer(marker)
			})
			peopleMarkers = []
		} else {
			// Pobieramy lokalizacje użytkowników i dodajemy markery
			const users = await fetchUserLocations()

			users.forEach(user => {
				if (user.name !== auth.currentUser.email) {
					const userMarker = L.marker([user.location.latitude, user.location.longitude])
						.addTo(map)
						.bindPopup(`${user.name}<br>${user.location.latitude}, ${user.location.longitude}`)

					// Dodajemy marker do tablicy
					peopleMarkers.push(userMarker)

					if (userPosition) {
						const distance = calculateDistance(
							userPosition[0],
							userPosition[1],
							user.location.latitude,
							user.location.longitude
						)
						if (
							gpsButton.dataset.status === "enabled" &&
							showPeopleBtn.textContent === "Hide people" &&
							distance <= 100 &&
							user.name !== auth.currentUser.email
						) {
							navigator.vibrate(200)
							console.log("Telefon wibruje.")
						}
					}
				}
			})
		}
	}

	// Obsługa kliknięcia przycisku "Pokaż historię lokalizacji"
	document.getElementById("fetch-historic-locations").addEventListener("click", async () => {
		await fetchAndDisplayHistoricLocations()
	})

	// Obsługa kliknięcia w przycisk "show-people"
	showPeopleBtn.addEventListener("click", () => {
		if (gpsButton.dataset.status !== "enabled") {
			// Jeśli lokalizacja nie jest włączona, wyświetlamy komunikat i nie zmieniamy tekstu przycisku
			alert("Aby zobaczyć użytkowników na mapie, musisz włączyć lokalizację.")
		} else {
			// Jeśli lokalizacja jest włączona, wywołujemy toggleUserMarkers
			toggleUserMarkers()

			if (showPeopleBtn.textContent === "Show people") {
				showPeopleBtn.textContent = "Hide people"
			} else {
				showPeopleBtn.textContent = "Show people"
			}
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
		map = L.map("map").setView([52.2297, 21.0122], 13)

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map)
	}

	gpsButton.addEventListener("click", async e => {
		e.preventDefault()

		if (gpsButton.dataset.status === "enabled") {
			removeMarker()

			clearPeopleMarkers()

			gpsButton.textContent = "Enable GPS"
			gpsButton.dataset.status = "disabled"

			if (locationDocId) {
				await deleteUserLocation(locationDocId)
				localStorage.removeItem("userLocationDocId")
				locationDocId = null
			}

			const showPeopleBtn = document.getElementById("show-people")
			if (showPeopleBtn) {
				showPeopleBtn.textContent = "Show people"
			}

			return
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async position => {
					const user = auth.currentUser
					const email = user ? user.email : "Unknown user"
					const { latitude, longitude } = position.coords

					userPosition = [latitude, longitude]

					map.setView(userPosition, 16)

					removeMarker()

					marker = L.marker(userPosition).addTo(map).bindPopup("You are here!").openPopup()

					gpsButton.textContent = "Disable GPS"
					gpsButton.dataset.status = "enabled"

					locationDocId = await addUserLocation(email, latitude, longitude)
					localStorage.setItem("userLocationDocId", locationDocId)

					// Zapisz historyczną lokalizację
					if (user) {
						await addHistoricUserLocation(email, latitude, longitude)
					}
				},
				error => {
					alert("Unable to retrieve location.")
					console.error(error)
				}
			)
		} else {
			alert("Geolocation is not supported by your browser.")
		}
	})

	// favourite places
	favPlacesBtn.addEventListener("click", () => {
		favPlacesTable.classList.toggle("d-none")
	})

	addFavPlaceForm.addEventListener("submit", async e => {
		e.preventDefault()
		const name = document.getElementById("place-name").value
		const location = document.getElementById("place-location").value
		const description = document.getElementById("place-description").value

		try {
			await addFavouritePlace(name, location, description)
			document.getElementById("form-message").textContent = "Place added successfully!"
			addFavPlaceForm.reset()
			displayFavouritePlaces()
		} catch (error) {
			document.getElementById("form-message").textContent = "Error: " + error.message
		}
	})

	addFavPlaceBtn.addEventListener("click", () => {
		displayFavouritePlaces()
	})

	displayFavouritePlaces()

	// flashlight
	toggleFlashlightBtn.addEventListener("click", async () => {
		try {
			if (!track) {
				const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
				track = stream.getVideoTracks()[0]
			}

			const capabilities = track.getCapabilities()
			if (!capabilities.torch) {
				alert("Your device does not support flashlight.")
				return
			}

			if (flashlightInterval) {
				clearInterval(flashlightInterval)
				flashlightInterval = null
				await track.applyConstraints({ advanced: [{ torch: false }] })
				flashlightOn = false
				toggleFlashlightBtn.textContent = "Start Flashlight Blinking"
			} else {
				flashlightInterval = setInterval(async () => {
					flashlightOn = !flashlightOn
					await track.applyConstraints({ advanced: [{ torch: flashlightOn }] })
				}, 500)
				toggleFlashlightBtn.textContent = "Stop Flashlight Blinking"
			}
		} catch (error) {
			console.error("Flashlight error:", error)
			alert("Error toggling flashlight.")
		}
	})
})

export { removeMarker, clearPeopleMarkers }

if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("/serviceWorker.js")
			.then(res => console.log("service worker registered"))
			.catch(err => console.log("service worker not registered", err))
	})
}
