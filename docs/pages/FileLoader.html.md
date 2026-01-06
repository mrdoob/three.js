*Inheritance: Loader →*

# FileLoader

A low level class for loading resources with the Fetch API, used internally by most loaders. It can also be used directly to load any file type that does not have a loader.

This loader supports caching. If you want to use it, add `THREE.Cache.enabled = true;` once to your application.

## Code Example

```js
const loader = new THREE.FileLoader();
const data = await loader.loadAsync( 'example.txt' );
```

## Constructor

### new FileLoader( manager : LoadingManager )

Constructs a new file loader.

**manager**

The loading manager.

## Properties

### .mimeType : string

The expected mime type. Valid values can be found [here](hhttps://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#mimetype)

### .responseType : 'arraybuffer' | 'blob' | 'document' | 'json' | ''

The expected response type.

Default is `''`.

## Methods

### .abort() : FileLoader

Aborts ongoing fetch requests.

**Overrides:** [Loader#abort](Loader.html#abort)

**Returns:** A reference to this instance.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : any | undefined

Starts loading from the given URL and pass the loaded response to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The cached resource if available.

### .setMimeType( value : string ) : FileLoader

Sets the expected mime type of the loaded file.

**value**

The mime type.

**Returns:** A reference to this file loader.

### .setResponseType( value : 'arraybuffer' | 'blob' | 'document' | 'json' | '' ) : FileLoader

Sets the expected response type.

**value**

The response type.

**Returns:** A reference to this file loader.

## Source

[src/loaders/FileLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/FileLoader.js)