import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../core/Object3D.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function DirectionalLight( color, intensity ) {

	Light.call( this, color, intensity );

	this.type = 'DirectionalLight';

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	this.target = new Object3D();

	this.shadow = new DirectionalLightShadow();

}

DirectionalLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: DirectionalLight,

	isDirectionalLight: true,

	copy: function ( source, recursive, cache ) {

		if ( cache === undefined ) cache = {};

		Light.prototype.copy.call( this, source, recursive, cache );

		if ( ( source.target.uuid in cache ) === false ) {

			source.target.clone( recursive, cache );

		}
		this.target = cache[ source.target.uuid ];

		this.shadow = source.shadow.clone();

		return this;

	}

} );


export { DirectionalLight };
