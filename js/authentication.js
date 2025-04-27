import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"

import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"

// Konfiguracja Firebase
const firebaseConfig = {
	apiKey: "AIzaSyBfwt1QFscGONrSzvDxuAtHXzs4e1PZeqE",
	authDomain: "psm-projekt-grupowy.firebaseapp.com",
	projectId: "psm-projekt-grupowy",
	storageBucket: "psm-projekt-grupowy.firebasestorage.app",
	messagingSenderId: "968364837935",
	appId: "1:968364837935:web:dfddf680e00957fbdd8ada",
}

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

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
		document.querySelector(".login-box").classList.add("d-none")
		document.querySelector(".main-app").classList.remove("d-none")
	} else {
		document.querySelector(".login-box").classList.remove("d-none")
		document.querySelector(".main-app").classList.add("d-none")
	}
})
