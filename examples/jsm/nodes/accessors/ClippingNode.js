
import Node from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { positionView } from './PositionNode.js';
import { diffuseColor, property } from '../core/PropertyNode.js';
import { tslFn } from '../shadernode/ShaderNode.js';
import { loop } from '../utils/LoopNode.js';
import { smoothstep  } from '../math/MathNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { Matrix3, Plane, Vector4 } from 'three';
import { uniform } from '../core/UniformNode.js';

const _plane = new Plane();
const _viewNormalMatrix = new Matrix3();

class ClippingNode extends Node {

	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		this.scope = scope;
		this.updateType = NodeUpdateType.FRAME;
		this.planes = [];

	}

	projectPlanes( source, offset, viewMatrix ) {

		const l = source.length;
		const planes = this.planes;

		for ( let i = 0; i < l; i ++ ) {

			_plane.copy( source[ i ] ).applyMatrix4( viewMatrix, _viewNormalMatrix );

			const v = planes[ offset + i ];
			const normal = _plane.normal;

			v.x = - normal.x;
			v.y = - normal.y;
			v.z = - normal.z;
			v.w = _plane.constant;

		}

	}

	update( frame ) {

		const viewMatrix = frame.camera.matrixWorldInverse;

		_viewNormalMatrix.getNormalMatrix( viewMatrix );

		const globalClippingPlanes = this._globalClippingPlanes;
		const localClippingPlanes = this._localClippingPlanes;

		const lg = globalClippingPlanes.length;
		const ll = localClippingPlanes.length;

		if ( lg > 0 ) this.projectPlanes( globalClippingPlanes, 0, viewMatrix );

		if ( ll > 0 ) this.projectPlanes( localClippingPlanes, lg, viewMatrix );

	}

	setup( builder ) {

		super.setup( builder );

		const { localClippingEnabled, localClipIntersection } = builder.clippingContext;
		const { localClippingCount, globalClippingCount } = builder.clippingContext;
		const { globalClippingPlanes, localClippingPlanes } = builder.clippingContext;

		this._globalClippingPlanes = globalClippingPlanes;
		this._localClippingPlanes = localClippingEnabled ? localClippingPlanes : [];

		const l = globalClippingCount + localClippingCount;

		this._numClippingPlanes = l;
		this._numUnionClippingPlanes = localClipIntersection ? l - localClippingCount : l;

		for ( let i = 0; i < l; i ++ ) {

			this.planes.push( new Vector4() );

		}

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage();

		} else {

			return this.setupDefault();

		}

	}

	setupAlphaToCoverage() {

		const numClippingPlanes = this._numClippingPlanes;
		const numUnionClippingPlanes = this._numUnionClippingPlanes;

		return tslFn( () => {

			const clippingPlanes = uniform( this.planes, 'vec4' );

			const distanceToPlane = property( 'float', 'distanceToPlane' );
			const distanceGradient = property( 'float', 'distanceToGradient' );

			const clipOpacity = property( 'float', 'clipOpacity' );

			clipOpacity.assign( 1 );

			let plane;

			loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );

				distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
				distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

				clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				clipOpacity.equal( 0.0 ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const unionClipOpacity = property( 'float', 'unionclipOpacity' );

				unionClipOpacity.assign( 1 );

				loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

					plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot(  plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					unionClipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ).oneMinus() );

				} );

				clipOpacity.mulAssign( unionClipOpacity.oneMinus() );

			}

			diffuseColor.a.mulAssign( clipOpacity );

			diffuseColor.a.equal( 0.0 ).discard();

		} )();

	}

	setupDefault() {

		const numClippingPlanes = this._numClippingPlanes;
		const numUnionClippingPlanes = this._numUnionClippingPlanes;

		return tslFn( () => {

			const clippingPlanes = uniform( this.planes, 'vec4' );

			let plane;

			loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );
				positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const clipped = property( 'bool', 'clipped' );

				clipped.assign( true );

				loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

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
