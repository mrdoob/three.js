import { Vector3 } from './../math/Vector3';
import { Line } from './../objects/Line';
import { Mesh } from './../objects/Mesh';
import { Color } from './../math/Color';
import { Object3D } from './../core/Object3D';

// Extras / Helpers /////////////////////////////////////////////////////////////////////

export class ArrowHelper extends Object3D {

	/**
	 * @param [dir=new THREE.Vector3( 0, 0, 1 )]
	 * @param [origin=new THREE.Vector3( 0, 0, 0 )]
	 * @param [length=1]
	 * @param [color=0xffff00]
	 * @param headLength
	 * @param headWidth
	 */
	constructor(
		dir: Vector3,
		origin?: Vector3,
		length?: number,
		color?: number,
		headLength?: number,
		headWidth?: number
	);

	/**
	 * @default 'ArrowHelper'
	 */
	type: string;

	line: Line;
	cone: Mesh;

	setDirection( dir: Vector3 ): void;
	setLength( length: number, headLength?: number, headWidth?: number ): void;
	setColor( color: Color | string | number ): void;

}
