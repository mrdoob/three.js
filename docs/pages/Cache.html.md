# Cache

A simple caching system, used internally by [FileLoader](FileLoader.html). To enable caching across all loaders that use [FileLoader](FileLoader.html), add `THREE.Cache.enabled = true.` once in your app.

## Properties

### .enabled : boolean

Whether caching is enabled or not.

Default is `false`.

### .files : Object.<string, Object>

A dictionary that holds cached files.

## Static Methods

### .add( key : string, file : Object )

Adds a cache entry with a key to reference the file. If this key already holds a file, it is overwritten.

**key**

The key to reference the cached file.

**file**

The file to be cached.

### .clear()

Remove all values from the cache.

### .get( key : string ) : Object | undefined

Gets the cached value for the given key.

**key**

The key to reference the cached file.

**Returns:** The cached file. If the key does not exist `undefined` is returned.

### .remove( key : string )

Removes the cached file associated with the given key.

**key**

The key to reference the cached file.

## Source

[src/loaders/Cache.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/Cache.js)