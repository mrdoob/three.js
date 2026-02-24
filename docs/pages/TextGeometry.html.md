*Inheritance: EventDispatcher → BufferGeometry → ExtrudeGeometry →*

# TextGeometry

A class for generating text as a single geometry. It is constructed by providing a string of text, and a set of parameters consisting of a loaded font and extrude settings.

See the [FontLoader](FontLoader.html) page for additional details.

`TextGeometry` uses [typeface.json](http://gero3.github.io/facetype.js/) generated fonts. Some existing fonts can be found located in `/examples/fonts`.

## Code Example

```js
const loader = new FontLoader();
const font = await loader.loadAsync( 'fonts/helvetiker_regular.typeface.json' );
const geometry = new TextGeometry( 'Hello three.js!', {
	font: font,
	size: 80,
	depth: 5,
	curveSegments: 12
} );
```

## Import

TextGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
```

## Constructor

### new TextGeometry( text : string, parameters : TextGeometry~Options )

Constructs a new text geometry.

**text**

The text that should be transformed into a geometry.

**parameters**

The text settings.

## Type Definitions

### .Options

Represents the `options` type of the geometry's constructor.

**font**  
[Font](Font.html)

The font.

**size**  
number

The text size.

Default is `100`.

**depth**  
number

Depth to extrude the shape.

Default is `50`.

**curveSegments**  
number

Number of points on the curves.

Default is `12`.

**steps**  
number

Number of points used for subdividing segments along the depth of the extruded spline.

Default is `1`.

**bevelEnabled**  
boolean

Whether to beveling to the shape or not.

Default is `false`.

**bevelThickness**  
number

How deep into the original shape the bevel goes.

Default is `10`.

**bevelSize**  
number

Distance from the shape outline that the bevel extends.

Default is `8`.

**bevelOffset**  
number

Distance from the shape outline that the bevel starts.

Default is `0`.

**bevelSegments**  
number

Number of bevel layers.

Default is `3`.

**direction**  
string

Char direction: ltr(left to right), rtl(right to left) & tb(top bottom).

Default is `'ltr'`.

**extrudePath**  
[Curve](Curve.html)

A 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion.

Default is `null`.

**UVGenerator**  
Object

An object that provides UV generator functions for custom UV generation.

## Source

[examples/jsm/geometries/TextGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/TextGeometry.js)