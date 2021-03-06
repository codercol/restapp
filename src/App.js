import React, { useState, useEffect } from "react";
import "./styles.css";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";
import AddNewModal from "./Components/AddNewModal";
import mapStyles from "./mapStyles";
import StarRatings from "react-star-ratings";
import FilterRatings from "./Components/FilterRatings";
import RestaurantList from "./Components/RestaurantList";

// GLOBAL VARIABLES
const libraries = ["places"];

const mapContainerStyle = {
  height: "100vh",
  width: "100vw"
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};

// APP COMPONENT
export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDyb_aKsyq5CtMO83PKMbTVL79kCLTxqc8",
    libraries
  });

  const [userState, setUserState] = useState({
    currentLatLng: { lat: 0, lng: 0 }
  });

  const [newPlace, setNewPlace] = useState([]);
  // const [newPlaceSelected, setNewPlaceSelected] = useState(null);

  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState(null);

  const [firstRating, setFirstRating] = useState(0);
  const [secondRating, setSecondRating] = useState(5);

  const [query, setQuery] = useState("");
  const [infoWindowName, setInfoWindowName] = useState("");

  const [map, setMap] = useState(null)

  const [permUpdated, setPermUpdated] = useState(null)

  // const [newCenterLat, setNewCenterLat] = useState(null)
  // const [newCenterLng, setNewCenterLng] = useState(null)

  const reviewsArray = [
    `"Food/service was great!"`,
    `"This place was pretty good"`,
    `"We had an okay experience"`,
    `"Did not have a great experience"`
  ];


  const onLoad = React.useCallback(function callback(map) {
 //GET NEW CENTER AFTER PANNING TO GET OTHER RESTAURANTS IN NEW LOCATION 
    map.addListener("dragend", () => {

      let newLat = map.getCenter().lat();
      let newLng = map.getCenter().lng();

      setUserState((prevState) => ({
        currentLatLng: {
          ...prevState.currentLatLng,
          lat: newLat,
          lng: newLng
        }
      }));
    })

  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  // SET NEW PLACES/MARKERS ON MAPCLICK
  const onMapClick = React.useCallback((e) => {
    setNewPlace((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
    ]);
  }, []);



  // USEEFFECT TO FETCH NEARBY RESTAURANTS
  useEffect(() => {
    async function fetchRestaurants() {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userState.currentLatLng.lat},${userState.currentLatLng.lng}&radius=6047&type=restaurant&key=AIzaSyDyb_aKsyq5CtMO83PKMbTVL79kCLTxqc8`
      );
      const data = await response.json();
      setPermUpdated(true)
      // console.log(data)
      const filteredRatings =
        data.results &&
        data.results.filter((place) =>
          place.rating >= firstRating && place.rating <= secondRating
            ? place
            : null
        );
      //  console.log(filteredRatings);
      setNearbyRestaurants(filteredRatings);
    }
    fetchRestaurants();
  }, [
    userState.currentLatLng.lat,
    userState.currentLatLng.lng,
    firstRating,
    secondRating
  ]);


  // SHOW USER'S GEO-LOCATION
  function showCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserState((prevState) => ({
          currentLatLng: {
            ...prevState.currentLatLng,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
      });
    } else {
      console.log("error loading map");
    }
  }
  showCurrentLocation();

  const center = {
    lat: userState.currentLatLng.lat,
    lng: userState.currentLatLng.lng
  };

  if (loadError) return "Error loading map";
  if (!isLoaded) return "Loading...";

  return (
    <div className="App">
      <h1>Restaurant Review</h1>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
        zoom={13}

      >
        {/* PERSON-USER ICON */}
        <Marker
          position={{
            lat: userState.currentLatLng.lat,
            lng: userState.currentLatLng.lng
          }}
          icon={{
            url: "/person-icon.png",
            scaledSize: new window.google.maps.Size(30, 30)
          }}
        />

        {/* NEW RESTARUANTS MARKERS AND INFOWINDOW */}
        {newPlace.map((place) => (
          <AddNewModal
            key={`${place.lat}-${place.lng}`}
            nearbyRestaurants={nearbyRestaurants}
            newPlaceLat={place.lat}
            newPlaceLng={place.lng}
            permUpdated={permUpdated}
          />
        ))}

        {/* {newPlace.map((marker) => (
          <Marker
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setNewPlaceSelected(marker);
            }}
            icon={{
              url: `/restaurant-icon.png`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 20),
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        ))}

        {newPlaceSelected ? (
          <AddNewModal
            key={newPlaceSelected.name}
            nearbyRestaurants={nearbyRestaurants}
            newPlaceSelected={newPlaceSelected}
            setNewPlaceSelected={setNewPlaceSelected}
          />
        ) : null} */}

        {/* NEARBY RESTAURANT MARKERS AND INFOWINDOWS */}
        {nearbyRestaurants.map((place) => (
          <Marker
            position={{
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            }}
            onClick={() => {
              setSelectedRestaurants(place);
            }}
            icon={{
              url: "/restaurant-icon.png",
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        ))}

        {/* NEARBY RESTAURANT INFOWINDOWS */}
        {selectedRestaurants ? (
          <InfoWindow
            position={{
              lat: selectedRestaurants.geometry.location.lat,
              lng: selectedRestaurants.geometry.location.lng
            }}
            onCloseClick={() => {
              setSelectedRestaurants(null);
            }}
          >
            <div>
              <h4>{selectedRestaurants.name}</h4>
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=160x80&location=${selectedRestaurants.geometry.location.lat},${selectedRestaurants.geometry.location.lng}&fov=80&heading=70&pitch=0&key=AIzaSyDyb_aKsyq5CtMO83PKMbTVL79kCLTxqc8`}
                alt="restaurant-street-view"
              />
              <div style={{ color: "gold" }}>
                {selectedRestaurants.rating}{" "}
                <span>
                  {" "}
                  <StarRatings
                    rating={selectedRestaurants.rating}
                    starDimension="18px"
                    starSpacing="1px"
                    starRatedColor="gold"
                    numberOfStars={5}
                  />
                </span>
              </div>
              <div>
                <div>
                  {infoWindowName === selectedRestaurants.name
                    ? `"${query}"`
                    : null}
                </div>

                {selectedRestaurants.rating >= 4
                  ? reviewsArray[0]
                  : selectedRestaurants.rating >= 3.5
                    ? reviewsArray[1]
                    : selectedRestaurants.rating >= 3
                      ? reviewsArray[2]
                      : reviewsArray[3]}
              </div>
            </div>
          </InfoWindow>
        ) : null}

        {/* FILTER RATINGS */}
        <FilterRatings
          firstRating={firstRating}
          setFirstRating={setFirstRating}
          secondRating={secondRating}
          setSecondRating={setSecondRating}
        />

        {/* RESTAURANT LIST */}
        <RestaurantList
          key={nearbyRestaurants}
          nearbyRestaurants={nearbyRestaurants}
          setQuery={setQuery}
          setInfoWindowName={setInfoWindowName}
        />
      </GoogleMap>
    </div>
  );
}



