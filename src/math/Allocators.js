/**
 * @author mrdoob
 * @author tschw
 * @author bhouston / http://clara.io
 */

THREE.BlockAllocator = {

  blockSize: 1024*1,
  activeBuffer: new Float32Array( THREE.MemoryBlockSize ),
  nextOffset: 0,

  getFloat32: function ( length ) {

    var offset = this.nextOffset;
    this.nextOffset += length;

    if( this.nextOffset >= this.blockSize ) {

      this.activeBuffer = new Float32Array( this.blockSize );
      this.nextOffset = length;
      offset = 0;

    }

    return offset;

  }

};
