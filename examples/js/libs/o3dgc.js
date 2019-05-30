/*global ArrayBuffer, Uint32Array, Int32Array, Float32Array, Int8Array, Uint8Array, window, performance, Console*/

/*
Copyright (c) 2013 Khaled Mammou - Advanced Micro Devices, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var o3dgc = (function () {
    "use strict";
    var module, local;
    module = {};
    local = {};
    local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0 = 7;
    local.O3DGC_BINARY_STREAM_MAX_SYMBOL0 = 127; // ((1 << O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0) >>> 0) - 1;
    local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1 = 6;
    local.O3DGC_BINARY_STREAM_MAX_SYMBOL1 = 63; // ((1 << O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1) >>> 0) - 1;
    local.O3DGC_BINARY_STREAM_NUM_SYMBOLS_UINT32 = 5; // Math.floor((32 + O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0 - 1) / O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0);
    local.O3DGC_BIG_ENDIAN = 0;
    local.O3DGC_LITTLE_ENDIAN = 1;
    local.O3DGC_MAX_DOUBLE = 1.79769e+308;
    local.O3DGC_MIN_LONG = -2147483647;
    local.O3DGC_MAX_LONG = 2147483647;
    local.O3DGC_MAX_UCHAR8 = 255;
    local.O3DGC_MAX_TFAN_SIZE = 256;
    local.O3DGC_MAX_ULONG = 4294967295;
    local.O3DGC_SC3DMC_START_CODE = 0x00001F1;
    local.O3DGC_DV_START_CODE = 0x00001F2;
    local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES = 256;
    local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES = 256;
    local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES = 32;
    local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS = 2;
    local.O3DGC_SC3DMC_BINARIZATION_FL = 0; // Fixed Length (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_BP = 1; // BPC (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_FC = 2; // 4 bits Coding (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_AC = 3; // Arithmetic Coding (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_AC_EGC = 4; // Arithmetic Coding & EGCk
    local.O3DGC_SC3DMC_BINARIZATION_ASCII = 5; // Arithmetic Coding & EGCk
    local.O3DGC_STREAM_TYPE_UNKOWN = 0;
    local.O3DGC_STREAM_TYPE_ASCII = 1;
    local.O3DGC_STREAM_TYPE_BINARY = 2;
    local.O3DGC_SC3DMC_NO_PREDICTION = 0; // supported
    local.O3DGC_SC3DMC_DIFFERENTIAL_PREDICTION = 1; // supported
    local.O3DGC_SC3DMC_XOR_PREDICTION = 2; // not supported
    local.O3DGC_SC3DMC_ADAPTIVE_DIFFERENTIAL_PREDICTION = 3; // not supported
    local.O3DGC_SC3DMC_CIRCULAR_DIFFERENTIAL_PREDICTION = 4; // not supported
    local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION = 5; // supported
    local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION = 6; // supported
    local.O3DGC_SC3DMC_ENCODE_MODE_QBCR = 0; // not supported
    local.O3DGC_SC3DMC_ENCODE_MODE_SVA = 1; // not supported
    local.O3DGC_SC3DMC_ENCODE_MODE_TFAN = 2; // supported
    local.O3DGC_DYNAMIC_VECTOR_ENCODE_MODE_LIFT = 0;
    local.O3DGC_MIN_NEIGHBORS_SIZE = 128;
    local.O3DGC_MIN_NUM_NEIGHBORS_SIZE = 16;
    local.O3DGC_TFANS_MIN_SIZE_ALLOCATED_VERTICES_BUFFER = 128;
    local.O3DGC_TFANS_MIN_SIZE_TFAN_SIZE_BUFFER = 8;
    local.O3DGC_DEFAULT_VECTOR_SIZE = 32;

    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_UNKOWN = 0;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_POSITION = 1;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_NORMAL = 2;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_COLOR = 3;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_TEXCOORD = 4;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_WEIGHT = 5;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_UNKOWN = 0;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_INDEX = 1;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_JOINT_ID = 2;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_INDEX_BUFFER_ID = 3;

    module.O3DGC_OK = 0;
    module.O3DGC_ERROR_BUFFER_FULL = 1;
    module.O3DGC_ERROR_CORRUPTED_STREAM = 5;
    module.O3DGC_ERROR_NON_SUPPORTED_FEATURE = 6;
    module.O3DGC_ERROR_AC = 7;

    function SystemEndianness() {
        var a, b, c;
        b = new ArrayBuffer(4);
        a = new Uint32Array(b);
        c = new Uint8Array(b);
        a[0] = 1;
        if (c[0] === 1) {
            return local.O3DGC_LITTLE_ENDIAN;
        }
        return local.O3DGC_BIG_ENDIAN;
    }
    // SC3DMCStats class
    module.SC3DMCStats = function () {
        this.m_timeCoord = 0;
        this.m_timeNormal = 0;
        this.m_timeCoordIndex = 0;
        this.m_timeFloatAttribute = new Float32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_timeIntAttribute = new Float32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_timeReorder = 0;
        this.m_streamSizeCoord = 0;
        this.m_streamSizeNormal = 0;
        this.m_streamSizeCoordIndex = 0;
        this.m_streamSizeFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_streamSizeIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
    };
    // SC3DMCTriplet class
    module.SC3DMCTriplet = function (a, b, c) {
        this.m_a = a;
        this.m_b = b;
        this.m_c = c;
    };
    module.SC3DMCTriplet.prototype.Less = function (rhs) {
        var res;
        if (this.m_c !== rhs.m_c) {
            res = (this.m_c < rhs.m_c);
        } else if (this.m_b !== rhs.m_b) {
            res = (this.m_b < rhs.m_b);
        } else {
            res = (this.m_a < rhs.m_a);
        }
        return res;
    };
    module.SC3DMCTriplet.prototype.Equal = function (rhs) {
        return (this.m_c === rhs.m_c && this.m_b === rhs.m_b && this.m_a === rhs.m_a);
    };
    // SC3DMCPredictor class
    module.SC3DMCPredictor = function () {
        this.m_id = new module.SC3DMCTriplet(-1, -1, -1);
        this.m_pred = new Float32Array(local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
    };
    // fix me: optimize this function (e.g., binary search)
    function InsertPredictor(e, nPred, list, dimFloatArray) {
        var pos, foundOrInserted, j, j1, j0, h, i;
        pos = -1;
        foundOrInserted = false;
        j1 = nPred.m_value;
        j0 = 0;
        for (j = j0; j < j1; ++j) {
            if (e.Equal(list[j].m_id)) {
                foundOrInserted = true;
                break;
            } else if (e.Less(list[j].m_id)) {
                if (nPred.m_value < local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS) {
                    ++nPred.m_value;
                }
                for (h = nPred.m_value - 1; h > j; --h) {
                    list[h].m_id.m_a = list[h - 1].m_id.m_a;
                    list[h].m_id.m_b = list[h - 1].m_id.m_b;
                    list[h].m_id.m_c = list[h - 1].m_id.m_c;
                    for (i = 0; i < dimFloatArray; ++i) {
                        list[h].m_pred[i] = list[h - 1].m_pred[i];
                    }
                }
                list[j].m_id.m_a = e.m_a;
                list[j].m_id.m_b = e.m_b;
                list[j].m_id.m_c = e.m_c;
                pos = j;
                foundOrInserted = true;
                break;
            }
        }
        if (!foundOrInserted && nPred.m_value < local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS) {
            pos = nPred.m_value++;
            list[pos].m_id.m_a = e.m_a;
            list[pos].m_id.m_b = e.m_b;
            list[pos].m_id.m_c = e.m_c;
        }
        return pos;
    }
    // Timer class
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }
    if (!window.performance.now) {
        local.nowOffset = Date.now();
        if (performance.timing && performance.timing.navigationStart) {
            local.nowOffset = performance.timing.navigationStart;
        }
        window.performance.now = function now() {
            return Date.now() - local.nowOffset;
        };
    }
    module.Timer = function () {
        this.m_start = 0;
        this.m_end = 0;
    };
    module.Timer.prototype.Tic = function () {
        this.m_start = window.performance.now();
    };
    module.Timer.prototype.Toc = function () {
        this.m_end = window.performance.now();
    };
    module.Timer.prototype.GetElapsedTime = function () {
        return this.m_end - this.m_start;
    };
    // Vec3 class
    module.Vec3 = function (x, y, z) {
        this.m_x = x;
        this.m_y = y;
        this.m_z = z;
    };
    module.Vec3.prototype.Set = function (x, y, z) {
        this.m_x = x;
        this.m_y = y;
        this.m_z = z;
    };
    module.Vec3.prototype.Sub = function (lhs, rhs) {
        this.m_x = lhs.m_x - rhs.m_x;
        this.m_y = lhs.m_y - rhs.m_y;
        this.m_z = lhs.m_z - rhs.m_z;
    };
    module.Vec3.prototype.Add = function (lhs, rhs) {
        this.m_x = lhs.m_x + rhs.m_x;
        this.m_y = lhs.m_y + rhs.m_y;
        this.m_z = lhs.m_z + rhs.m_z;
    };
    module.Vec3.prototype.SelfAdd = function (v) {
        this.m_x += v.m_x;
        this.m_y += v.m_y;
        this.m_z += v.m_z;
    };
    module.Vec3.prototype.Cross = function (lhs, rhs) {
        this.m_x = lhs.m_y * rhs.m_z - lhs.m_z * rhs.m_y;
        this.m_y = lhs.m_z * rhs.m_x - lhs.m_x * rhs.m_z;
        this.m_z = lhs.m_x * rhs.m_y - lhs.m_y * rhs.m_x;
    };
    module.Vec3.prototype.GetNorm = function () {
        return Math.sqrt(this.m_x * this.m_x + this.m_y * this.m_y + this.m_z * this.m_z);
    };
    function SphereToCube(vin, vout) {
        var ax, ay, az;
        ax = Math.abs(vin.m_x);
        ay = Math.abs(vin.m_y);
        az = Math.abs(vin.m_z);
        if (az >= ax && az >= ay) {
            if (vin.m_z >= 0) {
                vout.m_z = 0;
                vout.m_x = vin.m_x;
                vout.m_y = vin.m_y;
            } else {
                vout.m_z = 1;
                vout.m_x = -vin.m_x;
                vout.m_y = -vin.m_y;
            }
        } else if (ay >= ax && ay >= az) {
            if (vin.m_y >= 0) {
                vout.m_z = 2;
                vout.m_x = vin.m_z;
                vout.m_y = vin.m_x;
            } else {
                vout.m_z = 3;
                vout.m_x = -vin.m_z;
                vout.m_y = -vin.m_x;
            }
        } else {
            if (vin.m_x >= 0) {
                vout.m_z = 4;
                vout.m_x = vin.m_y;
                vout.m_y = vin.m_z;
            } else {
                vout.m_z = 5;
                vout.m_x = -vin.m_y;
                vout.m_y = -vin.m_z;
            }
        }
    }
    local.CubeToSphere = {
        0: function (vin, vout) {
            vout.m_x = vin.m_x;
            vout.m_y = vin.m_y;
            vout.m_z = Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_y * vout.m_y));
        },
        1: function (vin, vout) {
            vout.m_x = -vin.m_x;
            vout.m_y = -vin.m_y;
            vout.m_z = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_y * vout.m_y));
        },
        2: function (vin, vout) {
            vout.m_z = vin.m_x;
            vout.m_x = vin.m_y;
            vout.m_y = Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_z * vout.m_z));
        },
        3: function (vin, vout) {
            vout.m_z = -vin.m_x;
            vout.m_x = -vin.m_y;
            vout.m_y = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_z * vout.m_z));
        },
        4: function (vin, vout) {
            vout.m_y = vin.m_x;
            vout.m_z = vin.m_y;
            vout.m_x = Math.sqrt(Math.max(0.0, 1.0 - vout.m_y * vout.m_y - vout.m_z * vout.m_z));
        },
        5: function (vin, vout) {
            vout.m_y = -vin.m_x;
            vout.m_z = -vin.m_y;
            vout.m_x = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_y * vout.m_y - vout.m_z * vout.m_z));
        }
    };
    function IntToUInt(value) {
        return (value < 0) ? (-1 - (2 * value)) : (2 * value);
    }
    function UIntToInt(uiValue) {
        return (uiValue & 1) ? -((uiValue + 1) >>> 1) : ((uiValue >>> 1));
    }
    module.Iterator = function () {
        this.m_count = 0;
    };
    module.NumberRef = function () {
        this.m_value = 0;
    };
    // BinaryStream class
    module.BinaryStream = function (buffer) {
        this.m_endianness = SystemEndianness();
        this.m_buffer = buffer;
        this.m_stream = new Uint8Array(this.m_buffer);
        this.m_localBuffer = new ArrayBuffer(4);
        this.m_localBufferViewUChar8 = new Uint8Array(this.m_localBuffer);
        this.m_localBufferViewFloat32 = new Float32Array(this.m_localBuffer);
        this.m_localBufferViewUInt32 = new Uint32Array(this.m_localBuffer);
    };
    module.BinaryStream.prototype.ReadFloat32Bin = function (bsIterator) {
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
        } else {
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
        }
        return this.m_localBufferViewFloat32[0];
    };
    module.BinaryStream.prototype.ReadUInt32Bin = function (bsIterator) {
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
        } else {
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
        }
        return this.m_localBufferViewUInt32[0];
    };
    module.BinaryStream.prototype.ReadUChar8Bin = function (bsIterator) {
        return this.m_stream[bsIterator.m_count++];
    };
    module.BinaryStream.prototype.ReadUInt32ASCII = function (bsIterator) {
        var value, shift, i;
        value = 0;
        shift = 0;
        for (i = 0; i < local.O3DGC_BINARY_STREAM_NUM_SYMBOLS_UINT32; ++i) {
            value += (this.m_stream[bsIterator.m_count++] << shift) >>> 0;
            shift += local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0;
        }
        return value;
    };
    module.BinaryStream.prototype.ReadFloat32ASCII = function (bsIterator) {
        var value = this.ReadUInt32ASCII(bsIterator);
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[2] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[1] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[0] = value & local.O3DGC_MAX_UCHAR8;
        } else {
            this.m_localBufferViewUChar8[0] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[1] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[2] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[3] = value & local.O3DGC_MAX_UCHAR8;
        }
        return this.m_localBufferViewFloat32[0];
    };
    module.BinaryStream.prototype.ReadIntASCII = function (bsIterator) {
        return UIntToInt(this.ReadUIntASCII(bsIterator));
    };
    module.BinaryStream.prototype.ReadUIntASCII = function (bsIterator) {
        var i, x, value;
        value = this.m_stream[bsIterator.m_count++];
        if (value === local.O3DGC_BINARY_STREAM_MAX_SYMBOL0) {
            i = 0;
            do {
                x = this.m_stream[bsIterator.m_count++];
                value += ((x >>> 1) << i) >>> 0;
                i += local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1;
            } while (x & 1);
        }
        return value;
    };
    module.BinaryStream.prototype.ReadUCharASCII = function (bsIterator) {
        return this.m_stream[bsIterator.m_count++];
    };
    module.BinaryStream.prototype.ReadFloat32 = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadFloat32ASCII(bsIterator);
        }
        return this.ReadFloat32Bin(bsIterator);
    };
    module.BinaryStream.prototype.ReadUInt32 = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadUInt32ASCII(bsIterator);
        }
        return this.ReadUInt32Bin(bsIterator);
    };
    module.BinaryStream.prototype.ReadUChar = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadUCharASCII(bsIterator);
        }
        return this.ReadUChar8Bin(bsIterator);
    };
    module.BinaryStream.prototype.GetBuffer = function (bsIterator, size) {
        return new Uint8Array(this.m_buffer, bsIterator.m_count, size);
    };

    // Copyright (c) 2004 Amir Said (said@ieee.org) & William A. Pearlman (pearlw@ecse.rpi.edu)
    // All rights reserved.

    local.O3DGC_AC_MIN_LENGTH = 0x01000000;   // threshold for renormalization
    local.O3DGC_AC_MAX_LENGTH = 0xFFFFFFFF;      // maximum AC interval length
    local.O3DGC_AC_BM_LENGTH_SHIFT = 13;     // Maximum values for binary models length bits discarded before mult.
    local.O3DGC_AC_BM_MAX_COUNT = (1 << local.O3DGC_AC_BM_LENGTH_SHIFT) >>> 0;  // for adaptive models
    local.O3DGC_AC_DM_LENGTH_SHIFT = 15; // Maximum values for general models length bits discarded before mult.
    local.O3DGC_AC_DM_MAX_COUNT = (1 << local.O3DGC_AC_DM_LENGTH_SHIFT) >>> 0;  // for adaptive models
    // StaticBitModel class 
    module.StaticBitModel = function () {
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0; // p0 = 0.5
    };
    module.StaticBitModel.prototype.SetProbability = function (p) {
        this.m_bit0Prob = Math.floor(p * ((1 << local.O3DGC_AC_BM_LENGTH_SHIFT) >>> 0));
    };
    // AdaptiveBitModel class 
    module.AdaptiveBitModel = function () {
        // initialization to equiprobable model
        this.m_updateCycle = 4;
        this.m_bitsUntilUpdate = 4;
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0;
        this.m_bit0Count = 1;
        this.m_bitCount = 2;
    };
    module.AdaptiveBitModel.prototype.Reset = function () {
        this.m_updateCycle = 4;
        this.m_bitsUntilUpdate = 4;
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0;
        this.m_bit0Count = 1;
        this.m_bitCount = 2;
    };
    module.AdaptiveBitModel.prototype.Update = function () {
        // halve counts when a threshold is reached
        if ((this.m_bitCount += this.m_updateCycle) > local.O3DGC_AC_BM_MAX_COUNT) {
            this.m_bitCount = (this.m_bitCount + 1) >>> 1;
            this.m_bit0Count = (this.m_bit0Count + 1) >>> 1;
            if (this.m_bit0Count === this.m_bitCount) {
                ++this.m_bitCount;
            }
        }
        // compute scaled bit 0 probability
        var scale = Math.floor(0x80000000 / this.m_bitCount);
        this.m_bit0Prob = (this.m_bit0Count * scale) >>> (31 - local.O3DGC_AC_BM_LENGTH_SHIFT);
        // set frequency of model updates
        this.m_updateCycle = (5 * this.m_updateCycle) >>> 2;
        if (this.m_updateCycle > 64) {
            this.m_updateCycle = 64;
        }
        this.m_bitsUntilUpdate = this.m_updateCycle;
    };
    // AdaptiveDataModel class 
    module.AdaptiveDataModel = function () {
        this.m_buffer = {};
        this.m_distribution = {};
        this.m_symbolCount = {};
        this.m_decoderTable = {};
        this.m_totalCount = 0;
        this.m_updateCycle = 0;
        this.m_symbolsUntilUpdate = 0;
        this.m_dataSymbols = 0;
        this.m_lastSymbol = 0;
        this.m_tableSize = 0;
        this.m_tableShift = 0;
    };
    module.AdaptiveDataModel.prototype.Update = function () {
        var n, sum, s, scale, k, max_cycle, w;
        // halve counts when a threshold is reached
        if ((this.m_totalCount += this.m_updateCycle) > local.O3DGC_AC_DM_MAX_COUNT) {
            this.m_totalCount = 0;
            for (n = 0; n < this.m_dataSymbols; ++n) {
                this.m_totalCount += (this.m_symbolCount[n] = (this.m_symbolCount[n] + 1) >>> 1);
            }
        }
        // compute cumulative distribution, decoder table
        sum = 0;
        s = 0;
        scale = Math.floor(0x80000000 / this.m_totalCount);
        if (this.m_tableSize === 0) {
            for (k = 0; k < this.m_dataSymbols; ++k) {
                this.m_distribution[k] = (scale * sum) >>> (31 - local.O3DGC_AC_DM_LENGTH_SHIFT);
                sum += this.m_symbolCount[k];
            }
        } else {
            for (k = 0; k < this.m_dataSymbols; ++k) {
                this.m_distribution[k] = (scale * sum) >>> (31 - local.O3DGC_AC_DM_LENGTH_SHIFT);
                sum += this.m_symbolCount[k];
                w = this.m_distribution[k] >>> this.m_tableShift;
                while (s < w) {
                    this.m_decoderTable[++s] = k - 1;
                }
            }
            this.m_decoderTable[0] = 0;
            while (s <= this.m_tableSize) {
                this.m_decoderTable[++s] = this.m_dataSymbols - 1;
            }
        }
        // set frequency of model updates
        this.m_updateCycle = (5 * this.m_updateCycle) >>> 2;
        max_cycle = ((this.m_dataSymbols + 6) << 3) >>> 0;
        if (this.m_updateCycle > max_cycle) {
            this.m_updateCycle = max_cycle;
        }
        this.m_symbolsUntilUpdate = this.m_updateCycle;
    };
    module.AdaptiveDataModel.prototype.Reset = function () {
        var k;
        if (this.m_dataSymbols === 0) {
            return;
        }
        // restore probability estimates to uniform distribution
        this.m_totalCount = 0;
        this.m_updateCycle = this.m_dataSymbols;
        for (k = 0; k < this.m_dataSymbols; ++k) {
            this.m_symbolCount[k] = 1;
        }
        this.Update();
        this.m_symbolsUntilUpdate = this.m_updateCycle = (this.m_dataSymbols + 6) >>> 1;
    };
    module.AdaptiveDataModel.prototype.SetAlphabet = function (number_of_symbols) {
        if ((number_of_symbols < 2) || (number_of_symbols > (1 << 11))) {
            Console.log("invalid number of data symbols");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_dataSymbols !== number_of_symbols) { // assign memory for data model
            this.m_dataSymbols = number_of_symbols;
            this.m_lastSymbol = this.m_dataSymbols - 1;
            // define size of table for fast decoding
            if (this.m_dataSymbols > 16) {
                var table_bits = 3;
                while (this.m_dataSymbols > ((1 << (table_bits + 2)) >>> 0)) {
                    ++table_bits;
                }
                this.m_tableSize = (1 << table_bits) >>> 0;
                this.m_tableShift = local.O3DGC_AC_DM_LENGTH_SHIFT - table_bits;
                this.m_buffer = new ArrayBuffer(4 * (2 * this.m_dataSymbols + this.m_tableSize + 2));
                this.m_distribution = new Uint32Array(this.m_buffer, 0, this.m_dataSymbols);
                this.m_symbolCount = new Uint32Array(this.m_buffer, 4 * this.m_dataSymbols, this.m_dataSymbols);
                this.m_decoderTable = new Uint32Array(this.m_buffer, 8 * this.m_dataSymbols, this.m_tableSize + 2);
            } else {// small alphabet: no table needed
                this.m_tableSize = this.m_tableShift = 0;
                this.m_buffer = new ArrayBuffer(4 * 2 * this.m_dataSymbols);
                this.m_distribution = new Uint32Array(this.m_buffer, 0, this.m_dataSymbols);
                this.m_symbolCount = new Uint32Array(this.m_buffer, 4 * this.m_dataSymbols, this.m_dataSymbols);
                this.m_decoderTable = {};
            }
        }
        this.Reset(); // initialize model
        return module.O3DGC_OK;
    };
    // ArithmeticDecoder class
    module.ArithmeticDecoder = function () {
        this.m_codeBuffer = {};
        this.m_acShift = 0;
        this.m_base = 0;
        this.m_value = 0;
        this.m_length = 0; // arithmetic coding state
        this.m_bufferSize = 0;
        this.m_mode = 0; // mode: 0 = undef, 1 = encoder, 2 = decoder
    };
    module.ArithmeticDecoder.prototype.SetBuffer = function (max_code_bytes, user_buffer) {
        if (max_code_bytes === 0) {
            Console.log("invalid codec buffer size");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_mode !== 0) {
            Console.log("cannot set buffer while encoding or decoding");
            return module.O3DGC_ERROR_AC;
        }
        this.m_bufferSize = max_code_bytes;
        this.m_codeBuffer = user_buffer;
    };
    module.ArithmeticDecoder.prototype.StartDecoder = function () {
        if (this.m_mode !== 0) {
            Console.log("cannot start decoder");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_bufferSize === 0) {
            Console.log("no code buffer set");
            return module.O3DGC_ERROR_AC;
        }
        // initialize decoder: interval, pointer, initial code value
        this.m_mode = 2;
        this.m_length = local.O3DGC_AC_MAX_LENGTH;
        this.m_acShift = 3;
        this.m_value = ((this.m_codeBuffer[0] << 24) | (this.m_codeBuffer[1] << 16) | (this.m_codeBuffer[2] << 8) | (this.m_codeBuffer[3])) >>> 0;
    };
    module.ArithmeticDecoder.prototype.StopDecoder = function () {
        if (this.m_mode !== 2) {
            Console.log("invalid to stop decoder");
            return module.O3DGC_ERROR_AC;
        }
        this.m_mode = 0;
    };
    module.ArithmeticDecoder.prototype.GetBit = function () {
        this.m_length >>>= 1; // halve interval
        var bit = (this.m_value >= this.m_length); // decode bit
        if (bit) {
            this.m_value -= this.m_length; // move base
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return bit;
    };
    module.ArithmeticDecoder.prototype.GetBits = function (bits) {
        var s = Math.floor(this.m_value / (this.m_length >>>= bits)); // decode symbol, change length
        this.m_value -= this.m_length * s; // update interval
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return s;
    };
    module.ArithmeticDecoder.prototype.DecodeStaticBitModel = function (M) {
        var x, bit;
        x = M.m_bit0Prob * (this.m_length >>> local.O3DGC_AC_BM_LENGTH_SHIFT); // product l x p0
        bit = (this.m_value >= x); // decision
        // update & shift interval
        if (!bit) {
            this.m_length = x;
        } else {
            this.m_value -= x; // shifted interval base = 0
            this.m_length -= x;
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return bit; // return data bit value
    };
    module.ArithmeticDecoder.prototype.DecodeAdaptiveBitModel = function (M) {
        var x, bit;
        x = M.m_bit0Prob * (this.m_length >>> local.O3DGC_AC_BM_LENGTH_SHIFT);   // product l x p0
        bit = (this.m_value >= x); // decision
        // update interval
        if (!bit) {
            this.m_length = x;
            ++M.m_bit0Count;
        } else {
            this.m_value -= x;
            this.m_length -= x;
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        if (--M.m_bitsUntilUpdate === 0) {
            M.Update(); // periodic model update
        }
        return bit; // return data bit value
    };
    module.ArithmeticDecoder.prototype.DecodeAdaptiveDataModel = function (M) {
        var n, s, x, y, t, dv, z, m;
        y = this.m_length;
        if (M.m_tableSize > 0) { // use table look-up for faster decoding
            dv = Math.floor(this.m_value / (this.m_length >>>= local.O3DGC_AC_DM_LENGTH_SHIFT));
            t = dv >>> M.m_tableShift;
            s = M.m_decoderTable[t];         // initial decision based on table look-up
            n = M.m_decoderTable[t + 1] + 1;
            while (n > s + 1) { // finish with bisection search
                m = (s + n) >>> 1;
                if (M.m_distribution[m] > dv) {
                    n = m;
                } else {
                    s = m;
                }
            }
            // compute products
            x = M.m_distribution[s] * this.m_length;
            if (s !== M.m_lastSymbol) {
                y = M.m_distribution[s + 1] * this.m_length;
            }
        } else { // decode using only multiplications
            x = s = 0;
            this.m_length >>>= local.O3DGC_AC_DM_LENGTH_SHIFT;
            m = (n = M.m_dataSymbols) >>> 1;
            // decode via bisection search
            do {
                z = this.m_length * M.m_distribution[m];
                if (z > this.m_value) {
                    n = m;
                    y = z; // value is smaller
                } else {
                    s = m;
                    x = z; // value is larger or equal
                }
            } while ((m = (s + n) >>> 1) !== s);
        }
        this.m_value -= x; // update interval
        this.m_length = y - x;
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        ++M.m_symbolCount[s];
        if (--M.m_symbolsUntilUpdate === 0) {
            M.Update(false); // periodic model update
        }
        return s;
    };
    module.ArithmeticDecoder.prototype.ExpGolombDecode = function (k, bModel0, bModel1) {
        var symbol, binary_symbol, l;
        symbol = 0;
        binary_symbol = 0;
        do {
            l = this.DecodeAdaptiveBitModel(bModel1);
            if (l) {
                symbol += (1 << k) >>> 0;
                k++;
            }
        } while (l);
        while (k--) { //next binary part
            if (this.DecodeStaticBitModel(bModel0)) {
                binary_symbol = (binary_symbol | (1 << k)) >>> 0;
            }
        }
        return (symbol + binary_symbol);
    };
    module.ArithmeticDecoder.prototype.RenormDecInterval = function () {
        do { // read least-significant byte
            this.m_value = ((this.m_value << 8) | this.m_codeBuffer[++this.m_acShift]) >>> 0;
            this.m_length = (this.m_length << 8) >>> 0;
        } while (this.m_length < local.O3DGC_AC_MIN_LENGTH); // length multiplied by 256
    };
    module.ArithmeticDecoder.prototype.DecodeIntACEGC = function (mModelValues, bModel0, bModel1, exp_k, M) {
        var uiValue = this.DecodeAdaptiveDataModel(mModelValues);
        if (uiValue === M) {
            uiValue += this.ExpGolombDecode(exp_k, bModel0, bModel1);
        }
        return UIntToInt(uiValue);
    };
    module.ArithmeticDecoder.prototype.DecodeUIntACEGC = function (mModelValues, bModel0, bModel1, exp_k, M) {
        var uiValue = this.DecodeAdaptiveDataModel(mModelValues);
        if (uiValue === M) {
            uiValue += this.ExpGolombDecode(exp_k, bModel0, bModel1);
        }
        return uiValue;
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    
    // FIFO class
    module.FIFO = function () {
        this.m_data = {};
        this.m_allocated = 0;
        this.m_size = 0;
        this.m_start = 0;
        this.m_end = 0;
    };
    module.FIFO.prototype.Clear = function () {
        this.m_start = this.m_end = this.m_size = 0;
    };
    module.FIFO.prototype.GetAllocatedSize = function () {
        return this.m_allocated;
    };
    module.FIFO.prototype.GetSize = function () {
        return this.m_size;
    };
    module.FIFO.prototype.Allocate = function (size) {
        if (size > this.m_allocated) {
            this.m_allocated = size;
            this.m_data = new Int32Array(this.m_allocated);
        }
        this.Clear();
        return module.O3DGC_OK;
    };
    module.FIFO.prototype.PopFirst = function () {
        --this.m_size;
        var current = this.m_start++;
        if (this.m_start === this.m_allocated) {
            this.m_end = 0;
        }
        return this.m_data[current];
    };
    module.FIFO.prototype.PushBack = function (value) {
        --this.m_size;
        this.m_data[this.m_end] = value;
        ++this.m_size;
        ++this.m_end;
        if (this.m_end === this.m_allocated) {
            this.m_end = 0;
        }
    };
    // IndexedFaceSet class
    module.IndexedFaceSet = function () {
        this.m_nCoordIndex = 0;
        this.m_nCoord = 0;
        this.m_nNormal = 0;
        this.m_numFloatAttributes = 0;
        this.m_numIntAttributes = 0;
        this.m_creaseAngle = 30.0;
        this.m_ccw = true;
        this.m_solid = true;
        this.m_convex = true;
        this.m_isTriangularMesh = true;
        this.m_coordMin = new Float32Array(3);
        this.m_coordMax = new Float32Array(3);
        this.m_normalMin = new Float32Array(3);
        this.m_normalMax = new Float32Array(3);
        this.m_nFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_nIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_dimFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_dimIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_typeFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_typeIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_minFloatAttributeBuffer = new ArrayBuffer(4 * local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_minFloatAttribute = new Float32Array(this.m_minFloatAttributeBuffer);
        this.m_maxFloatAttributeBuffer = new ArrayBuffer(4 * local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_maxFloatAttribute = new Float32Array(this.m_maxFloatAttributeBuffer);
        this.m_coordIndex = {};
        this.m_coord = {};
        this.m_normal = {};
        this.m_floatAttribute = [];
        this.m_intAttribute = [];
    };
    module.IndexedFaceSet.prototype.GetNCoordIndex = function () {
        return this.m_nCoordIndex;
    };
    module.IndexedFaceSet.prototype.GetNCoordIndex = function () {
        return this.m_nCoordIndex;
    };
    module.IndexedFaceSet.prototype.GetNCoord = function () {
        return this.m_nCoord;
    };
    module.IndexedFaceSet.prototype.GetNNormal = function () {
        return this.m_nNormal;
    };
    module.IndexedFaceSet.prototype.GetNFloatAttribute = function (a) {
        return this.m_nFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetNIntAttribute = function (a) {
        return this.m_nIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetNumFloatAttributes = function () {
        return this.m_numFloatAttributes;
    };
    module.IndexedFaceSet.prototype.GetNumIntAttributes = function () {
        return this.m_numIntAttributes;
    };
    module.IndexedFaceSet.prototype.GetCoordMinArray = function () {
        return this.m_coordMin;
    };
    module.IndexedFaceSet.prototype.GetCoordMaxArray = function () {
        return this.m_coordMax;
    };
    module.IndexedFaceSet.prototype.GetNormalMinArray = function () {
        return this.m_normalMin;
    };
    module.IndexedFaceSet.prototype.GetNormalMaxArray = function () {
        return this.m_normalMax;
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMinArray = function (a) {
        return (new Float32Array(this.m_minFloatAttributeBuffer, a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES * 4, this.GetFloatAttributeDim(a)));
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMaxArray = function (a) {
        return (new Float32Array(this.m_maxFloatAttributeBuffer, a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES * 4, this.GetFloatAttributeDim(a)));
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeDim = function (a) {
        return this.m_dimFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttributeDim = function (a) {
        return this.m_dimIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeType = function (a) {
        return this.m_typeFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttributeType = function (a) {
        return this.m_typeIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMax = function (a, dim) {
        return this.m_maxFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim];
    };
    module.IndexedFaceSet.prototype.GetCreaseAngle = function () {
        return this.m_creaseAngle;
    };
    module.IndexedFaceSet.prototype.GetCreaseAngle = function () {
        return this.m_creaseAngle;
    };
    module.IndexedFaceSet.prototype.GetCCW = function () {
        return this.m_ccw;
    };
    module.IndexedFaceSet.prototype.GetSolid = function () {
        return this.m_solid;
    };
    module.IndexedFaceSet.prototype.GetConvex = function () {
        return this.m_convex;
    };
    module.IndexedFaceSet.prototype.GetIsTriangularMesh = function () {
        return this.m_isTriangularMesh;
    };
    module.IndexedFaceSet.prototype.GetCoordIndex = function () {
        return this.m_coordIndex;
    };
    module.IndexedFaceSet.prototype.GetCoordIndex = function () {
        return this.m_coordIndex;
    };
    module.IndexedFaceSet.prototype.GetCoord = function () {
        return this.m_coord;
    };
    module.IndexedFaceSet.prototype.GetNormal = function () {
        return this.m_normal;
    };
    module.IndexedFaceSet.prototype.GetFloatAttribute = function (a) {
        return this.m_floatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttribute = function (a) {
        return this.m_intAttribute[a];
    };
    module.IndexedFaceSet.prototype.SetNCoordIndex = function (nCoordIndex) {
        this.m_nCoordIndex = nCoordIndex;
    };
    module.IndexedFaceSet.prototype.SetNNormalIndex = function (nNormalIndex) {
    };
    module.IndexedFaceSet.prototype.SetNormalPerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetNFloatAttributeIndex = function (nFloatAttributeIndex) {
    };
    module.IndexedFaceSet.prototype.SetNIntAttributeIndex = function (nIntAttributeIndex) {
    };
    module.IndexedFaceSet.prototype.SetFloatAttributePerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetIntAttributePerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetNCoord = function (nCoord) {
        this.m_nCoord = nCoord;
    };
    module.IndexedFaceSet.prototype.SetNNormal = function (nNormal) {
        this.m_nNormal = nNormal;
    };
    module.IndexedFaceSet.prototype.SetNumFloatAttributes = function (numFloatAttributes) {
        this.m_numFloatAttributes = numFloatAttributes;
    };
    module.IndexedFaceSet.prototype.SetNumIntAttributes = function (numIntAttributes) {
        this.m_numIntAttributes = numIntAttributes;
    };
    module.IndexedFaceSet.prototype.SetCreaseAngle = function (creaseAngle) {
        this.m_creaseAngle = creaseAngle;
    };
    module.IndexedFaceSet.prototype.SetCCW = function (ccw) {
        this.m_ccw = ccw;
    };
    module.IndexedFaceSet.prototype.SetSolid = function (solid) {
        this.m_solid = solid;
    };
    module.IndexedFaceSet.prototype.SetConvex = function (convex) {
        this.m_convex = convex;
    };
    module.IndexedFaceSet.prototype.SetIsTriangularMesh = function (isTriangularMesh) {
        this.m_isTriangularMesh = isTriangularMesh;
    };
    module.IndexedFaceSet.prototype.SetCoordMin = function (j, min) {
        this.m_coordMin[j] = min;
    };
    module.IndexedFaceSet.prototype.SetCoordMax = function (j, max) {
        this.m_coordMax[j] = max;
    };
    module.IndexedFaceSet.prototype.SetNormalMin = function (j, min) {
        this.m_normalMin[j] = min;
    };
    module.IndexedFaceSet.prototype.SetNormalMax = function (j, max) {
        this.m_normalMax[j] = max;
    };
    module.IndexedFaceSet.prototype.SetNFloatAttribute = function (a, nFloatAttribute) {
        this.m_nFloatAttribute[a] = nFloatAttribute;
    };
    module.IndexedFaceSet.prototype.SetNIntAttribute = function (a, nIntAttribute) {
        this.m_nIntAttribute[a] = nIntAttribute;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeDim = function (a, d) {
        this.m_dimFloatAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetIntAttributeDim = function (a, d) {
        this.m_dimIntAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeType = function (a, d) {
        this.m_typeFloatAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetIntAttributeType = function (a, d) {
        this.m_typeIntAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeMin = function (a, dim, min) {
        this.m_minFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim] = min;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeMax = function (a, dim, max) {
        this.m_maxFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim] = max;
    };
    module.IndexedFaceSet.prototype.SetCoordIndex = function (coordIndex) {
        this.m_coordIndex = coordIndex;
    };
    module.IndexedFaceSet.prototype.SetCoord = function (coord) {
        this.m_coord = coord;
    };
    module.IndexedFaceSet.prototype.SetNormal = function (normal) {
        this.m_normal = normal;
    };
    module.IndexedFaceSet.prototype.SetFloatAttribute = function (a, floatAttribute) {
        this.m_floatAttribute[a] = floatAttribute;
    };
    module.IndexedFaceSet.prototype.SetIntAttribute = function (a, intAttribute) {
        this.m_intAttribute[a] = intAttribute;
    };

    // SC3DMCEncodeParams class
    module.SC3DMCEncodeParams = function () {
        var a;
        this.m_numFloatAttributes = 0;
        this.m_numIntAttributes = 0;
        this.m_floatAttributeQuantBits = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_floatAttributePredMode = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_intAttributePredMode = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_encodeMode = local.O3DGC_SC3DMC_ENCODE_MODE_TFAN;
        this.m_streamTypeMode = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_coordQuantBits = 14;
        this.m_normalQuantBits = 8;
        this.m_coordPredMode = local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        this.m_normalPredMode = local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION;
        for (a = 0; a < local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES; ++a) {
            this.m_floatAttributePredMode[a] = local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        }
        for (a = 0; a < local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES; ++a) {
            this.m_intAttributePredMode[a] = local.O3DGC_SC3DMC_DIFFERENTIAL_PREDICTION;
        }
    };
    module.SC3DMCEncodeParams.prototype.GetStreamType = function () {
        return this.m_streamTypeMode;
    };
    module.SC3DMCEncodeParams.prototype.GetEncodeMode = function () {
        return this.m_encodeMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNumFloatAttributes = function () {
        return this.m_numFloatAttributes;
    };
    module.SC3DMCEncodeParams.prototype.GetNumIntAttributes = function () {
        return this.m_numIntAttributes;
    };
    module.SC3DMCEncodeParams.prototype.GetCoordQuantBits = function () {
        return this.m_coordQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalQuantBits = function () {
        return this.m_normalQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributeQuantBits = function (a) {
        return this.m_floatAttributeQuantBits[a];
    };
    module.SC3DMCEncodeParams.prototype.GetCoordPredMode = function () {
        return this.m_coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalPredMode = function () {
        return this.m_normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributePredMode = function (a) {
        return this.m_floatAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetIntAttributePredMode = function (a) {
        return this.m_intAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetCoordPredMode = function () {
        return this.m_coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalPredMode = function () {
        return this.m_normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributePredMode = function (a) {
        return this.m_floatAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetIntAttributePredMode = function (a) {
        return this.m_intAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.SetStreamType = function (streamTypeMode) {
        this.m_streamTypeMode = streamTypeMode;
    };
    module.SC3DMCEncodeParams.prototype.SetEncodeMode = function (encodeMode) {
        this.m_encodeMode = encodeMode;
    };
    module.SC3DMCEncodeParams.prototype.SetNumFloatAttributes = function (numFloatAttributes) {
        this.m_numFloatAttributes = numFloatAttributes;
    };
    module.SC3DMCEncodeParams.prototype.SetNumIntAttributes = function (numIntAttributes) {
        this.m_numIntAttributes = numIntAttributes;
    };
    module.SC3DMCEncodeParams.prototype.SetCoordQuantBits = function (coordQuantBits) {
        this.m_coordQuantBits = coordQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.SetNormalQuantBits = function (normalQuantBits) {
        this.m_normalQuantBits = normalQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.SetFloatAttributeQuantBits = function (a, q) {
        this.m_floatAttributeQuantBits[a] = q;
    };
    module.SC3DMCEncodeParams.prototype.SetCoordPredMode = function (coordPredMode) {
        this.m_coordPredMode = coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.SetNormalPredMode = function (normalPredMode) {
        this.m_normalPredMode = normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.SetFloatAttributePredMode = function (a, p) {
        this.m_floatAttributePredMode[a] = p;
    };
    module.SC3DMCEncodeParams.prototype.SetIntAttributePredMode = function (a, p) {
        this.m_intAttributePredMode[a] = p;
    };
    // AdjacencyInfo class
    module.AdjacencyInfo = function () {
        this.m_neighborsSize = 0;    // actual allocated size for m_neighbors
        this.m_numNeighborsSize = 0; // actual allocated size for m_numNeighbors
        this.m_numElements = 0;      // number of elements 
        this.m_neighbors = {};
        this.m_numNeighbors = {};
    };
    module.AdjacencyInfo.prototype.Allocate = function (numNeighborsSize, neighborsSize) {
        this.m_numElements = numNeighborsSize;
        if (neighborsSize > this.m_neighborsSize) {
            this.m_neighborsSize = neighborsSize;
            this.m_neighbors = new Int32Array(this.m_neighborsSize);
        }
        if (numNeighborsSize > this.m_numNeighborsSize) {
            this.m_numNeighborsSize = numNeighborsSize;
            this.m_numNeighbors = new Int32Array(this.m_numNeighborsSize);
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.AllocateNumNeighborsArray = function (numElements) {
        if (numElements > this.m_numNeighborsSize) {
            this.m_numNeighborsSize = numElements;
            this.m_numNeighbors = new Int32Array(this.m_numNeighborsSize);
        }
        this.m_numElements = numElements;
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.AllocateNeighborsArray = function () {
        var i;
        for (i = 1; i < this.m_numElements; ++i) {
            this.m_numNeighbors[i] += this.m_numNeighbors[i - 1];
        }
        if (this.m_numNeighbors[this.m_numElements - 1] > this.m_neighborsSize) {
            this.m_neighborsSize = this.m_numNeighbors[this.m_numElements - 1];
            this.m_neighbors = new Int32Array(this.m_neighborsSize);
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.ClearNumNeighborsArray = function () {
        var i;
        for (i = 0; i < this.m_numElements; ++i) {
            this.m_numNeighbors[i] = 0;
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.ClearNeighborsArray = function () {
        var i;
        for (i = 0; i < this.m_neighborsSize; ++i) {
            this.m_neighbors[i] = -1;
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.Begin = function (element) {
        return (element > 0) ? this.m_numNeighbors[element - 1] : 0;
    };
    module.AdjacencyInfo.prototype.End = function (element) {
        return this.m_numNeighbors[element];
    };
    module.AdjacencyInfo.prototype.AddNeighbor = function (element, neighbor) {
        var p, p0, p1;
        p0 = this.Begin(element);
        p1 = this.End(element);
        for (p = p0; p < p1; ++p) {
            if (this.m_neighbors[p] === -1) {
                this.m_neighbors[p] = neighbor;
                return module.O3DGC_OK;
            }
        }
        return module.O3DGC_ERROR_BUFFER_FULL;
    };
    module.AdjacencyInfo.prototype.GetNeighbor = function (element) {
        return this.m_neighbors[element];
    };
    module.AdjacencyInfo.prototype.GetNumNeighbors = function (element) {
        return this.End(element) - this.Begin(element);
    };
    module.AdjacencyInfo.prototype.GetNumNeighborsBuffer = function () {
        return this.m_numNeighbors;
    };
    module.AdjacencyInfo.prototype.GetNeighborsBuffer = function () {
        return this.m_neighbors;
    };
    // Vector class
    module.Vector = function () {
        this.m_data = {};
        this.m_allocated = 0;
        this.m_size = 0;
    };
    module.Vector.prototype.Clear = function () {
        this.m_size = 0;
    };
    module.Vector.prototype.Get = function (i) {
        return this.m_data[i];
    };
    module.Vector.prototype.GetAllocatedSize = function () {
        return this.m_allocated;
    };
    module.Vector.prototype.GetSize = function () {
        return this.m_size;
    };
    module.Vector.prototype.GetBuffer = function () {
        return this.m_data;
    };
    module.Vector.prototype.SetSize = function (size) {
        this.m_size = size;
    };
    module.Vector.prototype.Allocate = function (size) {
        var i, tmp_data;
        if (size > this.m_allocated) {
            this.m_allocated = size;
            tmp_data = new Int32Array(this.m_allocated);
            if (this.m_size > 0) {
                for (i = 0; i < this.m_size; ++i) {
                    tmp_data[i] = this.m_data[i];
                }
            }
            this.m_data = tmp_data;
        }
    };
    module.Vector.prototype.PushBack = function (value) {
        var i, tmp_data;
        if (this.m_size === this.m_allocated) {
            this.m_allocated *= 2;
            if (this.m_allocated < local.O3DGC_DEFAULT_VECTOR_SIZE) {
                this.m_allocated = local.O3DGC_DEFAULT_VECTOR_SIZE;
            }
            tmp_data = new Int32Array(this.m_allocated);
            if (this.m_size > 0) {
                for (i = 0; i < this.m_size; ++i) {
                    tmp_data[i] = this.m_data[i];
                }
            }
            this.m_data = tmp_data;
        }
        this.m_data[this.m_size++] = value;
    };
    // CompressedTriangleFans class
    module.CompressedTriangleFans = function () {
        this.m_numTFANs = new module.Vector();
        this.m_degrees = new module.Vector();
        this.m_configs = new module.Vector();
        this.m_operations = new module.Vector();
        this.m_indices = new module.Vector();
        this.m_trianglesOrder = new module.Vector();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
    };
    module.CompressedTriangleFans.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.CompressedTriangleFans.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.CompressedTriangleFans.prototype.Clear = function () {
        this.m_numTFANs.Clear();
        this.m_degrees.Clear();
        this.m_configs.Clear();
        this.m_operations.Clear();
        this.m_indices.Clear();
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.Allocate = function (numVertices, numTriangles) {
        this.m_numTFANs.Allocate(numVertices);
        this.m_degrees.Allocate(2 * numVertices);
        this.m_configs.Allocate(2 * numVertices);
        this.m_operations.Allocate(2 * numVertices);
        this.m_indices.Allocate(2 * numVertices);
        this.m_trianglesOrder.Allocate(numTriangles);
        this.Clear();
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.PushNumTFans = function (numTFans) {
        this.m_numTFANs.PushBack(numTFans);
    };
    module.CompressedTriangleFans.prototype.ReadNumTFans = function (it) {
        return this.m_numTFANs.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushDegree = function (degree) {
        this.m_degrees.PushBack(degree);
    };
    module.CompressedTriangleFans.prototype.ReadDegree = function (it) {
        return this.m_degrees.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushConfig = function (config) {
        this.m_configs.PushBack(config);
    };
    module.CompressedTriangleFans.prototype.ReadConfig = function (it) {
        return this.m_configs.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushOperation = function (op) {
        this.m_operations.PushBack(op);
    };
    module.CompressedTriangleFans.prototype.ReadOperation = function (it) {
        return this.m_operations.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushIndex = function (index) {
        this.m_indices.PushBack(index);
    };
    module.CompressedTriangleFans.prototype.ReadIndex = function (it) {
        return this.m_indices.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushTriangleIndex = function (index) {
        this.m_trianglesOrder.PushBack(IntToUInt(index));
    };
    module.CompressedTriangleFans.prototype.ReadTriangleIndex = function (it) {
        return UIntToInt(this.m_trianglesOrder.Get(it.m_count++));
    };
    module.CompressedTriangleFans.prototype.LoadUIntData = function (data, bstream, it) {
        var size, i;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size);
        data.Clear();
        for (i = 0; i < size; ++i) {
            data.PushBack(bstream.ReadUIntASCII(it));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadIntData = function (data, bstream, it) {
        var size, i;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size);
        data.Clear();
        for (i = 0; i < size; ++i) {
            data.PushBack(bstream.ReadIntASCII(it));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadBinData = function (data, bstream, it) {
        var size, symbol, i, h;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size * local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0);
        data.Clear();
        i = 0;
        while (i < size) {
            symbol = bstream.ReadUCharASCII(it);
            for (h = 0; h < local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0; ++h) {
                data.PushBack(symbol & 1);
                symbol >>>= 1;
                ++i;
            }
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadUIntAC = function (data, M, bstream, it) {

        var sizeSize, size, minValue, buffer, acd, mModelValues, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 12;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        minValue = bstream.ReadUInt32Bin(it);
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 1);
        for (i = 0; i < size; ++i) {
            data.PushBack(acd.DecodeAdaptiveDataModel(mModelValues) + minValue);
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadIntACEGC = function (data, M, bstream, it) {
        var sizeSize, size, minValue, buffer, acd, mModelValues, bModel0, bModel1, value, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 12;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        minValue = bstream.ReadUInt32Bin(it) - local.O3DGC_MAX_LONG;
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        for (i = 0; i < size; ++i) {
            value = acd.DecodeAdaptiveDataModel(mModelValues);
            if (value === M) {
                value += acd.ExpGolombDecode(0, bModel0, bModel1);
            }
            data.PushBack(value + minValue);
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadBinAC = function (data, bstream, it) {
        var sizeSize, size, buffer, acd, bModel, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 8;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        bModel = new module.AdaptiveBitModel();
        for (i = 0; i < size; ++i) {
            data.PushBack(acd.DecodeAdaptiveBitModel(bModel));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.Load = function (bstream, iterator, decodeTrianglesOrder, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            this.LoadUIntData(this.m_numTFANs, bstream, iterator);
            this.LoadUIntData(this.m_degrees, bstream, iterator);
            this.LoadUIntData(this.m_configs, bstream, iterator);
            this.LoadBinData(this.m_operations, bstream, iterator);
            this.LoadIntData(this.m_indices, bstream, iterator);
            if (decodeTrianglesOrder) {
                this.LoadUIntData(this.m_trianglesOrder, bstream, iterator);
            }
        } else {
            this.LoadIntACEGC(this.m_numTFANs, 4, bstream, iterator);
            this.LoadIntACEGC(this.m_degrees, 16, bstream, iterator);
            this.LoadUIntAC(this.m_configs, 10, bstream, iterator);
            this.LoadBinAC(this.m_operations, bstream, iterator);
            this.LoadIntACEGC(this.m_indices, 8, bstream, iterator);
            if (decodeTrianglesOrder) {
                this.LoadIntACEGC(this.m_trianglesOrder, 16, bstream, iterator);
            }
        }
        return module.O3DGC_OK;
    };
    // TriangleFans class
    module.TriangleFans = function () {
        this.m_verticesAllocatedSize = 0;
        this.m_sizeTFANAllocatedSize = 0;
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        this.m_sizeTFAN = {};
        this.m_vertices = {};
    };
    module.TriangleFans.prototype.Allocate = function (sizeTFAN, verticesSize) {
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        if (this.m_verticesAllocatedSize < verticesSize) {
            this.m_verticesAllocatedSize = verticesSize;
            this.m_vertices = new Int32Array(this.m_verticesAllocatedSize);
        }
        if (this.m_sizeTFANAllocatedSize < sizeTFAN) {
            this.m_sizeTFANAllocatedSize = sizeTFAN;
            this.m_sizeTFAN = new Int32Array(this.m_sizeTFANAllocatedSize);
        }
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.Clear = function () {
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.AddVertex = function (vertex) {
        var i, tmp_vertices;
        ++this.m_numVertices;
        if (this.m_numVertices > this.m_verticesAllocatedSize) {
            this.m_verticesAllocatedSize *= 2;
            tmp_vertices = new Int32Array(this.m_verticesAllocatedSize);
            for (i = 0; i < this.m_numVertices; ++i) {
                tmp_vertices[i] = this.m_vertices[i];
            }
            this.m_vertices = tmp_vertices;
        }
        this.m_vertices[this.m_numVertices - 1] = vertex;
        ++this.m_sizeTFAN[this.m_numTFANs - 1];
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.AddTFAN = function () {
        var i, tmp_sizeTFAN;
        ++this.m_numTFANs;
        if (this.m_numTFANs > this.m_sizeTFANAllocatedSize) {
            this.m_sizeTFANAllocatedSize *= 2;
            tmp_sizeTFAN = new Int32Array(this.m_sizeTFANAllocatedSize);
            for (i = 0; i < this.m_numTFANs; ++i) {
                tmp_sizeTFAN[i] = this.m_sizeTFAN[i];
            }
            this.m_sizeTFAN = tmp_sizeTFAN;
        }
        this.m_sizeTFAN[this.m_numTFANs - 1] = (this.m_numTFANs > 1) ? this.m_sizeTFAN[this.m_numTFANs - 2] : 0;
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.Begin = function (tfan) {
        return (tfan > 0) ? this.m_sizeTFAN[tfan - 1] : 0;
    };
    module.TriangleFans.prototype.End = function (tfan) {
        return this.m_sizeTFAN[tfan];
    };
    module.TriangleFans.prototype.GetVertex = function (vertex) {
        return this.m_vertices[vertex];
    };
    module.TriangleFans.prototype.GetTFANSize = function (tfan) {
        return this.End(tfan) - this.Begin(tfan);
    };
    module.TriangleFans.prototype.GetNumTFANs = function () {
        return this.m_numTFANs;
    };
    module.TriangleFans.prototype.GetNumVertices = function () {
        return this.m_numVertices;
    };
    // TriangleListDecoder class
    module.TriangleListDecoder = function () {
        this.m_itNumTFans = new module.Iterator();
        this.m_itDegree = new module.Iterator();
        this.m_itConfig = new module.Iterator();
        this.m_itOperation = new module.Iterator();
        this.m_itIndex = new module.Iterator();
        this.m_maxNumVertices = 0;
        this.m_maxNumTriangles = 0;
        this.m_numTriangles = 0;
        this.m_numVertices = 0;
        this.m_tempTrianglesSize = 0;
        this.m_vertexCount = 0;
        this.m_triangleCount = 0;
        this.m_numConqueredTriangles = 0;
        this.m_numVisitedVertices = 0;
        this.m_triangles = {};
        this.m_tempTriangles = {};
        this.m_visitedVertices = {};
        this.m_visitedVerticesValence = {};
        this.m_vertexToTriangle = new module.AdjacencyInfo();
        this.m_ctfans = new module.CompressedTriangleFans();
        this.m_tfans = new module.TriangleFans();
        this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_decodeTrianglesOrder = false;
        this.m_decodeVerticesOrder = false;
        this.m_processConfig = {
            0: function (decoder, degree) { // ops: 1000001 vertices: -1 -2
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            1: function (decoder, degree, focusVertex) { // ops: 1xxxxxx1 vertices: -1 x x x x x -2
                var u, op, index;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree - 1; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            2: function (decoder, degree) { // ops: 00000001 vertices: -1
                var u;
                for (u = 0; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            3: function (decoder, degree) { // ops: 00000001 vertices: -2
                var u;
                for (u = 0; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            4: function (decoder, degree) {// ops: 10000000 vertices: -1
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            5: function (decoder, degree) { // ops: 10000000 vertices: -2
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            6: function (decoder, degree) { // ops: 00000000 vertices:
                var u;
                for (u = 0; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            7: function (decoder, degree) { // ops: 1000001 vertices: -2 -1
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            8: function (decoder, degree, focusVertex) { // ops: 1xxxxxx1 vertices: -2 x x x x x -1
                var u, op, index;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree - 1; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            9: function (decoder, degree, focusVertex) { // general case
                var u, op, index;
                for (u = 0; u < degree; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
            }
        };
    };
    module.TriangleListDecoder.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.TriangleListDecoder.prototype.GetReorderTriangles = function () {
        return this.m_decodeTrianglesOrder;
    };
    module.TriangleListDecoder.prototype.GetReorderVertices = function () {
        return this.m_decodeVerticesOrder;
    };
    module.TriangleListDecoder.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.TriangleListDecoder.prototype.GetVertexToTriangle = function () {
        return this.m_vertexToTriangle;
    };
    module.TriangleListDecoder.prototype.Reorder = function () {
        var triangles, numTriangles, order, it, prevTriangleIndex, tempTriangles, t, i;
        if (this.m_decodeTrianglesOrder) {
            triangles = this.m_triangles;
            numTriangles = this.m_numTriangles;
            order = this.m_ctfans.m_trianglesOrder.m_data;
            tempTriangles = this.m_tempTriangles;
            tempTriangles.set(triangles);
            it = 0;
            prevTriangleIndex = 0;
            for (i = 0; i < numTriangles; ++i) {
                t = UIntToInt(order[it++]) + prevTriangleIndex;
                triangles[3 * t] = tempTriangles[3 * i];
                triangles[3 * t + 1] = tempTriangles[3 * i + 1];
                triangles[3 * t + 2] = tempTriangles[3 * i + 2];
                prevTriangleIndex = t + 1;
            }
        }
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.CompueLocalConnectivityInfo = function (focusVertex) {
        var visitedVertices, visitedVerticesValence, triangles, vertexToTriangle, beginV2T, endV2T, numConqueredTriangles, foundOrInserted, numVisitedVertices, tmp, i, j, k, h, x, y, t, p, v;
        visitedVertices = this.m_visitedVertices;
        visitedVerticesValence = this.m_visitedVerticesValence;
        triangles = this.m_triangles;
        vertexToTriangle = this.m_vertexToTriangle;
        beginV2T = vertexToTriangle.Begin(focusVertex);
        endV2T = vertexToTriangle.End(focusVertex);
        numConqueredTriangles = 0;
        numVisitedVertices = 0;
        t = 0;
        for (i = beginV2T; (t >= 0) && (i < endV2T); ++i) {
            t = vertexToTriangle.GetNeighbor(i);
            if (t >= 0) {
                ++numConqueredTriangles;
                p = 3 * t;
                // extract visited vertices
                for (k = 0; k < 3; ++k) {
                    v = triangles[p + k];
                    if (v > focusVertex) { // vertices are insertices by increasing traversal order
                        foundOrInserted = false;
                        for (j = 0; j < numVisitedVertices; ++j) {
                            if (v === visitedVertices[j]) {
                                visitedVerticesValence[j]++;
                                foundOrInserted = true;
                                break;
                            } else if (v < visitedVertices[j]) {
                                ++numVisitedVertices;
                                for (h = numVisitedVertices - 1; h > j; --h) {
                                    visitedVertices[h] = visitedVertices[h - 1];
                                    visitedVerticesValence[h] = visitedVerticesValence[h - 1];
                                }
                                visitedVertices[j] = v;
                                visitedVerticesValence[j] = 1;
                                foundOrInserted = true;
                                break;
                            }
                        }
                        if (!foundOrInserted) {
                            visitedVertices[numVisitedVertices] = v;
                            visitedVerticesValence[numVisitedVertices] = 1;
                            numVisitedVertices++;
                        }
                    }
                }
            }
        }
        // re-order visited vertices by taking into account their valence (i.e., # of conquered triangles incident to each vertex)
        // in order to avoid config. 9
        if (numVisitedVertices > 2) {
            for (x = 1; x < numVisitedVertices; ++x) {
                if (visitedVerticesValence[x] === 1) {
                    y = x;
                    while ((y > 0) && (visitedVerticesValence[y] < visitedVerticesValence[y - 1])) {
                        tmp = visitedVerticesValence[y];
                        visitedVerticesValence[y] = visitedVerticesValence[y - 1];
                        visitedVerticesValence[y - 1] = tmp;
                        tmp = visitedVertices[y];
                        visitedVertices[y] = visitedVertices[y - 1];
                        visitedVertices[y - 1] = tmp;
                        --y;
                    }
                }
            }
        }
        this.m_numConqueredTriangles = numConqueredTriangles;
        this.m_numVisitedVertices = numVisitedVertices;
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.DecompressTFAN = function (focusVertex) {
        var vertexToTriangle, triangles, itDegree, itConfig, tfans, ntfans, processConfig, ctfans, triangleCount, numConqueredTriangles, degree, config, k0, k1, b, c, t, f, k;
        vertexToTriangle = this.m_vertexToTriangle;
        triangles = this.m_triangles;
        itDegree = this.m_itDegree;
        itConfig = this.m_itConfig;
        tfans = this.m_tfans;
        processConfig = this.m_processConfig;
        ctfans = this.m_ctfans;
        triangleCount = this.m_triangleCount;
        numConqueredTriangles = this.m_numConqueredTriangles;
        ntfans = ctfans.ReadNumTFans(this.m_itNumTFans);
        if (ntfans > 0) {
            for (f = 0; f < ntfans; ++f) {
                tfans.AddTFAN();
                degree = ctfans.ReadDegree(itDegree) + 2 - numConqueredTriangles;
                config = ctfans.ReadConfig(itConfig);
                k0 = tfans.GetNumVertices();
                tfans.AddVertex(focusVertex);
                processConfig[config](this, degree, focusVertex);
                k1 = tfans.GetNumVertices();
                b = tfans.GetVertex(k0 + 1);
                for (k = k0 + 2; k < k1; ++k) {
                    c = tfans.GetVertex(k);
                    t = triangleCount * 3;
                    triangles[t++] = focusVertex;
                    triangles[t++] = b;
                    triangles[t] = c;
                    vertexToTriangle.AddNeighbor(focusVertex, triangleCount);
                    vertexToTriangle.AddNeighbor(b, triangleCount);
                    vertexToTriangle.AddNeighbor(c, triangleCount);
                    b = c;
                    triangleCount++;
                }
            }
        }
        this.m_triangleCount = triangleCount;
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Decompress = function () {
        var focusVertex;
        for (focusVertex = 0; focusVertex < this.m_numVertices; ++focusVertex) {
            if (focusVertex === this.m_vertexCount) {
                this.m_vertexCount++; // insert focusVertex
            }
            this.CompueLocalConnectivityInfo(focusVertex);
            this.DecompressTFAN(focusVertex);
        }
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Init = function (triangles, numTriangles, numVertices, maxSizeV2T) {
        var i, numNeighbors;
        this.m_numTriangles = numTriangles;
        this.m_numVertices = numVertices;
        this.m_triangles = triangles;
        this.m_vertexCount = 0;
        this.m_triangleCount = 0;
        this.m_itNumTFans.m_count = 0;
        this.m_itDegree.m_count = 0;
        this.m_itConfig.m_count = 0;
        this.m_itOperation.m_count = 0;
        this.m_itIndex.m_count = 0;
        if (this.m_numVertices > this.m_maxNumVertices) {
            this.m_maxNumVertices = this.m_numVertices;
            this.m_visitedVerticesValence = new Int32Array(this.m_numVertices);
            this.m_visitedVertices = new Int32Array(this.m_numVertices);
        }
        if (this.m_decodeTrianglesOrder && this.m_tempTrianglesSize < this.m_numTriangles) {
            this.m_tempTrianglesSize = this.m_numTriangles;
            this.m_tempTriangles = new Int32Array(3 * this.m_tempTrianglesSize);
        }
        this.m_ctfans.SetStreamType(this.m_streamType);
        this.m_ctfans.Allocate(this.m_numVertices, this.m_numTriangles);
        this.m_tfans.Allocate(2 * this.m_numVertices, 8 * this.m_numVertices);
        // compute vertex-to-triangle adjacency information
        this.m_vertexToTriangle.AllocateNumNeighborsArray(numVertices);
        numNeighbors = this.m_vertexToTriangle.GetNumNeighborsBuffer();
        for (i = 0; i < numVertices; ++i) {
            numNeighbors[i] = maxSizeV2T;
        }
        this.m_vertexToTriangle.AllocateNeighborsArray();
        this.m_vertexToTriangle.ClearNeighborsArray();
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Decode = function (triangles, numTriangles, numVertices, bstream, it) {
        var compressionMask, maxSizeV2T;
        compressionMask = bstream.ReadUChar(it, this.m_streamType);
        this.m_decodeTrianglesOrder = ((compressionMask & 2) !== 0);
        this.m_decodeVerticesOrder = ((compressionMask & 1) !== 0);
        if (this.m_decodeVerticesOrder) { // vertices reordering not supported
            return module.O3DGC_ERROR_NON_SUPPORTED_FEATURE;
        }
        maxSizeV2T = bstream.ReadUInt32(it, this.m_streamType);
        this.Init(triangles, numTriangles, numVertices, maxSizeV2T);
        this.m_ctfans.Load(bstream, it, this.m_decodeTrianglesOrder, this.m_streamType);
        this.Decompress();
        return module.O3DGC_OK;
    };
    // SC3DMCDecoder class
    module.SC3DMCDecoder = function () {
        var i;
        this.m_iterator = new module.Iterator();
        this.m_streamSize = 0;
        this.m_params = new module.SC3DMCEncodeParams();
        this.m_triangleListDecoder = new module.TriangleListDecoder();
        this.m_quantFloatArray = {};
        this.m_orientation = {};
        this.m_normals = {};
        this.m_quantFloatArraySize = 0;
        this.m_normalsSize = 0;
        this.m_orientationSize = 0;
        this.m_stats = new module.SC3DMCStats();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
        this.m_neighbors = [];
        this.m_idelta = new Float32Array(local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_minNormal = new Float32Array(2);
        this.m_maxNormal = new Float32Array(2);
        this.m_minNormal[0] = this.m_minNormal[1] = -2;
        this.m_maxNormal[0] = this.m_maxNormal[1] = 2;
        for (i = 0; i < local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES; ++i) {
            this.m_neighbors[i] = new module.SC3DMCPredictor();
        }
    };
    module.SC3DMCDecoder.prototype.GetStats = function () {
        return this.m_stats;
    };
    module.SC3DMCDecoder.prototype.DecodeHeader = function (ifs, bstream) {
        var c0, start_code, mask, j, a, d;
        c0 = this.m_iterator.m_count;
        start_code = bstream.ReadUInt32(this.m_iterator, local.O3DGC_STREAM_TYPE_BINARY);
        if (start_code !== local.O3DGC_SC3DMC_START_CODE) {
            this.m_iterator.m_count = c0;
            start_code = bstream.ReadUInt32(this.m_iterator, local.O3DGC_STREAM_TYPE_ASCII);
            if (start_code !== local.O3DGC_SC3DMC_START_CODE) {
                return module.O3DGC_ERROR_CORRUPTED_STREAM;
            }
            this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        } else {
            this.m_streamType = local.O3DGC_STREAM_TYPE_BINARY;
        }
        this.m_streamSize = bstream.ReadUInt32(this.m_iterator, this.m_streamType);
        this.m_params.SetEncodeMode(bstream.ReadUChar(this.m_iterator, this.m_streamType));

        ifs.SetCreaseAngle(bstream.ReadFloat32(this.m_iterator, this.m_streamType));
        mask = bstream.ReadUChar(this.m_iterator, this.m_streamType);
        ifs.SetCCW((mask & 1) === 1);
        ifs.SetSolid((mask & 2) === 1);
        ifs.SetConvex((mask & 4) === 1);
        ifs.SetIsTriangularMesh((mask & 8) === 1);

        ifs.SetNCoord(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNNormal(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNumFloatAttributes(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNumIntAttributes(bstream.ReadUInt32(this.m_iterator, this.m_streamType));

        if (ifs.GetNCoord() > 0) {
            ifs.SetNCoordIndex(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            for (j = 0; j < 3; ++j) {
                ifs.SetCoordMin(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                ifs.SetCoordMax(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
            }
            this.m_params.SetCoordQuantBits(bstream.ReadUChar(this.m_iterator, this.m_streamType));
        }
        if (ifs.GetNNormal() > 0) {
            ifs.SetNNormalIndex(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            for (j = 0; j < 3; ++j) {
                ifs.SetNormalMin(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                ifs.SetNormalMax(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
            }
            ifs.SetNormalPerVertex(bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
            this.m_params.SetNormalQuantBits(bstream.ReadUChar(this.m_iterator, this.m_streamType));
        }
        for (a = 0; a < ifs.GetNumFloatAttributes(); ++a) {
            ifs.SetNFloatAttribute(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            if (ifs.GetNFloatAttribute(a) > 0) {
                ifs.SetNFloatAttributeIndex(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
                d = bstream.ReadUChar(this.m_iterator, this.m_streamType);
                ifs.SetFloatAttributeDim(a, d);
                for (j = 0; j < d; ++j) {
                    ifs.SetFloatAttributeMin(a, j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                    ifs.SetFloatAttributeMax(a, j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                }
                ifs.SetFloatAttributePerVertex(a, bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
                ifs.SetFloatAttributeType(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
                this.m_params.SetFloatAttributeQuantBits(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
            }
        }
        for (a = 0; a < ifs.GetNumIntAttributes(); ++a) {
            ifs.SetNIntAttribute(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            if (ifs.GetNIntAttribute(a) > 0) {
                ifs.SetNIntAttributeIndex(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
                ifs.SetIntAttributeDim(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
                ifs.SetIntAttributePerVertex(a, bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
                ifs.SetIntAttributeType(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
            }
        }
        return module.O3DGC_OK;
    };
    function DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride) {
        var ws, k, p, w, i, id;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        for (k = 0; k < 3; ++k) {
            w = triangles[ta * 3 + k];
            if (w < v) {
                id.m_a = -1;
                id.m_b = -1;
                id.m_c = w;
                p = InsertPredictor(id, nPred, neighbors, dimFloatArray);
                if (p !== -1) {
                    ws = w * stride;
                    for (i = 0; i < dimFloatArray; ++i) {
                        neighbors[p].m_pred[i] = quantFloatArray[ws + i];
                    }
                }
            }
        }
    }
    function ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors) {
        var ta3, tb3, as, bs, cs, a, b, c, x, i, k, u1_begin, u1_end, u1, tb, foundB, p, id;
        ta3 = ta * 3;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (triangles[ta3] === v) {
            a = triangles[ta3 + 1];
            b = triangles[ta3 + 2];
        } else if (triangles[ta3 + 1] === v) {
            a = triangles[ta3];
            b = triangles[ta3 + 2];
        } else {
            a = triangles[ta3];
            b = triangles[ta3 + 1];
        }
        if (a < v && b < v) {
            u1_begin = v2T.Begin(a);
            u1_end = v2T.End(a);
            for (u1 = u1_begin; u1 < u1_end; ++u1) {
                tb = v2TNeighbors[u1];
                if (tb < 0) {
                    break;
                }
                tb3 = tb * 3;
                c = -1;
                foundB = false;
                for (k = 0; k < 3; ++k) {
                    x = triangles[tb3 + k];
                    if (x === b) {
                        foundB = true;
                    } else if (x < v && x !== a) {
                        c = x;
                    }
                }
                if (c !== -1 && foundB) {
                    if (a < b) {
                        id.m_a = a;
                        id.m_b = b;
                    } else {
                        id.m_a = b;
                        id.m_b = a;
                    }
                    id.m_c = (-c - 1);
                    p = InsertPredictor(id, nPred, neighbors, dimFloatArray);
                    if (p !== -1) {
                        as = a * stride;
                        bs = b * stride;
                        cs = c * stride;
                        for (i = 0; i < dimFloatArray; ++i) {
                            neighbors[p].m_pred[i] = quantFloatArray[as + i] + quantFloatArray[bs + i] - quantFloatArray[cs + i];
                        }
                    }
                }
            }
        }
    }
    module.SC3DMCDecoder.prototype.DecodeIntArrayBinary = function (intArray,
                                                                    numIntArray,
                                                                    dimIntArray,
                                                                    stride,
                                                                    ifs,
                                                                    predMode,
                                                                    bstream) {
        var testPredEnabled, bestPred, i, u, ta, u_begin, u_end, buffer, iterator, streamType, predResidual, acd, bModel0, bModel1, mModelPreds, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, exp_k, M, id, mModelValues, neighbors, normals, nPred, v;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        mModelPreds = new module.AdaptiveDataModel();
        mModelPreds.SetAlphabet(local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS + 1);
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numIntArray * dimIntArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);        // bitsream size
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        exp_k = 0;
        M = 0;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_AC_EGC) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        buffer = bstream.GetBuffer(iterator, streamSize);
        iterator.m_count += streamSize;
        acd.SetBuffer(streamSize, buffer);
        acd.StartDecoder();
        exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
        M = acd.ExpGolombDecode(0, bModel0, bModel1);
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        for (v = 0; v < numIntArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                for (u = u_begin; u < u_end; ++u) {
                    ta = v2TNeighbors[u];
                    if (ta < 0) {
                        break;
                    }
                    DeltaPredictors(triangles, ta, v, nPred, neighbors, dimIntArray, intArray, stride);
                }
            }
            if (nPred.m_value > 1) {
                bestPred = acd.DecodeAdaptiveDataModel(mModelPreds);
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual + intArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeUIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeIntArrayASCII = function (intArray,
                                                                   numIntArray,
                                                                   dimIntArray,
                                                                   stride,
                                                                   ifs,
                                                                   predMode,
                                                                   bstream) {
        var testPredEnabled, iterator, streamType, predResidual, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, id, neighbors, normals, nPred, v, u_begin, u_end, u, ta, i, bestPred;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numIntArray * dimIntArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);        // bitsream size
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_ASCII) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        bstream.ReadUInt32(iteratorPred, streamType);        // predictors bitsream size
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        for (v = 0; v < numIntArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                for (u = u_begin; u < u_end; ++u) {
                    ta = v2TNeighbors[u];
                    if (ta < 0) {
                        break;
                    }
                    DeltaPredictors(triangles, ta, v, nPred, neighbors, dimIntArray, intArray, stride);
                }
            }
            if (nPred.m_value > 1) {
                bestPred = bstream.ReadUCharASCII(iteratorPred);
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    intArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    intArray[v * stride + i] = predResidual + intArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadUIntASCII(iterator);
                    intArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeIntArray = function (intArray,
                                                              numIntArray,
                                                              dimIntArray,
                                                              stride,
                                                              ifs,
                                                              predMode,
                                                              bstream) {
        if (this.m_streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.DecodeIntArrayASCII(intArray, numIntArray, dimIntArray, stride, ifs, predMode, bstream);
        }
        return this.DecodeIntArrayBinary(intArray, numIntArray, dimIntArray, stride, ifs, predMode, bstream);
    };
    function ComputeNormals(triangles, ntris, coords, nvert, normals) {
        var t3, v, n, t, a, b, c, d1, d2, n0;
        n0 = new module.Vec3();
        d1 = new module.Vec3();
        d2 = new module.Vec3();
        n = nvert * 3;
        for (v = 0; v < n; ++v) {
            normals[v] = 0;
        }
        for (t = 0; t < ntris; ++t) {
            t3 = t * 3;
            a = triangles[t3] * 3;
            b = triangles[t3 + 1] * 3;
            c = triangles[t3 + 2] * 3;
            d1.m_x = coords[b] - coords[a];
            d1.m_y = coords[b + 1] - coords[a + 1];
            d1.m_z = coords[b + 2] - coords[a + 2];
            d2.m_x = coords[c] - coords[a];
            d2.m_y = coords[c + 1] - coords[a + 1];
            d2.m_z = coords[c + 2] - coords[a + 2];
            n0.m_x = d1.m_y * d2.m_z - d1.m_z * d2.m_y;
            n0.m_y = d1.m_z * d2.m_x - d1.m_x * d2.m_z;
            n0.m_z = d1.m_x * d2.m_y - d1.m_y * d2.m_x;
            normals[a] += n0.m_x;
            normals[a + 1] += n0.m_y;
            normals[a + 2] += n0.m_z;
            normals[b] += n0.m_x;
            normals[b + 1] += n0.m_y;
            normals[b + 2] += n0.m_z;
            normals[c] += n0.m_x;
            normals[c + 1] += n0.m_y;
            normals[c + 2] += n0.m_z;
        }
    }
    module.SC3DMCDecoder.prototype.ProcessNormals = function (ifs) {
        var v3, v2, nvert, normalSize, normals, quantFloatArray, orientation, triangles, n0, n1, v, rna0, rnb0, ni1, norm0;
        nvert = ifs.GetNNormal();

        normalSize = ifs.GetNNormal() * 3;
        if (this.m_normalsSize < normalSize) {
            this.m_normalsSize = normalSize;
            this.m_normals = new Float32Array(this.m_normalsSize);
        }
        normals = this.m_normals;
        quantFloatArray = this.m_quantFloatArray;
        orientation = this.m_orientation;
        triangles = ifs.GetCoordIndex();
        ComputeNormals(triangles, ifs.GetNCoordIndex(), quantFloatArray, nvert, normals);
        n0 = new module.Vec3();
        n1 = new module.Vec3();
        for (v = 0; v < nvert; ++v) {
            v3 = 3 * v;
            n0.m_x = normals[v3];
            n0.m_y = normals[v3 + 1];
            n0.m_z = normals[v3 + 2];
            norm0 = Math.sqrt(n0.m_x * n0.m_x + n0.m_y * n0.m_y + n0.m_z * n0.m_z);
            if (norm0 === 0.0) {
                norm0 = 1.0;
            }
            SphereToCube(n0, n1);
            rna0 = n1.m_x / norm0;
            rnb0 = n1.m_y / norm0;
            ni1 = n1.m_z + orientation[v];
            orientation[v] = ni1;
            if ((ni1 >>> 1) !== (n1.m_z >>> 1)) {
                rna0 = 0.0;
                rnb0 = 0.0;
            }
            v2 = v * 2;
            normals[v2] = rna0;
            normals[v2 + 1] = rnb0;
        }
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.IQuantize = function (floatArray,
                                                         numFloatArray,
                                                         dimFloatArray,
                                                         stride,
                                                         minFloatArray,
                                                         maxFloatArray,
                                                         nQBits,
                                                         predMode) {
        var v, nin, nout, orientation, normals, CubeToSphere;
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            CubeToSphere = local.CubeToSphere;
            orientation = this.m_orientation;
            normals = this.m_normals;
            nin = new module.Vec3(0, 0, 0);
            nout = new module.Vec3(0, 0, 0);
            this.IQuantizeFloatArray(floatArray, numFloatArray, dimFloatArray, stride, this.m_minNormal, this.m_maxNormal, nQBits + 1);
            for (v = 0; v < numFloatArray; ++v) {
                nin.m_x = floatArray[stride * v] + normals[2 * v];
                nin.m_y = floatArray[stride * v + 1] + normals[2 * v + 1];
                nin.m_z = orientation[v];
                CubeToSphere[nin.m_z](nin, nout);
                floatArray[stride * v] = nout.m_x;
                floatArray[stride * v + 1] = nout.m_y;
                floatArray[stride * v + 2] = nout.m_z;
            }
        } else {
            this.IQuantizeFloatArray(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits);
        }
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArrayBinary = function (floatArray,
                                                                      numFloatArray,
                                                                      dimFloatArray,
                                                                      stride,
                                                                      minFloatArray,
                                                                      maxFloatArray,
                                                                      nQBits,
                                                                      ifs,
                                                                      predMode,
                                                                      bstream) {
        var maxNPred, testPredEnabled, testParaPredEnabled, bestPred, dModel, buffer, quantFloatArray, neighbors, normals, nPred, ta, i, v, u, u_begin, u_end, iterator, orientation, streamType, predResidual, acd, bModel0, bModel1, mModelPreds, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, exp_k, M, mModelValues;
        iterator = this.m_iterator;
        orientation = this.m_orientation;
        streamType = this.m_streamType;
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        mModelPreds = new module.AdaptiveDataModel();
        maxNPred = local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS;
        mModelPreds.SetAlphabet(maxNPred + 1);
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numFloatArray * dimFloatArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        exp_k = 0;
        M = 0;
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_AC_EGC) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        buffer = bstream.GetBuffer(iterator, streamSize);
        iterator.m_count += streamSize;
        acd.SetBuffer(streamSize, buffer);
        acd.StartDecoder();
        exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
        M = acd.ExpGolombDecode(0, bModel0, bModel1);
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            if (this.m_orientationSize < size) {
                this.m_orientationSize = size;
                this.m_orientation = new Int8Array(this.m_orientationSize);
                orientation = this.m_orientation;
            }
            dModel = new module.AdaptiveDataModel();
            dModel.SetAlphabet(12);
            for (i = 0; i < numFloatArray; ++i) {
                orientation[i] = UIntToInt(acd.DecodeAdaptiveDataModel(dModel));
            }
            this.ProcessNormals(ifs);
            dimFloatArray = 2;
        }
        if (this.m_quantFloatArraySize < size) {
            this.m_quantFloatArraySize = size;
            this.m_quantFloatArray = new Int32Array(this.m_quantFloatArraySize);
        }
        quantFloatArray = this.m_quantFloatArray;
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        testParaPredEnabled = predMode.m_value === local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        for (v = 0; v < numFloatArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                if (testParaPredEnabled) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors);
                    }
                }
                if (nPred.m_value < maxNPred) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride);
                    }
                }
            }
            if (nPred.m_value > 1) {
                bestPred = acd.DecodeAdaptiveDataModel(mModelPreds);
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && testPredEnabled) {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual + quantFloatArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeUIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        this.IQuantize(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, predMode);
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArrayASCII = function (floatArray,
                                                                     numFloatArray,
                                                                     dimFloatArray,
                                                                     stride,
                                                                     minFloatArray,
                                                                     maxFloatArray,
                                                                     nQBits,
                                                                     ifs,
                                                                     predMode,
                                                                     bstream) {
        var maxNPred, testPredEnabled, testParaPredEnabled, iterator, orientation, streamType, predResidual, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, quantFloatArray, neighbors, normals, nPred, v, u, u_begin, u_end, ta, i, bestPred;
        maxNPred = local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS;
        iterator = this.m_iterator;
        orientation = this.m_orientation;
        streamType = this.m_streamType;
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numFloatArray * dimFloatArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_ASCII) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        bstream.ReadUInt32(iteratorPred, streamType);
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            if (this.m_orientationSize < numFloatArray) {
                this.m_orientationSize = numFloatArray;
                this.m_orientation = new Int8Array(this.m_orientationSize);
                orientation = this.m_orientation;
            }
            for (i = 0; i < numFloatArray; ++i) {
                orientation[i] = bstream.ReadIntASCII(iterator);
            }
            this.ProcessNormals(ifs);
            dimFloatArray = 2;
        }
        if (this.m_quantFloatArraySize < size) {
            this.m_quantFloatArraySize = size;
            this.m_quantFloatArray = new Int32Array(this.m_quantFloatArraySize);
        }
        quantFloatArray = this.m_quantFloatArray;
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        testParaPredEnabled = predMode.m_value === local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        for (v = 0; v < numFloatArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                if (testParaPredEnabled) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors);
                    }
                }
                if (nPred.m_value < maxNPred) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride);
                    }
                }
            }
            if (nPred.m_value > 1) {
                bestPred = bstream.ReadUCharASCII(iteratorPred);
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual + quantFloatArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadUIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        this.IQuantize(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, predMode);
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArray = function (floatArray,
                                                                numFloatArray,
                                                                dimFloatArray,
                                                                stride,
                                                                minFloatArray,
                                                                maxFloatArray,
                                                                nQBits,
                                                                ifs,
                                                                predMode,
                                                                bstream) {
        if (this.m_streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.DecodeFloatArrayASCII(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, ifs, predMode, bstream);
        }
        return this.DecodeFloatArrayBinary(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, ifs, predMode, bstream);
    };
    module.SC3DMCDecoder.prototype.IQuantizeFloatArray = function (floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits) {
        var idelta, quantFloatArray, d, r, v;
        idelta = this.m_idelta;
        quantFloatArray = this.m_quantFloatArray;
        for (d = 0; d < dimFloatArray; ++d) {
            r = maxFloatArray[d] - minFloatArray[d];
            if (r > 0.0) {
                idelta[d] = r / (((1 << nQBits) >>> 0) - 1);
            } else {
                idelta[d] = 1.0;
            }
        }
        for (v = 0; v < numFloatArray; ++v) {
            for (d = 0; d < dimFloatArray; ++d) {
                floatArray[v * stride + d] = quantFloatArray[v * stride + d] * idelta[d] + minFloatArray[d];
            }
        }
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodePlayload = function (ifs, bstream) {
        var params, iterator, stats, predMode, timer, ret, a;
        params = this.m_params;
        iterator = this.m_iterator;
        stats = this.m_stats;
        predMode = new module.NumberRef();
        timer = new module.Timer();
        ret = module.O3DGC_OK;
        this.m_triangleListDecoder.SetStreamType(this.m_streamType);
        stats.m_streamSizeCoordIndex = iterator.m_count;
        timer.Tic();
        this.m_triangleListDecoder.Decode(ifs.GetCoordIndex(), ifs.GetNCoordIndex(), ifs.GetNCoord(), bstream, iterator);
        timer.Toc();
        stats.m_timeCoordIndex = timer.GetElapsedTime();
        stats.m_streamSizeCoordIndex = iterator.m_count - stats.m_streamSizeCoordIndex;
        // decode coord
        stats.m_streamSizeCoord = iterator.m_count;
        timer.Tic();
        if (ifs.GetNCoord() > 0) {
            ret = this.DecodeFloatArray(ifs.GetCoord(), ifs.GetNCoord(), 3, 3, ifs.GetCoordMinArray(), ifs.GetCoordMaxArray(), params.GetCoordQuantBits(), ifs, predMode, bstream);
            params.SetCoordPredMode(predMode.m_value);
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Toc();
        stats.m_timeCoord = timer.GetElapsedTime();
        stats.m_streamSizeCoord = iterator.m_count - stats.m_streamSizeCoord;

        // decode Normal
        stats.m_streamSizeNormal = iterator.m_count;
        timer.Tic();
        if (ifs.GetNNormal() > 0) {
            ret = this.DecodeFloatArray(ifs.GetNormal(), ifs.GetNNormal(), 3, 3, ifs.GetNormalMinArray(), ifs.GetNormalMaxArray(), params.GetNormalQuantBits(), ifs, predMode, bstream);
            params.SetNormalPredMode(predMode.m_value);
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Toc();
        stats.m_timeNormal = timer.GetElapsedTime();
        stats.m_streamSizeNormal = iterator.m_count - stats.m_streamSizeNormal;

        // decode FloatAttributes
        for (a = 0; a < ifs.GetNumFloatAttributes(); ++a) {
            stats.m_streamSizeFloatAttribute[a] = iterator.m_count;
            timer.Tic();
            ret = this.DecodeFloatArray(ifs.GetFloatAttribute(a), ifs.GetNFloatAttribute(a), ifs.GetFloatAttributeDim(a), ifs.GetFloatAttributeDim(a), ifs.GetFloatAttributeMinArray(a), ifs.GetFloatAttributeMaxArray(a), params.GetFloatAttributeQuantBits(a), ifs, predMode, bstream);
            params.SetFloatAttributePredMode(a, predMode.m_value);
            timer.Toc();
            stats.m_timeFloatAttribute[a] = timer.GetElapsedTime();
            stats.m_streamSizeFloatAttribute[a] = iterator.m_count - stats.m_streamSizeFloatAttribute[a];
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        // decode IntAttributes
        for (a = 0; a < ifs.GetNumIntAttributes(); ++a) {
            stats.m_streamSizeIntAttribute[a] = iterator.m_count;
            timer.Tic();
            ret = this.DecodeIntArray(ifs.GetIntAttribute(a), ifs.GetNIntAttribute(a), ifs.GetIntAttributeDim(a), ifs.GetIntAttributeDim(a), ifs, predMode, bstream);
            params.SetIntAttributePredMode(a, predMode.m_value);
            timer.Toc();
            stats.m_timeIntAttribute[a] = timer.GetElapsedTime();
            stats.m_streamSizeIntAttribute[a] = iterator.m_count - stats.m_streamSizeIntAttribute[a];
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Tic();
        this.m_triangleListDecoder.Reorder();
        timer.Toc();
        stats.m_timeReorder = timer.GetElapsedTime();
        return ret;
    };
    // DVEncodeParams class
    module.DVEncodeParams = function () {
        this.m_encodeMode = local.O3DGC_DYNAMIC_VECTOR_ENCODE_MODE_LIFT;
        this.m_streamTypeMode = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_quantBits = 10;
    };
    module.DVEncodeParams.prototype.GetStreamType = function () {
        return this.m_streamTypeMode;
    };
    module.DVEncodeParams.prototype.GetEncodeMode = function () {
        return this.m_encodeMode;
    };
    module.DVEncodeParams.prototype.GetQuantBits = function () {
        return this.m_quantBits;
    };
    module.DVEncodeParams.prototype.SetStreamType = function (streamTypeMode) {
        this.m_streamTypeMode = streamTypeMode;
    };
    module.DVEncodeParams.prototype.SetEncodeMode = function (encodeMode) {
        this.m_encodeMode = encodeMode;
    };
    module.DVEncodeParams.prototype.SetQuantBits = function (quantBits) {
        this.m_quantBits = quantBits;
    };
    // DynamicVector class
    module.DynamicVector = function () {
        this.m_num = 0;
        this.m_dim = 0;
        this.m_stride = 0;
        this.m_max = {};
        this.m_min = {};
        this.m_vectors = {};
    };
    module.DynamicVector.prototype.GetNVector = function () {
        return this.m_num;
    };
    module.DynamicVector.prototype.GetDimVector = function () {
        return this.m_dim;
    };
    module.DynamicVector.prototype.GetStride = function () {
        return this.m_stride;
    };
    module.DynamicVector.prototype.GetMinArray = function () {
        return this.m_min;
    };
    module.DynamicVector.prototype.GetMaxArray = function () {
        return this.m_max;
    };
    module.DynamicVector.prototype.GetVectors = function () {
        return this.m_vectors;
    };
    module.DynamicVector.prototype.GetMin = function (j) {
        return this.m_min[j];
    };
    module.DynamicVector.prototype.GetMax = function (j) {
        return this.m_max[j];
    };
    module.DynamicVector.prototype.SetNVector = function (num) {
        this.m_num = num;
    };
    module.DynamicVector.prototype.SetDimVector = function (dim) {
        this.m_dim = dim;
    };
    module.DynamicVector.prototype.SetStride = function (stride) {
        this.m_stride = stride;
    };
    module.DynamicVector.prototype.SetMinArray = function (min) {
        this.m_min = min;
    };
    module.DynamicVector.prototype.SetMaxArray = function (max) {
        this.m_max = max;
    };
    module.DynamicVector.prototype.SetMin = function (j, min) {
        this.m_min[j] = min;
    };
    module.DynamicVector.prototype.SetMax = function (j, max) {
        this.m_max[j] = max;
    };
    module.DynamicVector.prototype.SetVectors = function (vectors) {
        this.m_vectors = vectors;
    };
    // DynamicVectorDecoder class
    module.DynamicVectorDecoder = function () {
        this.m_streamSize = 0;
        this.m_maxNumVectors = 0;
        this.m_numVectors = 0;
        this.m_dimVectors = 0;
        this.m_quantVectors = {};
        this.m_iterator = new module.Iterator();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
        this.m_params = new module.DVEncodeParams();
    };
    module.DynamicVectorDecoder.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.DynamicVectorDecoder.prototype.GetIterator = function () {
        return this.m_iterator;
    };
    module.DynamicVectorDecoder.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.DynamicVectorDecoder.prototype.SetIterator = function (iterator) {
        this.m_iterator = iterator;
    };
    module.DynamicVectorDecoder.prototype.IUpdate = function (data, shift, size) {
        var p, size1;
        size1 = size - 1;
        p = 2;
        data[shift] -= data[shift + 1] >> 1;
        while (p < size1) {
            data[shift + p] -= (data[shift + p - 1] + data[shift + p + 1] + 2) >> 2;
            p += 2;
        }
        if (p === size1) {
            data[shift + p] -= data[shift + p - 1] >> 1;
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.IPredict = function (data, shift, size) {
        var p, size1;
        size1 = size - 1;
        p = 1;
        while (p < size1) {
            data[shift + p] += (data[shift + p - 1] + data[shift + p + 1] + 1) >> 1;
            p += 2;
        }
        if (p === size1) {
            data[shift + p] += data[shift + p - 1];
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.Merge = function (data, shift, size) {
        var i, h, a, b, tmp;
        h = (size >> 1) + (size & 1);
        a = h - 1;
        b = h;
        while (a > 0) {
            for (i = a; i < b; i += 2) {
                tmp = data[shift + i];
                data[shift + i] = data[shift + i + 1];
                data[shift + i + 1] = tmp;
            }
            --a;
            ++b;
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.ITransform = function (data, shift, size) {
        var n, even, k, i;
        n = size;
        even = 0;
        k = 0;
        even += ((n & 1) << k++) >>> 0;
        while (n > 1) {
            n = (n >> 1) + ((n & 1) >>> 0);
            even += ((n & 1) << k++) >>> 0;
        }
        for (i = k - 2; i >= 0; --i) {
            n = ((n << 1) >>> 0) - (((even >>> i) & 1)) >>> 0;
            this.Merge(data, shift, n);
            this.IUpdate(data, shift, n);
            this.IPredict(data, shift, n);
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.IQuantize = function (floatArray,
                                                       numFloatArray,
                                                       dimFloatArray,
                                                       stride,
                                                       minFloatArray,
                                                       maxFloatArray,
                                                       nQBits) {
        var quantVectors, r, idelta, size, d, v;
        quantVectors = this.m_quantVectors;
        size = numFloatArray * dimFloatArray;
        for (d = 0; d < dimFloatArray; ++d) {
            r = maxFloatArray[d] - minFloatArray[d];
            if (r > 0.0) {
                idelta = r / (((1 << nQBits) >>> 0) - 1);
            } else {
                idelta = 1.0;
            }
            for (v = 0; v < numFloatArray; ++v) {
                floatArray[v * stride + d] = quantVectors[v + d * numFloatArray] * idelta + minFloatArray[d];
            }
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.DecodeHeader = function (dynamicVector, bstream) {
        var iterator, c0, start_code, streamType;
        iterator = this.m_iterator;
        c0 = iterator.m_count;
        start_code = bstream.ReadUInt32(iterator, local.O3DGC_STREAM_TYPE_BINARY);
        if (start_code !== local.O3DGC_DV_START_CODE) {
            iterator.m_count = c0;
            start_code = bstream.ReadUInt32(iterator, local.O3DGC_STREAM_TYPE_ASCII);
            if (start_code !== local.O3DGC_DV_START_CODE) {
                return module.O3DGC_ERROR_CORRUPTED_STREAM;
            }
            this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        } else {
            this.m_streamType = local.O3DGC_STREAM_TYPE_BINARY;
        }
        streamType = this.m_streamType;
        this.m_streamSize = bstream.ReadUInt32(iterator, streamType);
        this.m_params.SetEncodeMode(bstream.ReadUChar(iterator, streamType));
        dynamicVector.SetNVector(bstream.ReadUInt32(iterator, streamType));
        if (dynamicVector.GetNVector() > 0) {
            dynamicVector.SetDimVector(bstream.ReadUInt32(iterator, streamType));
            this.m_params.SetQuantBits(bstream.ReadUChar(iterator, streamType));
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.DecodePlayload = function (dynamicVector, bstream) {
        var size, iterator, streamType, ret, start, streamSize, dim, num, j, acd, bModel0, bModel1, exp_k, M, buffer, mModelValues, quantVectors, v, d;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        ret = module.O3DGC_OK;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        dim = dynamicVector.GetDimVector();
        num = dynamicVector.GetNVector();
        size = dim * num;
        for (j = 0; j < dynamicVector.GetDimVector(); ++j) {
            dynamicVector.SetMin(j, bstream.ReadFloat32(iterator, streamType));
            dynamicVector.SetMax(j, bstream.ReadFloat32(iterator, streamType));
        }
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        streamSize -= (iterator.m_count - start);
        exp_k = 0;
        M = 0;
        if (streamType === local.O3DGC_STREAM_TYPE_BINARY) {
            buffer = bstream.GetBuffer(iterator, streamSize);
            iterator.m_count += streamSize;
            acd.SetBuffer(streamSize, buffer);
            acd.StartDecoder();
            exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
            M = acd.ExpGolombDecode(0, bModel0, bModel1);
        }
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        if (this.m_maxNumVectors < size) {
            this.m_maxNumVectors = size;
            this.m_quantVectors = new Int32Array(this.m_maxNumVectors);
        }
        quantVectors = this.m_quantVectors;
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            for (v = 0; v < num; ++v) {
                for (d = 0; d < dim; ++d) {
                    quantVectors[d * num + v] = bstream.ReadIntASCII(iterator);
                }
            }
        } else {
            for (v = 0; v < num; ++v) {
                for (d = 0; d < dim; ++d) {
                    quantVectors[d * num + v] = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                }
            }
        }
        for (d = 0; d < dim; ++d) {
            this.ITransform(quantVectors, d * num, num);
        }
        this.IQuantize(dynamicVector.GetVectors(), num, dim,
                       dynamicVector.GetStride(), dynamicVector.GetMinArray(),
                       dynamicVector.GetMaxArray(), this.m_params.GetQuantBits());
        return ret;
    };

    return module;
})();

