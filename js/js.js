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

let map, mapEvent;

const date = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];  
today.innerText = `${months[date.getMonth()]} ${date.getDate()}`;



class App{
  constructor(){

    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationInput);



  }

  _getPosition(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
        alert('fail to call your location');
      })
    
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._getWeather.bind(this), function () {
        alert('fail to call your location');
      })
    
    };


  }

  _loadMap(position){
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const coords = {
      lat,
      lon
    };

    this.map = L.map('map').setView(coords, 17);
    
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    //Handling Clicks on map
    this.map.on('click', function(mapE){
      mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
    })

  }

  _getWeather(position){

    const api ={
      key: "2dce14b5cb89113de2ab27e458030969",
      base: "https://api.openweathermap.org/data/2.5/"
    }
    
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`)
    .then(weather => {
        return weather.json();
    }).then(this._displayWeather);

  }

  _displayWeather(weather){
    weatherDisplay.innerText = `${weather.weather[0].main}`;
    degree.innerText = `${weather.main.temp_min}℃/ ${weather.main.temp_max}℃`;
    workoutLocation.innerText = `${weather.name}/${weather.sys.country}`;
  }

  _toggleElevationInput(){
    inputCadence.closest('.form-row').classList.toggle('form-row--hidden');  
    inputElevation.closest('.form-row').classList.toggle('form-row--hidden');  
  }

  _newWorkout(e){
    e.preventDefault();

    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
  //Display marker
    const {lat,lng} = mapEvent.latlng;
    L.marker({lat, lng})
      .addTo(this.map)
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
  }

}

const app = new App();



