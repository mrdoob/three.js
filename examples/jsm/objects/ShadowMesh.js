import {
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	EqualStencilFunc,
	IncrementStencilOp
} from 'three';

const _shadowMatrix = new Matrix4();

/**
 * A Shadow Mesh that follows a shadow-casting mesh in the scene,
 * but is confined to a single plane. This technique can be used as
 * a very performant alternative to classic shadow mapping. However,
 * it has serious limitations like:
 *
 * - Shadows can only be casted on flat planes.
 * - No soft shadows support.
 *
 * ```js
 * const cubeShadow = new ShadowMesh( cube );
 * scene.add( cubeShadow );
 * ```
 *
 * @augments Mesh
 */
class ShadowMesh extends Mesh {

	/**
	 * Constructs a new shadow mesh.
	 *
	 * @param {Mesh} mesh - The shadow-casting reference mesh.
	 */
	constructor( mesh ) {

		const shadowMaterial = new MeshBasicMaterial( {

			color: 0x000000,
			transparent: true,
			opacity: 0.6,
			depthWrite: false,
			stencilWrite: true,
			stencilFunc: EqualStencilFunc,
			stencilRef: 0,
			stencilZPass: IncrementStencilOp

		} );

		super( mesh.geometry, shadowMaterial );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowMesh = true;

		/**
		 * Represent the world matrix of the reference mesh.
		 *
		 * @type {Matrix4}
		 */
		this.meshMatrix = mesh.matrixWorld;

		/**
		 * Overwritten to disable view-frustum culling by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.frustumCulled = false;

		/**
		 * Overwritten to disable automatic matrix update. The local
		 * matrix is computed manually in {@link ShadowMesh#update}.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.matrixAutoUpdate = false;

	}

	/**
	 * Updates the shadow mesh so it follows its shadow-casting reference mesh.
	 *
	 * @param {Plane} plane - The plane onto the shadow mesh is projected.
	 * @param {Vector4} lightPosition4D - The light position.
	 */
	update( plane, lightPosition4D ) {

		// based on https://www.opengl.org/archives/resources/features/StencilTalk/tsld021.htm

		const dot = plane.normal.x * lightPosition4D.x +
			  plane.normal.y * lightPosition4D.y +
			  plane.normal.z * lightPosition4D.z +
			  - plane.constant * lightPosition4D.w;

		const sme = _shadowMatrix.elements;

		sme[ 0 ] = dot - lightPosition4D.x * plane.normal.x;
		sme[ 4 ] = - lightPosition4D.x * plane.normal.y;
		sme[ 8 ] = - lightPosition4D.x * plane.normal.z;
		sme[ 12 ] = - lightPosition4D.x * - plane.constant;

		sme[ 1 ] = - lightPosition4D.y * plane.normal.x;
		sme[ 5 ] = dot - lightPosition4D.y * plane.normal.y;
		sme[ 9 ] = - lightPosition4D.y * plane.normal.z;
		sme[ 13 ] = - lightPosition4D.y * - plane.constant;

		sme[ 2 ] = - lightPosition4D.z * plane.normal.x;
		sme[ 6 ] = - lightPosition4D.z * plane.normal.y;
		sme[ 10 ] = dot - lightPosition4D.z * plane.normal.z;
		sme[ 14 ] = - lightPosition4D.z * - plane.constant;

		sme[ 3 ] = - lightPosition4D.w * plane.normal.x;
		sme[ 7 ] = - lightPosition4D.w * plane.normal.y;
		sme[ 11 ] = - lightPosition4D.w * plane.normal.z;
		sme[ 15 ] = dot - lightPosition4D.w * - plane.constant;

		this.matrix.multiplyMatrices( _shadowMatrix, this.meshMatrix );

	}

}

export { ShadowMesh };
