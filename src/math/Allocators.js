THREE.MemoryBlockSize = 1024*16; // 32K as a wild guess
THREE.BlockAllocator = {

    currentBuffer: new Float32Array( THREE.MemoryBlockSize ),
    currentOffset: 0,

    getFloat32: function ( length ) {

        var buffer = this.currentBuffer,
            start = this.currentOffset,
            bytes = length,// * Float32Array.BYTES_PER_ELEMENT,
            newOffset = start + bytes;

        if ( newOffset >= THREE.MemoryBlockSize ) {
            // insufficient free memory in buffer

            buffer = new Float32Array( THREE.MemoryBlockSize );
            start = 0;
            newOffset = bytes;

            this.currentBuffer = buffer;

        }

        this.currentOffset = newOffset;
        return start;//new Float32Array( buffer, start, length );

    }

};

THREE.SimpleAllocator = {

  getFloat32: function( length ) {

    return new Float32Array( length );

  }

};


THREE.DefaultAllocator = THREE.BlockAllocator;
