import {
    DataTexture,
    FloatType,
    LinearFilter,
    RedFormat
} from 'three';

import { IESLoader } from '../loaders/IESLoader.js';

class IESTexture extends DataTexture {

	constructor( iesProfiles = [ ], initialCapacity = 1 ) {

        super( new Float32Array( 180 * initialCapacity ), 180, initialCapacity, RedFormat, FloatType );

        this.cursor = 0;
        this.capacity = initialCapacity;
        this.iesLoader = new IESLoader();
        this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;

        this.add( iesProfiles );

	}

    add( iesProfiles ) {

        if( iesProfiles instanceof Array ) {

            if( iesProfiles.length == 0 ) {

                return;

            }

        } else {

            iesProfiles = [ iesProfiles ];

        }

        const newCapacity = ( ( this.cursor + iesProfiles.length ) > this.capacity ) ? ( Math.pow( 2, Math.ceil( Math.log2( this.cursor + iesProfiles.length ) ) ) ) : this.capacity;

        if( newCapacity !== this.capacity ) {

            this.capacity = newCapacity;

            this.dispose();

            const newImageData = new Float32Array( 180 * this.capacity );

            for( var i = 0; i < this.image.data.length; ++ i ) {

                newImageData[ i ] = this.image.data[ i ];

            }

            this.image.data = newImageData;
            this.image.height = newCapacity;

        }

        return iesProfiles.map( iesProfile => {

            const currentCursor = this.cursor ++;

            return new Promise( resolve => {

                this.iesLoader.load( iesProfile, iesProfileData => {

                    for( var i = 0; i < 180; ++ i) {

                        this.image.data[ 180 * currentCursor + i ] = iesProfileData[ i * 360 ];

                    }

                    this.needsUpdate = true;

                    resolve();

                } );

            } );

        } );

    }

}

export { IESTexture };