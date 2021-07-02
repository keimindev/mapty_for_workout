'use strict';

// Elements
const form = document.querySelector('.form');
const containWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form-input--type');
const workoutTitle = document.querySelector('.workout-title');
const inputDistance = document.querySelector('.form-input--distance');
const inputDuration = document.querySelector('.form-input--duration');
const inputCadence = document.querySelector('.form-input--cadence');
const inputElevation = document.querySelector('.form-input--elevation');
const workoutIcon = document.querySelector('.workout-icon');
const sortBy = document.querySelector('.sort');

const deleteAllBtn = document.querySelector('.delete-all');

const today = document.querySelector('.day>p');
const degree = document.querySelector('.degree');
const weatherDisplay = document.querySelector('.weather');
const workoutLocation = document.querySelector('.location');

let map, mapEvent, key;


const date = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const getLocation = (currentLocation) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(currentLocation, function () {
      alert('fail to call your location');
    })

  };
}

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  road = workoutLocation.innerText;
  // key = 1;
  // // for(key = 0, key < localStorage.length, key ++ ){
  // //   return key ++;
  // // }

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;

  }

  _setTitle() {
    this.setTitlte = `
  ${this.type[0].toUpperCase()}${this.type.slice(1)} on
  ${months[this.date.getMonth()]} ${this.date.getDate()}
  `;
  }

}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = 'running';
    this.calculatePace();
    this._setTitle();


  }

  calculatePace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.type = 'cycling';
    this.calculateSpeed();
    this._setTitle();

  }

  calculateSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}




////////////////////// Architecture Application ///////////////////////////




class App {
  #workouts = [];
  constructor() {

    getLocation(this._loadMap.bind(this));
    getLocation(this._getWeather.bind(this));
    this._getLocalStorage();
    this._reset();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationInput);

    deleteAllBtn.addEventListener('click',this._deleteAllWorkout);

    containWorkouts.addEventListener('click', this._moveToPopup.bind(this));

  }

  _loadMap(position) {
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
    this.map.on('click', this._showForm.bind(this))

    //from Local Storage
    this.#workouts.forEach((work) => {
      this.renderWorkoutMarker(work);
    })

  }


  _showForm(mapE) {
    mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm(){
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
    form.classList.add('hidden');

  }

  _getWeather(position) {

    const api = {
      key: "2dce14b5cb89113de2ab27e458030969",
      base: "https://api.openweathermap.org/data/2.5/"
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`)
      .then(weather => {return weather.json();})
      .then(this._displayWeather);
  }

  _displayWeather(weather) {
    today.innerText = `${months[date.getMonth()]} ${date.getDate()}`;
    weatherDisplay.innerText = `${weather.weather[0].main}`;
    degree.innerText = `${weather.main.temp}℃`;
    workoutLocation.innerText = `${weather.name}.${weather.sys.country}`;

  }

  _toggleElevationInput() {
    inputCadence.closest('.form-row').classList.toggle('form-row--hidden');
    inputElevation.closest('.form-row').classList.toggle('form-row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();


    //Get Data from Form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const {
      lat,
      lng
    } = mapEvent.latlng;
    let workout;
    let place = workoutLocation.innerText;


    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) {
        return alert('Input have to be Positive numbers!');
      }

      workout = new Running({
        lat,
        lng
      }, distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevation)) {
        return alert('Input have to be Positive numbers!');
      }

      workout = new Cycling({
        lat,
        lng
      }, distance, duration, elevation);
    }
    //add new object to workout array
    this.#workouts.push(workout);

    //Render workout on map as marker
    this.renderWorkoutMarker(workout);

    this._renderWorkout(workout,place);

    this._hideForm();

    this._setLocalStorage();

    sortBy.classList.remove('hidden');

    
  }


  renderWorkoutMarker(workout) {
    //Display marker
    L.marker(workout.coords)
      .addTo(this.map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      }))
      //marker부분에 뜨는 내용
      .setPopupContent(`${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.setTitlte}`)
      .openPopup();

  }


  _renderWorkout(workout) {
    let html = `
    <li class="workout workout-${workout.type}" data-id="${workout.id}">
    <div class="workout-content">
      <h2 class="workout-title">${workout.setTitlte}</h2>
      <button class="delete hidden"><i class="far fa-trash-alt"></i></button>
    </div>
    <div class="workout-details">
      <span class="workout-icon">🌏&nbsp;</span>
      <span class="workout-location">${workout.road}</span>
    </div>
    <div class="workout-details">
      <span class="workout-icon">${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
      <span class="workout-value">&nbsp;${workout.distance}</span>
      <span class="workout-unit">&nbsp;km</span>
    </div>
    <div class="workout-details">
      <span class="workout-icon">⏱&nbsp;</span>
      <span class="workout-value">${workout.duration}</span>
      <span class="workout-unit">&nbsp;min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `
      <div class="workout-details">
      <span class="workout-icon">⚡️&nbsp;</span>
      <span class="workout-value">${workout.pace.toFixed(1)}</span>
      <span class="workout-unit">&nbsp;min/km</span>
    </div>
    <div class="workout-details">
      <span class="workout-icon">🦶🏼&nbsp;</span>
      <span class="workout-value">${workout.cadence}</span>
      <span class="workout-unit">&nbsp;spm</span>
    </div>
  </li>`
    };

    if (workout.type === 'cycling') {
      html += `
      <div class="workout-details">
      <span class="workout-icon">⚡️&nbsp;</span>
      <span class="workout-value">${workout.speed.toFixed(1)}</span>
      <span class="workout-unit">&nbsp;km/h</span>
    </div>
    <div class="workout-details">
      <span class="workout-icon">⛰&nbsp;</span>
      <span class="workout-value">${workout.elevation}</span>
      <span class="workout-unit">&nbsp;m</span>
    </div>
  </li>`
    };

    sortBy.insertAdjacentHTML('afterend', html);

    const detBtn = document.querySelector('.delete')

    detBtn.addEventListener('click', (e) => {
      const btn = e.target.parentNode;
      const list = btn.parentNode;
      const eleInList = list.parentNode;
      const index = `${workout.id}`;

      let arrIndex = this.#workouts.findIndex(item => item.id == index);
      const itemId = this.#workouts[arrIndex].id;


      if( index == itemId){
        eleInList.remove();
        this.#workouts.splice(arrIndex, 1);
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      }
    
    });
;
  }

  _moveToPopup(e){
     const workoutEl = e.target.closest('.workout');
  
    //workout 아닌걸 클릭하면 계속 null탄생~return해줘야함
     if(!workoutEl) return;
  
    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
     
    //leaflet doc에서 찾을 수 있음 
    this.map.setView(workout.coords, 17, {
      animate: true,
      pan: {
        duration: 1
      }
    });
  }

  _setLocalStorage(){
    localStorage.setItem('workouts',  JSON.stringify(this.#workouts));
    
  }

  _getLocalStorage(){
    const workoutData = JSON.parse(localStorage.getItem('workouts'));

    if(!workoutData) return;

    this.#workouts = workoutData;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });

    this._reset(workoutData);
  }


  _reset(workoutData){
    if(workoutData){
      sortBy.classList.remove('hidden');
    }
  }

  _deleteAllWorkout(){
    const workoutsList = document.querySelectorAll('.workout');
    const popupOnMap = document.querySelectorAll('.leaflet-popup');
    const popupIcon = document.querySelectorAll('.leaflet-marker-icon');

    workoutsList.forEach( (ele) => ele.remove());
    popupOnMap.forEach( (ele) => ele.remove());
    popupIcon.forEach( (ele) => ele.remove());

  
    localStorage.removeItem('workouts');
  }


}

const app = new App();
