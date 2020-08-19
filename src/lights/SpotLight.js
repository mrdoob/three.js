import { Light } from './Light.js';
import { SpotLightShadow } from './SpotLightShadow.js';
import { Object3D } from '../core/Object3D.js';

class SpotLight extends Light {

	constructor( color, intensity, distance, angle, penumbra, decay ) {

		super( color, intensity );

		this.type = 'SpotLight';
		Object.defineProperty( this, 'isSpotLight', true );

		this.position.copy( Object3D.DefaultUp );
		this.updateMatrix();

		this.target = new Object3D();

		this.distance = ( distance !== undefined ) ? distance : 0;
		this.angle = ( angle !== undefined ) ? angle : Math.PI / 3;
		this.penumbra = ( penumbra !== undefined ) ? penumbra : 0;
		this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

		this.shadow = new SpotLightShadow();

	}

	get power() {

		// intensity = power per solid angle.
		// ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		return this.intensity * Math.PI;

	}

	set power( value ) {

		// intensity = power per solid angle.
		// ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		this.intensity = value / Math.PI;

	}

	copy( source ) {

		super.copy( source );

		this.distance = source.distance;
		this.angle = source.angle;
		this.penumbra = source.penumbra;
		this.decay = source.decay;

		this.target = source.target.clone();

		this.shadow = source.shadow.clone();

		return this;

	}

}

export { SpotLight };
