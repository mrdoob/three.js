*Inheritance: Loader →*

# ImageLoader

A loader for loading images. The class loads images with the HTML `Image` API.

Please note that `ImageLoader` has dropped support for progress events in `r84`. For an `ImageLoader` that supports progress events, see [this thread](https://github.com/mrdoob/three.js/issues/10439#issuecomment-275785639).

## Code Example

```js
const loader = new THREE.ImageLoader();
const image = await loader.loadAsync( 'image.png' );
```

## Constructor

### new ImageLoader( manager : LoadingManager )

Constructs a new image loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : Image

Starts loading from the given URL and passes the loaded image to the `onLoad()` callback. The method also returns a new `Image` object which can directly be used for texture creation. If you do it this way, the texture may pop up in your scene once the respective loading process is finished.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Unsupported in this loader.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The image.

## Source

[src/loaders/ImageLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/ImageLoader.js)