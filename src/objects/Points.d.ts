import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

/**
 * A class for displaying particles in the form of variable size points. For example, if using the WebGLRenderer, the particles are displayed using GL_POINTS.
 *
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/objects/ParticleSystem.js">src/objects/ParticleSystem.js</a>
 */
export class Points extends Object3D {

	/**
   * @param geometry An instance of Geometry or BufferGeometry.
   * @param material An instance of Material (optional).
   */
	constructor(
		geometry?: Geometry | BufferGeometry,
		material?: Material | Material[]
	);

	type: 'Points';
	isPoints: true;

	/**
   * An instance of Geometry or BufferGeometry, where each vertex designates the position of a particle in the system.
   */
	geometry: Geometry | BufferGeometry;

	/**
   * An instance of Material, defining the object's appearance. Default is a PointsMaterial with randomised colour.
   */
	material: Material | Material[];

	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;

}
