# DRACOExporter

An exporter to compress geometry with the Draco library.

[Draco](https://google.github.io/draco/) is an open source library for compressing and decompressing 3D meshes and point clouds. Compressed geometry can be significantly smaller, at the cost of additional decoding time on the client device.

Standalone Draco files have a `.drc` extension, and contain vertex positions, normals, colors, and other attributes. Draco files _do not_ contain materials, textures, animation, or node hierarchies – to use these features, embed Draco geometry inside of a glTF file. A normal glTF file can be converted to a Draco-compressed glTF file using [glTF-Pipeline](https://github.com/AnalyticalGraphicsInc/gltf-pipeline).

## Code Example

```js
const exporter = new DRACOExporter();
const data = exporter.parse( mesh, options );
```

## Import

DRACOExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DRACOExporter } from 'three/addons/exporters/DRACOExporter.js';
```

## Constructor

### new DRACOExporter()

## Properties

### .MESH_EDGEBREAKER_ENCODING : number (constant)

Edgebreaker encoding.

Default is `1`.

### .MESH_SEQUENTIAL_ENCODING : number (constant)

Sequential encoding.

Default is `0`.

## Methods

### .parse( object : Mesh | Points, options : DRACOExporter~Options ) : Int8Array

Parses the given mesh or point cloud and generates the Draco output.

**object**

The mesh or point cloud to export.

**options**

The export options.

**Returns:** The exported Draco.

## Type Definitions

### .Options

Export options of `DRACOExporter`.

**decodeSpeed**  
number

Indicates how to tune the encoder regarding decode speed (0 gives better speed but worst quality).

Default is `5`.

**encodeSpeed**  
number

Indicates how to tune the encoder parameters (0 gives better speed but worst quality).

Default is `5`.

**encoderMethod**  
number

Either sequential (very little compression) or Edgebreaker. Edgebreaker traverses the triangles of the mesh in a deterministic, spiral-like way which provides most of the benefits of this data format.

Default is `1`.

**quantization**  
Array.<number>

Indicates the precision of each type of data stored in the draco file in the order (POSITION, NORMAL, COLOR, TEX\_COORD, GENERIC).

Default is `[ 16, 8, 8, 8, 8 ]`.

**exportUvs**  
boolean

Whether to export UVs or not.

Default is `true`.

**exportNormals**  
boolean

Whether to export normals or not.

Default is `true`.

**exportColor**  
boolean

Whether to export colors or not.

Default is `false`.

## Source

[examples/jsm/exporters/DRACOExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/DRACOExporter.js)