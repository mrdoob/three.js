"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NRRDLoader = void 0;

var NRRDLoader = function NRRDLoader(manager) {
  Loader.call(this, manager);
};

THREE.NRRDLoader = NRRDLoader;
NRRDLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: NRRDLoader,
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(url, function (data) {
      try {
        onLoad(scope.parse(data));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }

        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  },
  parse: function parse(data) {
    var _data = data;
    var _dataPointer = 0;

    var _nativeLittleEndian = new Int8Array(new Int16Array([1]).buffer)[0] > 0;

    var _littleEndian = true;
    var headerObject = {};

    function scan(type, chunks) {
      if (chunks === undefined || chunks === null) {
        chunks = 1;
      }

      var _chunkSize = 1;
      var _array_type = Uint8Array;

      switch (type) {
        case 'uchar':
          break;

        case 'schar':
          _array_type = Int8Array;
          break;

        case 'ushort':
          _array_type = Uint16Array;
          _chunkSize = 2;
          break;

        case 'sshort':
          _array_type = Int16Array;
          _chunkSize = 2;
          break;

        case 'uint':
          _array_type = Uint32Array;
          _chunkSize = 4;
          break;

        case 'sint':
          _array_type = Int32Array;
          _chunkSize = 4;
          break;

        case 'float':
          _array_type = Float32Array;
          _chunkSize = 4;
          break;

        case 'complex':
          _array_type = Float64Array;
          _chunkSize = 8;
          break;

        case 'double':
          _array_type = Float64Array;
          _chunkSize = 8;
          break;
      }

      var _bytes = new _array_type(_data.slice(_dataPointer, _dataPointer += chunks * _chunkSize));

      if (_nativeLittleEndian != _littleEndian) {
        _bytes = flipEndianness(_bytes, _chunkSize);
      }

      if (chunks == 1) {
        return _bytes[0];
      }

      return _bytes;
    }

    function flipEndianness(array, chunkSize) {
      var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);

      for (var i = 0; i < array.byteLength; i += chunkSize) {
        for (var j = i + chunkSize - 1, k = i; j > k; j--, k++) {
          var tmp = u8[k];
          u8[k] = u8[j];
          u8[j] = tmp;
        }
      }

      return array;
    }

    function parseHeader(header) {
      var data, field, fn, i, l, lines, m, _i, _len;

      lines = header.split(/\r?\n/);

      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        l = lines[_i];

        if (l.match(/NRRD\d+/)) {
          headerObject.isNrrd = true;
        } else if (l.match(/^#/)) {} else if (m = l.match(/(.*):(.*)/)) {
          field = m[1].trim();
          data = m[2].trim();
          fn = NRRDLoader.prototype.fieldFunctions[field];

          if (fn) {
            fn.call(headerObject, data);
          } else {
            headerObject[field] = data;
          }
        }
      }

      if (!headerObject.isNrrd) {
        throw new Error('Not an NRRD file');
      }

      if (headerObject.encoding === 'bz2' || headerObject.encoding === 'bzip2') {
        throw new Error('Bzip is not supported');
      }

      if (!headerObject.vectors) {
        headerObject.vectors = [new THREE.Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];

        if (headerObject.spacings) {
          for (i = 0; i <= 2; i++) {
            if (!isNaN(headerObject.spacings[i])) {
              headerObject.vectors[i].multiplyScalar(headerObject.spacings[i]);
            }
          }
        }
      }
    }

    function parseDataAsText(data, start, end) {
      var number = '';
      start = start || 0;
      end = end || data.length;
      var value;
      var lengthOfTheResult = headerObject.sizes.reduce(function (previous, current) {
        return previous * current;
      }, 1);
      var base = 10;

      if (headerObject.encoding === 'hex') {
        base = 16;
      }

      var result = new headerObject.__array(lengthOfTheResult);
      var resultIndex = 0;
      var parsingFunction = parseInt;

      if (headerObject.__array === Float32Array || headerObject.__array === Float64Array) {
        parsingFunction = parseFloat;
      }

      for (var i = start; i < end; i++) {
        value = data[i];

        if ((value < 9 || value > 13) && value !== 32) {
          number += String.fromCharCode(value);
        } else {
          if (number !== '') {
            result[resultIndex] = parsingFunction(number, base);
            resultIndex++;
          }

          number = '';
        }
      }

      if (number !== '') {
        result[resultIndex] = parsingFunction(number, base);
        resultIndex++;
      }

      return result;
    }

    var _bytes = scan('uchar', data.byteLength);

    var _length = _bytes.length;
    var _header = null;
    var _data_start = 0;
    var i;

    for (i = 1; i < _length; i++) {
      if (_bytes[i - 1] == 10 && _bytes[i] == 10) {
        _header = this.parseChars(_bytes, 0, i - 2);
        _data_start = i + 1;
        break;
      }
    }

    parseHeader(_header);

    var _data = _bytes.subarray(_data_start);

    if (headerObject.encoding === 'gzip' || headerObject.encoding === 'gz') {
      var inflate = new THREE.Zlib.Gunzip(new Uint8Array(_data));
      _data = inflate.decompress();
    } else if (headerObject.encoding === 'ascii' || headerObject.encoding === 'text' || headerObject.encoding === 'txt' || headerObject.encoding === 'hex') {
      _data = parseDataAsText(_data);
    } else if (headerObject.encoding === 'raw') {
      var _copy = new Uint8Array(_data.length);

      for (var i = 0; i < _data.length; i++) {
        _copy[i] = _data[i];
      }

      _data = _copy;
    }

    _data = _data.buffer;
    var volume = new THREE.Volume();
    volume.header = headerObject;
    volume.data = new headerObject.__array(_data);
    var min_max = volume.computeMinMax();
    var min = min_max[0];
    var max = min_max[1];
    volume.windowLow = min;
    volume.windowHigh = max;
    volume.dimensions = [headerObject.sizes[0], headerObject.sizes[1], headerObject.sizes[2]];
    volume.xLength = volume.dimensions[0];
    volume.yLength = volume.dimensions[1];
    volume.zLength = volume.dimensions[2];
    var spacingX = new Vector3(headerObject.vectors[0][0], headerObject.vectors[0][1], headerObject.vectors[0][2]).length();
    var spacingY = new Vector3(headerObject.vectors[1][0], headerObject.vectors[1][1], headerObject.vectors[1][2]).length();
    var spacingZ = new Vector3(headerObject.vectors[2][0], headerObject.vectors[2][1], headerObject.vectors[2][2]).length();
    volume.spacing = [spacingX, spacingY, spacingZ];
    volume.matrix = new THREE.Matrix4();
    var _spaceX = 1;
    var _spaceY = 1;
    var _spaceZ = 1;

    if (headerObject.space == "left-posterior-superior") {
      _spaceX = -1;
      _spaceY = -1;
    } else if (headerObject.space === 'left-anterior-superior') {
      _spaceX = -1;
    }

    if (!headerObject.vectors) {
      volume.matrix.set(_spaceX, 0, 0, 0, 0, _spaceY, 0, 0, 0, 0, _spaceZ, 0, 0, 0, 0, 1);
    } else {
      var v = headerObject.vectors;
      volume.matrix.set(_spaceX * v[0][0], _spaceX * v[1][0], _spaceX * v[2][0], 0, _spaceY * v[0][1], _spaceY * v[1][1], _spaceY * v[2][1], 0, _spaceZ * v[0][2], _spaceZ * v[1][2], _spaceZ * v[2][2], 0, 0, 0, 0, 1);
    }

    volume.inverseMatrix = new Matrix4();
    volume.inverseMatrix.getInverse(volume.matrix);
    volume.RASDimensions = new Vector3(volume.xLength, volume.yLength, volume.zLength).applyMatrix4(volume.matrix).round().toArray().map(Math.abs);

    if (volume.lowerThreshold === -Infinity) {
      volume.lowerThreshold = min;
    }

    if (volume.upperThreshold === Infinity) {
      volume.upperThreshold = max;
    }

    return volume;
  },
  parseChars: function parseChars(array, start, end) {
    if (start === undefined) {
      start = 0;
    }

    if (end === undefined) {
      end = array.length;
    }

    var output = '';
    var i = 0;

    for (i = start; i < end; ++i) {
      output += String.fromCharCode(array[i]);
    }

    return output;
  },
  fieldFunctions: {
    type: function type(data) {
      switch (data) {
        case 'uchar':
        case 'unsigned char':
        case 'uint8':
        case 'uint8_t':
          this.__array = Uint8Array;
          break;

        case 'signed char':
        case 'int8':
        case 'int8_t':
          this.__array = Int8Array;
          break;

        case 'short':
        case 'short int':
        case 'signed short':
        case 'signed short int':
        case 'int16':
        case 'int16_t':
          this.__array = Int16Array;
          break;

        case 'ushort':
        case 'unsigned short':
        case 'unsigned short int':
        case 'uint16':
        case 'uint16_t':
          this.__array = Uint16Array;
          break;

        case 'int':
        case 'signed int':
        case 'int32':
        case 'int32_t':
          this.__array = Int32Array;
          break;

        case 'uint':
        case 'unsigned int':
        case 'uint32':
        case 'uint32_t':
          this.__array = Uint32Array;
          break;

        case 'float':
          this.__array = Float32Array;
          break;

        case 'double':
          this.__array = Float64Array;
          break;

        default:
          throw new Error('Unsupported NRRD data type: ' + data);
      }

      return this.type = data;
    },
    endian: function endian(data) {
      return this.endian = data;
    },
    encoding: function encoding(data) {
      return this.encoding = data;
    },
    dimension: function dimension(data) {
      return this.dim = parseInt(data, 10);
    },
    sizes: function sizes(data) {
      var i;
      return this.sizes = function () {
        var _i, _len, _ref, _results;

        _ref = data.split(/\s+/);
        _results = [];

        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];

          _results.push(parseInt(i, 10));
        }

        return _results;
      }();
    },
    space: function space(data) {
      return this.space = data;
    },
    'space origin': function spaceOrigin(data) {
      return this.space_origin = data.split("(")[1].split(")")[0].split(",");
    },
    'space directions': function spaceDirections(data) {
      var f, parts, v;
      parts = data.match(/\(.*?\)/g);
      return this.vectors = function () {
        var _i, _len, _results;

        _results = [];

        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          v = parts[_i];

          _results.push(function () {
            var _j, _len2, _ref, _results2;

            _ref = v.slice(1, -1).split(/,/);
            _results2 = [];

            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              f = _ref[_j];

              _results2.push(parseFloat(f));
            }

            return _results2;
          }());
        }

        return _results;
      }();
    },
    spacings: function spacings(data) {
      var f, parts;
      parts = data.split(/\s+/);
      return this.spacings = function () {
        var _i,
            _len,
            _results = [];

        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          f = parts[_i];

          _results.push(parseFloat(f));
        }

        return _results;
      }();
    }
  }
});