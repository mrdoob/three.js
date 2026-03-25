# OBJExporter

An exporter for OBJ.

`OBJExporter` is not able to export material data into MTL files so only geometry data are supported.

## Code Example

```js
const exporter = new OBJExporter();
const data = exporter.parse( scene );
```

## Import

OBJExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
```

## Constructor

### new OBJExporter()

## Methods

### .parse( object : Object3D ) : string

Parses the given 3D object and generates the OBJ output.

If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.

**object**

The 3D object to export.

**Returns:** The exported OBJ.

## Source

[examples/jsm/exporters/OBJExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/OBJExporter.js)