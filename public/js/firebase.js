import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"
import {
	GoogleAuthProvider,
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"
import { getFirestore, GeoPoint } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"
import {
	collection,
	addDoc,
	getDocs,
	deleteDoc,
	updateDoc,
	doc,
	query,
	where,
	Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"

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
const db = getFirestore(app)

export {
	app,
	auth,
	provider,
	db,
	GeoPoint,
	collection,
	addDoc,
	getDocs,
	deleteDoc,
	updateDoc,
	doc,
	query,
	where,
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	Timestamp
}
