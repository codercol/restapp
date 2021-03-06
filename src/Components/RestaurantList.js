import React from "react";
import StarRatings from "react-star-ratings";
import AddReview from "./AddReview";

export default function RestaurantList({
  nearbyRestaurants,
  setQuery,
  setInfoWindowName
}) {
  return (
    <div className="restaurant-list">
      <ul>
        <li className="list-header">Restaurants</li>
        {nearbyRestaurants.map((place) => (
          <div>
            <li>
              <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                {place.name}
              </div>
              <br />

              <div style={{ color: "gold" }}>
                {place.rating}
                <span>
                  <StarRatings
                    rating={place.rating}
                    starDimension="20px"
                    starSpacing="1px"
                    starRatedColor="gold"
                    numberOfStars={5}
                    name="rating"
                  />
                </span>
              </div>
              <br />
              <div style={{ fontStyle: "italic" }}>{place.vicinity}</div>

              <AddReview
                key={place.name}
                name={place.name}
                setQuery={setQuery}
                setInfoWindowName={setInfoWindowName}
              />
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
}
