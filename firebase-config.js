// Firebase Configuration para compartir ubicaciones
const firebaseConfig = {
    apiKey: "AIzaSyCVQEwOPQZAwocJNyxXxsuwnIJuRXDtD-0",
    authDomain: "goodviv-spy.firebaseapp.com",
    databaseURL: "https://goodviv-spy-default-rtdb.firebaseio.com",
    projectId: "goodviv-spy",
    storageBucket: "goodviv-spy.appspot.com",
    messagingSenderId: "891234567890",
    appId: "1:891234567890:web:1234567890abcdef"
};

// Inicializar Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para guardar ubicación capturada
function saveLocationToFirebase(locationData) {
    const locationsRef = ref(database, 'capturedLocations');
    push(locationsRef, locationData);
}

// Función para escuchar ubicaciones en tiempo real
function listenToLocations(callback) {
    const locationsRef = ref(database, 'capturedLocations');
    onValue(locationsRef, (snapshot) => {
        const data = snapshot.val();
        const locations = data ? Object.values(data) : [];
        callback(locations);
    });
}