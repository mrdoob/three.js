# TrafficlightGenerator

A NYC traffic signal: a round pole at the curb with a horizontal mast arm reaching out over the roadway to a vertical three-section signal head, plus a pedestrian-signal box on the pole. Built once and instanced across a list of placements, dressed with one cheap material that branches on a baked `partId` ( dark metal, three coloured lenses ).

The canonical model stands on `y = 0`, centred in X / Z, with the arm reaching toward `+Z`, so a placement whose local `+Z` faces the road throws the head over it with its lenses aimed back at oncoming traffic.

## Code Example

```js
const lights = new TrafficlightGenerator();
scene.add( lights.build( placements ) ); // placements: Matrix4[]
```

## Constructor

### new TrafficlightGenerator()

## Source

[examples/jsm/generators/city/TrafficlightGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/TrafficlightGenerator.js)