
import Node from '../core/Node.js';
import { nodeObject, Fn, bool, float } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { Loop } from '../utils/LoopNode.js';
import { smoothstep } from '../math/MathNode.js';
import { uniformArray } from './UniformArrayNode.js';

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
		const { intersectionPlanes, unionPlanes } = clippingContext;


		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( intersectionPlanes, unionPlanes );

		} else {

			return this.setupDefault( intersectionPlanes, unionPlanes );

		}

	}

	setupAlphaToCoverage( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const distanceToPlane = float().toVar( 'distanceToPlane' );
			const distanceGradient = float().toVar( 'distanceToGradient' );

			const clipOpacity = float( 1 ).toVar( 'clipOpacity' );

			const numUnionPlanes = unionPlanes.length;

			if ( numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				let plane;

				Loop( numUnionPlanes, ( { i } ) => {

					plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const intersectionClipOpacity = float( 1 ).toVar( 'intersectionClipOpacity' );

				let plane;

				Loop( numIntersectionPlanes, ( { i } ) => {

					plane = clippingPlanes.element( i );

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
				const clipped = bool( true ).toVar( 'clipped' );

				let plane;

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

export const clipping = () => nodeObject( new ClippingNode() );

export const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );
