*Inheritance: Loader →*

# LottieLoader

A loader for the Lottie texture animation format.

The loader returns an instance of [CanvasTexture](CanvasTexture.html) to represent the animated texture. Two additional properties are added to each texture:

*   `animation`: The return value of `lottie.loadAnimation()` which is an object with an API for controlling the animation's playback.
*   `image`: The image container.

## Code Example

```js
const loader = new LottieLoader();
loader.setQuality( 2 );
const texture = await loader.loadAsync( 'textures/lottie/24017-lottie-logo-animation.json' );
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { map: texture } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Import

LottieLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LottieLoader } from 'three/addons/loaders/LottieLoader.js';
```

## Constructor

### new LottieLoader( manager : LoadingManager )

Constructs a new Lottie loader.

**manager**

The loading manager.

**Deprecated:** The loader has been deprecated and will be removed with r186. Use lottie-web instead and create your animated texture manually.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : CanvasTexture

Starts loading from the given URL and passes the loaded Lottie asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The Lottie texture.

### .setQuality( value : number )

Sets the texture quality.

**value**

The texture quality.

## Source

[examples/jsm/loaders/LottieLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LottieLoader.js)