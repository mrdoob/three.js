# CountingSort

A reusable GPU counting sort.

This computes a stable-ish permutation of the integers `[0, count)` that orders them by an arbitrary, user supplied `uint` key ("bin") in the range `[0, binCount)`. It is a good fit for approximate ordering of large element counts (hundreds of thousands to millions) where an exact comparison sort such as a bitonic sort (see [BitonicSort](BitonicSort.html)) would be too slow: a counting sort only requires a fixed number of passes (reset, histogram, prefix sum, scatter) regardless of `count`, at the cost of only being accurate to the resolution of `binCount` - elements that land in the same bin end up in an unspecified relative order.

This class does not compute the sort key itself. Instead, a TSL function is supplied via [CountingSort#setBinNode](CountingSort.html#setBinNode) that maps the current `instanceIndex` to a bin, and an equivalent plain JavaScript function can be supplied to [CountingSort#computeCPU](CountingSort.html#computeCPU) for platforms without compute shader support (e.g. the WebGL backend of [WebGPURenderer](WebGPURenderer.html)).

## Code Example

```js
const sort = new CountingSort( count, { binCount: 4096 } );
sort.setBinNode( () => {
	// return a `Node<uint>` bin index for `instanceIndex`, e.g. derived from a depth value.
} );
sort.compute( renderer );
// `sort.orderRead` now holds a storage buffer of `count` indices, ordered by bin.
```

## Import

CountingSort is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { CountingSort } from 'three/addons/gpgpu/CountingSort.js';
```

## Constructor

### new CountingSort( count : number, options : Object )

Constructs a new counting sort.

**count**

The number of elements to sort.

**options**

Options that modify the counting sort.

Default is `{}`.

**binCount**

The number of bins/buckets the sort key is quantized into. Larger values improve sort accuracy at the cost of a longer (but still single-pass) prefix sum.

Default is `4096`.

**workgroupSize**

The workgroup size of the compute shaders executed during the sort.

Default is `256`.

## Properties

### .binCount : number

The number of bins/buckets the sort key is quantized into.

### .binRead : StorageBufferNode

A read-only storage node holding each element's bin, computed during the histogram pass.

### .binWrite : StorageBufferNode

A writable storage node holding each element's bin.

### .count : number

The number of elements to sort.

### .histogramAtomic : StorageBufferNode

An atomic storage node used to accumulate the per-bin histogram.

### .offsetAtomic : StorageBufferNode

An atomic storage node used both for the exclusive prefix sum of the histogram and, during the scatter pass, as a per-bin write cursor.

### .orderAttribute : StorageBufferAttribute

The buffer attribute holding the sorted order (a permutation of `[0, count)`). This is also the attribute that is kept up to date by [CountingSort#computeCPU](CountingSort.html#computeCPU).

### .orderRead : StorageBufferNode

A read-only storage node for the sorted order buffer.

### .orderWrite : StorageBufferNode

A writable storage node for the sorted order buffer.

### .workgroupSize : number

The workgroup size of the compute shaders executed during the sort.

## Methods

### .compute( renderer : Renderer )

Executes a complete counting sort on the GPU, updating [CountingSort#orderRead](CountingSort.html#orderRead).

**renderer**

The current scene's renderer.

### .computeCPU( binFn : function )

Executes a complete counting sort on the CPU, updating [CountingSort#orderAttribute](CountingSort.html#orderAttribute). Intended as a fallback for backends without compute shader support.

**binFn**

A function taking an element index and returning its bin (a plain number in `[0, binCount)`).

### .enableWebGLBuffers()

Enables the WebGL-specific storage buffer path (PBO + dynamic draw usage) for the order buffer. Only needed when [CountingSort#computeCPU](CountingSort.html#computeCPU) is used with the WebGL backend of [WebGPURenderer](WebGPURenderer.html).

### .setBinNode( binNode : function )

Sets the TSL function used to compute the bin of the element currently referenced by `instanceIndex`, and (re)builds the compute nodes used by [CountingSort#compute](CountingSort.html#compute).

**binNode**

A parameterless function returning a `Node<uint>` in `[0, binCount)`.

## Source

[examples/jsm/gpgpu/CountingSort.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/gpgpu/CountingSort.js)