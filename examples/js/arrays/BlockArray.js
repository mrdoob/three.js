/**
 *
 * Fast growable, memory efficient array
 *
 * @author bhouston / http://clara.io
 */

THREE.BlockArray = function ( type, typeArray, typeStride ) {

  this.type = type;
  this.typeArray = typeArray || type.TypeArray;
  this.typeStride = typeStride || type.TypedStride;
  this.blocks = [];
  this.length = 0;

  this.nextBlockOffset = THREE.BlockArray.ElementsPerBlock - 1;
  this.currentBlock = null;

};

THREE.BlockArray.ElementsPerBlock = 32768;  // 2^N
THREE.BlockArray.ElementsPerBlockMask = 32768 - 1;  // 2^N - 1
THREE.BlockArray.ElementsPerBlockShift = 15; // N

THREE.BlockArray.prototype = {

	constructor: THREE.BlockArray,

  getAt: function ( index, optionalValue ) {

    var result = optionalValue || new this.type();

    var blockIndex = index >> THREE.BlockArray.ElementsPerBlockShift;
    var blockOffset = index & THREE.BlockArray.ElementsPerBlockMask;

    result.fromArray( this.blocks[ blockIndex ], blockOffset * this.typedStride );

		return result;

	},

	setAt: function ( index, value ) {

    var blockIndex = index >> THREE.BlockArray.ElementsPerBlockShift;
    var blockOffset = index & THREE.BlockArray.ElementsPerBlockMask;

    value.toArray( this.blocks[ blockIndex ], blockOffset * this.typedStride );

		return this;

	},

  push: function( value ) {

    this.nextBlockOffset ++;
    if( this.nextBlockOffset >= THREE.BlockArray.ElementsPerBlock ) {
      this.nextBlockOffset = 0;

      this.currentBlock = new this.typedArray( THREE.BlockArray.ElementsPerBlock * this.typedStride );
      this.blocks.push( this.currentBlock );
    }

    value.toArray( this.currentBlock, this.nextBlockOffset * this.typedStride );

    this.length ++;

    return this.length;

  },

  clear: function() {

    this.blocks = [];
    this.length = 0;
    this.nextBlockOffset = THREE.BlockArray.ElementsPerBlock - 1;
    this.currentBlock = null;

  },

  toArray: function( clearAfterCopy, optionalArray ) {

    var result = optionalArray || new this.typedArray( this.length * this.typedStride );

    for ( var blockIndex = 0; blockIndex < this.blocks.length; blockIndex ++ ) {

      var block = this.blocks[ blockIndex ];
      var indexAtBlockStart = blockIndex * THREE.BlockArray.ElementsPerBlock;
      var indexAtBlockEnd = indexAtBlockStart + THREE.BlockArray.ElementsPerBlock;

      var occupiedBlockLength = Math.min(indexAtBlockEnd, this.length) - indexAtBlockStart;

      var copyLength = occupiedBlockLength * this.typedStride;
      var destinationOffset = indexAtBlockStart * this.typedStride;

      for( var i = 0; i < copyLength; i ++ ) {
        result[ destinationOffset + i ] = block[ i ];
      }

    }

    if( clearAfterCopy ) this.clear();

    return result;

  },

  toFlatArray: function() {

    var flatArray = new THREE.FlatArray( this.type, this.length );
    this.toArray( flatArray.data );
    return flatArray;

  }

};
