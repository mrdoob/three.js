*Inheritance: Loader →*

# AudioLoader

Class for loading audio buffers. Audios are internally loaded via [FileLoader](FileLoader.html).

## Code Example

```js
const audioListener = new THREE.AudioListener();
const ambientSound = new THREE.Audio( audioListener );
const loader = new THREE.AudioLoader();
const audioBuffer = await loader.loadAsync( 'audio/ambient_ocean.ogg' );
ambientSound.setBuffer( audioBuffer );
ambientSound.play();
```

## Constructor

### new AudioLoader( manager : LoadingManager )

Constructs a new audio loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded audio buffer to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

## Source

[src/loaders/AudioLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/AudioLoader.js)