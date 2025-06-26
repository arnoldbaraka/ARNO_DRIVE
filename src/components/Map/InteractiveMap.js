import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { db } from '../../utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './InteractiveMap.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function NairobiRacingMap() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const markers = useRef({});

  // Load Nairobi racing routes
  useEffect(() => {
    const fetchRoutes = async () => {
      const response = await fetch('/nairobi-map/routes.json');
      return response.json();
    };

    const initializeMap = async () => {
      const routes = await fetchRoutes();
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [36.8219, -1.2921],
        zoom: 11,
        pitch: 45
      });

      mapInstance.on('load', () => {
        // Add 3D terrain
        mapInstance.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512
        });
        mapInstance.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Add racing routes
        mapInstance.addSource('race-routes', {
          type: 'geojson',
          data: routes
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'race-routes',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff0000',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Add landmarks
        mapInstance.addSource('landmarks', {
          type: 'geojson',
          data: '/nairobi-map/landmarks.json'
        });

        mapInstance.addLayer({
          id: 'landmarks',
          type: 'circle',
          source: 'landmarks',
          paint: {
            'circle-radius': 6,
            'circle-color': '#00ffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      });

      setMap(mapInstance);
    };

    initializeMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Load real-time driver locations
  useEffect(() => {
    if (!map) return;

    const unsubscribe = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const driver = change.doc.data();
        const driverId = change.doc.id;

        if (change.type === 'added' || change.type === 'modified') {
          const { lng, lat } = driver.location;

          if (markers.current[driverId]) {
            // Update existing marker
            markers.current[driverId].setLngLat([lng, lat]);
          } else {
            // Create new marker
            const el = document.createElement('div');
            el.className = 'driver-marker';
            el.innerHTML = `<div class="driver-icon">🏎️</div>`;
            
            markers.current[driverId] = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <div class="driver-popup">
                  <h3>${driver.name}</h3>
                  <p>Speed: ${driver.speed || 0} km/h</p>
                  <p>Status: ${driver.status || 'Racing'}</p>
                </div>
              `))
              .addTo(map);
          }
        } else if (change.type === 'removed') {
          if (markers.current[driverId]) {
            markers.current[driverId].remove();
            delete markers.current[driverId];
          }
        }
      });
    });

    return unsubscribe;
  }, [map]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      <div className="map-controls">
        <button className="holographic-btn" onClick={() => map.flyTo({
          center: [36.8219, -1.2921],
          zoom: 11,
          pitch: 45
        })}>
          Reset View
        </button>
      </div>
    </div>
  );
}                                                                                                            