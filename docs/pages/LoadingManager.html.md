# LoadingManager

Handles and keeps track of loaded and pending data. A default global instance of this class is created and used by loaders if not supplied manually.

In general that should be sufficient, however there are times when it can be useful to have separate loaders - for example if you want to show separate loading bars for objects and textures.

## Code Example

```js
const manager = new THREE.LoadingManager();
manager.onLoad = () => console.log( 'Loading complete!' );
const loader1 = new OBJLoader( manager );
const loader2 = new ColladaLoader( manager );
```

## Constructor

### new LoadingManager( onLoad : function, onProgress : function, onError : function )

Constructs a new loading manager.

**onLoad**

Executes when all items have been loaded.

**onProgress**

Executes when single items have been loaded.

**onError**

Executes when an error occurs.

## Properties

### .abortController : AbortController

Used for aborting ongoing requests in loaders using this manager.

### .onError : function | undefined

Executes when an error occurs.

Default is `undefined`.

### .onLoad : function | undefined

Executes when all items have been loaded.

Default is `undefined`.

### .onProgress : function | undefined

Executes when single items have been loaded.

Default is `undefined`.

### .onStart : function | undefined

Executes when an item starts loading.

Default is `undefined`.

## Methods

### .abort() : LoadingManager

Can be used to abort ongoing loading requests in loaders using this manager. The abort only works if the loaders implement [Loader#abort](Loader.html#abort) and `AbortSignal.any()` is supported in the browser.

**Returns:** A reference to this loading manager.

### .addHandler( regex : string, loader : Loader ) : LoadingManager

Registers a loader with the given regular expression. Can be used to define what loader should be used in order to load specific files. A typical use case is to overwrite the default loader for textures.

```js
// add handler for TGA textures
manager.addHandler( /\.tga$/i, new TGALoader() );
```

**regex**

A regular expression.

**loader**

A loader that should handle matched cases.

**Returns:** A reference to this loading manager.

### .getHandler( file : string ) : Loader

Can be used to retrieve the registered loader for the given file path.

**file**

The file path.

**Returns:** The registered loader. Returns `null` if no loader was found.

### .itemEnd( url : string )

This should be called by any loader using the manager when the loader ended loading an item.

**url**

The URL of the loaded item.

### .itemError( url : string )

This should be called by any loader using the manager when the loader encounters an error when loading an item.

**url**

The URL of the item that produces an error.

### .itemStart( url : string )

This should be called by any loader using the manager when the loader starts loading an item.

**url**

The URL to load.

### .removeHandler( regex : string ) : LoadingManager

Removes the loader for the given regular expression.

**regex**

A regular expression.

**Returns:** A reference to this loading manager.

### .resolveURL( url : string ) : string

Given a URL, uses the URL modifier callback (if any) and returns a resolved URL. If no URL modifier is set, returns the original URL.

**url**

The URL to load.

**Returns:** The resolved URL.

### .setURLModifier( transform : function ) : LoadingManager

If provided, the callback will be passed each resource URL before a request is sent. The callback may return the original URL, or a new URL to override loading behavior. This behavior can be used to load assets from .ZIP files, drag-and-drop APIs, and Data URIs.

```js
const blobs = {'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3};
const manager = new THREE.LoadingManager();
// Initialize loading manager with URL callback.
const objectURLs = [];
manager.setURLModifier( ( url ) => {
	url = URL.createObjectURL( blobs[ url ] );
	objectURLs.push( url );
	return url;
} );
// Load as usual, then revoke the blob URLs.
const loader = new GLTFLoader( manager );
loader.load( 'fish.gltf', (gltf) => {
	scene.add( gltf.scene );
	objectURLs.forEach( ( url ) => URL.revokeObjectURL( url ) );
} );
```

**transform**

URL modifier callback. Called with an URL and must return a resolved URL.

**Returns:** A reference to this loading manager.

## Source

[src/loaders/LoadingManager.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/LoadingManager.js)