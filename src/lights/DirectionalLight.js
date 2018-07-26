import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../core/Object3D.js';
import { _Math } from '../Math/Math.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author EliasHasle / http://eliashasle.github.io/
 */

function DirectionalLight( color, intensity ) {

	Light.call( this, color, intensity );

	this.type = 'DirectionalLight';

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	this.target = new Object3D();

	this.shadow = new DirectionalLightShadow();
	
	// Read and write direction using angles:
	// around the equator of the sphere
	Object.defineProperty(this, "theta", {
		get: function() {
			return Math.atan2( this.position.x, this.position.z );
		},
		set: function(value) {
			this.setPhiTheta( this.phi, value );
		}
	});
	
	// up / down towards top and bottom pole
	Object.defineProperty(this, "phi", {
		get: function() {
			const r = this.position.length();
			return Math.acos( _Math.clamp( this.position.y / r, - 1, 1 ) );
		},
		set: function(value) {
			this.setPhiTheta( value, this.theta );
		}
	});
}

DirectionalLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: DirectionalLight,

	isDirectionalLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.target = source.target.clone();

		this.shadow = source.shadow.clone();

		return this;

	},
	
	//Set direction by angles without affecting radius
	setPhiTheta: function() {
		
		//Shared Spherical instance in closure on prototype
		let spherical = new THREE.Spherical();
		
		return function( phi, theta ) {
			
			spherical.phi = phi;
			spherical.theta = theta;
			spherical.radius = this.position.length();
			this.position.setFromSpherical( spherical );
			
		};
	}(),
} );


export { DirectionalLight };
