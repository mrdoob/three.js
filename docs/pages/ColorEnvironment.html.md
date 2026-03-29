*Inheritance: EventDispatcher → Object3D → Scene →*

# ColorEnvironment

This class represents a scene with a uniform color that can be used as input for [PMREMGenerator#fromScene](PMREMGenerator.html#fromScene). The resulting PMREM represents uniform ambient lighting and can be used for Image Based Lighting by assigning it to [Scene#environment](Scene.html#environment).

## Code Example

```js
const environment = new ColorEnvironment( 0x00ff00 );
const pmremGenerator = new THREE.PMREMGenerator( renderer );
const envMap = pmremGenerator.fromScene( environment ).texture;
scene.environment = envMap;
```

## Import

ColorEnvironment is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ColorEnvironment } from 'three/addons/environments/ColorEnvironment.js';
```

## Constructor

### new ColorEnvironment( color : number | Color )

Constructs a new color environment.

**color**

The color of the environment.

Default is `16777215`.

## Methods

### .dispose()

Frees internal resources. This method should be called when the environment is no longer required.

## Source

[examples/jsm/environments/ColorEnvironment.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/environments/ColorEnvironment.js)