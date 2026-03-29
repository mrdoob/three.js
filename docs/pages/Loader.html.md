# Loader

Abstract base class for loaders.

## Constructor

### new Loader( manager : LoadingManager ) (abstract)

Constructs a new loader.

**manager**

The loading manager.

## Properties

### .crossOrigin : string

The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS.

Default is `'anonymous'`.

### .manager : LoadingManager

The loading manager.

Default is `DefaultLoadingManager`.

### .path : string

The base path from which the asset will be loaded.

### .requestHeader : Object.<string, any>

The [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header) used in HTTP request.

### .resourcePath : string

The base path from which additional resources like textures will be loaded.

### .withCredentials : boolean

Whether the XMLHttpRequest uses credentials.

Default is `false`.

### .DEFAULT_MATERIAL_NAME : string

The default material name that is used by loaders when creating materials for loaded 3D objects.

Note: Not all loaders might honor this setting.

Default is `'__DEFAULT'`.

## Methods

### .abort() : Loader (abstract)

This method can be implemented in loaders for aborting ongoing requests.

**Returns:** A reference to this instance.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) (abstract)

This method needs to be implemented by all concrete loaders. It holds the logic for loading assets from the backend.

**url**

The path/URL of the file to be loaded.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

### .loadAsync( url : string, onProgress : onProgressCallback ) : Promise

A async version of [Loader#load](Loader.html#load).

**url**

The path/URL of the file to be loaded.

**onProgress**

Executed while the loading is in progress.

**Returns:** A Promise that resolves when the asset has been loaded.

### .parse( data : any ) (abstract)

This method needs to be implemented by all concrete loaders. It holds the logic for parsing the asset into three.js entities.

**data**

The data to parse.

### .setCrossOrigin( crossOrigin : string ) : Loader

Sets the `crossOrigin` String to implement CORS for loading the URL from a different domain that allows CORS.

**crossOrigin**

The `crossOrigin` value.

**Returns:** A reference to this instance.

### .setPath( path : string ) : Loader

Sets the base path for the asset.

**path**

The base path.

**Returns:** A reference to this instance.

### .setRequestHeader( requestHeader : Object ) : Loader

Sets the given request header.

**requestHeader**

A [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header) for configuring the HTTP request.

**Returns:** A reference to this instance.

### .setResourcePath( resourcePath : string ) : Loader

Sets the base path for dependent resources like textures.

**resourcePath**

The resource path.

**Returns:** A reference to this instance.

### .setWithCredentials( value : boolean ) : Loader

Whether the XMLHttpRequest uses credentials such as cookies, authorization headers or TLS client certificates, see [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

Note: This setting has no effect if you are loading files locally or from the same domain.

**value**

The `withCredentials` value.

**Returns:** A reference to this instance.

## Source

[src/loaders/Loader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/Loader.js)