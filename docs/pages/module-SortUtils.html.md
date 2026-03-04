# SortUtils

## Import

SortUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as SortUtils from 'three/addons/utils/SortUtils.js';
```

## Static Methods

### .radixSort( arr : Array.<Object>, opt : Object )

Hybrid radix sort from.

*   [https://gist.github.com/sciecode/93ed864dd77c5c8803c6a86698d68dab](https://gist.github.com/sciecode/93ed864dd77c5c8803c6a86698d68dab)
*   [https://github.com/mrdoob/three.js/pull/27202#issuecomment-1817640271](https://github.com/mrdoob/three.js/pull/27202#issuecomment-1817640271)

Expects unsigned 32b integer values.

**arr**

The array to sort.

**opt**

The options

## Source

[examples/jsm/utils/SortUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/SortUtils.js)