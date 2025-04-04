import {
	BoxGeometry,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D
} from 'three';

/**
 * A utility class for the WebXR Plane Detection Module. If planes
 * are detected by WebXR, this class will automatically add them
 * as thin box meshes to the scene when below code snippet is used.
 *
 * ```js
 * const planes = new XRPlanes( renderer );
 * scene.add( planes );
 * ```
 *
 * @augments Object3D
 * @three_import import { XRPlanes } from 'three/addons/webxr/XRPlanes.js';
 */
class XRPlanes extends Object3D {

	/**
	 * Constructs a new XR plane container.
	 *
	 * @param {WebGLRenderer|WebGPURenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		super();

		const matrix = new Matrix4();

		const currentPlanes = new Map();

		const xr = renderer.xr;

		xr.addEventListener( 'planesdetected', event => {

			const frame = event.data;
			const planes = frame.detectedPlanes;

			const referenceSpace = xr.getReferenceSpace();

			let planeschanged = false;

			for ( const [ plane, mesh ] of currentPlanes ) {

				if ( planes.has( plane ) === false ) {

					mesh.geometry.dispose();
					mesh.material.dispose();
					this.remove( mesh );

					currentPlanes.delete( plane );

					planeschanged = true;

				}

			}

			for ( const plane of planes ) {

				if ( currentPlanes.has( plane ) === false ) {

					const pose = frame.getPose( plane.planeSpace, referenceSpace );
					matrix.fromArray( pose.transform.matrix );

					const polygon = plane.polygon;

					let minX = Number.MAX_SAFE_INTEGER;
					let maxX = Number.MIN_SAFE_INTEGER;
					let minZ = Number.MAX_SAFE_INTEGER;
					let maxZ = Number.MIN_SAFE_INTEGER;

					for ( const point of polygon ) {

						minX = Math.min( minX, point.x );
						maxX = Math.max( maxX, point.x );
						minZ = Math.min( minZ, point.z );
						maxZ = Math.max( maxZ, point.z );

					}

					const width = maxX - minX;
					const height = maxZ - minZ;

					const geometry = new BoxGeometry( width, 0.01, height );
					const material = new MeshBasicMaterial( { color: 0xffffff * Math.random() } );

					const mesh = new Mesh( geometry, material );
					mesh.position.setFromMatrixPosition( matrix );
					mesh.quaternion.setFromRotationMatrix( matrix );
					this.add( mesh );

					currentPlanes.set( plane, mesh );

					planeschanged = true;

				}

			}

			if ( planeschanged ) {

				this.dispatchEvent( { type: 'planeschanged' } );

			}

		} );

	}

}

export { XRPlanes };
