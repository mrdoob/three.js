import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

class VideoFrameTexture extends Texture {

    constructor( videoFrame, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

        super( videoFrame, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

        this.isVideoTexture = true;

        this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
        this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

        this.generateMipmaps = false;

    }

    clone() {

        return new this.constructor( this.image ).copy( this );

    }

    update(  ) {

    }

    setFrame( videoFrame ) {

        this.image = videoFrame
        this.needsUpdate = true;

    }

}

export { VideoFrameTexture };
