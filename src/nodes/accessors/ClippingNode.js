
import Node from '../core/Node.js';
import { Fn, bool, float } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { Loop } from '../utils/LoopNode.js';
import { smoothstep } from '../math/MathNode.js';
import { uniformArray } from './UniformArrayNode.js';
import { builtin } from './BuiltinNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';

/**
 * This node is used in {@link NodeMaterial} to setup the clipping
 * which can happen hardware-accelerated (if supported) and optionally
 * use alpha-to-coverage for anti-aliasing clipped edges.
 *
 * @augments Node
 */
class ClippingNode extends Node {

	static get type() {

		return 'ClippingNode';

	}

	/**
	 * Constructs a new clipping node.
	 *
	 * @param {('default'|'hardware'|'alphaToCoverage')} [scope='default'] - The node's scope. Similar to other nodes,
	 * the selected scope influences the behavior of the node and what type of code is generated.
	 */
	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		/**
		 * The node's scope. Similar to other nodes, the selected scope influences
		 * the behavior of the node and what type of code is generated.
		 *
		 * @type {('default'|'hardware'|'alphaToCoverage')}
		 */
		this.scope = scope;

	}

	/**
	 * Setups the node depending on the selected scope.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The result node.
	 */
	setup( builder ) {

		super.setup( builder );

		const clippingContext = builder.clippingContext;
		const { intersectionPlanes, unionPlanes } = clippingContext;

		this.hardwareClipping = builder.material.hardwareClipping;

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( intersectionPlanes, unionPlanes );

		} else if ( this.scope === ClippingNode.HARDWARE ) {

			return this.setupHardwareClipping( unionPlanes, builder );

		} else {

			return this.setupDefault( intersectionPlanes, unionPlanes );

		}

	}

	/**
	 * Setups alpha to coverage.
	 *
	 * @param {Array<Vector4>} intersectionPlanes - The intersection planes.
	 * @param {Array<Vector4>} unionPlanes - The union planes.
	 * @return {Node} The result node.
	 */
	setupAlphaToCoverage( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const distanceToPlane = float().toVar( 'distanceToPlane' );
			const distanceGradient = float().toVar( 'distanceToGradient' );

			const clipOpacity = float( 1 ).toVar( 'clipOpacity' );

			const numUnionPlanes = unionPlanes.length;

			if ( this.hardwareClipping === false && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes ).setGroup( renderGroup );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes ).setGroup( renderGroup );
				const intersectionClipOpacity = float( 1 ).toVar( 'intersectionClipOpacity' );

				Loop( numIntersectionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					intersectionClipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ).oneMinus() );

				} );

				clipOpacity.mulAssign( intersectionClipOpacity.oneMinus() );

			}

			diffuseColor.a.mulAssign( clipOpacity );

			diffuseColor.a.equal( 0.0 ).discard();

		} )();

	}

	/**
	 * Setups the default clipping.
	 *
	 * @param {Array<Vector4>} intersectionPlanes - The intersection planes.
	 * @param {Array<Vector4>} unionPlanes - The union planes.
	 * @return {Node} The result node.
	 */
	setupDefault( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const numUnionPlanes = unionPlanes.length;

			if ( this.hardwareClipping === false && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes ).setGroup( renderGroup );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes ).setGroup( renderGroup );
				const clipped = bool( true ).toVar( 'clipped' );

				Loop( numIntersectionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					clipped.assign( positionView.dot( plane.xyz ).greaterThan( plane.w ).and( clipped ) );

				} );

				clipped.discard();

			}

		} )();

	}

	/**
	 * Setups hardware clipping.
	 *
	 * @param {Array<Vector4>} unionPlanes - The union planes.
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The result node.
	 */
	setupHardwareClipping( unionPlanes, builder ) {

		const numUnionPlanes = unionPlanes.length;

		builder.enableHardwareClipping( numUnionPlanes );

		return Fn( () => {

			const clippingPlanes = uniformArray( unionPlanes ).setGroup( renderGroup );
			const hw_clip_distances = builtin( builder.getClipDistance() );

			Loop( numUnionPlanes, ( { i } ) => {

				const plane = clippingPlanes.element( i );

				const distance = positionView.dot( plane.xyz ).sub( plane.w ).negate();
				hw_clip_distances.element( i ).assign( distance );

			} );

		} )();

	}

}

ClippingNode.ALPHA_TO_COVERAGE = 'alphaToCoverage';
ClippingNode.DEFAULT = 'default';
ClippingNode.HARDWARE = 'hardware';

export default ClippingNode;

/**
 * TSL function for setting up the default clipping logic.
 *
 * @tsl
 * @function
 * @returns {ClippingNode}
 */
export const clipping = () => new ClippingNode();

/**
 * TSL function for setting up alpha to coverage.
 *
 * @tsl
 * @function
 * @returns {ClippingNode}
 */
export const clippingAlpha = () => new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE );

/**
 * TSL function for setting up hardware-based clipping.
 *
 * @tsl
 * @function
 * @returns {ClippingNode}
 */
export const hardwareClipping = () => new ClippingNode( ClippingNode.HARDWARE );
