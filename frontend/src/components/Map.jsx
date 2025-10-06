import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapStyles = { 
  height: "400px", 
  width: "100%" 
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const Map = ({ center = defaultCenter, markers = [] }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={center}
      >
        <Marker position={center} />
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} title={marker.title} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;