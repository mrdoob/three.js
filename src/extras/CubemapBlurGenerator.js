import { BackSide, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, LinearSRGBColorSpace, NoBlending } from '../constants.js';
import { BoxGeometry } from '../geometries/BoxGeometry.js';
import { CubeCamera } from '../cameras/CubeCamera.js';
import { floorPowerOfTwo } from '../math/MathUtils.js';
import { Mesh } from '../objects/Mesh.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { ShaderLib } from '../renderers/shaders/ShaderLib.js';
import { copyFragment, blurFragment, sphereFragment } from '../renderers/shaders/ShaderLib/cubemapBlur.glsl.js';
import { WebGLCubeRenderTarget } from '../renderers/WebGLCubeRenderTarget.js';

// sharp copy of the environment, its mip chain feeds the blur
const SOURCE_SIZE = 256;
const SUPERSAMPLING = 4;

// the blurred cube map is sized so sigma spans 1.5 to 3 of its texels, down to this size
const SIGMA_TEXELS = 3;
const MIN_SIZE = 16;

// taps at the source texel spacing cover 3.5 sigma, the source level has twice the target's size where available
const TAP_RADIUS = 12;

// the smallest size blurs too wide for a tangent plane and sums every texel of this source level instead
const SPHERE_SOURCE_SIZE = 32;

/**
 * Blurs an environment map with an angular Gaussian into a cube map, the way a real
 * blur of the background would look. The result is sized to the blur: from 256 faces
 * for the finest blur down to 16 for the average of the whole map.
 *
 * The renderer uses it for {@link Scene#backgroundBlurriness}.
 *
 * @private
 */
class CubemapBlurGenerator {

	/**
	 * Constructs a new cubemap blur generator.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		this._renderer = renderer;
		this._cache = new WeakMap();
		this._mesh = new Mesh( new BoxGeometry( 5, 5, 5 ), null );
		this._cubeCamera = new CubeCamera( 1, 10, null );

		this._source = null;
		this._sourceTexture = null;
		this._sourceVersion = - 1;

		this._copyMaterial = null;
		this._blurMaterial = null;
		this._sphereMaterial = null;

	}

	/**
	 * Blurs an equirectangular or cube texture. Blurriness `1 / 9` gives a
	 * sigma of 0.9 degrees, every further `1 / 9` doubles it up to the average of the whole
	 * map at `1`, below `1 / 9` the blur ramps down to sharp.
	 *
	 * @param {Texture} texture - The environment texture.
	 * @param {number} blurriness - The blurriness in the range `[0,1]`.
	 * @param {?WebGLCubeRenderTarget} [renderTarget=null] - A previous result to update, replaced when its size does not fit.
	 * @return {WebGLCubeRenderTarget} The cube render target with the blurred environment.
	 */
	fromTexture( texture, blurriness, renderTarget = null ) {

		const renderer = this._renderer;

		const { size, sigma } = _getBlurParameters( blurriness );

		if ( renderTarget !== null && renderTarget.width !== size ) {

			renderTarget.dispose();
			renderTarget = null;

		}

		const target = renderTarget || _createTarget( size );
		const cache = this._cache;
		let entry = cache.get( target );

		if ( entry !== undefined && entry.texture === texture && entry.pmremVersion === texture.pmremVersion && entry.sigma === sigma ) return target;

		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		this._copy( texture );
		this._blur( target, sigma );

		renderer.autoClear = autoClear;

		if ( entry === undefined ) {

			entry = {};
			cache.set( target, entry );

			target.addEventListener( 'dispose', function onDispose( event ) {

				cache.delete( event.target );
				event.target.removeEventListener( 'dispose', onDispose );

			} );

		}

		entry.texture = texture;
		entry.pmremVersion = texture.pmremVersion;
		entry.sigma = sigma;

		return target;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.
	 */
	dispose() {

		if ( this._source !== null ) this._source.dispose();
		if ( this._copyMaterial !== null ) this._copyMaterial.dispose();
		if ( this._blurMaterial !== null ) this._blurMaterial.dispose();
		if ( this._sphereMaterial !== null ) this._sphereMaterial.dispose();

		this._mesh.geometry.dispose();

	}

	// private interface

	_copy( texture ) {

		if ( this._sourceTexture === texture && this._sourceVersion === texture.pmremVersion ) return;

		if ( this._source === null ) this._source = _createTarget( SOURCE_SIZE, true );

		if ( this._copyMaterial === null ) this._copyMaterial = _createCopyMaterial();

		const uniforms = this._copyMaterial.uniforms;

		uniforms.envMap.value = texture;
		uniforms.flipEnvMap.value = ( texture.isCubeTexture && texture.isRenderTargetTexture === false ) ? - 1 : 1;

		this._render( this._copyMaterial, this._source );

		this._sourceTexture = texture;
		this._sourceVersion = texture.pmremVersion;

	}

	_blur( target, sigma ) {

		const size = target.width;
		const sourceSize = Math.min( 2 * size, SOURCE_SIZE );

		// tap spacing is the source texel angle at the face center
		const spacing = 2 / sourceSize;

		let material;

		if ( size > MIN_SIZE ) {

			if ( this._blurMaterial === null ) this._blurMaterial = _createBlurMaterial();

			material = this._blurMaterial;
			material.uniforms.radius.value = TAP_RADIUS * sourceSize / size;
			material.uniforms.level.value = Math.log2( SOURCE_SIZE / sourceSize );
			material.uniforms.spacing.value = spacing;

		} else {

			if ( this._sphereMaterial === null ) this._sphereMaterial = _createSphereMaterial();

			material = this._sphereMaterial;

		}

		material.uniforms.envMap.value = this._source.texture;
		material.uniforms.sigma.value = sigma;

		this._render( material, target );

	}

	_render( material, target ) {

		this._mesh.material = material;
		this._cubeCamera.renderTarget = target;
		this._cubeCamera.update( this._renderer, this._mesh );

	}

}

function _getBlurParameters( blurriness ) {

	const t = blurriness * 9 - 1;
	const sigma = ( t < 0 ? Math.max( t + 1, 0 ) : Math.pow( 2, t ) ) / 64;
	const size = Math.min( Math.max( floorPowerOfTwo( SIGMA_TEXELS * 2 / sigma ), MIN_SIZE ), SOURCE_SIZE );
	const spacing = 2 / Math.min( 2 * size, SOURCE_SIZE );
	const texel = 2 / size;

	// Remove the variance added by source interpolation and cubic reconstruction.
	const bakeSigma = Math.max( Math.sqrt( Math.max( sigma * sigma - texel * texel / 3 - spacing * spacing / 6, 0 ) ), 0.25 * texel );

	return { size, sigma: Math.fround( bakeSigma ) };

}

function _createTarget( size, mipmaps = false ) {

	return new WebGLCubeRenderTarget( size, {
		type: HalfFloatType,
		colorSpace: LinearSRGBColorSpace,
		minFilter: mipmaps ? LinearMipmapLinearFilter : LinearFilter,
		magFilter: LinearFilter,
		generateMipmaps: mipmaps,
		depthBuffer: false
	} );

}

function _createMaterial( name, defines, uniforms, fragmentShader ) {

	return new ShaderMaterial( {

		name: name,
		defines: defines,
		uniforms: uniforms,
		vertexShader: ShaderLib.cube.vertexShader,
		fragmentShader: fragmentShader,
		side: BackSide,
		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

}

function _createCopyMaterial() {

	const material = _createMaterial( 'CubemapBlurCopy', { 'SUPERSAMPLING': SUPERSAMPLING }, {

		'envMap': { value: null },
		'flipEnvMap': { value: 1 }

	}, copyFragment );

	// Expose cube sources so the renderer selects the cubemap shader.
	Object.defineProperty( material, 'envMap', {

		get: function () {

			const texture = this.uniforms.envMap.value;

			return ( texture !== null && texture.isCubeTexture ) ? texture : null;

		}

	} );

	return material;

}

function _createBlurMaterial() {

	return _createMaterial( 'CubemapBlur', {}, {

		'envMap': { value: null },
		'sigma': { value: 0 },
		'level': { value: 0 },
		'spacing': { value: 0 },
		'radius': { value: 0 }

	}, blurFragment );

}

function _createSphereMaterial() {

	return _createMaterial( 'CubemapBlurSphere', { 'SIZE': SPHERE_SOURCE_SIZE, 'LEVEL': Math.log2( SOURCE_SIZE / SPHERE_SOURCE_SIZE ) + '.0' }, {

		'envMap': { value: null },
		'sigma': { value: 0 }

	}, sphereFragment );

}

export { CubemapBlurGenerator };
