THREE.MemoryBlockSize = 32768; // 32K as a wild guess
THREE.BlockAllocator = {

    currentBuffer: new ArrayBuffer( THREE.MemoryBlockSize ),
    currentOffset: 0,

    getFloat32: function ( length ) {

        var buffer = this.currentBuffer,
            start = this.currentOffset,
            bytes = length * Float32Array.BYTES_PER_ELEMENT,
            newOffset = start + bytes;

        if ( newOffset > buffer.byteLength ) {
            // insufficient free memory in buffer

            buffer = new ArrayBuffer( THREE.MemoryBlockSize );
            start = 0;
            newOffset = bytes;

            this.currentBuffer = buffer;

        }

        this.currentOffset = newOffset;
        return new Float32Array( buffer, start, length );

    }

};

THREE.SimpleAllocator = {

  getFloat32: function( length ) {

    return new Float32Array( length );

  }

};


THREE.DefaultAllocator = THREE.BlockAllocator;
