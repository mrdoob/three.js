"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.KTXLoader = void 0;

var KTXLoader = function KTXLoader(manager) {
  CompressedTextureLoader.call(this, manager);
};

THREE.KTXLoader = KTXLoader;
KTXLoader.prototype = Object.assign(Object.create(THREE.CompressedTextureLoader.prototype), {
  constructor: KTXLoader,
  parse: function parse(buffer, loadMipmaps) {
    var ktx = new KhronosTextureContainer(buffer, 1);
    return {
      mipmaps: ktx.mipmaps(loadMipmaps),
      width: ktx.pixelWidth,
      height: ktx.pixelHeight,
      format: ktx.glInternalFormat,
      isCubemap: ktx.numberOfFaces === 6,
      mipmapCount: ktx.numberOfMipmapLevels
    };
  }
});

var KhronosTextureContainer = function () {
  function KhronosTextureContainer(arrayBuffer, facesExpected) {
    this.arrayBuffer = arrayBuffer;
    var identifier = new Uint8Array(this.arrayBuffer, 0, 12);

    if (identifier[0] !== 0xAB || identifier[1] !== 0x4B || identifier[2] !== 0x54 || identifier[3] !== 0x58 || identifier[4] !== 0x20 || identifier[5] !== 0x31 || identifier[6] !== 0x31 || identifier[7] !== 0xBB || identifier[8] !== 0x0D || identifier[9] !== 0x0A || identifier[10] !== 0x1A || identifier[11] !== 0x0A) {
      console.error('texture missing KTX identifier');
      return;
    }

    var dataSize = Uint32Array.BYTES_PER_ELEMENT;
    var headerDataView = new DataView(this.arrayBuffer, 12, 13 * dataSize);
    var endianness = headerDataView.getUint32(0, true);
    var littleEndian = endianness === 0x04030201;
    this.glType = headerDataView.getUint32(1 * dataSize, littleEndian);
    this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian);
    this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian);
    this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian);
    this.glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian);
    this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian);
    this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian);
    this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian);
    this.numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian);
    this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian);
    this.numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian);
    this.bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian);

    if (this.glType !== 0) {
      console.warn('only compressed formats currently supported');
      return;
    } else {
      this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
    }

    if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
      console.warn('only 2D textures currently supported');
      return;
    }

    if (this.numberOfArrayElements !== 0) {
      console.warn('texture arrays not currently supported');
      return;
    }

    if (this.numberOfFaces !== facesExpected) {
      console.warn('number of faces expected' + facesExpected + ', but found ' + this.numberOfFaces);
      return;
    }

    this.loadType = KhronosTextureContainer.COMPRESSED_2D;
  }

  KhronosTextureContainer.prototype.mipmaps = function (loadMipmaps) {
    var mipmaps = [];
    var dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
    var width = this.pixelWidth;
    var height = this.pixelHeight;
    var mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;

    for (var level = 0; level < mipmapCount; level++) {
      var imageSize = new Int32Array(this.arrayBuffer, dataOffset, 1)[0];
      dataOffset += 4;

      for (var face = 0; face < this.numberOfFaces; face++) {
        var byteArray = new Uint8Array(this.arrayBuffer, dataOffset, imageSize);
        mipmaps.push({
          "data": byteArray,
          "width": width,
          "height": height
        });
        dataOffset += imageSize;
        dataOffset += 3 - (imageSize + 3) % 4;
      }

      width = Math.max(1.0, width * 0.5);
      height = Math.max(1.0, height * 0.5);
    }

    return mipmaps;
  };

  KhronosTextureContainer.HEADER_LEN = 12 + 13 * 4;
  KhronosTextureContainer.COMPRESSED_2D = 0;
  KhronosTextureContainer.COMPRESSED_3D = 1;
  KhronosTextureContainer.TEX_2D = 2;
  KhronosTextureContainer.TEX_3D = 3;
  return KhronosTextureContainer;
}();