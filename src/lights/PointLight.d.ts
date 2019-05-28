import { Color } from './../math/Color';
import { Light } from './Light';
import { PerspectiveCamera } from './../cameras/PerspectiveCamera';
import { LightShadow } from './LightShadow';

export class PointLightShadow extends LightShadow {

	camera: PerspectiveCamera;

}

/**
 * Affects objects using {@link MeshLambertMaterial} or {@link MeshPhongMaterial}.
 *
 * @example
 * var light = new THREE.PointLight( 0xff0000, 1, 100 );
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
   * Default — 0.0.
   */
	distance: number;

	decay: number;
	shadow: PointLightShadow;
	power: number;

}
