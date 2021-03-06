// import React from 'react';
// import DeckGL, { LineLayer, ScatterplotLayer } from 'deck.gl';

// // カメラ（視点）の設定
// const viewState = {
//   longitude: -122.41669,
//   latitude: 37.7853,
//   zoom: 13,
//   pitch: 0,
//   bearing: 0
// };

// // データ（始点と終点）
// const data = [{
//   sourcePosition: [-122.41669, 37.7853],
//   targetPosition: [-122.41669, 37.781]
// }];

// class App extends React.Component {
//   render() {
//     const layers = [
//       // レイヤーの種類を指定し、データを渡す
//       // new LineLayer({ id: 'line-layer', data })
//       new ScatterplotLayer({
//         data: [
//           { position: [-122.45, 37.8], color: [255, 0, 0], radius: 100 }
//         ],
//         getColor: d => d.color,
//         getRadius: d => d.radius
//       })
//     ];

//     return (
//       // deck.glにpropsとしてカメラとレイヤーを渡す
//       <DeckGL viewState={viewState} layers={layers} />
//     );
//   }
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import TripsData  from "./dentetsu.json"

const MAPBOX_TOKEN = "*****"

// Source data CSV
// const DATA_URL = {
//   BUILDINGS:
//     'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
//   TRIPS: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json' // eslint-disable-line
// };

const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS: TripsData // eslint-disable-line
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

// const INITIAL_VIEW_STATE = {
//   longitude: -74.005650,
//   latitude: 40.712087,
//   zoom: 13,
//   pitch: 45,
//   bearing: 0
// };

const INITIAL_VIEW_STATE = {
  longitude: 130.7134138,
  latitude: 32.8455853,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const landCover = [[[-74.0, 40.7], [-74.02, 40.7], [-74.02, 40.72], [-74.0, 40.72]]];

export default function App({
  trips = DATA_URL.TRIPS,
  trailLength = 30,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 90170, // unit corresponds to the timestamp in source data
  animationSpeed = 10
}) {

  // const timestamps = trips.reduce(
  //   (ts, trip) => ts.concat(trip.timestamps),
  //   []
  // );
  // loopLength = Math.max(...timestamps) + 50;
  // console.log(Math.max(...timestamps))
  // console.log(Math.min(...timestamps))

  const [time, setTime] = useState(3600*4);
  const [animation] = useState({});

  const animate = () => {
    setTime(t => (t + animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(
    () => {
      animation.id = window.requestAnimationFrame(animate);
      return () => window.cancelAnimationFrame(animation.id);
    },
    [animation]
  );

  const layers = [
    // This is only needed when using shadow effects
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      getPolygon: f => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0]
    }),
    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength: trailLength,
      currentTime: time,

      shadowEnabled: false
    }),
    // new PolygonLayer({
    //   id: 'buildings',
    //   data: buildings,
    //   extruded: true,
    //   wireframe: false,
    //   opacity: 0.5,
    //   getPolygon: f => f.polygon,
    //   getElevation: f => f.height,
    //   getFillColor: theme.buildingColor,
    //   material: theme.material
    // })
  ];

  return (
    <DeckGL
      layers={layers}
      effects={theme.effects}
      initialViewState={initialViewState}
      controller={true}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} mapboxApiAccessToken={MAPBOX_TOKEN}>
        <div style={{ margin: "0.5rem", fontFamily: "monospace", fontSize: "18px", color: "white" }}>
          Current Time: { Math.floor(time/3600) }時{Math.floor((time%3600)/60)}分
        </div>
      </StaticMap>
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
