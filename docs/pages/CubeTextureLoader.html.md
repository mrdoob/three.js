*Inheritance: Loader →*

# CubeTextureLoader

Class for loading cube textures. Images are internally loaded via [ImageLoader](ImageLoader.html).

The loader returns an instance of [CubeTexture](CubeTexture.html) and expects the cube map to be defined as six separate images representing the sides of a cube. Other cube map definitions like vertical and horizontal cross, column and row layouts are not supported.

Note that, by convention, cube maps are specified in a coordinate system in which positive-x is to the right when looking up the positive-z axis -- in other words, using a left-handed coordinate system. Since three.js uses a right-handed coordinate system, environment maps used in three.js will have pos-x and neg-x swapped.

The loaded cube texture is in sRGB color space. Meaning [Texture#colorSpace](Texture.html#colorSpace) is set to `SRGBColorSpace` by default.

## Code Example

```js
const loader = new THREE.CubeTextureLoader().setPath( 'textures/cubeMaps/' );
const cubeTexture = await loader.loadAsync( [
	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
] );
scene.background = cubeTexture;
```

## Constructor

### new CubeTextureLoader( manager : LoadingManager )

Constructs a new cube texture loader.

**manager**

The loading manager.

## Methods

### .load( urls : Array.<string>, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : CubeTexture

Starts loading from the given URL and pass the fully loaded cube texture to the `onLoad()` callback. The method also returns a new cube texture object which can directly be used for material creation. If you do it this way, the cube texture may pop up in your scene once the respective loading process is finished.

**urls**

Array of 6 URLs to images, one for each side of the cube texture. The urls should be specified in the following order: pos-x, neg-x, pos-y, neg-y, pos-z, neg-z. An array of data URIs are allowed as well.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Unsupported in this loader.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The cube texture.

## Source

[src/loaders/CubeTextureLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/CubeTextureLoader.js)