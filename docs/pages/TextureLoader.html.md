*Inheritance: Loader →*

# TextureLoader

Class for loading textures. Images are internally loaded via [ImageLoader](ImageLoader.html).

Please note that `TextureLoader` has dropped support for progress events in `r84`. For a `TextureLoader` that supports progress events, see [this thread](https://github.com/mrdoob/three.js/issues/10439#issuecomment-293260145).

## Code Example

```js
const loader = new THREE.TextureLoader();
const texture = await loader.loadAsync( 'textures/land_ocean_ice_cloud_2048.jpg' );
const material = new THREE.MeshBasicMaterial( { map:texture } );
```

## Constructor

### new TextureLoader( manager : LoadingManager )

Constructs a new texture loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : Texture

Starts loading from the given URL and pass the fully loaded texture to the `onLoad()` callback. The method also returns a new texture object which can directly be used for material creation. If you do it this way, the texture may pop up in your scene once the respective loading process is finished.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Unsupported in this loader.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The texture.

## Source

[src/loaders/TextureLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/TextureLoader.js)