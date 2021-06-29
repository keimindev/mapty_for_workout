'use strict';

// Elements
const form = document.querySelector('.form');
const inputType = document.querySelector('.form-input--type');
const workoutTitle = document.querySelector('.workout-title');
const inputDistance = document.querySelector('.form-input--distance');
const inputDuration = document.querySelector('.form-input--duration');
const inputCadence = document.querySelector('.form-input--cadence');
const inputElevation = document.querySelector('.form-input--elevation');
const workoutLocation = document.querySelector('.workout-location');

const deleteBtn = document.querySelector('.delete');
const deleteAllBtn = document.querySelector('.delete-all');

const today = document.querySelector('.date');
const degree = document.querySelector('.degree'); 
const weatherDisplay = document.querySelector('.weather'); 
const hilow = document.querySelector('.hilow'); 

let map, mapEvent;

const date = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];  
today.innerText = `${months[date.getMonth()]} ${date.getDate()}`;

const api ={
  key: "2dce14b5cb89113de2ab27e458030969",
  base: "https://api.openweathermap.org/data/2.5/"
}



if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const coords = {
      lat,
      lon
    };

    fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`)
    .then(weather => {
        return weather.json();
    }).then(getWeather);

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

function getWeather(weather){
  weatherDisplay.innerText = `${weather.weather[0].main}`;
  degree.innerText = `${weather.main.temp_min}℃/ ${weather.main.temp_max}℃`;
  workoutLocation.innerText = `${weather.name}/${weather.sys.country}`;
}

form.addEventListener('submit', function (e) {

  e.preventDefault();

  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
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

  form.classList.add('hidden');

})

inputType.addEventListener('change', function(){
  inputCadence.closest('.form-row').classList.toggle('form-row--hidden');  
  inputElevation.closest('.form-row').classList.toggle('form-row--hidden');  
})
