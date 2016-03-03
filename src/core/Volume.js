/**
 * @author stity / https://github.com/stity
 */

THREE.Volume = function ( xLength, yLength, zLength, type, arrayBuffer ) {

    if (arguments.length > 0) {

        this.xLength = Number( xLength ) || 1;
        this.yLength = Number( yLength ) || 1;
        this.zLength = Number( zLength ) || 1;

        switch ( type ) {

            case 'Uint8' :
            case 'uint8' :
            case 'uchar' :
            case 'unsigned char' :
            case 'uint8_t' :
                this.data = new Uint8Array( arrayBuffer );
                break;
            case 'Int8' :
            case 'int8' :
            case 'signed char' :
            case 'int8_t' :
                this.data = new Int8Array( arrayBuffer );
                break;
            case 'Int16' :
            case 'int16' :
            case 'short' :
            case 'short int' :
            case 'signed short' :
            case 'signed short int' :
            case 'int16_t' :
                this.data = new Int16Array( arrayBuffer );
                break;
            case 'Uint16' :
            case 'uint16' :
            case 'ushort' :
            case 'unsigned short' :
            case 'unsigned short int' :
            case 'uint16_t' :
                this.data = new Uint16Array( arrayBuffer );
                break;
            case 'Int32' :
            case 'int32' :
            case 'int' :
            case 'signed int' :
            case 'int32_t' :
                this.data = new Int32Array( arrayBuffer );
                break;
            case 'Uint32' :
            case 'uint32' :
            case 'uint' :
            case 'unsigned int' :
            case 'uint32' :
            case 'uint32_t' :
                this.data = new Uint32Array( arrayBuffer );
                break;
            case 'longlong' :
            case 'long long' :
            case 'long long int' :
            case 'signed long long' :
            case 'signed long long int' :
            case 'int64' :
            case 'int64_t' :
            case 'ulonglong' :
            case 'unsigned long long' :
            case 'unsigned long long int' :
            case 'uint64' :
            case 'uint64_t' :
                throw 'Error in THREE.Volume constructor : this type is not supported in JavaScript';
                break;
            case 'Float32' :
            case 'float32' :
            case 'float' :
                this.data = new Float32Array( arrayBuffer );
                break;
            case 'Float64' :
            case 'float64' :
            case 'double' :
                this.data = new Float64Array( arrayBuffer );
                break;
            default :
                this.data = new Uint8Array( arrayBuffer );

        }

        if ( this.data.length !== this.xLength * this.yLength * this.zLength ) {

            throw 'Error in THREE.Volume constructor, lengths are not matching arrayBuffer size';

        }

    }

    this.spacing = [ 1, 1, 1 ];
    this.offset = [ 0, 0, 0 ];
    this.rotationMatrix = new THREE.Matrix3();
    this.rotationMatrix.identity();
    this.lowerThreshold = -Infinity;
    this.upperThreshold = Infinity;

}

THREE.Volume.prototype = {

    constructor : THREE.Volume,

    getData : function ( i, j, k ) {

        return this.data[ k * this.xLength * this.yLength + j * this.xLength + i ];

    },
    
    access : function ( i, j, k ) {

        return k * this.xLength * this.yLength + j * this.xLength + i;

    },

    reverseAccess : function ( index ) {

        var z = Math.floor( index / ( this.yLength * this.xLength ) );
        var y = Math.floor( ( index - z * this.yLength * this.xLength ) / this.xLength );
        var x = index - z * this.yLength * this.xLength - y * this.xLength;
        return [ x, y, z ];

    },

    map : function ( functionToMap ) {

        var length = this.data.length;

        for ( var i = 0; i < length; i ++ ) {

            this.data[ i ] = functionToMap( this.data[ i ], i, this.data );

        }

        return this;

    },

    extractPlan : function ( axis, index ) {

        var iLength, jLength, sliceAccess;
        var volume = this;

        switch ( axis ) {

            case 'x' :
                iLength = this.yLength;
                jLength = this.zLength;
                sliceAccess = function (i,j) {
                    return volume.access( index, this.yLength - i - 1, this.zLength - j - 1 );
                }
                break;
            case 'y' :
                var iLength = this.xLength;
                var jLength = this.zLength;
                sliceAccess = function (i,j) {
                    return  volume.access( i, index, this.zLength - j - 1 );
                }
                break;
            case 'z' :
            default :
                iLength = this.xLength;
                jLength = this.yLength;
                sliceAccess = function (i,j) {
                    return  volume.access( i, j , index);
                }
                break;
        }

        var canvasBuffer   = document.createElement('canvas');
        canvasBuffer.width = iLength;
        canvasBuffer.height = jLength;
        var ctx = canvasBuffer.getContext('2d');


        // get the imageData and pixel array from the canvas
        var imgData=ctx.getImageData(0,0,iLength, jLength);
        var data=imgData.data;

        // manipulate some pixel elements
        var pixelCount = 0;

        if (this.dataType === 'label') {

            for (var i=0; i < jLength; i++) {
                for (var j=0; j < iLength; j++) {
                    var label = this.data[sliceAccess(j,i)];
                    label = label >= this.colorMap.length ? (label % this.colorMap.length)+1 : label;
                    var color = this.colorMap[label];
                    data[4*pixelCount] = (color >> 24) & 0xff;
                    data[4*pixelCount + 1] = (color >> 16) & 0xff;
                    data[4*pixelCount + 2] = (color >> 8) & 0xff;
                    data[4*pixelCount + 3] = color & 0xff;
                    pixelCount++;
                }
            }
        }
        else {
            
            for (var i=0; i < jLength; i++) {
                for (var j=0; j < iLength; j++) {
                    var value = this.data[sliceAccess(j,i)];
                    //apply threshold
                    value = this.upperThreshold>=value ? (this.lowerThreshold<=value ? value : 0) :0;
                    //apply window level
                    value = Math.floor(255*(value-this.windowLow) / (this.windowHigh-this.windowLow));
                    
                    data[4*pixelCount] = value;
                    data[4*pixelCount + 1] = value;
                    data[4*pixelCount + 2] = value;
                    data[4*pixelCount + 3] = 0xff;
                    pixelCount++;
                }
            }
        }
        ctx.putImageData(imgData,0,0);

        return canvasBuffer;

    },


    computeMinMax : function() {

        var min = Infinity;
        var max = -Infinity;

        // buffer the length
        var datasize = this.data.length;

        var i = 0;
        for (i = 0; i < datasize; i++) {

            if(!isNaN(this.data[i])) {

                var value = this.data[i];
                min = Math.min(min, value);
                max = Math.max(max, value);

            }

        }
        this.min = min;
        this.max = max;

        return [ min, max ];

    }

}