*Inheritance: Loader →*

# ImageBitmapLoader

A loader for loading images as an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap). An `ImageBitmap` provides an asynchronous and resource efficient pathway to prepare textures for rendering.

Note that [Texture#flipY](Texture.html#flipY) and [Texture#premultiplyAlpha](Texture.html#premultiplyAlpha) are ignored with image bitmaps. These options need to be configured via [ImageBitmapLoader#setOptions](ImageBitmapLoader.html#setOptions) prior to loading, unlike regular images which can be configured on the Texture to set these options on GPU upload instead.

To match the default behaviour of [Texture](Texture.html), the following options are needed:

Also note that unlike [FileLoader](FileLoader.html), this loader will only avoid multiple concurrent requests to the same URL if [Cache](Cache.html) is enabled.

```js
const loader = new THREE.ImageBitmapLoader();
loader.setOptions( { imageOrientation: 'flipY' } ); // set options if needed
const imageBitmap = await loader.loadAsync( 'image.png' );
const texture = new THREE.Texture( imageBitmap );
texture.needsUpdate = true;
```

## Code Example

```js
{ imageOrientation: 'flipY', premultiplyAlpha: 'none' }
```

## Constructor

### new ImageBitmapLoader( manager : LoadingManager )

Constructs a new image bitmap loader.

**manager**

The loading manager.

## Properties

### .isImageBitmapLoader : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .options : Object

Represents the loader options.

Default is `{premultiplyAlpha:'none'}`.

## Methods

### .abort() : ImageBitmapLoader

Aborts ongoing fetch requests.

**Overrides:** [Loader#abort](Loader.html#abort)

**Returns:** A reference to this instance.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : ImageBitmap | undefined

Starts loading from the given URL and pass the loaded image bitmap to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Unsupported in this loader.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The image bitmap.

### .setOptions( options : Object ) : ImageBitmapLoader

Sets the given loader options. The structure of the object must match the `options` parameter of [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap).

**options**

The loader options to set.

**Returns:** A reference to this image bitmap loader.

## Source

[src/loaders/ImageBitmapLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/ImageBitmapLoader.js)