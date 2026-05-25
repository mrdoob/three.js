/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
/* @ts-self-types="./three_core.d.ts" */


/**
 * Batched geometry + position + material + UV setup in one WASM call.
 * @param {Float32Array} vert_data
 * @param {Uint32Array} vert_offsets
 * @param {Uint32Array} idx_data
 * @param {Uint32Array} idx_offsets
 * @param {Uint32Array} obj_ids
 * @param {Float32Array} pos_data
 * @param {Float32Array} mat_data
 * @param {Uint32Array} parent_ids
 * @param {Float32Array} uv_data
 * @param {Uint32Array} uv_offsets
 * @param {Uint8Array} has_uv
 */
function create_geometries_batch(vert_data, vert_offsets, idx_data, idx_offsets, obj_ids, pos_data, mat_data, parent_ids, uv_data, uv_offsets, has_uv) {
    const ptr0 = passArrayF32ToWasm0(vert_data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(vert_offsets, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(idx_data, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(idx_offsets, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(obj_ids, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passArrayF32ToWasm0(pos_data, wasm.__wbindgen_malloc);
    const len5 = WASM_VECTOR_LEN;
    const ptr6 = passArrayF32ToWasm0(mat_data, wasm.__wbindgen_malloc);
    const len6 = WASM_VECTOR_LEN;
    const ptr7 = passArray32ToWasm0(parent_ids, wasm.__wbindgen_malloc);
    const len7 = WASM_VECTOR_LEN;
    const ptr8 = passArrayF32ToWasm0(uv_data, wasm.__wbindgen_malloc);
    const len8 = WASM_VECTOR_LEN;
    const ptr9 = passArray32ToWasm0(uv_offsets, wasm.__wbindgen_malloc);
    const len9 = WASM_VECTOR_LEN;
    const ptr10 = passArray8ToWasm0(has_uv, wasm.__wbindgen_malloc);
    const len10 = WASM_VECTOR_LEN;
    wasm.create_geometries_batch(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10);
}

/**
 * @returns {number}
 */
function create_object() {
    const ret = wasm.create_object();
    return ret >>> 0;
}

/**
 * Get GL bytecode directly (avoids FlatBuffers ResponseBatch parsing overhead)
 * @returns {Uint8Array}
 */
function get_gl_commands() {
    const ret = wasm.get_gl_commands();
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

function init_core() {
    wasm.init_core();
}

/**
 * Process a batch of commands encoded as a FlatBuffers CommandBatch.
 * GL bytecode is written to the shared buffer (read via get_gl_buffer_ptr/len).
 * Returns FlatBuffers ResponseBatch bytes (results only, no gl_commands copy).
 * Rendering is triggered internally when CAMERA_VIEW ReadRequest is present.
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function process_commands(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.process_commands(ptr0, len0);
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Set scene lights directly (bypasses FlatBuffers LightData parsing issue).
 * Data layout: [type, r, g, b, intensity, dir_x, dir_y, dir_z] repeated per light.
 * @param {Float32Array} data
 */
function set_scene_lights(data) {
    const ptr0 = passArrayF32ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_scene_lights(ptr0, len0);
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./three_core_bg.js": import0,
    };
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('three_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance);
}

const SIZEOF_SHORT = 2;
const SIZEOF_INT = 4;
const FILE_IDENTIFIER_LENGTH = 4;
const SIZE_PREFIX_LENGTH$1 = 4;

const int32$1 = new Int32Array(2);
const float32 = new Float32Array(int32$1.buffer);
const float64 = new Float64Array(int32$1.buffer);
const isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

var Encoding$1;
(function (Encoding) {
    Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
    Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding$1 || (Encoding$1 = {}));

class ByteBuffer {
    /**
     * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
     */
    constructor(bytes_) {
        this.bytes_ = bytes_;
        this.position_ = 0;
        this.text_decoder_ = new TextDecoder();
    }
    /**
     * Create and allocate a new ByteBuffer with a given size.
     */
    static allocate(byte_size) {
        return new ByteBuffer(new Uint8Array(byte_size));
    }
    clear() {
        this.position_ = 0;
    }
    /**
     * Get the underlying `Uint8Array`.
     */
    bytes() {
        return this.bytes_;
    }
    /**
     * Get the buffer's position.
     */
    position() {
        return this.position_;
    }
    /**
     * Set the buffer's position.
     */
    setPosition(position) {
        this.position_ = position;
    }
    /**
     * Get the buffer's capacity.
     */
    capacity() {
        return this.bytes_.length;
    }
    readInt8(offset) {
        return (this.readUint8(offset) << 24) >> 24;
    }
    readUint8(offset) {
        return this.bytes_[offset];
    }
    readInt16(offset) {
        return (this.readUint16(offset) << 16) >> 16;
    }
    readUint16(offset) {
        return this.bytes_[offset] | (this.bytes_[offset + 1] << 8);
    }
    readInt32(offset) {
        return (this.bytes_[offset] |
            (this.bytes_[offset + 1] << 8) |
            (this.bytes_[offset + 2] << 16) |
            (this.bytes_[offset + 3] << 24));
    }
    readUint32(offset) {
        return this.readInt32(offset) >>> 0;
    }
    readInt64(offset) {
        return BigInt.asIntN(64, BigInt(this.readUint32(offset)) +
            (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readUint64(offset) {
        return BigInt.asUintN(64, BigInt(this.readUint32(offset)) +
            (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readFloat32(offset) {
        int32$1[0] = this.readInt32(offset);
        return float32[0];
    }
    readFloat64(offset) {
        int32$1[isLittleEndian ? 0 : 1] = this.readInt32(offset);
        int32$1[isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
        return float64[0];
    }
    writeInt8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeUint8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeInt16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeUint16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeInt32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeUint32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeInt64(offset, value) {
        this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
        this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
    }
    writeUint64(offset, value) {
        this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
        this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
    }
    writeFloat32(offset, value) {
        float32[0] = value;
        this.writeInt32(offset, int32$1[0]);
    }
    writeFloat64(offset, value) {
        float64[0] = value;
        this.writeInt32(offset, int32$1[isLittleEndian ? 0 : 1]);
        this.writeInt32(offset + 4, int32$1[isLittleEndian ? 1 : 0]);
    }
    /**
     * Return the file identifier.   Behavior is undefined for FlatBuffers whose
     * schema does not include a file_identifier (likely points at padding or the
     * start of a the root vtable).
     */
    getBufferIdentifier() {
        if (this.bytes_.length <
            this.position_ + SIZEOF_INT + FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: ByteBuffer is too short to contain an identifier.');
        }
        let result = '';
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            result += String.fromCharCode(this.readInt8(this.position_ + SIZEOF_INT + i));
        }
        return result;
    }
    /**
     * Look up a field in the vtable, return an offset into the object, or 0 if the
     * field is not present.
     */
    __offset(bb_pos, vtable_offset) {
        const vtable = bb_pos - this.readInt32(bb_pos);
        return vtable_offset < this.readInt16(vtable)
            ? this.readInt16(vtable + vtable_offset)
            : 0;
    }
    /**
     * Initialize any Table-derived type to point to the union at the given offset.
     */
    __union(t, offset) {
        t.bb_pos = offset + this.readInt32(offset);
        t.bb = this;
        return t;
    }
    /**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */
    __string(offset, opt_encoding) {
        offset += this.readInt32(offset);
        const length = this.readInt32(offset);
        offset += SIZEOF_INT;
        const utf8bytes = this.bytes_.subarray(offset, offset + length);
        if (opt_encoding === Encoding$1.UTF8_BYTES)
            return utf8bytes;
        else
            return this.text_decoder_.decode(utf8bytes);
    }
    /**
     * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
     * if a string then return a new one
     *
     * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
     * makes the behaviour of __union_with_string different compared to __union
     */
    __union_with_string(o, offset) {
        if (typeof o === 'string') {
            return this.__string(offset);
        }
        return this.__union(o, offset);
    }
    /**
     * Retrieve the relative offset stored at "offset"
     */
    __indirect(offset) {
        return offset + this.readInt32(offset);
    }
    /**
     * Get the start of data of a vector whose offset is stored at "offset" in this object.
     */
    __vector(offset) {
        return offset + this.readInt32(offset) + SIZEOF_INT; // data starts after the length
    }
    /**
     * Get the length of a vector whose offset is stored at "offset" in this object.
     */
    __vector_len(offset) {
        return this.readInt32(offset + this.readInt32(offset));
    }
    __has_identifier(ident) {
        if (ident.length != FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: file identifier must be length ' + FILE_IDENTIFIER_LENGTH);
        }
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            if (ident.charCodeAt(i) != this.readInt8(this.position() + SIZEOF_INT + i)) {
                return false;
            }
        }
        return true;
    }
    /**
     * A helper function for generating list for obj api
     */
    createScalarList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val);
            }
        }
        return ret;
    }
    /**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */
    createObjList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val.unpack());
            }
        }
        return ret;
    }
}

class Builder {
    /**
     * Create a FlatBufferBuilder.
     */
    constructor(opt_initial_size) {
        /** Minimum alignment encountered so far. */
        this.minalign = 1;
        /** The vtable for the current table. */
        this.vtable = null;
        /** The amount of fields we're actually using. */
        this.vtable_in_use = 0;
        /** Whether we are currently serializing a table. */
        this.isNested = false;
        /** Starting offset of the current struct/table. */
        this.object_start = 0;
        /** List of offsets of all vtables. */
        this.vtables = [];
        /** For the current vector being built. */
        this.vector_num_elems = 0;
        /** False omits default values from the serialized data */
        this.force_defaults = false;
        this.string_maps = null;
        this.text_encoder = new TextEncoder();
        let initial_size;
        if (!opt_initial_size) {
            initial_size = 1024;
        }
        else {
            initial_size = opt_initial_size;
        }
        /**
         * @type {ByteBuffer}
         * @private
         */
        this.bb = ByteBuffer.allocate(initial_size);
        this.space = initial_size;
    }
    clear() {
        this.bb.clear();
        this.space = this.bb.capacity();
        this.minalign = 1;
        this.vtable = null;
        this.vtable_in_use = 0;
        this.isNested = false;
        this.object_start = 0;
        this.vtables = [];
        this.vector_num_elems = 0;
        this.force_defaults = false;
        this.string_maps = null;
    }
    /**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */
    forceDefaults(forceDefaults) {
        this.force_defaults = forceDefaults;
    }
    /**
     * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
     * called finish(). The actual data starts at the ByteBuffer's current position,
     * not necessarily at 0.
     */
    dataBuffer() {
        return this.bb;
    }
    /**
     * Get the bytes representing the FlatBuffer. Only call this after you've
     * called finish().
     */
    asUint8Array() {
        return this.bb
            .bytes()
            .subarray(this.bb.position(), this.bb.position() + this.offset());
    }
    /**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */
    prep(size, additional_bytes) {
        // Track the biggest thing we've ever aligned to.
        if (size > this.minalign) {
            this.minalign = size;
        }
        // Find the amount of alignment needed such that `size` is properly
        // aligned after `additional_bytes`
        const align_size = (~(this.bb.capacity() - this.space + additional_bytes) + 1) & (size - 1);
        // Reallocate the buffer if needed.
        while (this.space < align_size + size + additional_bytes) {
            const old_buf_size = this.bb.capacity();
            this.bb = Builder.growByteBuffer(this.bb);
            this.space += this.bb.capacity() - old_buf_size;
        }
        this.pad(align_size);
    }
    pad(byte_size) {
        for (let i = 0; i < byte_size; i++) {
            this.bb.writeInt8(--this.space, 0);
        }
    }
    writeInt8(value) {
        this.bb.writeInt8((this.space -= 1), value);
    }
    writeInt16(value) {
        this.bb.writeInt16((this.space -= 2), value);
    }
    writeInt32(value) {
        this.bb.writeInt32((this.space -= 4), value);
    }
    writeInt64(value) {
        this.bb.writeInt64((this.space -= 8), value);
    }
    writeFloat32(value) {
        this.bb.writeFloat32((this.space -= 4), value);
    }
    writeFloat64(value) {
        this.bb.writeFloat64((this.space -= 8), value);
    }
    /**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */
    addInt8(value) {
        this.prep(1, 0);
        this.writeInt8(value);
    }
    /**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */
    addInt16(value) {
        this.prep(2, 0);
        this.writeInt16(value);
    }
    /**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */
    addInt32(value) {
        this.prep(4, 0);
        this.writeInt32(value);
    }
    /**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */
    addInt64(value) {
        this.prep(8, 0);
        this.writeInt64(value);
    }
    /**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */
    addFloat32(value) {
        this.prep(4, 0);
        this.writeFloat32(value);
    }
    /**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */
    addFloat64(value) {
        this.prep(8, 0);
        this.writeFloat64(value);
    }
    addFieldInt8(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt8(value);
            this.slot(voffset);
        }
    }
    addFieldInt16(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt16(value);
            this.slot(voffset);
        }
    }
    addFieldInt32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt32(value);
            this.slot(voffset);
        }
    }
    addFieldInt64(voffset, value, defaultValue) {
        if (this.force_defaults || value !== defaultValue) {
            this.addInt64(value);
            this.slot(voffset);
        }
    }
    addFieldFloat32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat32(value);
            this.slot(voffset);
        }
    }
    addFieldFloat64(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat64(value);
            this.slot(voffset);
        }
    }
    addFieldOffset(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addOffset(value);
            this.slot(voffset);
        }
    }
    /**
     * Structs are stored inline, so nothing additional is being added. `d` is always 0.
     */
    addFieldStruct(voffset, value, defaultValue) {
        if (value != defaultValue) {
            this.nested(value);
            this.slot(voffset);
        }
    }
    /**
     * Structures are always stored inline, they need to be created right
     * where they're used.  You'll get this assertion failure if you
     * created it elsewhere.
     */
    nested(obj) {
        if (obj != this.offset()) {
            throw new TypeError('FlatBuffers: struct must be serialized inline.');
        }
    }
    /**
     * Should not be creating any other object, string or vector
     * while an object is being constructed
     */
    notNested() {
        if (this.isNested) {
            throw new TypeError('FlatBuffers: object serialization must not be nested.');
        }
    }
    /**
     * Set the current vtable at `voffset` to the current location in the buffer.
     */
    slot(voffset) {
        if (this.vtable !== null)
            this.vtable[voffset] = this.offset();
    }
    /**
     * @returns Offset relative to the end of the buffer.
     */
    offset() {
        return this.bb.capacity() - this.space;
    }
    /**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */
    static growByteBuffer(bb) {
        const old_buf_size = bb.capacity();
        // Ensure we don't grow beyond what fits in an int.
        if (old_buf_size & 0xc0000000) {
            throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
        }
        const new_buf_size = old_buf_size << 1;
        const nbb = ByteBuffer.allocate(new_buf_size);
        nbb.setPosition(new_buf_size - old_buf_size);
        nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
        return nbb;
    }
    /**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */
    addOffset(offset) {
        this.prep(SIZEOF_INT, 0); // Ensure alignment is already done.
        this.writeInt32(this.offset() - offset + SIZEOF_INT);
    }
    /**
     * Start encoding a new object in the buffer.  Users will not usually need to
     * call this directly. The FlatBuffers compiler will generate helper methods
     * that call this method internally.
     */
    startObject(numfields) {
        this.notNested();
        if (this.vtable == null) {
            this.vtable = [];
        }
        this.vtable_in_use = numfields;
        for (let i = 0; i < numfields; i++) {
            this.vtable[i] = 0; // This will push additional elements as needed
        }
        this.isNested = true;
        this.object_start = this.offset();
    }
    /**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */
    endObject() {
        if (this.vtable == null || !this.isNested) {
            throw new Error('FlatBuffers: endObject called without startObject');
        }
        this.addInt32(0);
        const vtableloc = this.offset();
        // Trim trailing zeroes.
        let i = this.vtable_in_use - 1;
        // eslint-disable-next-line no-empty
        for (; i >= 0 && this.vtable[i] == 0; i--) { }
        const trimmed_size = i + 1;
        // Write out the current vtable.
        for (; i >= 0; i--) {
            // Offset relative to the start of the table.
            this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
        }
        const standard_fields = 2; // The fields below:
        this.addInt16(vtableloc - this.object_start);
        const len = (trimmed_size + standard_fields) * SIZEOF_SHORT;
        this.addInt16(len);
        // Search for an existing vtable that matches the current one.
        let existing_vtable = 0;
        const vt1 = this.space;
        outer_loop: for (i = 0; i < this.vtables.length; i++) {
            const vt2 = this.bb.capacity() - this.vtables[i];
            if (len == this.bb.readInt16(vt2)) {
                for (let j = SIZEOF_SHORT; j < len; j += SIZEOF_SHORT) {
                    if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
                        continue outer_loop;
                    }
                }
                existing_vtable = this.vtables[i];
                break;
            }
        }
        if (existing_vtable) {
            // Found a match:
            // Remove the current vtable.
            this.space = this.bb.capacity() - vtableloc;
            // Point table to existing vtable.
            this.bb.writeInt32(this.space, existing_vtable - vtableloc);
        }
        else {
            // No match:
            // Add the location of the current vtable to the list of vtables.
            this.vtables.push(this.offset());
            // Point table to current vtable.
            this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
        }
        this.isNested = false;
        return vtableloc;
    }
    /**
     * Finalize a buffer, poiting to the given `root_table`.
     */
    finish(root_table, opt_file_identifier, opt_size_prefix) {
        const size_prefix = opt_size_prefix ? SIZE_PREFIX_LENGTH$1 : 0;
        if (opt_file_identifier) {
            const file_identifier = opt_file_identifier;
            this.prep(this.minalign, SIZEOF_INT + FILE_IDENTIFIER_LENGTH + size_prefix);
            if (file_identifier.length != FILE_IDENTIFIER_LENGTH) {
                throw new TypeError('FlatBuffers: file identifier must be length ' +
                    FILE_IDENTIFIER_LENGTH);
            }
            for (let i = FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
                this.writeInt8(file_identifier.charCodeAt(i));
            }
        }
        this.prep(this.minalign, SIZEOF_INT + size_prefix);
        this.addOffset(root_table);
        if (size_prefix) {
            this.addInt32(this.bb.capacity() - this.space);
        }
        this.bb.setPosition(this.space);
    }
    /**
     * Finalize a size prefixed buffer, pointing to the given `root_table`.
     */
    finishSizePrefixed(root_table, opt_file_identifier) {
        this.finish(root_table, opt_file_identifier, true);
    }
    /**
     * This checks a required field has been set in a given table that has
     * just been constructed.
     */
    requiredField(table, field) {
        const table_start = this.bb.capacity() - table;
        const vtable_start = table_start - this.bb.readInt32(table_start);
        const ok = field < this.bb.readInt16(vtable_start) &&
            this.bb.readInt16(vtable_start + field) != 0;
        // If this fails, the caller will show what field needs to be set.
        if (!ok) {
            throw new TypeError('FlatBuffers: field ' + field + ' must be set');
        }
    }
    /**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */
    startVector(elem_size, num_elems, alignment) {
        this.notNested();
        this.vector_num_elems = num_elems;
        this.prep(SIZEOF_INT, elem_size * num_elems);
        this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
    }
    /**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */
    endVector() {
        this.writeInt32(this.vector_num_elems);
        return this.offset();
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createSharedString(s) {
        if (!s) {
            return 0;
        }
        if (!this.string_maps) {
            this.string_maps = new Map();
        }
        if (this.string_maps.has(s)) {
            return this.string_maps.get(s);
        }
        const offset = this.createString(s);
        this.string_maps.set(s, offset);
        return offset;
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createString(s) {
        if (s === null || s === undefined) {
            return 0;
        }
        let utf8;
        if (s instanceof Uint8Array) {
            utf8 = s;
        }
        else {
            utf8 = this.text_encoder.encode(s);
        }
        this.addInt8(0);
        this.startVector(1, utf8.length, 1);
        this.bb.setPosition((this.space -= utf8.length));
        this.bb.bytes().set(utf8, this.space);
        return this.endVector();
    }
    /**
     * Create a byte vector.
     *
     * @param v The bytes to add
     * @returns The offset in the buffer where the byte vector starts
     */
    createByteVector(v) {
        if (v === null || v === undefined) {
            return 0;
        }
        this.startVector(1, v.length, 1);
        this.bb.setPosition((this.space -= v.length));
        this.bb.bytes().set(v, this.space);
        return this.endVector();
    }
    /**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */
    createObjectOffset(obj) {
        if (obj === null) {
            return 0;
        }
        if (typeof obj === 'string') {
            return this.createString(obj);
        }
        else {
            return obj.pack(this);
        }
    }
    /**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */
    createObjectOffsetList(list) {
        const ret = [];
        for (let i = 0; i < list.length; ++i) {
            const val = list[i];
            if (val !== null) {
                ret.push(this.createObjectOffset(val));
            }
            else {
                throw new TypeError('FlatBuffers: Argument for createObjectOffsetList cannot contain null.');
            }
        }
        return ret;
    }
    createStructOffsetList(list, startFunc) {
        startFunc(this, list.length);
        this.createObjectOffsetList(list.slice().reverse());
        return this.endVector();
    }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/flatbuffers/mjs/constants.js
var SIZE_PREFIX_LENGTH = 4;

// node_modules/flatbuffers/mjs/utils.js
var int32 = new Int32Array(2);
new Float32Array(int32.buffer);
new Float64Array(int32.buffer);
new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

// node_modules/flatbuffers/mjs/encoding.js
var Encoding;
(function(Encoding2) {
  Encoding2[Encoding2["UTF8_BYTES"] = 1] = "UTF8_BYTES";
  Encoding2[Encoding2["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (Encoding = {}));

// js/three-core/method.ts
var Method$1 = /* @__PURE__ */ ((Method2) => {
  Method2[Method2["ADD_CHILD"] = 0] = "ADD_CHILD";
  Method2[Method2["UPDATE_MATRIX_WORLD"] = 1] = "UPDATE_MATRIX_WORLD";
  Method2[Method2["CREATE_OBJECT"] = 2] = "CREATE_OBJECT";
  Method2[Method2["CREATE_GEOMETRY"] = 3] = "CREATE_GEOMETRY";
  Method2[Method2["CREATE_MATERIAL"] = 4] = "CREATE_MATERIAL";
  Method2[Method2["SET_OBJECT_GEOMETRY"] = 5] = "SET_OBJECT_GEOMETRY";
  Method2[Method2["SET_OBJECT_MATERIAL"] = 6] = "SET_OBJECT_MATERIAL";
  return Method2;
})(Method$1 || {});

// js/three-core/euler-value.ts
var EulerValue = class _EulerValue {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsEulerValue(bb, obj) {
    return (obj || new _EulerValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsEulerValue(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _EulerValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  x() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  y() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  z() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  order() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
  }
  static startEulerValue(builder) {
    builder.startObject(4);
  }
  static addX(builder, x) {
    builder.addFieldFloat32(0, x, 0);
  }
  static addY(builder, y) {
    builder.addFieldFloat32(1, y, 0);
  }
  static addZ(builder, z) {
    builder.addFieldFloat32(2, z, 0);
  }
  static addOrder(builder, order) {
    builder.addFieldInt8(3, order, 0);
  }
  static endEulerValue(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createEulerValue(builder, x, y, z, order) {
    _EulerValue.startEulerValue(builder);
    _EulerValue.addX(builder, x);
    _EulerValue.addY(builder, y);
    _EulerValue.addZ(builder, z);
    _EulerValue.addOrder(builder, order);
    return _EulerValue.endEulerValue(builder);
  }
};

// js/three-core/float-v.ts
var FloatV = class _FloatV {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsFloatV(bb, obj) {
    return (obj || new _FloatV()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsFloatV(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _FloatV()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  v() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  static startFloatV(builder) {
    builder.startObject(1);
  }
  static addV(builder, v) {
    builder.addFieldFloat32(0, v, 0);
  }
  static endFloatV(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createFloatV(builder, v) {
    _FloatV.startFloatV(builder);
    _FloatV.addV(builder, v);
    return _FloatV.endFloatV(builder);
  }
};

// js/three-core/geometry-data.ts
var GeometryData = class _GeometryData {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsGeometryData(bb, obj) {
    return (obj || new _GeometryData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsGeometryData(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _GeometryData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  id() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  vertices(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  verticesLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  verticesArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  indices(index) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readUint32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  indicesLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  indicesArray() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? new Uint32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  static startGeometryData(builder) {
    builder.startObject(3);
  }
  static addId(builder, id) {
    builder.addFieldInt32(0, id, 0);
  }
  static addVertices(builder, verticesOffset) {
    builder.addFieldOffset(1, verticesOffset, 0);
  }
  static createVerticesVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startVerticesVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addIndices(builder, indicesOffset) {
    builder.addFieldOffset(2, indicesOffset, 0);
  }
  static createIndicesVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]);
    }
    return builder.endVector();
  }
  static startIndicesVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endGeometryData(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createGeometryData(builder, id, verticesOffset, indicesOffset) {
    _GeometryData.startGeometryData(builder);
    _GeometryData.addId(builder, id);
    _GeometryData.addVertices(builder, verticesOffset);
    _GeometryData.addIndices(builder, indicesOffset);
    return _GeometryData.endGeometryData(builder);
  }
};

// js/three-core/light-data.ts
var LightData = class _LightData {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsLightData(bb, obj) {
    return (obj || new _LightData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsLightData(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _LightData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  lightType() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* AMBIENT */;
  }
  color(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  colorLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  colorArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  intensity() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  direction(index) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  directionLength() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  directionArray() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  static startLightData(builder) {
    builder.startObject(4);
  }
  static addLightType(builder, lightType) {
    builder.addFieldInt8(0, lightType, 0 /* AMBIENT */);
  }
  static addColor(builder, colorOffset) {
    builder.addFieldOffset(1, colorOffset, 0);
  }
  static createColorVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startColorVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addIntensity(builder, intensity) {
    builder.addFieldFloat32(2, intensity, 0);
  }
  static addDirection(builder, directionOffset) {
    builder.addFieldOffset(3, directionOffset, 0);
  }
  static createDirectionVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startDirectionVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endLightData(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createLightData(builder, lightType, colorOffset, intensity, directionOffset) {
    _LightData.startLightData(builder);
    _LightData.addLightType(builder, lightType);
    _LightData.addColor(builder, colorOffset);
    _LightData.addIntensity(builder, intensity);
    _LightData.addDirection(builder, directionOffset);
    return _LightData.endLightData(builder);
  }
};

// js/three-core/material-data.ts
var MaterialData = class _MaterialData {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsMaterialData(bb, obj) {
    return (obj || new _MaterialData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsMaterialData(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _MaterialData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  id() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  color(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  colorLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  colorArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  specular(index) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  specularLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  specularArray() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  shininess() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  materialType() {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
  }
  static startMaterialData(builder) {
    builder.startObject(5);
  }
  static addId(builder, id) {
    builder.addFieldInt32(0, id, 0);
  }
  static addColor(builder, colorOffset) {
    builder.addFieldOffset(1, colorOffset, 0);
  }
  static createColorVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startColorVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addSpecular(builder, specularOffset) {
    builder.addFieldOffset(2, specularOffset, 0);
  }
  static createSpecularVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startSpecularVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addShininess(builder, shininess) {
    builder.addFieldFloat32(3, shininess, 0);
  }
  static addMaterialType(builder, materialType) {
    builder.addFieldInt8(4, materialType, 0);
  }
  static endMaterialData(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createMaterialData(builder, id, colorOffset, specularOffset, shininess, materialType) {
    _MaterialData.startMaterialData(builder);
    _MaterialData.addId(builder, id);
    _MaterialData.addColor(builder, colorOffset);
    _MaterialData.addSpecular(builder, specularOffset);
    _MaterialData.addShininess(builder, shininess);
    _MaterialData.addMaterialType(builder, materialType);
    return _MaterialData.endMaterialData(builder);
  }
};

// js/three-core/quat-value.ts
var QuatValue = class _QuatValue {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsQuatValue(bb, obj) {
    return (obj || new _QuatValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsQuatValue(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _QuatValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  x() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  y() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  z() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  w() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  static startQuatValue(builder) {
    builder.startObject(4);
  }
  static addX(builder, x) {
    builder.addFieldFloat32(0, x, 0);
  }
  static addY(builder, y) {
    builder.addFieldFloat32(1, y, 0);
  }
  static addZ(builder, z) {
    builder.addFieldFloat32(2, z, 0);
  }
  static addW(builder, w) {
    builder.addFieldFloat32(3, w, 0);
  }
  static endQuatValue(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createQuatValue(builder, x, y, z, w) {
    _QuatValue.startQuatValue(builder);
    _QuatValue.addX(builder, x);
    _QuatValue.addY(builder, y);
    _QuatValue.addZ(builder, z);
    _QuatValue.addW(builder, w);
    return _QuatValue.endQuatValue(builder);
  }
};

// js/three-core/vec3.ts
var Vec3 = class _Vec3 {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsVec3(bb, obj) {
    return (obj || new _Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsVec3(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  x() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  y() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  z() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0;
  }
  static startVec3(builder) {
    builder.startObject(3);
  }
  static addX(builder, x) {
    builder.addFieldFloat32(0, x, 0);
  }
  static addY(builder, y) {
    builder.addFieldFloat32(1, y, 0);
  }
  static addZ(builder, z) {
    builder.addFieldFloat32(2, z, 0);
  }
  static endVec3(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createVec3(builder, x, y, z) {
    _Vec3.startVec3(builder);
    _Vec3.addX(builder, x);
    _Vec3.addY(builder, y);
    _Vec3.addZ(builder, z);
    return _Vec3.endVec3(builder);
  }
};

// js/three-core/value.ts
var Value = /* @__PURE__ */ ((Value2) => {
  Value2[Value2["NONE"] = 0] = "NONE";
  Value2[Value2["Vec3"] = 1] = "Vec3";
  Value2[Value2["EulerValue"] = 2] = "EulerValue";
  Value2[Value2["QuatValue"] = 3] = "QuatValue";
  Value2[Value2["FloatV"] = 4] = "FloatV";
  Value2[Value2["GeometryData"] = 5] = "GeometryData";
  Value2[Value2["MaterialData"] = 6] = "MaterialData";
  Value2[Value2["LightData"] = 7] = "LightData";
  return Value2;
})(Value || {});

// js/three-core/method-arg.ts
var MethodArg = class _MethodArg {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsMethodArg(bb, obj) {
    return (obj || new _MethodArg()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsMethodArg(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _MethodArg()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  valueType() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* NONE */;
  }
  value(obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }
  static startMethodArg(builder) {
    builder.startObject(2);
  }
  static addValueType(builder, valueType) {
    builder.addFieldInt8(0, valueType, 0 /* NONE */);
  }
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }
  static endMethodArg(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createMethodArg(builder, valueType, valueOffset) {
    _MethodArg.startMethodArg(builder);
    _MethodArg.addValueType(builder, valueType);
    _MethodArg.addValue(builder, valueOffset);
    return _MethodArg.endMethodArg(builder);
  }
};

// js/three-core/call-method.ts
var CallMethod = class _CallMethod {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsCallMethod(bb, obj) {
    return (obj || new _CallMethod()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsCallMethod(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _CallMethod()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  objectId() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  method() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint16(this.bb_pos + offset) : 0 /* ADD_CHILD */;
  }
  args(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? (obj || new MethodArg()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  argsLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startCallMethod(builder) {
    builder.startObject(3);
  }
  static addObjectId(builder, objectId) {
    builder.addFieldInt32(0, objectId, 0);
  }
  static addMethod(builder, method) {
    builder.addFieldInt16(1, method, 0 /* ADD_CHILD */);
  }
  static addArgs(builder, argsOffset) {
    builder.addFieldOffset(2, argsOffset, 0);
  }
  static createArgsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startArgsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endCallMethod(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createCallMethod(builder, objectId, method, argsOffset) {
    _CallMethod.startCallMethod(builder);
    _CallMethod.addObjectId(builder, objectId);
    _CallMethod.addMethod(builder, method);
    _CallMethod.addArgs(builder, argsOffset);
    return _CallMethod.endCallMethod(builder);
  }
};

// js/three-core/prop-path.ts
var PropPath$1 = /* @__PURE__ */ ((PropPath2) => {
  PropPath2[PropPath2["POSITION"] = 0] = "POSITION";
  PropPath2[PropPath2["ROTATION"] = 1] = "ROTATION";
  PropPath2[PropPath2["SCALE"] = 2] = "SCALE";
  PropPath2[PropPath2["QUATERNION"] = 3] = "QUATERNION";
  PropPath2[PropPath2["MATRIX_WORLD"] = 4] = "MATRIX_WORLD";
  PropPath2[PropPath2["GEOMETRY"] = 5] = "GEOMETRY";
  PropPath2[PropPath2["MATERIAL"] = 6] = "MATERIAL";
  PropPath2[PropPath2["CAMERA_PROJECTION"] = 7] = "CAMERA_PROJECTION";
  PropPath2[PropPath2["CAMERA_VIEW"] = 8] = "CAMERA_VIEW";
  PropPath2[PropPath2["SCENE_LIGHTS"] = 9] = "SCENE_LIGHTS";
  return PropPath2;
})(PropPath$1 || {});

// js/three-core/read-request.ts
var ReadRequest = class _ReadRequest {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsReadRequest(bb, obj) {
    return (obj || new _ReadRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsReadRequest(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _ReadRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  token() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  objectId() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  propPath() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* POSITION */;
  }
  static startReadRequest(builder) {
    builder.startObject(3);
  }
  static addToken(builder, token) {
    builder.addFieldInt32(0, token, 0);
  }
  static addObjectId(builder, objectId) {
    builder.addFieldInt32(1, objectId, 0);
  }
  static addPropPath(builder, propPath) {
    builder.addFieldInt8(2, propPath, 0 /* POSITION */);
  }
  static endReadRequest(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createReadRequest(builder, token, objectId, propPath) {
    _ReadRequest.startReadRequest(builder);
    _ReadRequest.addToken(builder, token);
    _ReadRequest.addObjectId(builder, objectId);
    _ReadRequest.addPropPath(builder, propPath);
    return _ReadRequest.endReadRequest(builder);
  }
};

// js/three-core/set-property.ts
var SetProperty = class _SetProperty {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsSetProperty(bb, obj) {
    return (obj || new _SetProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsSetProperty(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _SetProperty()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  objectId() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  propPath() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* POSITION */;
  }
  valueType() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* NONE */;
  }
  value(obj) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }
  static startSetProperty(builder) {
    builder.startObject(4);
  }
  static addObjectId(builder, objectId) {
    builder.addFieldInt32(0, objectId, 0);
  }
  static addPropPath(builder, propPath) {
    builder.addFieldInt8(1, propPath, 0 /* POSITION */);
  }
  static addValueType(builder, valueType) {
    builder.addFieldInt8(2, valueType, 0 /* NONE */);
  }
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(3, valueOffset, 0);
  }
  static endSetProperty(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createSetProperty(builder, objectId, propPath, valueType, valueOffset) {
    _SetProperty.startSetProperty(builder);
    _SetProperty.addObjectId(builder, objectId);
    _SetProperty.addPropPath(builder, propPath);
    _SetProperty.addValueType(builder, valueType);
    _SetProperty.addValue(builder, valueOffset);
    return _SetProperty.endSetProperty(builder);
  }
};

// js/three-core/command-batch.ts
var CommandBatch = class _CommandBatch {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsCommandBatch(bb, obj) {
    return (obj || new _CommandBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsCommandBatch(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _CommandBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  sets(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new SetProperty()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  setsLength() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  calls(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new CallMethod()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  callsLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  reads(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? (obj || new ReadRequest()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  readsLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startCommandBatch(builder) {
    builder.startObject(3);
  }
  static addSets(builder, setsOffset) {
    builder.addFieldOffset(0, setsOffset, 0);
  }
  static createSetsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startSetsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addCalls(builder, callsOffset) {
    builder.addFieldOffset(1, callsOffset, 0);
  }
  static createCallsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startCallsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addReads(builder, readsOffset) {
    builder.addFieldOffset(2, readsOffset, 0);
  }
  static createReadsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startReadsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endCommandBatch(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static finishCommandBatchBuffer(builder, offset) {
    builder.finish(offset);
  }
  static finishSizePrefixedCommandBatchBuffer(builder, offset) {
    builder.finish(offset, void 0, true);
  }
  static createCommandBatch(builder, setsOffset, callsOffset, readsOffset) {
    _CommandBatch.startCommandBatch(builder);
    _CommandBatch.addSets(builder, setsOffset);
    _CommandBatch.addCalls(builder, callsOffset);
    _CommandBatch.addReads(builder, readsOffset);
    return _CommandBatch.endCommandBatch(builder);
  }
};

// js/three-core/read-result.ts
var ReadResult = class _ReadResult {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsReadResult(bb, obj) {
    return (obj || new _ReadResult()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsReadResult(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _ReadResult()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  token() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
  }
  data(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  dataLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  dataArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  static startReadResult(builder) {
    builder.startObject(2);
  }
  static addToken(builder, token) {
    builder.addFieldInt32(0, token, 0);
  }
  static addData(builder, dataOffset) {
    builder.addFieldOffset(1, dataOffset, 0);
  }
  static createDataVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]);
    }
    return builder.endVector();
  }
  static startDataVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endReadResult(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createReadResult(builder, token, dataOffset) {
    _ReadResult.startReadResult(builder);
    _ReadResult.addToken(builder, token);
    _ReadResult.addData(builder, dataOffset);
    return _ReadResult.endReadResult(builder);
  }
};

// js/three-core/response-batch.ts
var ResponseBatch = class _ResponseBatch {
  constructor() {
    __publicField(this, "bb", null);
    __publicField(this, "bb_pos", 0);
  }
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsResponseBatch(bb, obj) {
    return (obj || new _ResponseBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsResponseBatch(bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new _ResponseBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  results(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new ReadResult()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  resultsLength() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  glCommands(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb.__vector(this.bb_pos + offset) + index) : 0;
  }
  glCommandsLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  glCommandsArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  static startResponseBatch(builder) {
    builder.startObject(2);
  }
  static addResults(builder, resultsOffset) {
    builder.addFieldOffset(0, resultsOffset, 0);
  }
  static createResultsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startResultsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addGlCommands(builder, glCommandsOffset) {
    builder.addFieldOffset(1, glCommandsOffset, 0);
  }
  static createGlCommandsVector(builder, data) {
    builder.startVector(1, data.length, 1);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt8(data[i]);
    }
    return builder.endVector();
  }
  static startGlCommandsVector(builder, numElems) {
    builder.startVector(1, numElems, 1);
  }
  static endResponseBatch(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createResponseBatch(builder, resultsOffset, glCommandsOffset) {
    _ResponseBatch.startResponseBatch(builder);
    _ResponseBatch.addResults(builder, resultsOffset);
    _ResponseBatch.addGlCommands(builder, glCommandsOffset);
    return _ResponseBatch.endResponseBatch(builder);
  }
};

const PropPath = {
    POSITION: PropPath$1.POSITION,
    ROTATION: PropPath$1.ROTATION,
    SCALE: PropPath$1.SCALE,
    QUATERNION: PropPath$1.QUATERNION,
    MATRIX_WORLD: PropPath$1.MATRIX_WORLD,
    GEOMETRY: PropPath$1.GEOMETRY,
    MATERIAL: PropPath$1.MATERIAL,
    CAMERA_PROJECTION: PropPath$1.CAMERA_PROJECTION,
    CAMERA_VIEW: PropPath$1.CAMERA_VIEW,
};

const Method = {
    ADD_CHILD: Method$1.ADD_CHILD,
    UPDATE_MATRIX_WORLD: Method$1.UPDATE_MATRIX_WORLD,
    CREATE_OBJECT: Method$1.CREATE_OBJECT,
    CREATE_GEOMETRY: Method$1.CREATE_GEOMETRY,
    CREATE_MATERIAL: Method$1.CREATE_MATERIAL,
    SET_OBJECT_GEOMETRY: Method$1.SET_OBJECT_GEOMETRY,
    SET_OBJECT_MATERIAL: Method$1.SET_OBJECT_MATERIAL,
};

// Integer cache key: (handle << 6) | propPath
function cacheKey(handle, propPath) {
    return (handle << 6) | propPath;
}

const writeCache = new Map();
const methodQueue = [];
let nextToken = 1;
let wasmExports = null;

function setWasmExports(exports) {
    wasmExports = exports;
}

function writeToCache(handle, propPath, value) {
    writeCache.set(cacheKey(handle, propPath), { handle, propPath, value });
}

function readFromCache(handle, propPath) {
    const entry = writeCache.get(cacheKey(handle, propPath));
    return entry ? entry.value : null;
}

function enqueueMethod(objectId, method, args = []) {
    methodQueue.push({ objectId, method, args });
}

function createObjectDirect() {
    return wasmExports.create_object();
}

function buildValue(builder, propPath, value) {
    switch (propPath) {
        case PropPath.POSITION:
        case PropPath.SCALE:
            return {
                type: Value.Vec3,
                offset: Vec3.createVec3(builder,
                    value.x ?? 0, value.y ?? 0, value.z ?? 0)
            };
        case PropPath.ROTATION:
            return {
                type: Value.EulerValue,
                offset: EulerValue.createEulerValue(builder,
                    value.x ?? 0, value.y ?? 0, value.z ?? 0, value.order ?? 0)
            };
        case PropPath.QUATERNION:
            return {
                type: Value.QuatValue,
                offset: QuatValue.createQuatValue(builder,
                    value.x ?? 0, value.y ?? 0, value.z ?? 0, value.w ?? 1)
            };
        case PropPath.GEOMETRY:
            {
                const verts = value.vertices || [];
                const indices = value.indices || [];
                // Build ALL vectors BEFORE starting the table to avoid nesting
                const vertsOffset = GeometryData.createVerticesVector(builder, verts);
                const idxOffset = indices.length > 0
                    ? GeometryData.createIndicesVector(builder, indices)
                    : null;
                GeometryData.startGeometryData(builder);
                GeometryData.addId(builder, 0);
                GeometryData.addVertices(builder, vertsOffset);
                if (idxOffset !== null) {
                    GeometryData.addIndices(builder, idxOffset);
                }
                return {
                    type: Value.GeometryData,
                    offset: GeometryData.endGeometryData(builder)
                };
            }
        case PropPath.MATERIAL:
            {
                const color = value.color || [1.0, 1.0, 1.0, 1.0];
                const specular = value.specular || [0.0, 0.0, 0.0];
                const colorOffset = MaterialData.createColorVector(builder, color);
                const specOffset = MaterialData.createSpecularVector(builder, specular);
                return {
                    type: Value.MaterialData,
                    offset: MaterialData.createMaterialData(builder, 0, colorOffset, specOffset,
                        value.shininess || 0, value.material_type || 0)
                };
            }
        case PropPath.SCENE_LIGHTS:
            {
                const lt = value.light_type || 0;
                const color = value.color || [1.0, 1.0, 1.0];
                const direction = value.direction || [0.0, 0.0, 0.0];
                const colorOffset = LightData.createColorVector(builder, color);
                const dirOffset = LightData.createDirectionVector(builder, direction);
                console.log('SCENE_LIGHTS buildValue: type=' + lt + ' intensity=' + value.intensity + ' color=' + JSON.stringify(color));
                return {
                    type: Value.LightData,
                    offset: LightData.createLightData(builder,
                        lt, colorOffset, value.intensity || 1.0, dirOffset)
                };
            }
        default:
            return null;
    }
}

/// Build a MethodArg entry from a method argument value
/// Only handles FloatV for simple scalar args (IDs, flags, etc.)
/// Complex data (geometry, material) goes through SetProperty via WriteCache.
function buildMethodArg(builder, arg) {
    switch (arg.type) {
        case 'float':
            return MethodArg.createMethodArg(builder,
                Value.FloatV,
                FloatV.createFloatV(builder, arg.value ?? 0));
        default:
            return null;
    }
}

function flush(readRequests = []) {
    // Pre-estimate buffer size to reduce reallocation (addresses O(n²) issue)
    // Each SetProperty ≈ 64 bytes + data, each CallMethod ≈ 48 bytes + args, each ReadRequest ≈ 32 bytes
    let dataBytes = 0;
    for (const [, entry] of writeCache) {
        if (entry.value) {
            if (entry.value.vertices) dataBytes += entry.value.vertices.length * 4;
            if (entry.value.indices) dataBytes += entry.value.indices.length * 4;
            if (entry.value.color) dataBytes += entry.value.color.length * 4;
        }
    }
    const estimatedSize = 4096 + writeCache.size * 256 + methodQueue.length * 128
                        + readRequests.length * 64 + dataBytes * 2;
    const builder = new Builder(Math.max(65536, estimatedSize));

    // Build SetProperty offsets
    const setOffsets = [];
    for (const [, entry] of writeCache) {
        const vo = buildValue(builder, entry.propPath, entry.value);
        if (!vo) continue;
        SetProperty.startSetProperty(builder);
        SetProperty.addObjectId(builder, entry.handle);
        SetProperty.addPropPath(builder, entry.propPath);
        SetProperty.addValueType(builder, vo.type);
        SetProperty.addValue(builder, vo.offset);
        setOffsets.push(SetProperty.endSetProperty(builder));
    }

    // Build CallMethod offsets with variable MethodArg args
    // Pre-build arg vectors outside the CallMethod table to avoid nesting
    const callOffsets = [];
    const callArgVectors = []; // Pre-built args vectors for each call
    for (const call of methodQueue) {
        let argsVectorOffset = null;
        if (call.args && call.args.length > 0) {
            const argOffsets = [];
            for (const arg of call.args) {
                const ma = buildMethodArg(builder, arg);
                if (ma) argOffsets.push(ma);
            }
            if (argOffsets.length > 0) {
                argsVectorOffset = CallMethod.createArgsVector(builder, argOffsets);
            }
        }
        callArgVectors.push(argsVectorOffset);
    }

    for (let ci = 0; ci < methodQueue.length; ci++) {
        const call = methodQueue[ci];
        CallMethod.startCallMethod(builder);
        CallMethod.addObjectId(builder, call.objectId);
        CallMethod.addMethod(builder, call.method);
        if (callArgVectors[ci] !== null) {
            CallMethod.addArgs(builder, callArgVectors[ci]);
        }
        callOffsets.push(CallMethod.endCallMethod(builder));
    }

    // Build ReadRequest offsets
    const readOffsets = [];
    const tokenToRequest = new Map();
    for (const req of readRequests) {
        const token = nextToken++;
        tokenToRequest.set(token, req);
        ReadRequest.startReadRequest(builder);
        ReadRequest.addToken(builder, token);
        ReadRequest.addObjectId(builder, req.handle);
        ReadRequest.addPropPath(builder, req.propPath);
        readOffsets.push(ReadRequest.endReadRequest(builder));
    }

    // Build vectors
    const setsVector = CommandBatch.createSetsVector(builder, setOffsets);
    const callsVector = CommandBatch.createCallsVector(builder, callOffsets);
    const readsVector = CommandBatch.createReadsVector(builder, readOffsets);

    // Build CommandBatch
    CommandBatch.startCommandBatch(builder);
    CommandBatch.addSets(builder, setsVector);
    CommandBatch.addCalls(builder, callsVector);
    CommandBatch.addReads(builder, readsVector);
    const batchOffset = CommandBatch.endCommandBatch(builder);
    builder.finish(batchOffset);

    // Send to WASM
    const bytes = builder.asUint8Array();
    const responseBytes = wasmExports.process_commands(bytes);

    // Clear caches
    writeCache.clear();
    methodQueue.length = 0;

    // Parse ResponseBatch for read results
    const resultMap = new Map();
    if (responseBytes && responseBytes.length > 0) {
        const respBB = new ByteBuffer(responseBytes);
        const response = ResponseBatch.getRootAsResponseBatch(respBB);
        const nResults = response.resultsLength();
        for (let i = 0; i < nResults; i++) {
            const rr = response.results(i, new ReadResult());
            if (rr) {
                const t = rr.token();
                const dataLen = rr.dataLength();
                const data = [];
                for (let j = 0; j < dataLen; j++) {
                    data.push(rr.data(j));
                }
                if (tokenToRequest.has(t)) {
                    resultMap.set(t, { request: tokenToRequest.get(t), data });
                }
            }
        }
    }

    // Get GL commands via direct WASM call (bypasses FlatBuffer ResponseBatch parse)
    let glCommands = null;
    if (wasmExports.get_gl_commands) {
        const raw = wasmExports.get_gl_commands();
        if (raw && raw.length > 0) glCommands = raw;
    } else {
        // Fallback: parse from ResponseBatch
        if (responseBytes && responseBytes.length > 0) {
            const respBB = new ByteBuffer(responseBytes);
            const response = ResponseBatch.getRootAsResponseBatch(respBB);
            const glLen = response.glCommandsLength();
            if (glLen > 0) {
                glCommands = new Uint8Array(glLen);
                for (let i = 0; i < glLen; i++) glCommands[i] = response.glCommands(i);
            }
        }
    }

    return { resultMap, tokens: [...tokenToRequest.keys()], glCommands };
}

// ---- Top-level WASM initialization ----
await __wbg_init();
init_core();
setWasmExports({ process_commands, create_object, get_gl_commands });

// ---- Math proxy classes ----

class Vector3Proxy {
    constructor(handle, propPath, defaultValue = { x: 0, y: 0, z: 0 }) {
        this._handle = handle;
        this._propPath = propPath;
        this._x = defaultValue.x;
        this._y = defaultValue.y;
        this._z = defaultValue.z;
    }

    get x() { return this._readFromWasm().x; }
    set x(v) { this._x = v; this._writeToCache(); }

    get y() { return this._readFromWasm().y; }
    set y(v) { this._y = v; this._writeToCache(); }

    get z() { return this._readFromWasm().z; }
    set z(v) { this._z = v; this._writeToCache(); }

    set(x, y, z) {
        this._x = x; this._y = y; this._z = z;
        this._writeToCache();
        return this;
    }

    copy(v) {
        this._x = v.x; this._y = v.y; this._z = v.z;
        this._writeToCache();
        return this;
    }

    _writeToCache() {
        if (this._useWriteCache !== false) {
            writeToCache(this._handle, this._propPath, { x: this._x, y: this._y, z: this._z });
        }
    }

    _readFromWasm() {
        const cached = readFromCache(this._handle, this._propPath);
        if (cached) return cached;
        const { resultMap } = flush([{ handle: this._handle, propPath: this._propPath }]);
        for (const [, result] of resultMap) {
            if (result.request.handle === this._handle && result.request.propPath === this._propPath) {
                const d = result.data;
                this._x = d[0]; this._y = d[1]; this._z = d[2];
                return { x: d[0], y: d[1], z: d[2] };
            }
        }
        return { x: this._x, y: this._y, z: this._z };
    }

    clone() {
        const v = this._readFromWasm();
        return new Vector3Proxy(this._handle, this._propPath, v);
    }

    toArray() {
        const v = this._readFromWasm();
        return [v.x, v.y, v.z];
    }
}

class EulerProxy {
    constructor(handle, propPath) {
        this._handle = handle;
        this._propPath = propPath;
        this._x = 0; this._y = 0; this._z = 0; this._order = 0;
    }

    get x() { return this._readFromWasm().x; }
    set x(v) { this._x = v; this._writeToCache(); }

    get y() { return this._readFromWasm().y; }
    set y(v) { this._y = v; this._writeToCache(); }

    get z() { return this._readFromWasm().z; }
    set z(v) { this._z = v; this._writeToCache(); }

    get order() { return this._readFromWasm().order; }
    set order(v) {
        const ordermap = { XYZ: 0, YXZ: 1, ZXY: 2, ZYX: 3, YZX: 4, XZY: 5 };
        this._order = typeof v === 'string' ? (ordermap[v] || 0) : v;
        this._writeToCache();
    }

    set(x, y, z, order) {
        this._x = x; this._y = y; this._z = z;
        if (order !== undefined) this.order = order;
        this._writeToCache();
        return this;
    }

    _writeToCache() {
        writeToCache(this._handle, this._propPath, {
            x: this._x, y: this._y, z: this._z, order: this._order
        });
    }

    _readFromWasm() {
        const cached = readFromCache(this._handle, this._propPath);
        if (cached) return cached;
        const { resultMap } = flush([{ handle: this._handle, propPath: this._propPath }]);
        for (const [, result] of resultMap) {
            if (result.request.handle === this._handle && result.request.propPath === this._propPath) {
                const d = result.data;
                this._x = d[0]; this._y = d[1]; this._z = d[2]; this._order = d[3];
                return { x: d[0], y: d[1], z: d[2], order: d[3] };
            }
        }
        return { x: this._x, y: this._y, z: this._z, order: this._order };
    }
}

class QuaternionProxy {
    constructor(handle, propPath) {
        this._handle = handle;
        this._propPath = propPath;
        this._x = 0; this._y = 0; this._z = 0; this._w = 1;
    }

    get x() { return this._readFromWasm().x; }
    set x(v) { this._x = v; this._writeToCache(); }

    get y() { return this._readFromWasm().y; }
    set y(v) { this._y = v; this._writeToCache(); }

    get z() { return this._readFromWasm().z; }
    set z(v) { this._z = v; this._writeToCache(); }

    get w() { return this._readFromWasm().w; }
    set w(v) { this._w = v; this._writeToCache(); }

    _writeToCache() {
        writeToCache(this._handle, this._propPath, {
            x: this._x, y: this._y, z: this._z, w: this._w
        });
    }

    _readFromWasm() {
        const cached = readFromCache(this._handle, this._propPath);
        if (cached) return cached;
        const { resultMap } = flush([{ handle: this._handle, propPath: this._propPath }]);
        for (const [, result] of resultMap) {
            if (result.request.handle === this._handle && result.request.propPath === this._propPath) {
                const d = result.data;
                this._x = d[0]; this._y = d[1]; this._z = d[2]; this._w = d[3];
                return { x: d[0], y: d[1], z: d[2], w: d[3] };
            }
        }
        return { x: this._x, y: this._y, z: this._z, w: this._w };
    }
}

class Matrix4Proxy {
    constructor(handle, propPath) {
        this._handle = handle;
        this._propPath = propPath;
    }

    get elements() {
        const { resultMap } = flush([{ handle: this._handle, propPath: PropPath.MATRIX_WORLD }]);
        for (const [, result] of resultMap) {
            if (result.request.handle === this._handle && result.request.propPath === PropPath.MATRIX_WORLD) {
                return result.data;
            }
        }
        return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    }
}

// ---- Object3D base class ----
class Object3D {
    constructor() {
        const handle = createObjectDirect();
        this._handle = handle;
        this.isObject3D = true;
        this.type = 'Object3D';
        this.name = '';
        this.parent = null;
        this.children = [];

        this.position = new Vector3Proxy(handle, PropPath.POSITION);
        this.rotation = new EulerProxy(handle, PropPath.ROTATION);
        this.quaternion = new QuaternionProxy(handle, PropPath.QUATERNION);
        this.scale = new Vector3Proxy(handle, PropPath.SCALE, { x: 1, y: 1, z: 1 });

        Object.defineProperty(this, 'matrixWorld', {
            get: () => new Matrix4Proxy(this._handle, PropPath.MATRIX_WORLD),
            enumerable: true,
            configurable: true,
        });

        Object.defineProperty(this, 'id', {
            value: handle,
            writable: false,
            enumerable: true,
        });
    }

    add(object) {
        if (object === this) return this;
        if (object._queueBatch) {
            object._queueBatch(this._handle);
        } else {
            enqueueMethod(this._handle, Method.ADD_CHILD, [{ type: 'float', value: object._handle }]);
        }
        if (object.parent) {
            const idx = object.parent.children.indexOf(object);
            if (idx >= 0) object.parent.children.splice(idx, 1);
        }
        object.parent = this;
        this.children.push(object);
        return this;
    }

    remove(object) {
        const idx = this.children.indexOf(object);
        if (idx >= 0) {
            this.children.splice(idx, 1);
            object.parent = null;
        }
        return this;
    }

    updateMatrixWorld(force = true) {
        if (!this.isMesh) {
            enqueueMethod(this._handle, Method.UPDATE_MATRIX_WORLD, [{ type: 'float', value: force ? 1 : 0 }]);
        }
    }
}

// ---- Subclasses ----
class Scene extends Object3D {
    constructor() {
        super();
        this.type = 'Scene';
        this.isScene = true;
    }
}

class Group extends Object3D {
    constructor() {
        super();
        this.type = 'Group';
        this.isGroup = true;
    }
}

class Mesh extends Object3D {
    constructor() {
        super();
        this.type = 'Mesh';
        this.isMesh = true;
        this.position._useWriteCache = false; // Batch transfer
    }

    /// Queue ALL object data for batched WASM transfer
    static _batch = null;

    _queueBatch(parentHandle) {
        if (!Mesh._batch) Mesh._batch = BatchData();
        const B = Mesh._batch;
        B.objIds.push(this._handle);
        B.parentIds.push(parentHandle);
        B.posData.push(this.position._x, this.position._y, this.position._z);
    }

    setGeometry(vertices, indices = [], uvs = null) {
        if (!Mesh._batch) Mesh._batch = BatchData();
        const B = Mesh._batch;
        B.vertOffsets.push(B.vertData.length, vertices.length);
        for (const v of vertices) B.vertData.push(v);
        B.idxOffsets.push(B.idxData.length, indices.length);
        for (const i of indices) B.idxData.push(i);
        // UVs: auto-generate box UVs or use provided
        const useUvs = uvs || (indices.length === 36 ? expandUVs(boxUVs(), indices) : []);
        B.uvOffsets.push(B.uvData.length, useUvs.length);
        for (const u of useUvs) B.uvData.push(u);
        B.hasUv.push(useUvs.length > 0 ? 1 : 0);
    }

    setMaterial(r, g, b, a, specR=0, specG=0, specB=0, shininess=0, type=0) {
        if (!Mesh._batch) Mesh._batch = BatchData();
        const B = Mesh._batch;
        B.matData.push(r, g, b, a, specR, specG, specB, shininess, type);
    }

    static flushBatch() {
        const B = Mesh._batch;
        if (!B || B.objIds.length === 0) return;
        create_geometries_batch(
            new Float32Array(B.vertData), new Uint32Array(B.vertOffsets),
            new Uint32Array(B.idxData), new Uint32Array(B.idxOffsets),
            new Uint32Array(B.objIds),
            new Float32Array(B.posData), new Float32Array(B.matData),
            new Uint32Array(B.parentIds),
            new Float32Array(B.uvData), new Uint32Array(B.uvOffsets), new Uint8Array(B.hasUv)
        );
        Mesh._batch = null;
    }
}

class PerspectiveCamera extends Object3D {
    constructor(fov = 50, aspect = 1, near = 0.1, far = 100) {
        super();
        this.type = 'PerspectiveCamera';
        this.isCamera = true;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
}

// ---- Renderer ----
class WebGLRenderer {
    constructor(webglAdapter) {
        this.adapter = webglAdapter;
    }

    render(scene, camera) {
        Mesh.flushBatch();
        const lightsData = [];
        if (scene._lights) {
            for (const l of scene._lights) {
                lightsData.push(l.light_type || 0, l.color[0], l.color[1], l.color[2],
                    l.intensity, l.direction[0], l.direction[1], l.direction[2]);
            }
        }
        if (lightsData.length > 0) {
            set_scene_lights(new Float32Array(lightsData));
        }

        // Trigger render via CAMERA_VIEW read (only non-batched data remains in WriteCache)
        const { glCommands } = flush([
            { handle: scene._handle, propPath: PropPath.CAMERA_VIEW }
        ]);
        if (glCommands && glCommands.length > 0) {
            this.adapter.execute(glCommands);
        }
        return glCommands;
    }
}

function BatchData() {
    return { vertData:[], vertOffsets:[], idxData:[], idxOffsets:[],
             objIds:[], posData:[], matData:[], parentIds:[], uvData:[], uvOffsets:[], hasUv:[] };
}

// Generate face UVs for a box (6 faces x 4 vertices x 2 coords)
function boxUVs() { const uvs=[]; for(let f=0;f<6;f++) uvs.push(0,0, 1,0, 1,1, 0,1); return uvs; }

// Expand UVs per vertex from indexed geometry
function expandUVs(uvs, indices) {
    if(!indices||indices.length===0)return uvs;
    const out=[]; for(const i of indices){const b=i*2;out.push(uvs[b],uvs[b+1]);} return out;
}

export { EulerProxy, Group, Matrix4Proxy, Mesh, Object3D, PerspectiveCamera, QuaternionProxy, Scene, Vector3Proxy, WebGLRenderer, __wbg_init, createObjectDirect, create_object, get_gl_commands, init_core, process_commands, setWasmExports };
