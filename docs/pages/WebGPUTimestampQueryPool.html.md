*Inheritance: TimestampQueryPool →*

# WebGPUTimestampQueryPool

Manages a pool of WebGPU timestamp queries for performance measurement. Extends the base TimestampQueryPool to provide WebGPU-specific implementation.

## Constructor

### new WebGPUTimestampQueryPool( device : GPUDevice, type : string, maxQueries : number )

Creates a new WebGPU timestamp query pool.

**device**

The WebGPU device to create queries on.

**type**

The type identifier for this query pool.

**maxQueries**

Maximum number of queries this pool can hold.

Default is `2048`.

## Methods

### .allocateQueriesForContext( uid : string ) : number

Allocates a pair of queries for a given render context.

**uid**

A unique identifier for the render context.

**Overrides:** [TimestampQueryPool#allocateQueriesForContext](TimestampQueryPool.html#allocateQueriesForContext)

**Returns:** The base offset for the allocated queries, or null if allocation failed.

### .dispose() : Promise (async)

Dispose of the query pool.

**Overrides:** [TimestampQueryPool#dispose](TimestampQueryPool.html#dispose)

**Returns:** A Promise that resolves when the dispose has been executed.

### .resolveQueriesAsync() : Promise.<number> (async)

Asynchronously resolves all pending queries and returns the total duration. If there's already a pending resolve operation, returns that promise instead.

**Overrides:** [TimestampQueryPool#resolveQueriesAsync](TimestampQueryPool.html#resolveQueriesAsync)

**Returns:** The total duration in milliseconds, or the last valid value if resolution fails.

## Source

[src/renderers/webgpu/utils/WebGPUTimestampQueryPool.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webgpu/utils/WebGPUTimestampQueryPool.js)