import ShadowNode from './ShadowNode.js';
import { uniform } from '../core/UniformNode.js';
import { float, vec2, If, Fn, nodeObject } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { max, abs, sign } from '../math/MathNode.js';
import { sub, div } from '../math/OperatorNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';
import { Color } from '../../math/Color.js';
import { BasicShadowMap } from '../../constants.js';

const _clearColor = /*@__PURE__*/ new Color();

// cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D
// vector suitable for 2D texture mapping. This code uses the following layout for the
// 2D texture:
//
// xzXZ
//  y Y
//
// Y - Positive y direction
// y - Negative y direction
// X - Positive x direction
// x - Negative x direction
// Z - Positive z direction
// z - Negative z direction
//
// Source and test bed:
// https://gist.github.com/tschw/da10c43c467ce8afd0c4

export const cubeToUV = /*@__PURE__*/ Fn( ( [ pos, texelSizeY ] ) => {

	const v = pos.toVar();

	// Number of texels to avoid at the edge of each square

	const absV = abs( v );

	// Intersect unit cube

	const scaleToCube = div( 1.0, max( absV.x, max( absV.y, absV.z ) ) );
	absV.mulAssign( scaleToCube );

	// Apply scale to avoid seams

	// two texels less per square (one texel will do for NEAREST)
	v.mulAssign( scaleToCube.mul( texelSizeY.mul( 2 ).oneMinus() ) );

	// Unwrap

	// space: -1 ... 1 range for each square
	//
	// #X##		dim    := ( 4 , 2 )
	//  # #		center := ( 1 , 1 )

	const planar = vec2( v.xy ).toVar();

	const almostATexel = texelSizeY.mul( 1.5 );
	const almostOne = almostATexel.oneMinus();

	If( absV.z.greaterThanEqual( almostOne ), () => {

		If( v.z.greaterThan( 0.0 ), () => {

			planar.x.assign( sub( 4.0, v.x ) );

		} );

	} ).ElseIf( absV.x.greaterThanEqual( almostOne ), () => {

		const signX = sign( v.x );
		planar.x.assign( v.z.mul( signX ).add( signX.mul( 2.0 ) ) );

	} ).ElseIf( absV.y.greaterThanEqual( almostOne ), () => {

		const signY = sign( v.y );
		planar.x.assign( v.x.add( signY.mul( 2.0 ) ).add( 2.0 ) );
		planar.y.assign( v.z.mul( signY ).sub( 2.0 ) );

	} );

	// Transform to UV space

	// scale := 0.5 / dim
	// translate := ( center + 0.5 ) / dim
	return vec2( 0.125, 0.25 ).mul( planar ).add( vec2( 0.375, 0.75 ) ).flipY();

} ).setLayout( {
	name: 'cubeToUV',
	type: 'vec2',
	inputs: [
		{ name: 'pos', type: 'vec3' },
		{ name: 'texelSizeY', type: 'float' }
	]
} );

export const BasicPointShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, bd3D, dp, texelSize } ) => {

	return texture( depthTexture, cubeToUV( bd3D, texelSize.y ) ).compare( dp );

} );

export const PointShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, bd3D, dp, texelSize, shadow } ) => {

	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );
	const offset = vec2( - 1.0, 1.0 ).mul( radius ).mul( texelSize.y );

	return texture( depthTexture, cubeToUV( bd3D.add( offset.xyy ), texelSize.y ) ).compare( dp )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.yyy ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.xyx ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.yyx ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D, texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.xxy ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.yxy ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.xxx ), texelSize.y ) ).compare( dp ) )
		.add( texture( depthTexture, cubeToUV( bd3D.add( offset.yxx ), texelSize.y ) ).compare( dp ) )
		.mul( 1.0 / 9.0 );

} );

const pointShadowFilter = /*@__PURE__*/ Fn( ( { filterFn, depthTexture, shadowCoord, shadow } ) => {

	// for point lights, the uniform @vShadowCoord is re-purposed to hold
	// the vector from the light to the world-space position of the fragment.
	const lightToPosition = shadowCoord.xyz.toVar();
	const lightToPositionLength = lightToPosition.length();

	const cameraNearLocal = uniform( 'float' ).setGroup( renderGroup ).onRenderUpdate( () => shadow.camera.near );
	const cameraFarLocal = uniform( 'float' ).setGroup( renderGroup ).onRenderUpdate( () => shadow.camera.far );
	const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );
	const mapSize = uniform( shadow.mapSize ).setGroup( renderGroup );

	const result = float( 1.0 ).toVar();

	If( lightToPositionLength.sub( cameraFarLocal ).lessThanEqual( 0.0 ).and( lightToPositionLength.sub( cameraNearLocal ).greaterThanEqual( 0.0 ) ), () => {

		// dp = normalized distance from light to fragment position
		const dp = lightToPositionLength.sub( cameraNearLocal ).div( cameraFarLocal.sub( cameraNearLocal ) ).toVar(); // need to clamp?
		dp.addAssign( bias );

		// bd3D = base direction 3D
		const bd3D = lightToPosition.normalize();
		const texelSize = vec2( 1.0 ).div( mapSize.mul( vec2( 4.0, 2.0 ) ) );

		// percentage-closer filtering
		result.assign( filterFn( { depthTexture, bd3D, dp, texelSize, shadow } ) );

	} );

	return result;

} );

const _viewport = /*@__PURE__*/ new Vector4();
const _viewportSize = /*@__PURE__*/ new Vector2();
const _shadowMapSize = /*@__PURE__*/ new Vector2();

//

class PointShadowNode extends ShadowNode {

	static get type() {

		return 'PointShadowNode';

	}

	constructor( light, shadow = null ) {

		super( light, shadow );

	}

	getShadowFilterFn( type ) {

		return type === BasicShadowMap ? BasicPointShadowFilter : PointShadowFilter;

	}

	setupShadowCoord( builder, shadowPosition ) {

		return shadowPosition;

	}

	setupShadowFilter( builder, { filterFn, shadowTexture, depthTexture, shadowCoord, shadow } ) {

		return pointShadowFilter( { filterFn, shadowTexture, depthTexture, shadowCoord, shadow } );

	}

	renderShadow( frame ) {

		const { shadow, shadowMap, light } = this;
		const { renderer, scene } = frame;

		const shadowFrameExtents = shadow.getFrameExtents();

		_shadowMapSize.copy( shadow.mapSize );
		_shadowMapSize.multiply( shadowFrameExtents );

		shadowMap.setSize( _shadowMapSize.width, _shadowMapSize.height );

		_viewportSize.copy( shadow.mapSize );

		//

		const previousAutoClear = renderer.autoClear;

		const previousClearColor = renderer.getClearColor( _clearColor );
		const previousClearAlpha = renderer.getClearAlpha();

		renderer.autoClear = false;
		renderer.setClearColor( shadow.clearColor, shadow.clearAlpha );
		renderer.clear();

		const viewportCount = shadow.getViewportCount();

		for ( let vp = 0; vp < viewportCount; vp ++ ) {

			const viewport = shadow.getViewport( vp );

			const x = _viewportSize.x * viewport.x;
			const y = _shadowMapSize.y - _viewportSize.y - ( _viewportSize.y * viewport.y );

			_viewport.set(
				x,
				y,
				_viewportSize.x * viewport.z,
				_viewportSize.y * viewport.w
			);

			shadowMap.viewport.copy( _viewport );

			shadow.updateMatrices( light, vp );

			renderer.render( scene, shadow.camera );

		}

		//

		renderer.autoClear = previousAutoClear;
		renderer.setClearColor( previousClearColor, previousClearAlpha );

	}

}

export default PointShadowNode;

export const pointShadow = ( light, shadow ) => nodeObject( new PointShadowNode( light, shadow ) );
