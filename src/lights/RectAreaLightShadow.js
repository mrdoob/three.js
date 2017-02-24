import { LightShadow } from './LightShadow';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';

/**
 * @author aallison / http://github.com/abelnation
 */

function RectAreaLightShadow() {

	LightShadow.call( this, new PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

RectAreaLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: RectAreaLightShadow,

	update: function ( light ) {

	// TODO (abelnation): implement

	}

});

export { RectAreaLightShadow };
