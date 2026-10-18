import { CustomBlending, DataTexture, DataUtils, DoubleSide, FloatType, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, Mesh, MeshBasicNodeMaterial, NodeMaterial, NoToneMapping, OneFactor, OrthographicCamera, QuadMesh, RendererUtils, RenderTarget, RGBAFormat, Scene, SRGBColorSpace, Vector2 } from 'three/webgpu';
import { Fn, If, Loop, float, ivec2, materialEmissive, output, screenCoordinate, texture, toneMapping as toneMappingNode, uniform, uv, vec3, vec4 } from 'three/tsl';

let _rendererState;

/**
 * Bakes the diffuse appearance of light mapped meshes into a texture on their light map UVs, so that
 * glTF viewers without light map support show the baked lighting, e.g. with an unlit material
 * (`KHR_materials_unlit`) or with an emissive material. Each texel is the albedo (the color, the map,
 * the vertex colors and the ambient occlusion of the material) times the summed irradiance of the
 * light maps over pi, plus the emission, times the exposure. Metals keep their base color, which
 * approximates their rough reflections of the light. Pass light maps
 * that include the direct light. The base color textures are sampled at the size of the result, so
 * tiling textures blur. With a `toneMapping`, the texels hold the tone mapped radiance, so viewers that
 * show unlit materials without tone mapping match a renderer that tone maps, e.g. the Microsoft 3D
 * Viewer. Viewers that tone map unlit materials, like three.js, then tone map them twice.
 *
 * ```js
 * const { texture } = await bakeUnlitTexture( renderer, meshes, [ lightMapper.texture ], { exposure: renderer.toneMappingExposure } );
 * const material = new MeshBasicMaterial( { map: texture } );
 * ```
 *
 * This function can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { bakeUnlitTexture } from 'three/addons/utils/bakeUnlitTexture.js';
 *
 * @param {WebGPURenderer} renderer - The renderer.
 * @param {Array<Mesh>} meshes - The meshes. Their geometries must provide `uv1`.
 * @param {Array<Texture>} lightMaps - Light maps on `uv1` in lux, their irradiance is summed, e.g. the indirect and the direct light.
 * @param {Object} [options] - The bake options.
 * @param {number} [options.size] - The texture size in texels, the size of the first light map by default.
 * @param {number} [options.exposure=1] - The exposure that scales the radiance.
 * @param {number} [options.samples=16] - The jittered samples per texel, which antialias the base color.
 * @param {boolean} [options.normalize=false] - Whether to divide the radiance by its maximum. Otherwise values above one are clipped.
 * @param {number} [options.toneMapping=NoToneMapping] - The tone mapping applied to the radiance after the exposure, e.g. `renderer.toneMapping`.
 * @return {Promise<{texture: DataTexture, scale: number}>} The sRGB texture on `uv1`, and the scale that restores the radiance.
 */
async function bakeUnlitTexture( renderer, meshes, lightMaps, { size = lightMaps[ 0 ].image.width, exposure = 1, samples = 16, normalize = false, toneMapping = NoToneMapping } = {} ) {

	const floatBlendable = renderer.hasFeature( 'float32-blendable' );
	const accumulation = new RenderTarget( size, size, { type: floatBlendable ? FloatType : HalfFloatType, depthBuffer: false } );
	const resolved = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false } );
	const jitter = uniform( new Vector2() );

	// the light maps are sampled at the texel centers, which are the same texels if the sizes match

	const lightMapUV = screenCoordinate.xy.div( size );
	let irradiance = vec3( 0 );
	for ( const lightMap of lightMaps ) irradiance = irradiance.add( texture( lightMap, lightMapUV ).rgb );

	const scene = new Scene();
	const camera = new OrthographicCamera();
	const materials = new Map();

	for ( const mesh of meshes ) {

		const getMaterial = ( source ) => {

			if ( ! materials.has( source ) ) materials.set( source, createMaterial( source, irradiance, exposure, jitter ) );
			return materials.get( source );

		};

		const proxy = new Mesh( mesh.geometry, Array.isArray( mesh.material ) ? mesh.material.map( getMaterial ) : getMaterial( mesh.material ) );
		mesh.updateWorldMatrix( true, false );
		proxy.matrix.copy( mesh.matrixWorld );
		proxy.matrixAutoUpdate = false;
		proxy.frustumCulled = false;
		scene.add( proxy );

	}

	// normalizes the accumulated samples and fills two texels around the charts, like LightMapper

	const accumulated = texture( accumulation.texture );
	const maxCoord = ivec2( size - 1 );

	const resolve = Fn( () => {

		const coord = ivec2( screenCoordinate.xy );
		const center = accumulated.load( coord ).toVar();
		const sum = vec4( 0 ).toVar();

		If( center.a.equal( 0 ), () => {

			Loop( { start: - 2, end: 2, condition: '<=', name: 'x' }, { start: - 2, end: 2, condition: '<=', name: 'y' }, ( { x, y } ) => {

				const value = accumulated.load( coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxCoord ) );

				If( value.a.greaterThan( 0 ), () => {

					sum.addAssign( vec4( value.rgb.div( value.a ), 1 ) );

				} );

			} );

			center.assign( sum );

		} );

		const radiance = center.rgb.div( center.a.max( 1e-4 ) );

		return toneMapping !== NoToneMapping ? toneMappingNode( toneMapping, float( 1 ), vec4( radiance, 1 ) ) : vec4( radiance, 1 );

	} );

	const resolveMaterial = new NodeMaterial();
	resolveMaterial.fragmentNode = resolve();
	const quad = new QuadMesh( resolveMaterial );

	let data;

	try {

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		try {

			renderer.autoClear = false;
			renderer.setClearColor( 0x000000, 0 );
			renderer.setRenderTarget( accumulation );
			renderer.clear();

			for ( let i = 1; i <= samples; i ++ ) {

				jitter.value.set( halton( i, 2 ) - 0.5, halton( i, 3 ) - 0.5 ).multiplyScalar( 2 / size );
				renderer.render( scene, camera );

			}

			renderer.setRenderTarget( resolved );
			quad.render( renderer );

		} finally {

			RendererUtils.restoreRendererState( renderer, _rendererState );

		}

		data = await renderer.readRenderTargetPixelsAsync( resolved, 0, 0, size, size );

	} finally {

		accumulation.dispose();
		resolved.dispose();
		resolveMaterial.dispose();
		for ( const material of materials.values() ) material.dispose();

	}

	// half floats to sRGB bytes

	const values = new Float32Array( size * size * 3 );
	let scale = 0;

	for ( let i = 0; i < size * size; i ++ ) {

		for ( let c = 0; c < 3; c ++ ) {

			const value = DataUtils.fromHalfFloat( data[ i * 4 + c ] );
			values[ i * 3 + c ] = value;
			scale = Math.max( scale, value );

		}

	}

	scale = normalize && scale > 0 ? scale : 1;

	const bytes = new Uint8Array( size * size * 4 );

	for ( let i = 0; i < size * size; i ++ ) {

		for ( let c = 0; c < 3; c ++ ) {

			const value = Math.min( values[ i * 3 + c ] / scale, 1 );
			bytes[ i * 4 + c ] = Math.round( 255 * ( value <= 0.0031308 ? 12.92 * value : 1.055 * value ** ( 1 / 2.4 ) - 0.055 ) );

		}

		bytes[ i * 4 + 3 ] = 255;

	}

	const result = new DataTexture( bytes, size, size );
	result.colorSpace = SRGBColorSpace;
	result.channel = 1;
	result.magFilter = LinearFilter;
	result.minFilter = LinearMipmapLinearFilter;
	result.generateMipmaps = true;
	result.needsUpdate = true;

	return { texture: result, scale };

}

/**
 * Creates a material that rasterizes meshes in UV space and outputs their diffuse radiance.
 *
 * @private
 * @param {Material} source - The material of the meshes.
 * @param {Node<vec3>} irradiance - The irradiance of the light maps.
 * @param {number} exposure - The exposure.
 * @param {UniformNode<vec2>} jitter - The sub-texel offset.
 * @return {NodeMaterial} The material.
 */
function createMaterial( source, irradiance, exposure, jitter ) {

	const material = new MeshBasicNodeMaterial();
	material.side = DoubleSide;
	material.depthTest = false;
	material.depthWrite = false;

	// additive blending, the sample count accumulates in alpha

	material.blending = CustomBlending;
	material.blendSrc = OneFactor;
	material.blendDst = OneFactor;

	material.vertexNode = vec4( uv( 1 ).flipY().mul( 2 ).sub( 1 ).add( jitter ), 0, 1 );

	// the diffuse albedo, the output of an unlit material without a light map

	if ( source.color !== undefined ) material.color.copy( source.color );
	if ( source.map !== undefined ) material.map = source.map;
	if ( source.vertexColors !== undefined ) material.vertexColors = source.vertexColors;
	if ( source.colorNode ) material.colorNode = source.colorNode;
	if ( source.aoMap !== undefined ) material.aoMap = source.aoMap;
	if ( source.aoMapIntensity !== undefined ) material.aoMapIntensity = source.aoMapIntensity;

	if ( source.isMeshBasicMaterial === true ) {

		material.outputNode = vec4( output.rgb.mul( exposure ), 1 );

	} else {

		// the emission of the source material, read by materialEmissive. It is a vec4 with an emissive map,
		// the alpha would replace the sample count

		let emission = float( 0 );

		if ( source.emissiveNode ) {

			emission = vec3( source.emissiveNode );

		} else if ( source.emissive !== undefined ) {

			material.emissive = source.emissive;
			material.emissiveIntensity = source.emissiveIntensity;
			material.emissiveMap = source.emissiveMap;
			emission = materialEmissive.rgb;

		}

		material.outputNode = vec4( output.rgb.mul( irradiance.div( Math.PI ) ).add( emission ).mul( exposure ), 1 );

	}

	return material;

}

/**
 * Tone maps linear colors with a tone mapping of the renderer, e.g. vertex colors that hold radiance,
 * with the same functions that tone map the rendered images.
 *
 * This function can only be used with {@link WebGPURenderer}.
 *
 * @param {WebGPURenderer} renderer - The renderer.
 * @param {Float32Array} colors - The linear RGB colors, three values per color, with the exposure applied.
 * @param {number} toneMapping - The tone mapping, e.g. `renderer.toneMapping`.
 * @return {Promise<Float32Array>} The tone mapped RGB colors.
 */
async function toneMapColors( renderer, colors, toneMapping ) {

	const count = colors.length / 3;

	if ( toneMapping === NoToneMapping || count === 0 ) return colors.slice();

	const width = Math.min( count, 2048 );
	const height = Math.ceil( count / width );

	const data = new Float32Array( width * height * 4 );
	for ( let i = 0; i < count; i ++ ) data.set( colors.subarray( i * 3, i * 3 + 3 ), i * 4 );

	const source = new DataTexture( data, width, height, RGBAFormat, FloatType );
	source.needsUpdate = true;

	const target = new RenderTarget( width, height, { type: FloatType, depthBuffer: false } );
	const material = new NodeMaterial();
	material.fragmentNode = toneMappingNode( toneMapping, float( 1 ), vec4( texture( source ).load( ivec2( screenCoordinate.xy ) ).rgb, 1 ) );
	const quad = new QuadMesh( material );

	let pixels;

	try {

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		try {

			renderer.setRenderTarget( target );
			quad.render( renderer );

		} finally {

			RendererUtils.restoreRendererState( renderer, _rendererState );

		}

		pixels = await renderer.readRenderTargetPixelsAsync( target, 0, 0, width, height );

	} finally {

		source.dispose();
		target.dispose();
		material.dispose();

	}

	const result = new Float32Array( count * 3 );
	for ( let i = 0; i < count; i ++ ) result.set( pixels.subarray( i * 4, i * 4 + 3 ), i * 3 );

	return result;

}

function halton( index, base ) {

	let result = 0;
	let f = 1;

	while ( index > 0 ) {

		f /= base;
		result += f * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}

export { bakeUnlitTexture, toneMapColors };
