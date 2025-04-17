document.addEventListener("DOMContentLoaded", () => {
	// login
	const loginForm = document.querySelector(".login-form")
	const registerForm = document.querySelector(".register-form")

	const createAccountBtn = document.getElementById("create-account-btn")
	const backToLoginBtn = document.getElementById("back-to-login-btn")

	function updateBackgroundBasedOnBox() {
		const box = document.querySelector(".box")
		const app = document.querySelector(".main-app")

		const isVisible = getComputedStyle(box).display !== "none"

		if (isVisible) {
			app.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--main-color")
		} else {
			app.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--secondary-color")
		}
	}

	createAccountBtn.addEventListener("click", e => {
		e.preventDefault()
		loginForm.classList.add("d-none")
		registerForm.classList.remove("d-none")
		updateBackgroundBasedOnBox()
	})

	backToLoginBtn.addEventListener("click", e => {
		e.preventDefault()
		registerForm.classList.add("d-none")
		loginForm.classList.remove("d-none")
		updateBackgroundBasedOnBox()
	})

	const registerFormElement = document.querySelector(".register-form")
	const passwordInput = document.getElementById("register-password")
	const passwordError = document.getElementById("password-error")

	registerFormElement.addEventListener("submit", e => {
		const password = passwordInput.value
		const isValid = validatePassword(password)

		if (!isValid) {
			e.preventDefault()
			passwordError.textContent =
				"Password must be at least 8 characters, include uppercase, lowercase, a number and special character."
		} else {
			passwordError.textContent = ""
		}
	})

	function validatePassword(password) {
		const length = password.length >= 8
		const upper = /[A-Z]/.test(password)
		const lower = /[a-z]/.test(password)
		const digit = /\d/.test(password)
		const special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
		return length && upper && lower && digit && special
	}

	// nav-btn show
	const navLinks = document.querySelectorAll(".navbar-nav .nav-link")
	const navbarCollapse = document.querySelector(".navbar-collapse")

	navLinks.forEach(link => {
		link.addEventListener("click", () => {
			if (navbarCollapse.classList.contains("show")) {
				const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse)
				bsCollapse?.hide()
			}
		})
	})

	// map
	let map
	let marker
	let userPosition

	const mapContainer = document.getElementById("map")
	const gpsButton = document.getElementById("enable-gps")

	if (mapContainer) {
		map = L.map("map").setView([52.2297, 21.0122], 13) // Warszawa

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map)
	}

	gpsButton?.addEventListener("click", e => {
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
			return
		}

		// Włącz GPS
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const { latitude, longitude } = position.coords
					userPosition = [latitude, longitude]

					map.setView(userPosition, 16)

					if (marker) map.removeLayer(marker)

					marker = L.marker(userPosition).addTo(map).bindPopup("Tu jesteś!").openPopup()

					gpsButton.textContent = "Disable GPS"
					gpsButton.dataset.status = "enabled"
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
})
