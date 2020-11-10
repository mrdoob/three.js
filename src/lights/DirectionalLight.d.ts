import { Color } from './../math/Color';
import { Object3D } from './../core/Object3D';
import { DirectionalLightShadow } from './DirectionalLightShadow';
import { Light } from './Light';
import { Vector3 } from '../math/Vector3';

/**
 * @example
 * // White directional light at half intensity shining from the top.
 * const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
 * directionalLight.position.set( 0, 1, 0 );
 * scene.add( directionalLight );
 *
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/lights/DirectionalLight.js|src/lights/DirectionalLight.js}
 */
export class DirectionalLight extends Light {

	constructor( color?: Color | string | number, intensity?: number );

	/**
	 * @default 'DirectionalLight'
	 */
	type: string;

	/**
	 * @default THREE.Object3D.DefaultUp
	 */
	position: Vector3;

	/**
	 * Target used for shadow camera orientation.
	 * @default new THREE.Object3D()
	 */
	target: Object3D;

	/**
	 * Light's intensity.
	 * @default 1
	 */
	intensity: number;

	/**
	 * @default new THREE.DirectionalLightShadow()
	 */
	shadow: DirectionalLightShadow;
	readonly isDirectionalLight: true;

}
