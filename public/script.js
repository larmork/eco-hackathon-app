import {ymaps} from '../react-ymaps';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';


ymaps.ready(init);
    
function init() {
var myMap = new ymaps.Map("map", { center: [46.062615, 36.854095], zoom: 8 });

myMap.controls.remove('geolocationControl');
myMap.controls.remove('searchControl');
myMap.controls.remove('trafficControl');
myMap.controls.remove('typeSelector');

const firebaseConfig = {
apiKey: "AIzaSyAy9MphweJbBDel5SKq3CbSePEhTscZd2w",
authDomain: "literallylitter-968b9.firebaseapp.com",
databaseURL: "https://literallylitter-968b9-default-rtdb.firebaseio.com/",
projectId: "literallylitter-968b9",
storageBucket: "literallylitter-968b9.appspot.com",
messagingSenderId: "686249910609",
appId: "1:686249910609:web:5ea9fbf5bdbfc973e63370",
measurementId: "G-VXRGZ3BJG2"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const chatsRef = ref(database, 'id');
onValue(chatsRef, function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var childData = childSnapshot.val();

    var latitude = childData.latitude;
    var longitude = childData.longitude;

    var marker = new ymaps.Placemark([latitude, longitude]);
    myMap.geoObjects.add(marker);
  })
})
}

