THREE.MemoryBlockSize = 1024*1;
THREE.BlockAllocator = {

  activeBuffer: new Float32Array( THREE.MemoryBlockSize ),
  nextOffset: 0,

  getFloat32: function ( length ) {

    var offset = this.nextOffset;
    this.nextOffset += length;

    if( this.nextOffset >= THREE.MemoryBlockSize ) {

      this.activeBuffer = new Float32Array( THREE.MemoryBlockSize );
      this.nextOffset = length;
      offset = 0;
      //console.log( "new Float32Array( " + THREE.MemoryBlockSize + " )");

    }

    return offset;
  }

};

THREE.SimpleAllocator = {

  getFloat32: function( length ) {

    return new Float32Array( length );

  }

};


THREE.DefaultAllocator = THREE.BlockAllocator;
