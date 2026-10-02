# HydrantGenerator

A classic cast-iron fire hydrant: a stout barrel on a flared footing, capped by a domed bonnet and a hex operating nut, with two side outlet nozzles and a larger front pumper nozzle. Built once and instanced across a list of placements, dressed with one cheap material that branches on a baked `partId` ( weathered red iron, bare metal caps ).

The canonical model stands on `y = 0`, centred in X / Z, with the pumper nozzle facing `+Z`, so a placement whose local `+Z` faces the road presents it to traffic.

## Code Example

```js
const hydrants = new HydrantGenerator();
scene.add( hydrants.build( placements ) ); // placements: Matrix4[]
```

## Constructor

### new HydrantGenerator()

## Source

[examples/jsm/generators/city/HydrantGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/HydrantGenerator.js)