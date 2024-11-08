import ShadowNode from './ShadowNode.js';
import { uniform } from '../core/UniformNode.js';
import { float, vec2, vec3, If, Fn, nodeObject } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { mix, max, abs, sign } from '../math/MathNode.js';
import { sub, div, mul } from '../math/OperatorNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

export const cubeToUV = /*@__PURE__*/ Fn( ( [ v_immutable, texelSizeY_immutable ] ) => {

	const texelSizeY = float( texelSizeY_immutable ).toVar();
	const v = vec3( v_immutable ).toVar();
	const absV = vec3( abs( v ) ).toVar();
	const scaleToCube = float( div( 1.0, max( absV.x, max( absV.y, absV.z ) ) ) ).toVar();
	absV.mulAssign( scaleToCube );
	v.mulAssign( scaleToCube.mul( sub( 1.0, mul( 2.0, texelSizeY ) ) ) );
	const planar = vec2( v.xy ).toVar();
	const almostATexel = float( mul( 1.5, texelSizeY ) ).toVar();
	const almostOne = float( sub( 1.0, almostATexel ) ).toVar();

	If( absV.z.greaterThanEqual( almostOne ), () => {

		If( v.z.greaterThan( 0.0 ), () => {

			planar.x.assign( sub( 4.0, v.x ) );

		} );

	} ).ElseIf( absV.x.greaterThanEqual( almostOne ), () => {

		const signX = float( sign( v.x ) ).toVar();
		planar.x.assign( v.z.mul( signX ).add( mul( 2.0, signX ) ) );

	} ).ElseIf( absV.y.greaterThanEqual( almostOne ), () => {

		const signY = float( sign( v.y ) ).toVar();
		planar.x.assign( v.x.add( mul( 2.0, signY ) ).add( 2.0 ) );
		planar.y.assign( v.z.mul( signY ).sub( 2.0 ) );

	} );

	return vec2( 0.125, 0.25 ).mul( planar ).add( vec2( 0.375, 0.75 ) );

} ).setLayout( {
	name: 'cubeToUV',
	type: 'vec2',
	inputs: [
		{ name: 'v', type: 'vec3' },
		{ name: 'texelSizeY', type: 'float' }
	]
} );

const BasicShadowMap = Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const lightToPosition = shadowCoord.xyz.toVar();
	const lightToPositionLength = lightToPosition.length();

	const cameraNearLocal = uniform( 'float' ).onRenderUpdate( () => shadow.camera.near );
	const cameraFarLocal = uniform( 'float' ).onRenderUpdate( () => shadow.camera.far );
	const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );
	const mapSize = uniform( shadow.mapSize ).setGroup( renderGroup );

	const result = float( 1.0 ).toVar();

	If( lightToPositionLength.sub( cameraFarLocal ).lessThanEqual( 0.0 ).and( lightToPositionLength.sub( cameraNearLocal ) ), () => {

		const dp = lightToPositionLength.sub( cameraNearLocal ).div( cameraFarLocal.sub( cameraNearLocal ) ).toVar();
		dp.addAssign( bias );

		const bd3D = lightToPosition.normalize();
		const texelSize = vec2( 1.0 ).div( mapSize.mul( vec2( 4.0, 2.0 ) ) );

		const uv = cubeToUV( bd3D, texelSize.y ).flipY();

		const dpRemap = dp.add( 1 ).div( 2 ); // unchecked

		result.assign( texture( depthTexture, uv ).compare( dpRemap ).select( 1, 0 ) );

	} );

	return mix( 1.0, result, 1 );

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

	setupShadowCoord( builder, shadowPosition ) {

		return shadowPosition;

	}

	setupShadowFilter( builder, { filterFn, depthTexture, shadowCoord, shadow } ) {

		return BasicShadowMap( { depthTexture, shadowCoord, shadow } );

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

		renderer.autoClear = false;
		renderer.setClearColor( 0xffffff, 1 );
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
			//shadowMap.scissor.copy( _viewport );
			//shadowMap.scissorTest = true;

			shadow.updateMatrices( light, vp );

			renderer.render( scene, shadow.camera );

		}

		//

		renderer.autoClear = previousAutoClear;

	}

}

export default PointShadowNode;

export const pointShadow = ( light, shadow ) => nodeObject( new PointShadowNode( light, shadow ) );
