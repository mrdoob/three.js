import { BackSide, BasicLightMapNode, DoubleSide, IrradianceNode, LightingNode, PhysicalLightingModel } from 'three/webgpu';
import { BRDF_GGX, Fn, attribute, cameraViewMatrix, cos, dot, faceDirection, length, materialLightMap, materialReference, normalView, normalViewGeometry, roughness, sin, specularColorBlended, specularF90, uv, vec2, vec4 } from 'three/tsl';

// the instanced attributes of KHR_lightmap that place the light map UVs of each instance in the atlas

const INSTANCE_ATTRIBUTES = [ '_LIGHTMAP_SCALE', '_LIGHTMAP_ROTATION', '_LIGHTMAP_OFFSET', '_LIGHTMAP_INTENSITY' ];

/**
 * Adds the irradiance of a directional light map to the lighting context. A directional light
 * map stores the dominant direction of the incident light next to the irradiance, e.g. the
 * {@link LightMapper#directionTexture}, so that normal maps show under baked light.
 *
 * The irradiance is re-evaluated for the shaded normal `n` with the half-Lambert rebalancing of
 * directional light maps in Unity: `E( n ) = E * ( dot( n, d ) * 0.5 + 0.5 ) / ( dot( n0, d ) * 0.5 + 0.5 )`,
 * where `d` is the dominant direction scaled by its directionality, not a unit vector, and `n0` the
 * vertex normal the light map was baked for. Unity stores the denominator as the rebalancing
 * coefficient, here it follows from the vertex normal, so flat surfaces keep the baked irradiance.
 *
 * The optional specular term treats the dominant direction as a light, with the directionality's
 * share of the irradiance, so baked lights keep a highlight on physical materials. The lobe of the
 * incident light is a von Mises-Fisher distribution with the directionality as its mean resultant
 * length, which widens the specular lobe of light from many directions.
 *
 * @augments LightingNode
 */
class DirectionalLightMapNode extends LightingNode {

	static get type() {

		return 'DirectionalLightMapNode';

	}

	/**
	 * Constructs a new directional light map node.
	 *
	 * @param {Node<vec3>} lightMapNode - The irradiance of the light map.
	 * @param {Node<vec4>} directionNode - The encoded dominant directions, `direction = rgb * 2 - 1` in world space.
	 * @param {?Node<float>} [specularIntensityNode=null] - The scale of the specular term, `null` leaves it out.
	 */
	constructor( lightMapNode, directionNode, specularIntensityNode = null ) {

		super();

		/**
		 * The irradiance of the light map.
		 *
		 * @type {Node<vec3>}
		 */
		this.lightMapNode = lightMapNode;

		/**
		 * The encoded dominant directions.
		 *
		 * @type {Node<vec4>}
		 */
		this.directionNode = directionNode;

		/**
		 * The scale of the specular term, `null` leaves it out.
		 *
		 * @type {?Node<float>}
		 */
		this.specularIntensityNode = specularIntensityNode;

	}

	setup( builder ) {

		const { context, material } = builder;

		// the dominant direction in view space, scaled by its directionality

		const direction = cameraViewMatrix.mul( vec4( this.directionNode.rgb.mul( 2 ).sub( 1 ), 0 ) ).xyz.toVar();

		// the light map holds the irradiance of the side the light mapper baked, the front of double-sided
		// materials. The normals are turned to that side

		const normal = material.side === DoubleSide ? normalView.mul( faceDirection ) : normalView;
		const geometryNormal = ( material.side === BackSide ? normalViewGeometry.negate() : normalViewGeometry ).toVar();

		const halfLambert = ( n ) => dot( n, direction ).mul( 0.5 ).add( 0.5 );
		const irradiance = this.lightMapNode.mul( halfLambert( normal ).div( halfLambert( geometryNormal ).max( 1e-4 ) ) ).toVar();

		context.irradiance.addAssign( irradiance );

		if ( this.specularIntensityNode === null || context.lightingModel instanceof PhysicalLightingModel === false ) return;

		const directionality = length( direction ).toVar();
		const lightDirection = direction.div( directionality.max( 1e-4 ) ).toVar();

		// a directional light that adds the directionality's share of the irradiance at the geometric normal

		const lightColor = this.lightMapNode.mul( directionality ).div( dot( geometryNormal, lightDirection ).max( 0.125 ) );

		// the concentration of the incident lobe from its mean resultant length, see "Clustering on the Unit
		// Hypersphere using von Mises-Fisher Distributions" (Banerjee et al., 2005). Convolved with the GGX
		// lobe as spherical Gaussians, it adds 1 / ( 2 * kappa ) to the squared GGX alpha

		const w2 = directionality.mul( directionality ).min( 0.9999 );
		const spread = w2.oneMinus().div( directionality.mul( w2.oneMinus().add( 2 ) ).mul( 2 ).max( 1e-4 ) );
		const specularRoughness = roughness.max( 0.045 ).pow( 4 ).add( spread ).min( 1 ).sqrt().sqrt();

		const dotNL = dot( normalView, lightDirection ).clamp();
		const specular = BRDF_GGX( { lightDirection, f0: specularColorBlended, f90: specularF90, roughness: specularRoughness } );

		context.reflectedLight.directSpecular.addAssign( lightColor.mul( dotNL ).mul( specular ).mul( context.lightingModel.multiScatteringCompensation ).mul( this.specularIntensityNode ) );

	}

}

/**
 * Shades the light map of a material with a directional light map, e.g. the
 * {@link LightMapper#directionTexture} of a directional bake, so that normal maps show under baked
 * light. The direction texture must share the UV channel and transform of `material.lightMap`.
 * It is kept in `material.lightMapDirection`, which {@link GLTFLightMapExporterExtension} exports,
 * and the scale of the specular term in `material.lightMapSpecularIntensity`. Both can change later,
 * but a change of the intensity from or to zero needs `material.needsUpdate`. The material uses
 * {@link DirectionalLightMapNode} through an override of `setupLightMap()`, unlit materials keep
 * their light map. The override is the one of {@link instancedLightMap}, so instanced meshes look both
 * textures up in the atlas regions of their instances.
 *
 * ```js
 * material.lightMap = lightMapper.texture;
 * directionalLightMap( material, lightMapper.directionTexture );
 * ```
 *
 * @param {Material} material - The light-mapped material, a node material or one that converts to one.
 * @param {?Texture} directionTexture - The dominant directions, `null` restores the default light map.
 * @param {Object} [options] - The options.
 * @param {number} [options.specularIntensity=1] - The scale of the approximate specular term, 0 leaves it out.
 */
function directionalLightMap( material, directionTexture, { specularIntensity = 1 } = {} ) {

	if ( directionTexture === null ) {

		delete material.lightMapDirection;
		delete material.lightMapSpecularIntensity;
		if ( material.lightMapInstances !== true ) delete material.setupLightMap;

	} else {

		material.lightMapDirection = directionTexture;
		material.lightMapSpecularIntensity = specularIntensity;
		material.setupLightMap = setupLightMap;

	}

	material.needsUpdate = true;

}

/**
 * Makes a material look its light map up in the atlas region of each instance of instanced meshes,
 * e.g. unwrapped by {@link unwrapUVs}, see {@link lightMapUV}, and scales it by the instanced attribute
 * `_LIGHTMAP_INTENSITY` of `KHR_lightmap`. The texture transform of the light map applies before the
 * one of the instances, like in `KHR_lightmap`. It works with {@link directionalLightMap}, in any order.
 * Clones of the material need another call.
 *
 * ```js
 * material.lightMap = lightMapper.texture;
 * instancedLightMap( material );
 * ```
 *
 * @param {Material} material - The material of instanced meshes, a node material or one that converts to one.
 * @return {Material} The material.
 */
function instancedLightMap( material ) {

	material.lightMapInstances = true;
	material.setupLightMap = setupLightMap;
	material.needsUpdate = true;

	return material;

}

/**
 * Returns the light map UVs of the rendered mesh, `uv1` by default, mapped into the atlas region of each
 * instance by the instanced attributes `_LIGHTMAP_SCALE`, `_LIGHTMAP_ROTATION` and `_LIGHTMAP_OFFSET` of
 * `KHR_lightmap`, which {@link unwrapUVs} generates for instanced meshes. Without them, the UVs are
 * returned as they are.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} [uvNode=uv(1)] - The light map UVs of the geometry.
 * @return {Node<vec2>} The light map UVs of the instance.
 */
const lightMapUV = ( uvNode = uv( 1 ) ) => Fn( ( builder ) => {

	const geometry = builder.geometry;

	let node = uvNode;

	if ( geometry?.hasAttribute( '_LIGHTMAP_SCALE' ) ) node = node.mul( attribute( '_LIGHTMAP_SCALE', 'vec2' ) );

	if ( geometry?.hasAttribute( '_LIGHTMAP_ROTATION' ) ) {

		const angle = attribute( '_LIGHTMAP_ROTATION', 'float' );
		node = vec2( node.x.mul( cos( angle ) ).sub( node.y.mul( sin( angle ) ) ), node.x.mul( sin( angle ) ).add( node.y.mul( cos( angle ) ) ) );

	}

	if ( geometry?.hasAttribute( '_LIGHTMAP_OFFSET' ) ) node = node.add( attribute( '_LIGHTMAP_OFFSET', 'vec2' ) );

	return node;

}, 'vec2' )();

/**
 * Returns a texture of the material, sampled at the light map UVs of the instance. The texture
 * transform applies first, like the binding transform of `KHR_lightmap`.
 *
 * @private
 * @param {string} property - The material property of the texture.
 * @return {Node<vec4>} The texture sample.
 */
function instanceTexture( property ) {

	return materialReference( property, 'texture' ).context( {
		getUV: ( textureNode ) => {

			const uvNode = lightMapUV( textureNode.getTransformedUV( textureNode.getDefaultUV() ) );

			// this reference is not shared, its texture is transformed once
			textureNode.setUpdateMatrix( false );

			return uvNode;

		}
	} );

}

/**
 * The `setupLightMap()` override of {@link directionalLightMap} and {@link instancedLightMap}. The
 * textures and the intensity are material references, so that materials which share a shader keep
 * their own.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @return {?LightingNode} The light map node.
 */
function setupLightMap( builder ) {

	const { lightMap, lightMapDirection, lightMapSpecularIntensity } = builder.material;
	const geometry = builder.geometry;
	const instanced = INSTANCE_ATTRIBUTES.some( ( name ) => geometry?.hasAttribute( name ) );
	const directional = Boolean( lightMapDirection ) && this.isMeshBasicNodeMaterial !== true;

	if ( ! lightMap || ( instanced === false && directional === false ) ) return this.constructor.prototype.setupLightMap.call( this, builder );

	let lightMapNode = instanced ? instanceTexture( 'lightMap' ).rgb.mul( materialReference( 'lightMapIntensity', 'float' ) ) : materialLightMap;

	if ( geometry?.hasAttribute( '_LIGHTMAP_INTENSITY' ) ) lightMapNode = lightMapNode.mul( attribute( '_LIGHTMAP_INTENSITY', 'float' ) );

	if ( directional ) {

		const specularIntensity = lightMapSpecularIntensity > 0 ? materialReference( 'lightMapSpecularIntensity', 'float' ) : null;
		const directionNode = instanced ? instanceTexture( 'lightMapDirection' ) : materialReference( 'lightMapDirection', 'texture' );

		return new DirectionalLightMapNode( lightMapNode, directionNode, specularIntensity );

	}

	return this.isMeshBasicNodeMaterial === true ? new BasicLightMapNode( lightMapNode ) : new IrradianceNode( lightMapNode );

}

export { DirectionalLightMapNode, directionalLightMap, instancedLightMap, lightMapUV };
