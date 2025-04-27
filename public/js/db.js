import { db } from './firebase.js'; // Importujesz instancję Firestore
import { collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const AddFavPlaceBtn = document.getElementById("add-place-btn")
async function fetchFavouritePlaces() {
    try {
        const querySnapshot = await getDocs(collection(db, "favourite_places"));
        if (querySnapshot.empty) {
            console.log("No documents found in 'favourite_places'");
            return [];
        }
        const places = querySnapshot.docs.map(doc => doc.data());
        return places;
    } catch (error) {
        console.error("Error fetching documents: ", error);
        return [];
    }
}

async function displayFavouritePlaces() {
    const places = await fetchFavouritePlaces();
    const tableBody = document.getElementById('favourite-places-table-data');

    places.forEach((place, index) => {
        const row = document.createElement('tr');
        
        const cell1 = document.createElement('td');
        cell1.textContent = index + 1; // Numeracja
        row.appendChild(cell1);

        const cell2 = document.createElement('td');
        cell2.textContent = place.name; // Nazwa miejsca
        row.appendChild(cell2);

        const cell3 = document.createElement('td');
        cell3.textContent = place.location; // Współrzędne
        row.appendChild(cell3);

        const cell4 = document.createElement('td');
        cell4.textContent = place.description; // Opis miejsca
        row.appendChild(cell4);

        tableBody.appendChild(row);
    });
}

// Funkcja dodająca nowe miejsce do Firestore
export async function addFavouritePlace(name, location, description) {
    try {
        // Dodajemy nowe miejsce do kolekcji "favourite_places"
        const docRef = await addDoc(collection(db, "favourite_places"), {
            name: name,
            description: description,
            location: location,  // Możesz dodać współrzędne, jeśli chcesz
        });
        console.log("Miejsce zostało dodane z ID: ", docRef.id);
    } catch (e) {
        console.error("Błąd przy dodawaniu miejsca: ", e);
        throw new Error('Nie udało się dodać miejsca');
    }
}

// Wywołanie funkcji po załadowaniu strony
window.onload = displayFavouritePlaces;

AddFavPlaceBtn.addEventListener("click", ()=>{displayFavouritePlaces()})

