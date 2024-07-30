
import Node from '../core/Node.js';
<<<<<<< HEAD
<<<<<<< HEAD
import { nodeObject } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
=======
import { addNodeElement, nodeObject, nodeProxy } from '../shadernode/ShaderNode.js';
=======
import { addNodeElement, nodeObject } from '../shadernode/ShaderNode.js';
>>>>>>> aa81eb1654 (working webgl implementation)
import { positionView } from './PositionNode.js';
>>>>>>> 93b66d8a45 (Modify node builder to work with latest version of Chrome ( there was no conditional extension support in GLSLNodeBuilder and clip_distances are no longer an enable feature as of Chrome 127, so we'll need to think of a way to support older systems that still need it enabled if that is what we want)
import { diffuseColor, property } from '../core/PropertyNode.js';
import { Fn } from '../tsl/TSLBase.js';
import { Loop } from '../utils/LoopNode.js';
import { smoothstep } from '../math/MathNode.js';
import { uniformArray } from './UniformArrayNode.js';
import { ArrayElementNode } from '../Nodes.js';

// ClippingNode: A node representing a TSL function that performs a clipping operation.
// HardwareClipDistancesNode: A node representing an assignable, builtin shader object ( GLSL's gl_clipDistance or WGSL's clip_distances )

class HardwareClipDistancesElementNode extends ArrayElementNode {

	constructor( node, indexNode ) {

		super( node, indexNode );

		this.isHardwareClipDistancesElementNode = true;

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;
		snippet = super.generate( builder );

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		// TODO: Potentially activate gl clip_distance index when element is accessed rather
		// than globally based on clipping context.

		return snippet;

	}

}

class HardwareClipDistancesNode extends Node {

	constructor() {

		super( 'float' );

		this.isHardwareClipDistancesNode = true;

	}

	generate( builder ) {

		const clippingContext = builder.clippingContext;
		const { localClippingCount, globalClippingCount } = clippingContext;

		const numClippingPlanes = globalClippingCount + localClippingCount;

		const propertyName = builder.getClipDistances( numClippingPlanes || 1 );

		return propertyName;

	}

	element( indexNode ) {

		return nodeObject( new HardwareClipDistancesElementNode( this, nodeObject( indexNode ) ) );

	}

}

export const clipDistances = () => nodeObject( new HardwareClipDistancesNode() );

addNodeElement( 'clipDistances', clipDistances );

class ClippingNode extends Node {

	static get type() {

		return 'ClippingNode';

	}

	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		this.scope = scope;

	}

	setup( builder ) {

		super.setup( builder );

		const clippingContext = builder.clippingContext;
		const { localClipIntersection, localClippingCount, globalClippingCount } = clippingContext;

		const numClippingPlanes = globalClippingCount + localClippingCount;
		const numUnionClippingPlanes = localClipIntersection ? numClippingPlanes - localClippingCount : numClippingPlanes;

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( clippingContext.planes, numClippingPlanes, numUnionClippingPlanes );

		} else {

			return this.setupDefault( clippingContext.planes, numClippingPlanes, numUnionClippingPlanes );

		}

	}

	setupAlphaToCoverage( planes, numClippingPlanes, numUnionClippingPlanes ) {

		return Fn( () => {

			const clippingPlanes = uniformArray( planes );

			const distanceToPlane = property( 'float', 'distanceToPlane' );
			const distanceGradient = property( 'float', 'distanceToGradient' );

			const clipOpacity = property( 'float', 'clipOpacity' );

			clipOpacity.assign( 1 );

			let plane;

			Loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );

				distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
				distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

				clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				clipOpacity.equal( 0.0 ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const unionClipOpacity = property( 'float', 'unionclipOpacity' );

				unionClipOpacity.assign( 1 );

				Loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

					plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					unionClipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ).oneMinus() );

				} );

				clipOpacity.mulAssign( unionClipOpacity.oneMinus() );

			}

			diffuseColor.a.mulAssign( clipOpacity );

			diffuseColor.a.equal( 0.0 ).discard();

		} )();

	}

	setupDefault( planes, numClippingPlanes, numUnionClippingPlanes ) {

		return Fn( () => {

			const clippingPlanes = uniformArray( planes );

			let plane;

			Loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );
				positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const clipped = property( 'bool', 'clipped' );

				clipped.assign( true );

				Loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

					plane = clippingPlanes.element( i );
					clipped.assign( positionView.dot( plane.xyz ).greaterThan( plane.w ).and( clipped ) );

				} );

				clipped.discard();

			}

		} )();

	}

}

ClippingNode.ALPHA_TO_COVERAGE = 'alphaToCoverage';
ClippingNode.DEFAULT = 'default';
ClippingNode.HARDWARE = 'hardware';

export default ClippingNode;

export const clipping = () => nodeObject( new ClippingNode() );

export const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );
