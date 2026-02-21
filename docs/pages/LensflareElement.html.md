# LensflareElement

Represents a single flare that can be added to a [Lensflare](Lensflare.html) container.

## Import

LensflareElement is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LensflareElement } from 'three/addons/objects/Lensflare.js';
```

## Constructor

### new LensflareElement( texture : Texture, size : number, distance : number, color : Color )

Constructs a new lensflare element.

**texture**

The flare's texture.

**size**

The size in pixels.

Default is `1`.

**distance**

The normalized distance (`[0,1]`) from the light source. A value of `0` means the flare is located at light source.

Default is `0`.

**color**

The flare's color

## Properties

### .color : Color

The flare's color

Default is `(1,1,1)`.

### .distance : number

The normalized distance (`[0,1]`) from the light source. A value of `0` means the flare is located at light source.

Default is `0`.

### .size : number

The size in pixels.

Default is `1`.

### .texture : Texture

The flare's texture.

## Source

[examples/jsm/objects/Lensflare.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Lensflare.js)