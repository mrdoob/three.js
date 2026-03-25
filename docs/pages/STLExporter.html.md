# STLExporter

An exporter for STL.

STL files describe only the surface geometry of a three-dimensional object without any representation of color, texture or other common model attributes. The STL format specifies both ASCII and binary representations, with binary being more compact. STL files contain no scale information or indexes, and the units are arbitrary.

## Code Example

```js
const exporter = new STLExporter();
const data = exporter.parse( mesh, { binary: true } );
```

## Import

STLExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
```

## Constructor

### new STLExporter()

## Methods

### .parse( scene : Object3D, options : STLExporter~Options ) : string | ArrayBuffer

Parses the given 3D object and generates the STL output.

If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.

**scene**

A scene, mesh or any other 3D object containing meshes to encode.

**options**

The export options.

**Returns:** The exported STL.

## Type Definitions

### .Options

Export options of `STLExporter`.

**binary**  
boolean

Whether to export in binary format or ASCII.

Default is `false`.

## Source

[examples/jsm/exporters/STLExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/STLExporter.js)