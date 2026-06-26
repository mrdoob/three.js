*Inheritance: EventDispatcher → Object3D → Line →*

# PositionalAudioHelper

This helper displays the directional cone of a positional audio.

`PositionalAudioHelper` must be added as a child of the positional audio.

## Code Example

```js
const positionalAudio = new THREE.PositionalAudio( listener );
positionalAudio.setDirectionalCone( 180, 230, 0.1 );
scene.add( positionalAudio );
const helper = new PositionalAudioHelper( positionalAudio );
positionalAudio.add( helper );
```

## Import

PositionalAudioHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
```

## Constructor

### new PositionalAudioHelper( audio : PositionalAudio, range : number, divisionsInnerAngle : number, divisionsOuterAngle : number )

Constructs a new positional audio helper.

**audio**

The audio to visualize.

**range**

The range of the directional cone.

Default is `1`.

**divisionsInnerAngle**

The number of divisions of the inner part of the directional cone.

Default is `16`.

**divisionsOuterAngle**

The number of divisions of the outer part of the directional cone.

Default is `2`.

## Properties

### .audio : PositionalAudio

The audio to visualize.

### .divisionsInnerAngle : number

The number of divisions of the inner part of the directional cone.

Default is `16`.

### .divisionsOuterAngle : number

The number of divisions of the outer part of the directional cone.

Default is `2`.

### .range : number

The range of the directional cone.

Default is `1`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper. This method must be called whenever the directional cone of the positional audio is changed.

## Source

[examples/jsm/helpers/PositionalAudioHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/PositionalAudioHelper.js)