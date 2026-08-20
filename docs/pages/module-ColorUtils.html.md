# ColorUtils

## Import

ColorUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as ColorUtils from 'three/addons/utils/ColorUtils.js';
```

## Methods

### .setKelvin( color : Color, kelvin : number ) : Color (inner)

Sets the given color from a color temperature in Kelvin.

Converts a correlated color temperature (CTT) to an approximate sRGB color using Tanner Helland's algorithm. Useful for physically-based lighting setups — e.g. candle flame (~1900K), tungsten bulb (~3200K), daylight (~6500K), or clear blue sky (~10000K). Values outside \[1000, 40000\] are clamped.

Reference: https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html

**color**

The color to set.

**kelvin**

Color temperature in Kelvin. Clamped to \[1000, 40000\].

**Returns:** The updated color.

## Source

[examples/jsm/utils/ColorUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/ColorUtils.js)