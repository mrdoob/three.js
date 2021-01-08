import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

/**
 * A class for displaying points. The points are rendered by the WebGLRenderer using gl.POINTS.
 */
export class Points extends Object3D {

	/**
	 * @param geometry An instance of BufferGeometry.
	 * @param material An instance of Material (optional).
	 */
	constructor(
		geometry?: BufferGeometry,
		material?: Material | Material[]
	);

	type: 'Points';
	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };
	readonly isPoints: true;

	/**
	 * An instance of BufferGeometry, where each vertex designates the position of a particle in the system.
	 */
	geometry: BufferGeometry;

	/**
	 * An instance of Material, defining the object's appearance. Default is a PointsMaterial with randomised colour.
	 */
	material: Material | Material[];

	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;
	updateMorphTargets(): void;

}
