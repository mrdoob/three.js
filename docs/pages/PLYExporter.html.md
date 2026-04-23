# PLYExporter

An exporter for PLY.

PLY (Polygon or Stanford Triangle Format) is a file format for efficient delivery and loading of simple, static 3D content in a dense format. Both binary and ascii formats are supported. PLY can store vertex positions, colors, normals and uv coordinates. No textures or texture references are saved.

## Code Example

```js
const exporter = new PLYExporter();
const data = exporter.parse( scene, options );
```

## Import

PLYExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
```

## Constructor

### new PLYExporter()

## Methods

### .parse( object : Object3D, onDone : PLYExporter~OnDone, options : PLYExporter~Options ) : string | ArrayBuffer

Parses the given 3D object and generates the PLY output.

If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.

**object**

The 3D object to export.

**onDone**

A callback function that is executed when the export has finished.

**options**

The export options.

**Returns:** The exported PLY.

## Type Definitions

### .OnDone( result : string | ArrayBuffer )

onDone callback of `PLYExporter`.

**result**

The generated PLY ascii or binary.

### .Options

Export options of `PLYExporter`.

**binary**  
boolean

Whether to export in binary format or ASCII.

Default is `false`.

**excludeAttributes**  
Array.<string>

Which properties to explicitly exclude from the exported PLY file. Valid values are `'color'`, `'normal'`, `'uv'`, and `'index'`. If triangle indices are excluded, then a point cloud is exported.

**littleEndian**  
boolean

Whether the binary export uses little or big endian.

Default is `false`.

## Source

[examples/jsm/exporters/PLYExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/PLYExporter.js)