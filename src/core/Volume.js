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
    var lowerThreshold = -Infinity;
    Object.defineProperty(this, 'lowerThreshold', {
        get : function () {
            return lowerThreshold;
        },
        set : function (value) {
            lowerThreshold = value;
            this.sliceList.forEach( slice => slice.geometryNeedsUpdate = true);
        }
    });
    var upperThreshold = Infinity;
    Object.defineProperty(this, 'upperThreshold', {
        get : function () {
            return upperThreshold;
        },
        set : function (value) {
            upperThreshold = value;
            this.sliceList.forEach( slice => slice.geometryNeedsUpdate = true);
        }
    });
    this.sliceList = [];

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

    extractPerpendicularPlane : function ( axis, RASIndex ) {

        var iLength,
            jLength,
            sliceAccess,
            planeMatrix = (new THREE.Matrix4()).identity(),
            volume = this,
            planeWidth,
            planeHeight,
            firstSpacing,
            secondSpacing,
            positionOffset,
            IJKIndex;

        var axisInIJK = new THREE.Vector3(),
            firstDirection = new THREE.Vector3(),
            secondDirection = new THREE.Vector3();

        var dimensions = new THREE.Vector3(this.xLength, this.yLength, this.zLength);


        switch ( axis ) {

            case 'x' :
                axisInIJK.set(1,0,0);
                firstDirection.set(0,0,-1);
                secondDirection.set(0,-1,0);
                firstSpacing = this.spacing[2];
                secondSpacing = this.spacing[1];
                IJKIndex = new THREE.Vector3(RASIndex,0,0);

                planeMatrix.multiply((new THREE.Matrix4()).makeRotationY(Math.PI/2));
                positionOffset = (volume.RASDimensions[0]-1)/2;
                planeMatrix.setPosition(new THREE.Vector3( RASIndex-positionOffset, 0, 0));
                break;
            case 'y' :
                axisInIJK.set(0,1,0);
                firstDirection.set(1,0,0);
                secondDirection.set(0,0,1);
                firstSpacing = this.spacing[0];
                secondSpacing = this.spacing[2];
                IJKIndex = new THREE.Vector3(0, RASIndex,0);

                planeMatrix.multiply((new THREE.Matrix4()).makeRotationX(-Math.PI/2));
                positionOffset = (volume.RASDimensions[1]-1)/2;
                planeMatrix.setPosition(new THREE.Vector3(0, RASIndex-positionOffset, 0));
                break;
            case 'z' :
            default :
                axisInIJK.set(0,0,1);
                firstDirection.set(1,0,0);
                secondDirection.set(0,-1,0);
                firstSpacing = this.spacing[0];
                secondSpacing = this.spacing[1];
                IJKIndex = new THREE.Vector3(0,0,RASIndex);
                
                positionOffset = (volume.RASDimensions[2]-1)/2;
                planeMatrix.setPosition(new THREE.Vector3(0, 0, RASIndex-positionOffset));
                break;
        }

        firstDirection.applyMatrix4(volume.inverseMatrix).normalize();
        firstDirection.argVar = 'i';
        secondDirection.applyMatrix4(volume.inverseMatrix).normalize();
        secondDirection.argVar = 'j';
        axisInIJK.applyMatrix4(volume.inverseMatrix).normalize();
        iLength = Math.floor(Math.abs(firstDirection.dot(dimensions)));
        jLength = Math.floor(Math.abs(secondDirection.dot(dimensions)));
        planeWidth = Math.abs(iLength*firstSpacing);
        planeHeight = Math.abs(jLength*secondSpacing);

        IJKIndex = Math.abs(Math.round(IJKIndex.applyMatrix4(volume.inverseMatrix).dot(axisInIJK)));
        var base = [new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)]
        var iDirection = [firstDirection, secondDirection, axisInIJK].find(x=>Math.abs(x.dot(base[0])) > 0.9);
        var jDirection = [firstDirection, secondDirection, axisInIJK].find(x=>Math.abs(x.dot(base[1])) > 0.9);
        var kDirection = [firstDirection, secondDirection, axisInIJK].find(x=>Math.abs(x.dot(base[2])) > 0.9);
        var argumentsWithInversion = ['volume.xLength-1-', 'volume.yLength-1-', 'volume.zLength-1-'];
        var arguments = ['i','j','k'];
        var argArray = [iDirection,jDirection,kDirection].map((direction,n) =>  (direction.dot(base[n]) > 0 ? '' : argumentsWithInversion[n])+(direction === axisInIJK ? 'IJKIndex' : direction.argVar));
        var argString = argArray.join(',');
        sliceAccess = eval('(function sliceAccess (i,j) {return volume.access( '+argString+');})');


        return  {
            iLength : iLength,
            jLength : jLength,
            sliceAccess : sliceAccess,
            matrix : planeMatrix,
            planeWidth : planeWidth,
            planeHeight : planeHeight
        }

    },

    extractSlice : function (axis, index) {

        var slice = new THREE.VolumeSlice(this, index, axis);
        this.sliceList.push(slice);
        return slice;

    },

    repaintAllSlices : function () {

        this.sliceList.forEach( function (slice) {
            slice.repaint();
        });

        return this;

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
