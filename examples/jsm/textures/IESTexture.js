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

            const newImageData = new Float32Array( 180 * this.capacity )
            newImageData.set( this.image.data, 0 );

            this.image.data = newImageData;
            this.image.height = newCapacity;

        }

        return iesProfiles.map( iesProfile => {

            const currentCursor = this.cursor ++;

            return new Promise( resolve => {

                this.iesLoader.load( iesProfile, iesProfileData => {

                    this.image.data.set( iesProfileData.subarray( 0, 180 ), 180 * currentCursor );

                    this.needsUpdate = true;

                    resolve();

                } );

            } );

        } );

    }

}

export { IESTexture };