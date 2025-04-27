import { db, GeoPoint } from "./firebase.js"
import {
	collection,
	getDocs,
	addDoc,
	deleteDoc,
	doc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"

export async function fetchFavouritePlaces() {
	try {
		const querySnapshot = await getDocs(collection(db, "favourite_places"))
		if (querySnapshot.empty) {
			console.log("No documents found in 'favourite_places'")
			return []
		}
		// Zwracamy też ID dokumentu, żeby móc go potem usunąć
		const places = querySnapshot.docs.map(docSnap => ({
			id: docSnap.id,
			...docSnap.data(),
		}))
		return places
	} catch (error) {
		console.error("Error fetching documents: ", error)
		return []
	}
}

export async function deleteFavouritePlace(id) {
	try {
		await deleteDoc(doc(db, "favourite_places", id))
		await displayFavouritePlaces()
	} catch (error) {
		console.error("Błąd podczas usuwania miejsca: ", error)
	}
}

export async function displayFavouritePlaces() {
	const places = await fetchFavouritePlaces()
	const tableBody = document.getElementById("favourite-places-table-data")

	tableBody.innerHTML = "" // Czyścimy tabelę

	places.forEach((place, index) => {
		const row = document.createElement("tr")

		const cell1 = document.createElement("td")
		cell1.textContent = index + 1 // Numeracja
		row.appendChild(cell1)

		const cell2 = document.createElement("td")
		cell2.textContent = place.name // Nazwa miejsca
		row.appendChild(cell2)

		const cell3 = document.createElement("td")
		cell3.textContent = place.location // Współrzędne
		row.appendChild(cell3)

		const cell4 = document.createElement("td")
		cell4.textContent = place.description // Opis miejsca
		row.appendChild(cell4)

		// Nowa komórka na ikonę kosza
		const cell5 = document.createElement("td")
		const trashButton = document.createElement("button")
		trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>'
		trashButton.classList.add("delete-btn")

		// Obsługa kliknięcia w ikonę
		trashButton.addEventListener("click", () => {
			if (confirm("Czy na pewno chcesz usunąć to miejsce?")) {
				deleteFavouritePlace(place.id)
			}
		})

		cell5.appendChild(trashButton)
		row.appendChild(cell5)

		tableBody.appendChild(row)
	})
}

export async function addFavouritePlace(name, location, description) {
	try {
		await addDoc(collection(db, "favourite_places"), {
			name: name,
			description: description,
			location: location,
		})
	} catch (e) {
		console.error("Błąd przy dodawaniu miejsca: ", e)
		throw new Error("Nie udało się dodać miejsca")
	}
}

export async function addUserLocation(name, latitude, longitude) {
	try {
		const docRef = await addDoc(collection(db, "users_locations"), {
			name: name,
			location: new GeoPoint(latitude, longitude),
		})
		console.log("Lokalizacja użytkownika została zapisana.")
		return docRef.id
	} catch (error) {
		console.error("Błąd przy zapisie lokalizacji użytkownika: ", error)
	}
}

export async function deleteUserLocation(docId) {
	try {
		await deleteDoc(doc(db, "users_locations", docId))
		console.log("Lokalizacja użytkownika została usunięta.")
	} catch (error) {
		console.error("Błąd przy usuwaniu lokalizacji użytkownika: ", error)
	}
}
