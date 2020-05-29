import { Color } from './../math/Color';
import { Light } from './Light';
import { PointLightShadow } from './PointLightShadow';

/**
 * @example
 * const light = new THREE.PointLight( 0xff0000, 1, 100 );
 * light.position.set( 50, 50, 50 );
 * scene.add( light );
 */
export class PointLight extends Light {

	constructor(
		color?: Color | string | number,
		intensity?: number,
		distance?: number,
		decay?: number
	);

	/*
	 * Light's intensity.
	 * Default - 1.0.
	 */
	intensity: number;

	/**
	 * If non-zero, light will attenuate linearly from maximum intensity at light position down to zero at distance.
	 * Default - 0.0.
	 */
	distance: number;

	decay: number;
	shadow: PointLightShadow;
	power: number;

}
