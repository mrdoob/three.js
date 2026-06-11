import NodeMaterial from './NodeMaterial.js';
import { dashSize, diffuseColor, gapSize, varyingProperty } from '../../nodes/core/PropertyNode.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialLineScale, materialLineDashSize, materialLineGapSize, materialLineDashOffset, materialLineWidth } from '../../nodes/accessors/MaterialNode.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { mix, smoothstep } from '../../nodes/math/MathNode.js';
import { Fn, float, vec2, vec3, vec4, If } from '../../nodes/tsl/TSLBase.js';
import { uv } from '../../nodes/accessors/UV.js';
import { screenDPR, viewport } from '../../nodes/display/ScreenNode.js';
import { viewportOpaqueMipTexture } from '../../nodes/display/ViewportTextureNode.js';

import { LineDashedMaterial } from '../LineDashedMaterial.js';
import { NoBlending } from '../../constants.js';
import { warnOnce } from '../../utils.js';

const _defaultValues = /*@__PURE__*/ new LineDashedMaterial();

/**
 * Varying node representing the world position of the segment start in view space.
 * Used for distance and coordinate calculations across the fragment shader.
 * @type {VaryingNode<vec3>}
 */
const worldStart = varyingProperty( 'vec3', 'worldStart' );

/**
 * Varying node representing the world position of the segment end in view space.
 * Used for distance and coordinate calculations across the fragment shader.
 * @type {VaryingNode<vec3>}
 */
const worldEnd = varyingProperty( 'vec3', 'worldEnd' );

/**
 * Varying node representing the accumulated distance along the line.
 * Crucial for correctly computing dashed line intervals in fragment stage.
 * @type {VaryingNode<float>}
 */
const lineDistance = varyingProperty( 'float', 'lineDistance' );

/**
 * Varying node representing the interpolated world/view position of the current fragment.
 * Used for line/ray distance checks under perspective projection.
 * @type {VaryingNode<vec4>}
 */
const worldPos = varyingProperty( 'vec4', 'worldPos' );

/**
 * Trims the line segment to avoid rendering behind the camera near plane.
 * Computes an interpolation factor (alpha) to clamp the segment's coordinate.
 *
 * @param {Object} inputs
 * @param {Node<vec4>} inputs.start - Segment start position in view space.
 * @param {Node<vec4>} inputs.end - Segment end position in view space.
 * @returns {Node<float>} The interpolation factor (alpha) to trim the segment.
 */
const trimSegmentAlpha = Fn( ( { start, end } ) => {

	const a = cameraProjectionMatrix.element( 2 ).element( 2 ); // 3nd entry in 3th column
	const b = cameraProjectionMatrix.element( 3 ).element( 2 ); // 3nd entry in 4th column

	// we need different nearEstimate formula for reversed and default depth buffer
	// a is positive with a reversed depth buffer so it can be used for controlling the code flow

	const nearEstimate = a.greaterThan( 0 ).select( b.negate().div( a.add( 1 ) ), b.mul( - 0.5 ).div( a ) );

	return nearEstimate.sub( start.z ).div( end.z.sub( start.z ) );

}, { start: 'vec4', end: 'vec4', return: 'float' } );

/**
 * Calculates the closest points on two 3D lines.
 * Used for perspective-correct line rendering and coordinates interpolation.
 *
 * @param {Object} inputs
 * @param {Node<vec3>} inputs.p1 - Start of line 1.
 * @param {Node<vec3>} inputs.p2 - End of line 1.
 * @param {Node<vec3>} inputs.p3 - Start of line 2.
 * @param {Node<vec3>} inputs.p4 - End of line 2.
 * @returns {Node<vec2>} A vec2 containing the parametric coordinates (mua, mub) of the closest points on line 1 and line 2.
 */
const closestLineToLine = Fn( ( { p1, p2, p3, p4 } ) => {

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

}, { p1: 'vec3', p2: 'vec3', p3: 'vec3', p4: 'vec3', return: 'vec2' } );

/**
 * TSL node acting as a custom Model-View-Projection (MVP) for fat lines,
 * expanding 3D segments into screen/world-facing ribbons of a specified width.
 *
 * @tsl
 * @type {Node<vec4>}
 */
const mvpLine = Fn( ( { material } ) => {

	const useDash = material._useDash;
	const useWorldUnits = material._useWorldUnits;

	const instanceStart = attribute( 'instanceStart' );
	const instanceEnd = attribute( 'instanceEnd' );

	// camera space

	const start = vec4( modelViewMatrix.mul( vec4( instanceStart, 1.0 ) ) ).toVar( 'start' );
	const end = vec4( modelViewMatrix.mul( vec4( instanceEnd, 1.0 ) ) ).toVar( 'end' );

	let distanceStart, distanceEnd;

	if ( useDash ) {

		distanceStart = float( attribute( 'instanceDistanceStart' ) ).toVar( 'distanceStart' );
		distanceEnd = float( attribute( 'instanceDistanceEnd' ) ).toVar( 'distanceEnd' );

	}

	if ( useWorldUnits ) {

		worldStart.assign( start.xyz );
		worldEnd.assign( end.xyz );

	}

	const aspect = viewport.z.div( viewport.w );

	// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
	// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
	// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
	// perhaps there is a more elegant solution -- WestLangley

	const perspective = cameraProjectionMatrix.element( 2 ).element( 3 ).equal( - 1.0 ); // 4th entry in the 3rd column

	If( perspective, () => {

		If( start.z.lessThan( 0.0 ).and( end.z.greaterThan( 0.0 ) ), () => {

			const alpha = trimSegmentAlpha( { start, end } );
			end.assign( vec4( mix( start.xyz, end.xyz, alpha ), end.w ) );

			if ( useDash ) {

				distanceEnd.assign( mix( distanceStart, distanceEnd, alpha ) );

			}

		} ).ElseIf( end.z.lessThan( 0.0 ).and( start.z.greaterThanEqual( 0.0 ) ), () => {

			const alpha = trimSegmentAlpha( { start: end, end: start } );
			start.assign( vec4( mix( end.xyz, start.xyz, alpha ), start.w ) );

			if ( useDash ) {

				distanceStart.assign( mix( distanceEnd, distanceStart, alpha ) );

			}

		} );

	} );

	if ( useDash ) {

		const dashScaleNode = material.dashScaleNode ? float( material.dashScaleNode ) : materialLineScale;
		const offsetNode = material.offsetNode ? float( material.offsetNode ) : materialLineDashOffset;

		let lineDist = positionGeometry.y.lessThan( 0.5 ).select( dashScaleNode.mul( distanceStart ), dashScaleNode.mul( distanceEnd ) );
		lineDist = lineDist.add( offsetNode );

		lineDistance.assign( lineDist );

	}

	// clip space
	const clipStart = cameraProjectionMatrix.mul( start );
	const clipEnd = cameraProjectionMatrix.mul( end );

	// ndc space
	const ndcStart = clipStart.xyz.div( clipStart.w );
	const ndcEnd = clipEnd.xyz.div( clipEnd.w );

	// direction
	const dir = ndcEnd.xy.sub( ndcStart.xy ).toVar();

	// account for clip-space aspect ratio
	dir.x.assign( dir.x.mul( aspect ) );
	dir.assign( dir.normalize() );

	const clip = vec4().toVar();

	if ( useWorldUnits ) {

		// get the offset direction as perpendicular to the view vector

		const worldDir = end.xyz.sub( start.xyz ).normalize();
		const tmpFwd = mix( start.xyz, end.xyz, 0.5 ).normalize();
		const worldUp = worldDir.cross( tmpFwd ).normalize();
		const worldFwd = worldDir.cross( worldUp );

		worldPos.assign( positionGeometry.y.lessThan( 0.5 ).select( start, end ) );

		// height offset
		const hw = materialLineWidth.mul( 0.5 );
		worldPos.addAssign( vec4( positionGeometry.x.lessThan( 0.0 ).select( worldUp.mul( hw ), worldUp.mul( hw ).negate() ), 0 ) );

		// don't extend the line if we're rendering dashes because we
		// won't be rendering the endcaps
		if ( ! useDash ) {

			// cap extension
			worldPos.addAssign( vec4( positionGeometry.y.lessThan( 0.5 ).select( worldDir.mul( hw ).negate(), worldDir.mul( hw ) ), 0 ) );

			// add width to the box
			worldPos.addAssign( vec4( worldFwd.mul( hw ), 0 ) );

			// endcaps
			If( positionGeometry.y.greaterThan( 1.0 ).or( positionGeometry.y.lessThan( 0.0 ) ), () => {

				worldPos.subAssign( vec4( worldFwd.mul( 2.0 ).mul( hw ), 0 ) );

			} );

		}

		// project the worldpos
		clip.assign( cameraProjectionMatrix.mul( worldPos ) );

		// shift the depth of the projected points so the line
		// segments overlap neatly
		const clipPose = vec3().toVar();

		clipPose.assign( positionGeometry.y.lessThan( 0.5 ).select( ndcStart, ndcEnd ) );
		clip.z.assign( clipPose.z.mul( clip.w ) );

	} else {

		const offset = vec2( dir.y, dir.x.negate() ).toVar( 'offset' );

		// undo aspect ratio adjustment
		dir.x.assign( dir.x.div( aspect ) );
		offset.x.assign( offset.x.div( aspect ) );

		// sign flip
		offset.assign( positionGeometry.x.lessThan( 0.0 ).select( offset.negate(), offset ) );

		// endcaps
		If( positionGeometry.y.lessThan( 0.0 ), () => {

			offset.assign( offset.sub( dir ) );

		} ).ElseIf( positionGeometry.y.greaterThan( 1.0 ), () => {

			offset.assign( offset.add( dir ) );

		} );

		// adjust for linewidth
		offset.assign( offset.mul( materialLineWidth ) );

		// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
		offset.assign( offset.div( viewport.w.div( screenDPR ) ) );

		// select end
		clip.assign( positionGeometry.y.lessThan( 0.5 ).select( clipStart, clipEnd ) );

		// back to clip space
		offset.assign( offset.mul( clip.w ) );

		clip.assign( clip.add( vec4( offset, 0, 0 ) ) );

	}

	return clip;

} )();

/**
 * TSL fragment node that computes the shape/coverage (alpha) of the fat line segment.
 * Handles dash/gap generation, alpha-to-coverage rendering, and round endcaps.
 *
 * @tsl
 * @type {Node<float>}
 */
const alphaLine = Fn( ( { material, renderer } ) => {

	const useAlphaToCoverage = material._useAlphaToCoverage;
	const useDash = material._useDash;
	const useWorldUnits = material._useWorldUnits;

	const vUv = uv();

	if ( useDash ) {

		const dashSizeNode = material.dashSizeNode ? float( material.dashSizeNode ) : materialLineDashSize;
		const gapSizeNode = material.gapSizeNode ? float( material.gapSizeNode ) : materialLineGapSize;

		dashSize.assign( dashSizeNode );
		gapSize.assign( gapSizeNode );

		vUv.y.lessThan( - 1.0 ).or( vUv.y.greaterThan( 1.0 ) ).discard(); // discard endcaps
		lineDistance.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard(); // todo - FIX

	}

	const alpha = float( 1 ).toVar( 'alpha' );

	if ( useWorldUnits ) {

		// Find the closest points on the view ray and the line segment
		const rayEnd = worldPos.xyz.normalize().mul( 1e5 );
		const lineDir = worldEnd.sub( worldStart );
		const params = closestLineToLine( { p1: worldStart, p2: worldEnd, p3: vec3( 0.0, 0.0, 0.0 ), p4: rayEnd } );

		const p1 = worldStart.add( lineDir.mul( params.x ) );
		const p2 = rayEnd.mul( params.y );
		const delta = p1.sub( p2 );
		const len = delta.length();
		const norm = len.div( materialLineWidth );

		if ( ! useDash ) {

			if ( useAlphaToCoverage && renderer.currentSamples > 0 ) {

				const dnorm = norm.fwidth();
				alpha.assign( smoothstep( dnorm.negate().add( 0.5 ), dnorm.add( 0.5 ), norm ).oneMinus() );

			} else {

				norm.greaterThan( 0.5 ).discard();

			}

		}

	} else {

		// round endcaps

		if ( useAlphaToCoverage && renderer.currentSamples > 0 ) {

			const a = vUv.x;
			const b = vUv.y.greaterThan( 0.0 ).select( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );

			const len2 = a.mul( a ).add( b.mul( b ) );

			const dlen = float( len2.fwidth() ).toVar( 'dlen' );

			If( vUv.y.abs().greaterThan( 1.0 ), () => {

				alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

			} );

		} else {

			If( vUv.y.abs().greaterThan( 1.0 ), () => {

				const a = vUv.x;
				const b = vUv.y.greaterThan( 0.0 ).select( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );
				const len2 = a.mul( a ).add( b.mul( b ) );

				len2.greaterThan( 1.0 ).discard();

			} );

		}

	}

	return alpha;

} )();

/**
 * This node material can be used to render lines with a size larger than one
 * by representing them as instanced meshes.
 *
 * @augments NodeMaterial
 */
class Line2NodeMaterial extends NodeMaterial {

	static get type() {

		return 'Line2NodeMaterial';

	}

	/**
	 * Constructs a new node material for wide line rendering.
	 *
	 * @param {Object} [parameters={}] - The configuration parameter.
	 */
	constructor( parameters = {} ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLine2NodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		/**
		 * Whether vertex colors should be used or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.vertexColors = parameters.vertexColors;

		/**
		 * The dash offset.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.dashOffset = 0;

		/**
		 * Defines the offset.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.offsetNode = null;

		/**
		 * Defines the dash scale.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.dashScaleNode = null;

		/**
		 * Defines the dash size.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.dashSizeNode = null;

		/**
		 * Defines the gap size.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.gapSizeNode = null;

		/**
		 * Blending is set to `NoBlending` since transparency
		 * is not supported, yet.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.blending = NoBlending;

		this._useDash = parameters.dashed;
		this._useAlphaToCoverage = true;
		this._useWorldUnits = false;

		this.setValues( parameters );

	}

	/**
	 * Setups the diffuse color of the line material in the fragment stage.
	 * Overrides the base setup to incorporate line/dash rendering and blending.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupDiffuseColor( builder ) {

		super.setupDiffuseColor( builder );

		diffuseColor.a.mulAssign( alphaLine );

		if ( this.vertexColors === true && builder.geometry.hasAttribute( 'instanceColorStart' ) ) {

			const instanceColorStart = attribute( 'instanceColorStart' );
			const instanceColorEnd = attribute( 'instanceColorEnd' );

			const instanceColor = positionGeometry.y.lessThan( 0.5 ).select( instanceColorStart, instanceColorEnd );

			diffuseColor.rgb.mulAssign( instanceColor );

		}

		if ( this.transparent ) {

			diffuseColor.rgb.assign( diffuseColor.rgb.mul( diffuseColor.a ).add( viewportOpaqueMipTexture().rgb.mul( diffuseColor.a.oneMinus() ) ) );

		}

	}

	/**
	 * Setups the position in clip space for the vertex stage of the fat line.
	 * Overrides the default model-view-projection to return the expanded fat line vertex coordinates.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec4>} The position of the fat line vertex in clip space.
	 */
	setupModelViewProjection( /*builder*/ ) {

		return mvpLine;

	}

	/**
	 * Defines the lines color.
	 *
	 * @deprecated since r185. Use {@link NodeMaterial#colorNode} instead.
	 * @type {?Node<vec3>}
	 */
	get lineColorNode() {

		return this.colorNode;

	}

	set lineColorNode( value ) {

		warnOnce( 'Line2NodeMaterial: "lineColorNode" has been deprecated. Use "colorNode" instead.' ); // @deprecated r185

		this.colorNode = value;

	}

	/**
	 * Whether the lines should sized in world units or not.
	 * When set to `false` the unit is pixel.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get worldUnits() {

		return this._useWorldUnits;

	}

	set worldUnits( value ) {

		if ( this._useWorldUnits !== value ) {

			this._useWorldUnits = value;
			this.needsUpdate = true;

		}

	}

	/**
	 * Whether the lines should be dashed or not.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get dashed() {

		return this._useDash;

	}

	set dashed( value ) {

		if ( this._useDash !== value ) {

			this._useDash = value;
			this.needsUpdate = true;

		}

	}

	/**
	 * Whether alpha to coverage should be used or not.
	 *
	 * @type {boolean}
	 * @default true
	 */
	get alphaToCoverage() {

		return this._useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this._useAlphaToCoverage !== value ) {

			this._useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

}

export default Line2NodeMaterial;
