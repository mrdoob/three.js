import { float, vec2, vec4, If, Fn } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { mix, fract, step, max, clamp } from '../math/MathNode.js';
import { add, sub } from '../math/OperatorNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { objectPosition } from '../accessors/Object3DNode.js';
import { positionWorld } from '../accessors/Position.js';

const shadowMaterialLib = /*@__PURE__*/ new WeakMap();

/**
 * A shadow filtering function performing basic filtering. This is in fact an unfiltered version of the shadow map
 * with a binary `[0,1]` result.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @return {Node<float>} The filtering result.
 */
export const BasicShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, depthLayer } ) => {

	let basic = texture( depthTexture, shadowCoord.xy ).label( 't_basic' );

	if ( depthTexture.isDepthArrayTexture ) {

		basic = basic.depth( depthLayer );

	}

	return basic.compare( shadowCoord.z );

} );

/**
 * A shadow filtering function performing PCF filtering.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @param {LightShadow} inputs.shadow - The light shadow.
 * @return {Node<float>} The filtering result.
 */
export const PCFShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow, depthLayer } ) => {

	const depthCompare = ( uv, compare ) => {

		let depth = texture( depthTexture, uv );

		if ( depthTexture.isDepthArrayTexture ) {

			depth = depth.depth( depthLayer );

		}

		return depth.compare( compare );

	};

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );
	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx0 = texelSize.x.negate().mul( radius );
	const dy0 = texelSize.y.negate().mul( radius );
	const dx1 = texelSize.x.mul( radius );
	const dy1 = texelSize.y.mul( radius );
	const dx2 = dx0.div( 2 );
	const dy2 = dy0.div( 2 );
	const dx3 = dx1.div( 2 );
	const dy3 = dy1.div( 2 );

	return add(
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy, shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
	).mul( 1 / 17 );

} );

/**
 * A shadow filtering function performing PCF soft filtering.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @param {LightShadow} inputs.shadow - The light shadow.
 * @return {Node<float>} The filtering result.
 */
export const PCFSoftShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow, depthLayer } ) => {

	const depthCompare = ( uv, compare ) => {

		let depth = texture( depthTexture, uv );

		if ( depthTexture.isDepthArrayTexture ) {

			depth = depth.depth( depthLayer );

		}

		return depth.compare( compare );

	};


	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx = texelSize.x;
	const dy = texelSize.y;

	const uv = shadowCoord.xy;
	const f = fract( uv.mul( mapSize ).add( 0.5 ) );
	uv.subAssign( f.mul( texelSize ) );

	return add(
		depthCompare( uv, shadowCoord.z ),
		depthCompare( uv.add( vec2( dx, 0 ) ), shadowCoord.z ),
		depthCompare( uv.add( vec2( 0, dy ) ), shadowCoord.z ),
		depthCompare( uv.add( texelSize ), shadowCoord.z ),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), 0 ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), 0 ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), dy ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), dy ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( 0, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( 0, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			depthCompare( uv.add( vec2( dx, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.negate() ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.negate() ) ), shadowCoord.z ),
				f.x
			),
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.mul( 2 ) ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.mul( 2 ) ) ), shadowCoord.z ),
				f.x
			),
			f.y
		)
	).mul( 1 / 9 );

} );

/**
 * A shadow filtering function performing VSM filtering.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @return {Node<float>} The filtering result.
 */
export const VSMShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, depthLayer } ) => {

	const occlusion = float( 1 ).toVar();

	let distribution = texture( depthTexture ).sample( shadowCoord.xy );

	if ( depthTexture.isDepthArrayTexture || depthTexture.isDataArrayTexture ) {

		distribution = distribution.depth( depthLayer );

	}

	distribution = distribution.rg;

	const hardShadow = step( shadowCoord.z, distribution.x );

	If( hardShadow.notEqual( float( 1.0 ) ), () => {

		const distance = shadowCoord.z.sub( distribution.x );
		const variance = max( 0, distribution.y.mul( distribution.y ) );
		let softnessProbability = variance.div( variance.add( distance.mul( distance ) ) ); // Chebeyshevs inequality
		softnessProbability = clamp( sub( softnessProbability, 0.3 ).div( 0.95 - 0.3 ) );
		occlusion.assign( clamp( max( hardShadow, softnessProbability ) ) );

	} );

	return occlusion;

} );

//

const linearDistance = /*@__PURE__*/ Fn( ( [ position, cameraNear, cameraFar ] ) => {

	let dist = positionWorld.sub( position ).length();
	dist = dist.sub( cameraNear ).div( cameraFar.sub( cameraNear ) );
	dist = dist.saturate(); // clamp to [ 0, 1 ]

	return dist;

} );

const linearShadowDistance = ( light ) => {

	const camera = light.shadow.camera;

	const nearDistance = reference( 'near', 'float', camera ).setGroup( renderGroup );
	const farDistance = reference( 'far', 'float', camera ).setGroup( renderGroup );

	const referencePosition = objectPosition( light );

	return linearDistance( referencePosition, nearDistance, farDistance );

};

/**
 * Retrieves or creates a shadow material for the given light source.
 *
 * This function checks if a shadow material already exists for the provided light.
 * If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it
 * in the `shadowMaterialLib` for future use.
 *
 * @param {Light} light - The light source for which the shadow material is needed.
 *                         If the light is a point light, a depth node is calculated
 *                         using the linear shadow distance.
 * @returns {NodeMaterial} The shadow material associated with the given light.
 */
export const getShadowMaterial = ( light ) => {

	let material = shadowMaterialLib.get( light );

	if ( material === undefined ) {

		const depthNode = light.isPointLight ? linearShadowDistance( light ) : null;

		material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.depthNode = depthNode;
		material.isShadowPassMaterial = true; // Use to avoid other overrideMaterial override material.colorNode unintentionally when using material.shadowNode
		material.name = 'ShadowMaterial';
		material.fog = false;

		shadowMaterialLib.set( light, material );

	}

	return material;

};
