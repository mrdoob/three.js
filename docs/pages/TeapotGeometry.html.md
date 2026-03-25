*Inheritance: EventDispatcher → BufferGeometry →*

# TeapotGeometry

Tessellates the famous Utah teapot database by Martin Newell into triangles.

The teapot should normally be rendered as a double sided object, since for some patches both sides can be seen, e.g., the gap around the lid and inside the spout.

Segments 'n' determines the number of triangles output. Total triangles = 32_2_n_n - 8_n (degenerates at the top and bottom cusps are deleted).

Code based on [SPD software](http://tog.acm.org/resources/SPD/) Created for the Udacity course [Interactive Rendering](http://bit.ly/ericity)

## Code Example

```js
const geometry = new TeapotGeometry( 50, 18 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const teapot = new THREE.Mesh( geometry, material );
scene.add( teapot );
```

## Import

TeapotGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
```

## Constructor

### new TeapotGeometry( size : number, segments : number, bottom : boolean, lid : boolean, body : boolean, fitLid : boolean, blinn : boolean )

Constructs a new teapot geometry.

**size**

Relative scale of the teapot.

Default is `50`.

**segments**

Number of line segments to subdivide each patch edge.

Default is `10`.

**bottom**

Whether the bottom of the teapot is generated or not.

Default is `true`.

**lid**

Whether the lid is generated or not.

Default is `true`.

**body**

Whether the body is generated or not.

Default is `true`.

**fitLid**

Whether the lid is slightly stretched to prevent gaps between the body and lid or not.

Default is `true`.

**blinn**

Whether the teapot is scaled vertically for better aesthetics or not.

Default is `true`.

## Source

[examples/jsm/geometries/TeapotGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/TeapotGeometry.js)