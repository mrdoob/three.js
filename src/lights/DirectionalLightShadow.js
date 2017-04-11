import { LightShadow } from './LightShadow';
import { OrthographicCamera } from '../cameras/OrthographicCamera';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function DirectionalLightShadow( ) {

	LightShadow.call( this, new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

}

DirectionalLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: DirectionalLightShadow

} );


export { DirectionalLightShadow };
