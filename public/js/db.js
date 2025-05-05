import { db, GeoPoint } from "./firebase.js"
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, Timestamp } from "./firebase.js"

// Dodanie lokalizacji użytkownika do kolekcji user_historic_locations
export async function addHistoricUserLocation(email, latitude, longitude) {
	try {
		const timestamp = Timestamp.now()

		const docRef = await addDoc(collection(db, "user_historic_locations"), {
			email: email,
			location: new GeoPoint(latitude, longitude),
			timestamp: timestamp,
		})
		console.log("Lokalizacja użytkownika została zapisana.")
	} catch (error) {
		console.error("Błąd przy zapisie lokalizacji historycznej użytkownika: ", error)
	}
}

// Funkcja do pobierania i wyświetlania historycznych lokalizacji użytkowników
export async function fetchAndDisplayHistoricLocations() {
	try {
		const querySnapshot = await getDocs(collection(db, "user_historic_locations"))
		const tableBody = document.getElementById("historic-locations-table-data")

		// Czyścimy tabelę przed dodaniem nowych danych
		tableBody.innerHTML = ""

		querySnapshot.docs.forEach((docSnap, index) => {
			const data = docSnap.data()
			const row = document.createElement("tr")

			// Numeracja
			const cell1 = document.createElement("td")
			cell1.textContent = index + 1
			row.appendChild(cell1)

			// Email użytkownika
			const cell2 = document.createElement("td")
			cell2.textContent = data.email
			row.appendChild(cell2)

			// Lokalizacja
			const cell3 = document.createElement("td")
			cell3.textContent = `Lat: ${data.location.latitude}, Lng: ${data.location.longitude}`
			row.appendChild(cell3)

			// Czas
			const cell4 = document.createElement("td")
			cell4.textContent = data.timestamp.toDate().toLocaleString() // Konwertowanie timestamp na czytelny format
			row.appendChild(cell4)

			tableBody.appendChild(row)
		})
	} catch (error) {
		console.error("Błąd podczas pobierania danych historycznych: ", error)
	}
}

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
// Dodaje lub aktualizuje lokalizację użytkownika
export async function addUserLocation(email, latitude, longitude) {
	try {
		const q = query(collection(db, "users_locations"), where("name", "==", email))
		const querySnapshot = await getDocs(q)

		if (!querySnapshot.empty) {
			// Lokalizacja już istnieje – aktualizuj
			const docId = querySnapshot.docs[0].id
			await updateDoc(doc(db, "users_locations", docId), {
				location: new GeoPoint(latitude, longitude),
			})
			console.log("Zaktualizowano lokalizację użytkownika.")
			return docId
		} else {
			// Lokalizacja nie istnieje – dodaj
			const docRef = await addDoc(collection(db, "users_locations"), {
				name: email,
				location: new GeoPoint(latitude, longitude),
			})
			console.log("Dodano nową lokalizację użytkownika.")
			return docRef.id
		}
	} catch (error) {
		console.error("Błąd przy zapisie lokalizacji użytkownika: ", error)
	}
}

// Usuwa lokalizację użytkownika (wg docId lub emaila bieżącego użytkownika)
export async function deleteUserLocation(docId = null) {
	try {
		if (docId) {
			await deleteDoc(doc(db, "users_locations", docId))
			console.log("Lokalizacja użytkownika została usunięta (po docId).")
		} else {
			const user = auth.currentUser
			if (user) {
				const q = query(collection(db, "users_locations"), where("name", "==", user.email))
				const snapshot = await getDocs(q)

				snapshot.forEach(async docSnap => {
					await deleteDoc(doc(db, "users_locations", docSnap.id))
					console.log("Lokalizacja użytkownika została usunięta (po emailu).")
				})
			}
		}
	} catch (error) {
		console.error("Błąd przy usuwaniu lokalizacji użytkownika: ", error)
	}
}

// Pobieranie lokalizacji wszystkich użytkowników
export async function fetchUserLocations() {
	try {
		const querySnapshot = await getDocs(collection(db, "users_locations"))
		if (querySnapshot.empty) {
			console.log("No documents found in 'users_locations'")
			return []
		}

		// Zwracamy lokalizacje użytkowników (name, location)
		const users = querySnapshot.docs.map(docSnap => ({
			id: docSnap.id,
			name: docSnap.data().name,
			location: docSnap.data().location,
		}))

		return users
	} catch (error) {
		console.error("Error fetching documents: ", error)
		return []
	}
}
