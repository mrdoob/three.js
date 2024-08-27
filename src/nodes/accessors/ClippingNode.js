
import Node, { registerNodeClass } from '../core/Node.js';
import { nodeObject } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { diffuseColor, property } from '../core/PropertyNode.js';
import { Fn } from '../tsl/TSLBase.js';
import { Loop } from '../utils/LoopNode.js';
import { smoothstep } from '../math/MathNode.js';
import { uniformArray } from './UniformArrayNode.js';

class ClippingNode extends Node {

	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		this.scope = scope;

	}

	setup( builder ) {

		super.setup( builder );

		const clippingContext = builder.clippingContext;
		const { intersectionPlanes, unionPlanes } = clippingContext;


		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( intersectionPlanes, unionPlanes );

		} else {

			return this.setupDefault( intersectionPlanes, unionPlanes );

		}

	}

	setupAlphaToCoverage( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const distanceToPlane = property( 'float', 'distanceToPlane' );
			const distanceGradient = property( 'float', 'distanceToGradient' );

			const clipOpacity = property( 'float', 'clipOpacity' );

			clipOpacity.assign( 1 );

			const numUnionPlanes = unionPlanes.length;

			if ( numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				let plane;

				Loop( numUnionPlanes, ( { i } ) => {

					plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

					clipOpacity.equal( 0.0 ).discard();

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const unionClipOpacity = property( 'float', 'unionclipOpacity' );

				let plane;

				unionClipOpacity.assign( 1 );

				Loop( numIntersectionPlanes, ( { i } ) => {

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

	setupDefault( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const numUnionPlanes = unionPlanes.length;

			if ( numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				let plane;

				Loop( numUnionPlanes, ( { i } ) => {

					plane = clippingPlanes.element( i );
					positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const clipped = property( 'bool', 'clipped' );

				let plane;

				clipped.assign( true );

				Loop( numIntersectionPlanes, ( { i } ) => {

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

export default ClippingNode;

registerNodeClass( 'Clipping', ClippingNode );

export const clipping = () => nodeObject( new ClippingNode() );

export const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );
