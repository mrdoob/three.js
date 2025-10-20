import { float, nodeObject, normalize, vec4 } from '../tsl/TSLBase.js';
import { Color } from '../../math/Color.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionLocal } from '../../nodes/accessors/Position.js';
import { normalLocal } from '../../nodes/accessors/Normal.js';
import { BackSide } from '../../constants.js';
import PassNode from './PassNode.js';

/**
 * Represents a render pass for producing a toon outline effect on compatible objects.
 * Only 3D objects with materials of type `MeshToonMaterial` and `MeshToonNodeMaterial`
 * will receive the outline.
 *
 * ```js
 * const postProcessing = new PostProcessing( renderer );
 *
 * const scenePass = toonOutlinePass( scene, camera );
 *
 * postProcessing.outputNode = scenePass;
 * ```
 * @augments PassNode
 */
class ToonOutlinePassNode extends PassNode {

	static get type() {

		return 'ToonOutlinePassNode';

	}

	/**
	 * Constructs a new outline pass node.
	 *
	 * @param {Scene} scene - A reference to the scene.
	 * @param {Camera} camera - A reference to the camera.
	 * @param {Node} colorNode - Defines the outline's color.
	 * @param {Node} thicknessNode - Defines the outline's thickness.
	 * @param {Node} alphaNode - Defines the outline's alpha.
	 */
	constructor( scene, camera, colorNode, thicknessNode, alphaNode ) {

		super( PassNode.COLOR, scene, camera );

		/**
		 * Defines the outline's color.
		 *
		 * @type {Node}
		 */
		this.colorNode = colorNode;

		/**
		 * Defines the outline's thickness.
		 *
		 * @type {Node}
		 */
		this.thicknessNode = thicknessNode;

		/**
		 * Defines the outline's alpha.
		 *
		 * @type {Node}
		 */
		this.alphaNode = alphaNode;

		/**
		 * An internal material cache.
		 *
		 * @private
		 * @type {WeakMap<Material, NodeMaterial>}
		 */
		this._materialCache = new WeakMap();

		/**
		 * The name of this pass.
		 *
		 * @type {string}
		 * @default 'Outline Pass'
		 */
		this.name = 'Outline Pass';

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, scene, camera, geometry, material, group, lightsNode, clippingContext ) => {

			// only render outline for supported materials

			if ( material.isMeshToonMaterial || material.isMeshToonNodeMaterial ) {

				if ( material.wireframe === false ) {

					const outlineMaterial = this._getOutlineMaterial( material );
					renderer.renderObject( object, scene, camera, geometry, outlineMaterial, group, lightsNode, clippingContext );

				}

			}

			// default

			renderer.renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext );

		} );

		super.updateBefore( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

	}

	/**
	 * Creates the material used for outline rendering.
	 *
	 * @private
	 * @return {NodeMaterial} The outline material.
	 */
	_createMaterial() {

		const material = new NodeMaterial();
		material.isMeshToonOutlineMaterial = true;
		material.name = 'Toon_Outline';
		material.side = BackSide;

		// vertex node

		const outlineNormal = normalLocal.negate();
		const mvp = cameraProjectionMatrix.mul( modelViewMatrix );

		const ratio = float( 1.0 ); // TODO: support outline thickness ratio for each vertex
		const pos = mvp.mul( vec4( positionLocal, 1.0 ) );
		const pos2 = mvp.mul( vec4( positionLocal.add( outlineNormal ), 1.0 ) );
		const norm = normalize( pos.sub( pos2 ) ); // NOTE: subtract pos2 from pos because BackSide objectNormal is negative

		material.vertexNode = pos.add( norm.mul( this.thicknessNode ).mul( pos.w ).mul( ratio ) );

		// color node

		material.colorNode = vec4( this.colorNode, this.alphaNode );

		return material;

	}

	/**
	 * For the given toon material, this method returns a corresponding
	 * outline material.
	 *
	 * @private
	 * @param {(MeshToonMaterial|MeshToonNodeMaterial)} originalMaterial - The toon material.
	 * @return {NodeMaterial} The outline material.
	 */
	_getOutlineMaterial( originalMaterial ) {

		let outlineMaterial = this._materialCache.get( originalMaterial );

		if ( outlineMaterial === undefined ) {

			outlineMaterial = this._createMaterial();

			this._materialCache.set( originalMaterial, outlineMaterial );

		}

		return outlineMaterial;

	}

}

export default ToonOutlinePassNode;

/**
 * TSL function for creating a toon outline pass node.
 *
 * @tsl
 * @function
 * @param {Scene} scene - A reference to the scene.
 * @param {Camera} camera - A reference to the camera.
 * @param {Color} color - Defines the outline's color.
 * @param {number} [thickness=0.003] - Defines the outline's thickness.
 * @param {number} [alpha=1] - Defines the outline's alpha.
 * @returns {ToonOutlinePassNode}
 */
export const toonOutlinePass = ( scene, camera, color = new Color( 0, 0, 0 ), thickness = 0.003, alpha = 1 ) => nodeObject( new ToonOutlinePassNode( scene, camera, nodeObject( color ), nodeObject( thickness ), nodeObject( alpha ) ) );
