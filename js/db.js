import { db } from './firebase.js';  // Importuj zainicjalizowany db z firebase.js
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Pobieranie danych z kolekcji "favourite_places"
export const fetchFavouritePlaces = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "favourite_places"));
    const places = [];
    querySnapshot.forEach(doc => {
      places.push({ id: doc.id, ...doc.data() });  // Pobierz dane z dokumentu
    });
    return places;
  } catch (error) {
    console.error("Błąd podczas pobierania miejsc: ", error);
    return [];
  }
};

// Dodawanie nowego miejsca do kolekcji "favourite_places"
export const addFavouritePlace = async (name, location, description) => {
  try {
    const docRef = await addDoc(collection(db, "favourite_places"), {
      name: name,
      location: location,
      description: description,
      createdAt: new Date()  // Dodaj datę dodania
    });
    console.log("Nowe miejsce dodane z ID: ", docRef.id);
  } catch (error) {
    console.error("Błąd podczas dodawania miejsca: ", error);
  }
};