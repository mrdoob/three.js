
import Node from '../core/Node.js';
import { nodeObject, Fn, bool, float } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { Loop } from '../utils/LoopNode.js';
import { smoothstep } from '../math/MathNode.js';
import { uniformArray } from './UniformArrayNode.js';
import { builtin } from './BuiltinNode.js';

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

		this.hardwareClipping = builder.material.hardwareClipping;

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( intersectionPlanes, unionPlanes );

		} else if ( this.scope === ClippingNode.HARDWARE ) {

			return this.setupHardwareClipping( unionPlanes, builder );

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

			if ( ! this.hardwareClipping && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
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

	setupDefault( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const numUnionPlanes = unionPlanes.length;

			if ( ! this.hardwareClipping && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const clipped = bool( true ).toVar( 'clipped' );

				Loop( numIntersectionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					clipped.assign( positionView.dot( plane.xyz ).greaterThan( plane.w ).and( clipped ) );

				} );

				clipped.discard();

			}

		} )();

	}

	setupHardwareClipping( unionPlanes, builder ) {

		const numUnionPlanes = unionPlanes.length;

		builder.enableHardwareClipping( numUnionPlanes );

		return Fn( () => {

			const clippingPlanes = uniformArray( unionPlanes );
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

export const clipping = () => nodeObject( new ClippingNode() );
export const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );
export const hardwareClipping = () => nodeObject( new ClippingNode( ClippingNode.HARDWARE ) );
