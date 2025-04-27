import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"

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

export {app, auth, provider}