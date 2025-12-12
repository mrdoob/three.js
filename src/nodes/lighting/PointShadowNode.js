import ShadowNode from './ShadowNode.js';
import { uniform } from '../core/UniformNode.js';
import { float, vec3, If, Fn } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector3 } from '../../math/Vector3.js';
import { Color } from '../../math/Color.js';
import { BasicShadowMap, LessCompare, WebGPUCoordinateSystem } from '../../constants.js';
import { CubeDepthTexture } from '../../textures/CubeDepthTexture.js';
import { screenCoordinate } from '../display/ScreenNode.js';
import { interleavedGradientNoise, vogelDiskSample } from '../utils/PostProcessingUtils.js';
import { abs, normalize, cross } from '../math/MathNode.js';

const _clearColor = /*@__PURE__*/ new Color();
const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

// Cube map face directions and up vectors for point light shadows
// Face order: +X, -X, +Y, -Y, +Z, -Z
// WebGPU coordinate system - Y faces swapped to match texture sampling convention
const _cubeDirectionsWebGPU = [
	/*@__PURE__*/ new Vector3( 1, 0, 0 ), /*@__PURE__*/ new Vector3( - 1, 0, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ),
	/*@__PURE__*/ new Vector3( 0, 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 )
];

const _cubeUpsWebGPU = [
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 ),
	/*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 )
];

// WebGL coordinate system - standard OpenGL convention
const _cubeDirectionsWebGL = [
	/*@__PURE__*/ new Vector3( 1, 0, 0 ), /*@__PURE__*/ new Vector3( - 1, 0, 0 ), /*@__PURE__*/ new Vector3( 0, 1, 0 ),
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 )
];

const _cubeUpsWebGL = [
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ),
	/*@__PURE__*/ new Vector3( 0, 0, - 1 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 )
];

export const BasicPointShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, bd3D, dp } ) => {

	return cubeTexture( depthTexture, bd3D ).compare( dp );

} );

/**
 * A shadow filtering function for point lights using Vogel disk sampling and IGN.
 *
 * Uses 5 samples distributed via Vogel disk pattern in tangent space around the
 * sample direction, rotated per-pixel using Interleaved Gradient Noise (IGN).
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {CubeDepthTexture} inputs.depthTexture - A reference to the shadow cube map.
 * @param {Node<vec3>} inputs.bd3D - The normalized direction from light to fragment.
 * @param {Node<float>} inputs.dp - The depth value to compare against.
 * @param {LightShadow} inputs.shadow - The light shadow.
 * @return {Node<float>} The filtering result.
 */
export const PointShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, bd3D, dp, shadow } ) => {

	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );
	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

	const texelSize = radius.div( mapSize.x );

	// Build a tangent-space coordinate system for applying offsets
	const absDir = abs( bd3D );
	const tangent = normalize( cross( bd3D, absDir.x.greaterThan( absDir.z ).select( vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) ) ) );
	const bitangent = cross( bd3D, tangent );

	// Use IGN to rotate sampling pattern per pixel (phi = IGN * 2π)
	const phi = interleavedGradientNoise( screenCoordinate.xy ).mul( 6.28318530718 );

	// 5 samples using Vogel disk distribution in tangent space
	const sample0 = vogelDiskSample( 0, 5, phi );
	const sample1 = vogelDiskSample( 1, 5, phi );
	const sample2 = vogelDiskSample( 2, 5, phi );
	const sample3 = vogelDiskSample( 3, 5, phi );
	const sample4 = vogelDiskSample( 4, 5, phi );

	return cubeTexture( depthTexture, bd3D.add( tangent.mul( sample0.x ).add( bitangent.mul( sample0.y ) ).mul( texelSize ) ) ).compare( dp )
		.add( cubeTexture( depthTexture, bd3D.add( tangent.mul( sample1.x ).add( bitangent.mul( sample1.y ) ).mul( texelSize ) ) ).compare( dp ) )
		.add( cubeTexture( depthTexture, bd3D.add( tangent.mul( sample2.x ).add( bitangent.mul( sample2.y ) ).mul( texelSize ) ) ).compare( dp ) )
		.add( cubeTexture( depthTexture, bd3D.add( tangent.mul( sample3.x ).add( bitangent.mul( sample3.y ) ).mul( texelSize ) ) ).compare( dp ) )
		.add( cubeTexture( depthTexture, bd3D.add( tangent.mul( sample4.x ).add( bitangent.mul( sample4.y ) ).mul( texelSize ) ) ).compare( dp ) )
		.mul( 1.0 / 5.0 );

} );

const pointShadowFilter = /*@__PURE__*/ Fn( ( { filterFn, depthTexture, shadowCoord, shadow } ) => {

	// for point lights, the uniform @vShadowCoord is re-purposed to hold
	// the vector from the light to the world-space position of the fragment.
	const lightToPosition = shadowCoord.xyz.toVar();
	const lightToPositionLength = lightToPosition.length();

	const cameraNearLocal = uniform( 'float' ).setGroup( renderGroup ).onRenderUpdate( () => shadow.camera.near );
	const cameraFarLocal = uniform( 'float' ).setGroup( renderGroup ).onRenderUpdate( () => shadow.camera.far );
	const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );

	const result = float( 1.0 ).toVar();

	If( lightToPositionLength.sub( cameraFarLocal ).lessThanEqual( 0.0 ).and( lightToPositionLength.sub( cameraNearLocal ).greaterThanEqual( 0.0 ) ), () => {

		// dp = normalized distance from light to fragment position
		const dp = lightToPositionLength.sub( cameraNearLocal ).div( cameraFarLocal.sub( cameraNearLocal ) ).toVar(); // need to clamp?
		dp.addAssign( bias );

		// bd3D = base direction 3D (direction from light to fragment)
		const bd3D = lightToPosition.normalize();

		// percentage-closer filtering using cube texture sampling
		result.assign( filterFn( { depthTexture, bd3D, dp, shadow } ) );

	} );

	return result;

} );


/**
 * Represents the shadow implementation for point light nodes.
 *
 * @augments ShadowNode
 */
class PointShadowNode extends ShadowNode {

	static get type() {

		return 'PointShadowNode';

	}

	/**
	 * Constructs a new point shadow node.
	 *
	 * @param {PointLight} light - The shadow casting point light.
	 * @param {?PointLightShadow} [shadow=null] - An optional point light shadow.
	 */
	constructor( light, shadow = null ) {

		super( light, shadow );

	}

	/**
	 * Overwrites the default implementation to return point light shadow specific
	 * filtering functions.
	 *
	 * @param {number} type - The shadow type.
	 * @return {Function} The filtering function.
	 */
	getShadowFilterFn( type ) {

		return type === BasicShadowMap ? BasicPointShadowFilter : PointShadowFilter;

	}

	/**
	 * Overwrites the default implementation so the unaltered shadow position is used.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Node<vec3>} shadowPosition - A node representing the shadow position.
	 * @return {Node<vec3>} The shadow coordinates.
	 */
	setupShadowCoord( builder, shadowPosition ) {

		return shadowPosition;

	}

	/**
	 * Overwrites the default implementation to only use point light specific
	 * shadow filter functions.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Object} inputs - A configuration object that defines the shadow filtering.
	 * @param {Function} inputs.filterFn - This function defines the filtering type of the shadow map e.g. PCF.
	 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's depth texture.
	 * @param {Node<vec3>} inputs.shadowCoord - Shadow coordinates which are used to sample from the shadow map.
	 * @param {LightShadow} inputs.shadow - The light shadow.
	 * @return {Node<float>} The result node of the shadow filtering.
	 */
	setupShadowFilter( builder, { filterFn, depthTexture, shadowCoord, shadow } ) {

		return pointShadowFilter( { filterFn, depthTexture, shadowCoord, shadow } );

	}

	/**
	 * Overwrites the default implementation to create a CubeRenderTarget with CubeDepthTexture.
	 *
	 * @param {LightShadow} shadow - The light shadow object.
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Object} An object containing the shadow map and depth texture.
	 */
	setupRenderTarget( shadow, builder ) {

		const depthTexture = new CubeDepthTexture( shadow.mapSize.width );
		depthTexture.name = 'PointShadowDepthTexture';
		depthTexture.compareFunction = LessCompare;

		const shadowMap = builder.createCubeRenderTarget( shadow.mapSize.width );
		shadowMap.texture.name = 'PointShadowMap';
		shadowMap.depthTexture = depthTexture;

		return { shadowMap, depthTexture };

	}

	/**
	 * Overwrites the default implementation with point light specific
	 * rendering code.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	renderShadow( frame ) {

		const { shadow, shadowMap, light } = this;
		const { renderer, scene } = frame;

		const camera = shadow.camera;
		const shadowMatrix = shadow.matrix;

		// Select cube directions/ups based on coordinate system
		const isWebGPU = renderer.coordinateSystem === WebGPUCoordinateSystem;
		const cubeDirections = isWebGPU ? _cubeDirectionsWebGPU : _cubeDirectionsWebGL;
		const cubeUps = isWebGPU ? _cubeUpsWebGPU : _cubeUpsWebGL;

		shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.width );

		//

		const previousAutoClear = renderer.autoClear;

		const previousClearColor = renderer.getClearColor( _clearColor );
		const previousClearAlpha = renderer.getClearAlpha();

		renderer.autoClear = false;
		renderer.setClearColor( shadow.clearColor, shadow.clearAlpha );

		// Render each cube face
		for ( let face = 0; face < 6; face ++ ) {

			// Set render target to the specific cube face
			renderer.setRenderTarget( shadowMap, face );
			renderer.clear();

			// Update shadow camera matrices for this face

			const far = light.distance || camera.far;

			if ( far !== camera.far ) {

				camera.far = far;
				camera.updateProjectionMatrix();

			}

			_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
			camera.position.copy( _lightPositionWorld );

			_lookTarget.copy( camera.position );
			_lookTarget.add( cubeDirections[ face ] );
			camera.up.copy( cubeUps[ face ] );
			camera.lookAt( _lookTarget );
			camera.updateMatrixWorld();

			shadowMatrix.makeTranslation( - _lightPositionWorld.x, - _lightPositionWorld.y, - _lightPositionWorld.z );

			_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			shadow._frustum.setFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

			//

			const currentSceneName = scene.name;

			scene.name = `Point Light Shadow [ ${ light.name || 'ID: ' + light.id } ] - Face ${ face + 1 }`;

			renderer.render( scene, camera );

			scene.name = currentSceneName;

		}

		//

		renderer.autoClear = previousAutoClear;
		renderer.setClearColor( previousClearColor, previousClearAlpha );

	}

}

export default PointShadowNode;

/**
 * TSL function for creating an instance of `PointShadowNode`.
 *
 * @tsl
 * @function
 * @param {PointLight} light - The shadow casting point light.
 * @param {?PointLightShadow} [shadow=null] - An optional point light shadow.
 * @return {PointShadowNode} The created point shadow node.
 */
export const pointShadow = ( light, shadow ) => new PointShadowNode( light, shadow );
