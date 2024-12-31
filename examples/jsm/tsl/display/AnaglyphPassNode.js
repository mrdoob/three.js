import { Matrix3, NodeMaterial } from 'three/webgpu';
import { clamp, nodeObject, Fn, vec4, uv, uniform, max } from 'three/tsl';
import StereoCompositePassNode from './StereoCompositePassNode.js';

/** @module AnaglyphPassNode **/

/**
 * A render pass node that creates an anaglyph effect.
 *
 * @augments StereoCompositePassNode
 */
class AnaglyphPassNode extends StereoCompositePassNode {

	static get type() {

		return 'AnaglyphPassNode';

	}

	/**
	 * Constructs a new anaglyph pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 */
	constructor( scene, camera ) {

		super( scene, camera );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isAnaglyphPassNode = true;

		// Dubois matrices from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf#page=4

		/**
		 * Color matrix node for the left eye.
		 *
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixLeft = uniform( new Matrix3().fromArray( [
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		] ) );

		/**
		 * Color matrix node for the right eye.
		 *
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixRight = uniform( new Matrix3().fromArray( [
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
		] ) );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();

		const anaglyph = Fn( () => {

			const colorL = this._mapLeft.sample( uvNode );
			const colorR = this._mapRight.sample( uvNode );

			const color = clamp( this._colorMatrixLeft.mul( colorL.rgb ).add( this._colorMatrixRight.mul( colorR.rgb ) ) );

			return vec4( color.rgb, max( colorL.a, colorR.a ) );

		} );

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = anaglyph().context( builder.getSharedContext() );
		material.name = 'Anaglyph';
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default AnaglyphPassNode;

/**
 * TSL function for creating an anaglyph pass node.
 *
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @returns {AnaglyphPassNode}
 */
export const anaglyphPass = ( scene, camera ) => nodeObject( new AnaglyphPassNode( scene, camera ) );
