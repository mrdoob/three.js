# TimestampQueryPool

Abstract base class of a timestamp query pool.

## Constructor

### new TimestampQueryPool( maxQueries : number ) (abstract)

Creates a new timestamp query pool.

**maxQueries**

Maximum number of queries this pool can hold.

Default is `256`.

## Properties

### .currentQueryIndex : number

How many queries allocated so far.

Default is `0`.

### .frames : Array.<number>

Stores all timestamp frames.

### .isDisposed : boolean

Whether the pool has been disposed or not.

Default is `false`.

### .lastValue : number

The total frame duration until the next update.

Default is `0`.

### .maxQueries : number

Maximum number of queries this pool can hold.

Default is `256`.

### .pendingResolve : boolean | Promise.<number>

This property is used to avoid multiple concurrent resolve operations. The WebGL backend uses it as a boolean flag. In context of WebGPU, it holds the promise of the current resolve operation.

Default is `false`.

### .queryOffsets : Map.<string, number>

Tracks offsets for different contexts.

### .timestamps : Map.<string, number>

Stores the latest timestamp for each render context.

### .trackTimestamp : boolean

Whether to track timestamps or not.

Default is `true`.

## Methods

### .allocateQueriesForContext( uid : string, frameId : number ) : number (abstract)

Allocate queries for a specific uid.

**uid**

A unique identifier for the render context.

**frameId**

The current frame identifier.

### .dispose() (abstract)

Dispose of the query pool.

### .getTimestamp( uid : string ) : number

Returns the timestamp for a given render context.

**uid**

A unique identifier for the render context.

**Returns:** The timestamp, or undefined if not available.

### .getTimestampFrames() : Array.<number>

Returns all timestamp frames.

**Returns:** The timestamp frames.

### .hasTimestamp( uid : string ) : boolean

Returns whether a timestamp is available for a given render context.

**uid**

A unique identifier for the render context.

**Returns:** True if a timestamp is available, false otherwise.

### .resolveQueriesAsync() : Promise.<number> | number (async, abstract)

Resolve all timestamps and return data (or process them).

**Returns:** The resolved timestamp value.

## Source

[src/renderers/common/TimestampQueryPool.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/TimestampQueryPool.js)