# USDComposer

USDComposer handles scene composition from parsed USD data. This includes reference resolution, variant selection, transform handling, and building the Three.js scene graph.

Works with specsByPath format from USDCParser.

## Constructor

### new USDComposer()

## Methods

### ._applyMaterialBinding()

Apply material binding from a prim path to a mesh. Used when merging referenced geometry into a prim that has material binding.

### ._applyTextureOrValue()

Shared helper for applying texture or value from shader attribute. Reduces duplication between \_applyPreviewSurface and \_applyOpenPBRSurface.

### ._buildHierarchy()

Build the scene hierarchy recursively. Uses childrenByPath index for O(1) child lookup instead of O(n) iteration.

### ._buildIndexes()

Build indexes for efficient lookups. Called once during compose() to avoid O(n) scans per lookup.

### ._buildMesh()

Build a mesh from a Mesh spec.

### ._findSingleMesh()

Find a single mesh in the group's shallow hierarchy. Only returns a mesh if it's at depth 0 or 1, not deeply nested. This preserves transforms in complex hierarchies like Kitchen Set while supporting USDZExporter round-trip (Xform > Xform > Mesh pattern).

### ._getAttributes()

Get attributes for a path from attribute specs.

### ._getBasePath()

Get the base path (directory) from a file path.

### ._getLocalVariantSelections()

Extract variant selections from a spec's fields.

### ._getMaterialBindingTarget()

Get material binding target path, checking variant paths if needed.

### ._getMaterialPath()

Get the material path for a mesh, checking various binding sources.

### ._getReference()

Get reference value from a prim spec.

### ._getVariantPaths()

Get variant paths for a parent path based on variant selections.

### ._hasNonIdentityTransform()

Check if an object has a non-identity local transform.

### ._isDirectChild()

Check if a path is a direct child of parentPath.

### ._resolveFilePath()

Resolve a file path relative to basePath.

### ._resolveReference( refValue : string, localVariants : Object ) : Group | null

Resolve a USD reference and return the composed content.

**refValue**

Reference value like "@./path/to/file.usdc@"

**localVariants**

Variant selections to apply

**Returns:** Composed content or null

### .applyTransform()

Apply USD transforms to a Three.js object. Handles xformOpOrder with proper matrix composition. USD uses row-vector convention, Three.js uses column-vector.

### .compose( parsedData : Object, assets : Object, variantSelections : Object, basePath : string ) : Group

Compose a Three.js scene from parsed USD data.

**parsedData**

Data from USDCParser or USDAParser

**assets**

Dictionary of referenced assets (specsByPath or blob URLs)

**variantSelections**

External variant selections

**basePath**

Base path for resolving relative references

**Returns:** Three.js scene graph

## Source

[examples/jsm/loaders/usd/USDComposer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/usd/USDComposer.js)