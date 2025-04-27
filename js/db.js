import { db } from './firebase.js'; // Importujesz instancję Firestore
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

async function fetchFavouritePlaces() {
    // const querySnapshot = await getDocs(collection(db, "favourite_places"));
    // const places = querySnapshot.docs.map(doc => doc.data());
    // return places;
    try {
        const querySnapshot = await getDocs(collection(db, "favourite_places"));
        if (querySnapshot.empty) {
            console.log("No documents found in 'favourite_places'");
            return [];
        }
        const places = querySnapshot.docs.map(doc => doc.data());
        console.log("Fetched places:", places); // Sprawdzamy, czy dane zostały pobrane
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
        cell3.textContent = place.coordinates; // Współrzędne
        row.appendChild(cell3);

        tableBody.appendChild(row);
    });
}

// Wywołanie funkcji po załadowaniu strony
window.onload = displayFavouritePlaces;