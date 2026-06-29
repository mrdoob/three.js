# ColorConverter

A utility class with helper functions for color conversion.

## Import

ColorConverter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ColorConverter } from 'three/addons/math/ColorConverter.js';
```

## Static Methods

### .getHSV( color : Color, target : Object ) : Object

Returns a HSV color representation of the given color object.

**color**

The color to get HSV values from.

**target**

The target object that is used to store the method's result.

**Returns:** The HSV color.

### .getOKLCH( color : Color, target : Object ) : Object

Returns an OKLCH color representation of the given color object.

**color**

The color to get OKLCH values from.

**target**

The target object that is used to store the method's result.

**Returns:** The OKLCH color.

### .setHSV( color : Color, h : number, s : number, v : number ) : Color

Sets the given HSV color definition to the given color object.

**color**

The color to set.

**h**

The hue.

**s**

The saturation.

**v**

The value.

**Returns:** The update color.

### .setOKLCH( color : Color, l : number, c : number, h : number ) : Color

Sets the given OKLCH color definition to the given color object.

**color**

The color to set.

**l**

The lightness.

**c**

The chroma.

**h**

The hue.

**Returns:** The updated color.

## Source

[examples/jsm/math/ColorConverter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/ColorConverter.js)
