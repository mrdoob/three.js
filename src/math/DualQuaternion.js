import * as MathUtils from './MathUtils.js';
import { Vector3 } from './Vector3.js';
import { Quaternion } from './Quaternion.js';

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

class DualQuaternion {

    constructor( x = 0, y = 0, z = 0, w = 1, dx = 0, dy = 0, dz = 0, dw = 0 ) {

        this.isDualQuaternion = true;

        this._values = new Float32Array( 8 );

        this._values[ 0 ] = x;
        this._values[ 1 ] = y;
        this._values[ 2 ] = z;
        this._values[ 3 ] = w;

        this._values[ 4 ] = dx;
        this._values[ 5 ] = dy;
        this._values[ 6 ] = dz;
        this._values[ 7 ] = dw;

        this.real = this._values.subarray( 0, 4 );
        this.dual = this._values.subarray( 4, 8 );
    
    }

    fromTranslationAndRotation( translation, rotation ) {
            
        rotation.toArray( this.real );
        translation.toArray( this.dual );        

        this.dual[ 0 ] = 0.5 * ( translation.x * rotation.w + translation.y * rotation.z - translation.z * rotation.y );
        this.dual[ 1 ] = 0.5 * ( translation.y * rotation.w + translation.z * rotation.x - translation.x * rotation.z );
        this.dual[ 2 ] = 0.5 * ( translation.z * rotation.w + translation.x * rotation.y - translation.y * rotation.x );
        this.dual[ 3 ] = -0.5 * ( translation.x * rotation.x + translation.y * rotation.y + translation.z * rotation.z );

        return this;

    }

    fromMatrix4( matrix ) {

        const position = _vector.setFromMatrixPosition( matrix );
        const rotation = _quaternion.setFromRotationMatrix( matrix );

        return this.fromTranslationAndRotation( position, rotation );

    }


    toArray( array, offset = 0 ) {

        this._values.forEach( ( value, i ) => {

            array[ offset + i ] = value;

        } );

        return array;

    }

}

export { DualQuaternion };