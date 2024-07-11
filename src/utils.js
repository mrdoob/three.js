// Finds the minimum value in an array
function arrayMin(array) {
    if (array.length === 0) return Infinity;
    let min = array[0];
    for (let i = 1; i < array.length; ++i) {
        if (array[i] < min) min = array[i];
    }
    return min;
}

// Finds the maximum value in an array
function arrayMax(array) {
    if (array.length === 0) return -Infinity;
    let max = array[0];
    for (let i = 1; i < array.length; ++i) {
        if (array[i] > max) max = array[i];
    }
    return max;
}

// Checks if an array needs Uint32 representation
function arrayNeedsUint32(array) {
    for (let i = array.length - 1; i >= 0; --i) {
        if (array[i] >= 65535) return true; // Adjusted comment for clarity
    }
    return false;
}

// Typed arrays mapping
const TYPED_ARRAYS = {
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array
};

// Creates a typed array with given type and buffer
function getTypedArray(type, buffer) {
    return new TYPED_ARRAYS[type](buffer);
}

// Creates an element with a specified namespace
function createElementNS(name) {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
}

// Creates a canvas element with default styles
function createCanvasElement() {
    const canvas = createElementNS('canvas');
    canvas.style.display = 'block';
    return canvas;
}

// Caches and warns once for a given message
const _cache = {};
function warnOnce(message) {
    if (message in _cache) return;
    _cache[message] = true;
    console.warn(message);
}

// Asynchronously probes WebGL context
function probeAsync(gl, sync, interval) {
    return new Promise(function(resolve, reject) {
        function probe() {
            switch (gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0)) {
                case gl.WAIT_FAILED:
                    reject();
                    break;
                case gl.TIMEOUT_EXPIRED:
                    setTimeout(probe, interval);
                    break;
                default:
                    resolve();
            }
        }
        setTimeout(probe, interval);
    });
}

// Exporting all functions
export {
    arrayMin,
    arrayMax,
    arrayNeedsUint32,
    getTypedArray,
    createElementNS,
    createCanvasElement,
    warnOnce,
    probeAsync
};
