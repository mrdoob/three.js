import { Light } from './Light.js';
import { PointLightShadow } from './PointLightShadow.js';

class PointLight extends Light {

	constructor( color, intensity, distance = 0, decay = 1 ) {

		super( color, intensity );

		this.type = 'PointLight';

		this.distance = distance;
		this.decay = decay; // for physically correct lights, should be 2.

		this.shadow = new PointLightShadow();

	}

	get power() {

		// intensity = power per solid angle.
		// ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		return this.intensity * 4 * Math.PI;

	}

	set power( power ) {

		// intensity = power per solid angle.
		// ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		this.intensity = power / ( 4 * Math.PI );

	}

	dispose() {

		this.shadow.dispose();

	}

	copy( source ) {

		super.copy( source );

		this.distance = source.distance;
		this.decay = source.decay;

		this.shadow = source.shadow.clone();

		return this;

	}

}

PointLight.prototype.isPointLight = true;

export { PointLight };
