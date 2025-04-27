import { auth, provider } from "./firebase.js"
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
	await signOut(auth)
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
