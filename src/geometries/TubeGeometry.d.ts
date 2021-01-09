import { Curve } from './../extras/core/Curve';
import { Vector3 } from './../math/Vector3';
import { BufferGeometry } from './../core/BufferGeometry';

export class TubeGeometry extends BufferGeometry {

	/**
	 * @param path
	 * @param [tubularSegments=64]
	 * @param [radius=1]
	 * @param [radiusSegments=8]
	 * @param [closed=false]
	 */
	constructor(
		path: Curve<Vector3>,
		tubularSegments?: number,
		radius?: number,
		radiusSegments?: number,
		closed?: boolean
	);

	/**
	 * @default 'TubeGeometry'
	 */
	type: string;

	parameters: {
		path: Curve<Vector3>;
		tubularSegments: number;
		radius: number;
		radialSegments: number;
		closed: boolean;
	};
	tangents: Vector3[];
	normals: Vector3[];
	binormals: Vector3[];

}

export { TubeGeometry as TubeBufferGeometry };
