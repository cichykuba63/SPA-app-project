import { auth, provider } from "./firebase.js"
import { deleteUserLocation } from "./db.js"
import { removeMarker, clearPeopleMarkers } from "./main.js"
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"

function updateBackgroundBasedOnBox() {
	const box = document.querySelector(".box")
	const bodyTag = document.querySelector("body")

	const isVisible = getComputedStyle(box).display !== "none"

	if (isVisible) {
		bodyTag.style.backgroundColor = "#006c35"
	} else {
		bodyTag.style.backgroundColor = "#ffddab"
	}
}
function logoutUser() {
	const docId = localStorage.getItem("userLocationDocId")
	console.log("Wylogowywanie... docId:", docId)

	const deleteAndLogout = async () => {
		try {
			// Usuwamy lokalizację z bazy danych
			if (docId) {
				await deleteUserLocation(docId)
				console.log("Lokalizacja usunięta.")
				localStorage.removeItem("userLocationDocId")
			} else {
				console.log("Brak docId w localStorage")
			}

			// Wylogowanie użytkownika
			await signOut(auth)
			console.log("Użytkownik wylogowany.")

			// Resetowanie przycisku GPS
			const gpsButton = document.getElementById("enable-gps")
			if (gpsButton) {
				gpsButton.textContent = "Enable GPS"
				gpsButton.dataset.status = "disabled" // Zablokowanie ponownego uruchomienia GPS
			}

			// Usunięcie markera, jeśli jest
			removeMarker()
			clearPeopleMarkers()
		} catch (error) {
			console.error("Błąd podczas wylogowywania:", error)
		}
	}

	deleteAndLogout()
}

// Logowanie email/hasło
document.getElementById("login-btn").addEventListener("click", async e => {
	e.preventDefault()
	const email = document.getElementById("login-email").value
	const password = document.getElementById("login-password").value
	try {
		await signInWithEmailAndPassword(auth, email, password)
	} catch (error) {
		alert("Błąd logowania: " + error.message)
	}
})

// Rejestracja
document.getElementById("register-btn").addEventListener("click", async e => {
	e.preventDefault()
	const email = document.getElementById("register-email").value
	const password = document.getElementById("register-password").value
	try {
		await createUserWithEmailAndPassword(auth, email, password)
		alert("Konto utworzone. Zaloguj się.")
	} catch (error) {
		alert("Błąd rejestracji: " + error.message)
	}
})

// Logowanie przez Google
document.getElementById("login-google-btn").addEventListener("click", async e => {
	e.preventDefault()
	try {
		await signInWithPopup(auth, provider)
	} catch (error) {
		alert("Błąd Google: " + error.message)
	}
})

// Wylogowanie
document.getElementById("log-out").addEventListener("click", async () => {
	logoutUser()
})

// Obserwowanie stanu użytkownika
onAuthStateChanged(auth, user => {
	if (user) {
		document.querySelector(".box").classList.add("d-none")
		document.querySelector(".main-app").classList.remove("d-none")
		updateBackgroundBasedOnBox()
	} else {
		document.querySelector(".box").classList.remove("d-none")
		document.querySelector(".main-app").classList.add("d-none")
		updateBackgroundBasedOnBox()
	}
})
