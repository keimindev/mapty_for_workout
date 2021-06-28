'use strict';

// Elements
const form = document.querySelector('.form');
const inputType = document.querySelector('.form-input--type');
const workoutTitle = document.querySelector('.workout-title');
const inputDistance = document.querySelector('.form-input--distance');
const inputDuration = document.querySelector('.form-input--duration');
const inputCadence = document.querySelector('.form-input--cadence');
const inputElevation = document.querySelector('.form-input--elevation');

const deleteBtn = document.querySelector('.delete');
const deleteAllBtn = document.querySelector('.delete-all');

let map, mapEvent;


if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const coords = {
      lat,
      lon
    };

    map = L.map('map').setView(coords, 17);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Handling Clicks on map
    map.on('click', function(mapE){
      mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
    })

  }, function () {
    alert('nope');
  })

};


form.addEventListener('submit', function (e) {

  e.preventDefault();
//Display marker
  const {lat,lng} = mapEvent.latlng;
  L.marker({lat, lng})
    .addTo(map)
    .bindPopup(L.popup({
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `running-popup`,
    }))
    //marker부분에 뜨는 내용
    .setPopupContent(`workout`)
    .openPopup();

})
