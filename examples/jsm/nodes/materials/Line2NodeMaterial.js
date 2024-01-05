import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { property } from '../core/PropertyNode.js';
import { attribute } from '../core/AttributeNode.js';
import { cameraProjectionMatrix } from '../accessors/CameraNode.js';
import { materialColor } from '../accessors/MaterialNode.js';
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { positionGeometry } from '../accessors/PositionNode.js';
import { tslFn, float, vec2, vec3, vec4, If } from '../shadernode/ShaderNode.js';
import { uv } from '../accessors/UVNode.js';
import { materialLineScale, materialLineDashSize, materialLineGapSize, materialLineDashOffset, materialLineWidth } from '../accessors/LineMaterialNode.js';
import { viewport } from '../display/ViewportNode.js';
import { dashSize, gapSize } from '../core/PropertyNode.js';

import { LineDashedMaterial } from 'three';

const defaultValues = new LineDashedMaterial();

class Line2NodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.normals = false;
		this.lights = false;

		this.setDefaultValues( defaultValues );

		this.useAlphaToCoverage = true;
		this.useColor = params.vertexColors;
		this.useDash = params.dashed;
		this.useWorldUnits = false;

		this.dashOffset = 0;
		this.lineWidth = 1;

		this.lineColorNode = null;

		this.offsetNode = null;
		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setupShaders();

		this.setValues( params );

	}

	setupShaders() {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;
		const useDash = this.dashed;
		const useWorldUnits = this.worldUnits;

		const trimSegment = ( { start, end } ) => {

			const a = cameraProjectionMatrix[ 2 ][ 2 ];
			const b = cameraProjectionMatrix[ 3 ][ 2 ];
			const nearEstimate = b.mul( - 0.5 ).div( a );

			end.xy = nearEstimate.remap( start.z, end.z, start.xy, end.xy );
			end.z = nearEstimate;

		};

		this.vertexNode = tslFn( () => {

			const instanceStart = attribute( 'instanceStart' );
			const instanceEnd = attribute( 'instanceEnd' );

			// camera space

			const start = property( 'vec4', 'start' ); // @TODO: why using `temp` here instead of `property` doesn't work?
			const end = property( 'vec4', 'end' );

			start.assign( modelViewMatrix.mul( instanceStart ) ); // force assignment into correct place in flow
			end.assign( modelViewMatrix.mul( instanceEnd ) );

			if ( useWorldUnits ) {

				vec3().varying( 'worldStart' ).assign( start );
				vec3().varying( 'worldEnd' ).assign( end );

			}

			const aspect = viewport.z.div( viewport.w );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			const perspective = cameraProjectionMatrix[ 2 ][ 3 ].equal( - 1.0 );

			If( perspective, () => {

				If( start.z.lessThan( 0.0 ).and( end.z.greaterThan( 0.0 ) ), () => {

					trimSegment( { start: start, end: end } );

				} ).elseif( end.z.lessThan( 0.0 ).and( start.z.greaterThanEqual( 0.0 ) ), () => {

					trimSegment( { start: end, end: start } );

			 	} );

			} );

			// clip space
			const clipStart = cameraProjectionMatrix.mul( start );
			const clipEnd = cameraProjectionMatrix.mul( end );

			// ndc space
			const ndcStart = clipStart.xyz.div( clipStart.w );
			const ndcEnd = clipEnd.xyz.div( clipEnd.w );

			// direction
			const dir = ndcEnd.xy.sub( ndcStart.xy );

			// account for clip-space aspect ratio
			dir.x.mulAssign( aspect );
			dir.normalizeAssign();

			const clip = vec4().temp();

			if ( useWorldUnits ) {

				// get the offset direction as perpendicular to the view vector
				const worldDir = end.xyz.sub( start.xyz ).normalize();

				const offset = property( 'vec3', 'offset' );

				offset.assign( positionGeometry.y.lessThan( 0.5 ).cond( start.xyz, end.xyz ).cross( worldDir ).normalize() );

				// sign flip
				If( positionGeometry.x.lessThan( 0.0 ), () => offset.negateAssign() );

				const forwardOffset = worldDir.z;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				if ( ! useDash ) {

					// extend the line bounds to encompass endcaps
					const extend = worldDir.mul( materialLineWidth ).mul( 0.5 );
					start.xyz.subAssign( extend );
					end.xyz.addAssign( extend );

					// shift the position of the quad so it hugs the forward edge of the line
					offset.subAssign( dir.mul( forwardOffset ) );
					offset.z.addAssign( 0.5 );

				}

				// endcaps

				If( positionGeometry.y.greaterThan( 1.0 ).or( positionGeometry.y.lessThan( 0.0 ) ), () => {

					offset.addAssign( dir.mul( 2.0 ).mul( forwardOffset ) );

				} );

				// adjust for linewidth
				offset.mulAssign( materialLineWidth, 0.5 );

				// set the world position

				const worldPos = vec4().varying( 'worldPos' );

				worldPos.assign( positionGeometry.y.lessThan( 0.5 ).cond( start, end ) );
				worldPos.xyz.addAssign( offset );

				// project the worldpos
				clip.assign( cameraProjectionMatrix.mul( worldPos ) );

				// shift the depth of the projected points so the line
				// segments overlap neatly
				clip.z = positionGeometry.y.lessThan( 0.5 ).cond( ndcStart.z, ndcEnd.z ).mul( clip.w );

			} else {

				const offset = vec2( dir.y, dir.x.negate() ).temp( 'offset' );

				// undo aspect ratio adjustment
				const invAspect = aspect.reciprocal();
				dir.x.mulAssign( invAspect );
				offset.x.mulAssign( invAspect );

				// sign flip
				If( positionGeometry.x.lessThan( 0.0 ), () => offset.negateAssign() );

				// endcaps
				If( positionGeometry.y.lessThan( 0.0 ), () => {

					offset.subAssign( dir );

				} ).elseif( positionGeometry.y.greaterThan( 1.0 ), () => {

					offset.addAssign( dir );

				} );

				// adjust for linewidth
				offset.mulAssign( materialLineWidth );

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset.divAssign( viewport.w );

				// select end
				clip.assign( positionGeometry.y.lessThan( 0.5 ).cond( clipStart, clipEnd ) );

				// back to clip space
				offset.mulAssign( clip.w );

				clip.xy.addAssign( offset );

			}

			return clip;

		} )();

		const closestLineToLine = tslFn( ( { p1, p2, p3, p4 } ) => {

			const p13 = p1.sub( p3 );
			const p43 = p4.sub( p3 );

			const p21 = p2.sub( p1 );

			const d1343 = p13.dot( p43 );
			const d4321 = p43.dot( p21 );
			const d1321 = p13.dot( p21 );
			const d4343 = p43.dot( p43 );
			const d2121 = p21.dot( p21 );

			const denom = d2121.mul( d4343 ).sub( d4321.mul( d4321 ) );
			const numer = d1343.mul( d4321 ).sub( d1321.mul( d4343 ) );

			const mua = numer.div( denom ).clamp();
			const mub = d1343.add( d4321.mul( mua ) ).div( d4343 ).clamp();

			return vec2( mua, mub );

		} );

		this.colorNode = tslFn( () => {

			if ( useDash ) {

				const offsetNode = float( this.offsetNode || materialLineDashOffset );
				const dashScaleNode = float( this.dashScaleNode || materialLineScale );
				const dashSizeNode = float( this.dashSizeNode || materialLineDashSize );
				const gapSizeNode = float( this.gapSizeNode || materialLineGapSize );

				dashSize.assign( dashSizeNode );
				gapSize.assign( gapSizeNode );

				const instanceDistanceStart = attribute( 'instanceDistanceStart' );
				const instanceDistanceEnd = attribute( 'instanceDistanceEnd' );

				const lineDistance = dashScaleNode.mul( positionGeometry.y.lessThan( 0.5 ).cond( instanceDistanceStart, instanceDistanceEnd ) );

				uv().y.lessThan( - 1.0 ).or( uv().y.greaterThan( 1.0 ) ).discard(); // discard endcaps
				lineDistance.add( offsetNode ).mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard(); // todo - FIX

			}

			// force assignment into correct place in flow
			const alpha = property( 'float', 'alpha' );
			alpha.assign( 1 );

			if ( useWorldUnits && ! useDash ) {

				const worldStart = vec3().varying( 'worldStart' );
				const worldEnd = vec3().varying( 'worldEnd' );

				// Find the closest points on the view ray and the line segment
				const rayEnd = vec4().varying( 'worldPos' ).xyz.normalize().mul( 1e5 );
				const params = closestLineToLine( { p1: worldStart, p2: worldEnd, p3: 0.0, p4: rayEnd } );

				const p1 = params.x.mix( worldStart, worldEnd );
				const p2 = params.y.mul( rayEnd );
				const norm = p1.distance( p2 ).div( materialLineWidth );

				if ( useAlphaToCoverage ) {

					const dnorm = norm.fwidth();
					alpha.assign( norm.smoothstep( dnorm.negate().add( 0.5 ), dnorm.add( 0.5 ) ).oneMinus() );

				} else {

					norm.greaterThan( 0.5 ).discard();

				}

			} else if ( ! useWorldUnits ) {

				// round endcaps

				if ( useAlphaToCoverage ) {

					const len2 = uv().add( uv().y.greaterThan( 0.0 ).cond( vec2( 0.0, - 1.0 ), vec2( 0.0, 1.0 ) ) ).length();

					// force assignment out of following 'if' statement - to avoid uniform control flow errors
					const dlen = property( 'float', 'dlen' );
					dlen.assign( len2.fwidth() );

					If( uv().y.abs().greaterThan( 1.0 ), () => {

						alpha.assign( len2.smoothstep( dlen.oneMinus(), dlen.add( 1 ) ).oneMinus() );

					} );

				} else {

					If( uv().y.abs().greaterThan( 1.0 ), () => {

						const len2 = uv().add( uv().y.greaterThan( 0.0 ).cond( vec2( 0.0, - 1.0 ), vec2( 0.0, 1.0 ) ) ).length();

						len2.greaterThan( 1.0 ).discard();

					} );

				}

			}

			let lineColorNode;

			if ( this.lineColorNode ) {

				lineColorNode = this.lineColorNode;

			} else {

				if ( useColor ) {

					const instanceColorStart = attribute( 'instanceColorStart' );
					const instanceColorEnd = attribute( 'instanceColorEnd' );

					lineColorNode = positionGeometry.y.lessThan( 0.5 ).cond( instanceColorStart, instanceColorEnd ).varying();

				} else {

					lineColorNode = materialColor;

				}

			}

			return vec4( lineColorNode, alpha );

		} )();

		this.needsUpdate = true;

	}


	get worldUnits() {

		return this.useWorldUnits;

	}

	set worldUnits( value ) {

		if ( this.useWorldUnits !== value ) {

			this.useWorldUnits = value;
			this.setupShaders();

		}

	}


	get dashed() {

		return this.useDash;

	}

	set dashed( value ) {

		if ( this.useDash !== value ) {

			this.useDash = value;
			this.setupShaders();

		}

	}


	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.setupShaders();

		}

	}

}

export default Line2NodeMaterial;

addNodeMaterial( 'Line2NodeMaterial', Line2NodeMaterial );
