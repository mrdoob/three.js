import NodeMaterial from '../../../materials/nodes/NodeMaterial.js';
import CubeRenderTarget from '../CubeRenderTarget.js';
import { resetRendererState, restoreRendererState } from '../RendererUtils.js';
import { CubeCamera } from '../../../cameras/CubeCamera.js';
import { floorPowerOfTwo } from '../../../math/MathUtils.js';
import { Mesh } from '../../../objects/Mesh.js';
import { BoxGeometry } from '../../../geometries/BoxGeometry.js';
import { CubeTexture } from '../../../textures/CubeTexture.js';
import { uniform } from '../../../nodes/core/UniformNode.js';
import { property } from '../../../nodes/core/PropertyNode.js';
import { texture } from '../../../nodes/accessors/TextureNode.js';
import { cubeTexture } from '../../../nodes/accessors/CubeTextureNode.js';
import { positionWorldDirection } from '../../../nodes/accessors/Position.js';
import { equirectUV } from '../../../nodes/utils/EquirectUV.js';
import { Fn, If, float, vec2, vec3, vec4 } from '../../../nodes/tsl/TSLBase.js';
import { abs, acos, atan, clamp, cross, dot, exp, inverseSqrt, normalize, sqrt, dFdx, dFdy } from '../../../nodes/math/MathNode.js';
import { select } from '../../../nodes/math/ConditionalNode.js';
import { Loop } from '../../../nodes/utils/LoopNode.js';
import { BackSide, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, LinearSRGBColorSpace, NoBlending } from '../../../constants.js';

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

const _defaultCubeTexture = /*@__PURE__*/ new CubeTexture();
_defaultCubeTexture.isRenderTargetTexture = true;

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
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		this._renderer = renderer;
		this._cache = new WeakMap();
		this._mesh = new Mesh( new BoxGeometry( 5, 5, 5 ), null );
		this._cubeCamera = new CubeCamera( 1, 10, null );

		this._source = null;
		this._sourceTexture = null;
		this._sourceVersion = - 1;

		this._copyPass = null;
		this._nodeCopyPass = null;
		this._blurPass = null;
		this._spherePass = null;
		this._rendererState = {};

	}

	/**
	 * Blurs an equirectangular or cube texture. Blurriness `1 / 9` gives a
	 * sigma of 0.9 degrees, every further `1 / 9` doubles it up to the average of the whole
	 * map at `1`, below `1 / 9` the blur ramps down to sharp.
	 *
	 * @param {Texture} texture - The environment texture.
	 * @param {number} blurriness - The blurriness in the range `[0,1]`.
	 * @param {?CubeRenderTarget} [renderTarget=null] - A previous result to update, replaced when its size does not fit.
	 * @return {CubeRenderTarget} The cube render target with the blurred environment.
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

		const currentMRT = renderer.getMRT();
		const autoClear = renderer.autoClear;

		renderer.setMRT( null );
		renderer.autoClear = false;

		this._copy( texture );
		this._blur( target, sigma );

		renderer.setMRT( currentMRT );
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
	 * Captures and blurs an environment texture node on every call.
	 *
	 * @param {TextureNode} textureNode - The environment texture node.
	 * @param {number} amount - The blur amount in the range `[0,1]`.
	 * @param {?CubeRenderTarget} [renderTarget=null] - A previous result to update.
	 * @param {?ContextNode} [contextNode=null] - The input's shared context.
	 * @return {CubeRenderTarget} The blurred environment.
	 */
	fromNode( textureNode, amount, renderTarget = null, contextNode = null ) {

		const { size, sigma } = _getBlurParameters( amount );

		if ( renderTarget !== null && renderTarget.width !== size ) {

			renderTarget.dispose();
			renderTarget = null;

		}

		const target = renderTarget || _createTarget( size );
		const renderer = this._renderer;
		const entry = this._cache.get( target );

		if ( entry !== undefined ) entry.texture = null;
		this._sourceTexture = null;
		this._sourceVersion = - 1;

		resetRendererState( renderer, this._rendererState );
		renderer.autoClear = false;

		try {

			this._initSource();

			let pass = this._nodeCopyPass;

			if ( pass === null || pass.textureNode !== textureNode || pass.texture !== textureNode.value || pass.material.contextNode !== contextNode ) {

				if ( pass !== null ) pass.material.dispose();

				pass = this._nodeCopyPass = _createNodeCopyPass( textureNode, contextNode );

			}

			this._render( pass.material, this._source );
			this._blur( target, sigma );

		} finally {

			restoreRendererState( renderer, this._rendererState );

		}

		return target;

	}

	/**
	 * Frees the generator's internal resources. Output targets are owned by the caller.
	 */
	dispose() {

		if ( this._source !== null ) this._source.dispose();
		if ( this._copyPass !== null ) this._copyPass.material.dispose();
		if ( this._nodeCopyPass !== null ) this._nodeCopyPass.material.dispose();
		if ( this._blurPass !== null ) this._blurPass.material.dispose();
		if ( this._spherePass !== null ) this._spherePass.material.dispose();

		this._mesh.geometry.dispose();

	}

	// private interface

	_initSource() {

		if ( this._source === null ) {

			this._source = _createTarget( SOURCE_SIZE, true );

			// allocate the mip chain now, CubeCamera renders all but the last face with mipmaps off
			this._renderer.initRenderTarget( this._source );

		}

	}

	_copy( texture ) {

		if ( this._sourceTexture === texture && this._sourceVersion === texture.pmremVersion ) return;

		this._initSource();

		// the sampler node bakes the source type and orientation into the shader
		let pass = this._copyPass;

		if ( pass === null || pass.texture !== texture ) {

			if ( pass !== null ) pass.material.dispose();

			pass = this._copyPass = _createCopyPass( texture );

		}

		this._render( pass.material, this._source );

		this._sourceTexture = texture;
		this._sourceVersion = texture.pmremVersion;

	}

	_blur( target, sigma ) {

		const size = target.width;
		const sourceSize = Math.min( 2 * size, SOURCE_SIZE );

		// tap spacing is the source texel angle at the face center
		const spacing = 2 / sourceSize;

		let pass;

		if ( size > MIN_SIZE ) {

			if ( this._blurPass === null ) this._blurPass = _createBlurPass();

			pass = this._blurPass;
			pass.radius.value = TAP_RADIUS * sourceSize / size;
			pass.level.value = Math.log2( SOURCE_SIZE / sourceSize );
			pass.spacing.value = spacing;

		} else {

			if ( this._spherePass === null ) this._spherePass = _createSpherePass();

			pass = this._spherePass;

		}

		pass.envMap.value = this._source.texture;
		pass.sigma.value = sigma;

		this._render( pass.material, target );

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

	return new CubeRenderTarget( size, {
		type: HalfFloatType,
		colorSpace: LinearSRGBColorSpace,
		minFilter: mipmaps ? LinearMipmapLinearFilter : LinearFilter,
		magFilter: LinearFilter,
		generateMipmaps: mipmaps,
		depthBuffer: false
	} );

}

function _createMaterial( name ) {

	const material = new NodeMaterial();
	material.name = name;
	material.side = BackSide;
	material.blending = NoBlending;
	material.depthTest = false;
	material.depthWrite = false;

	return material;

}

function _createCopyPass( sourceTexture ) {

	// one sampler node for all taps
	const direction = property( 'vec3', 'sampleDirection' );

	const envMap = sourceTexture.isCubeTexture === true
		? cubeTexture( sourceTexture, direction, 0 )
		: texture( sourceTexture, equirectUV( direction ), 0 );

	return { material: _createCopyMaterial( envMap, direction ), texture: sourceTexture };

}

function _createNodeCopyPass( textureNode, contextNode ) {

	const direction = property( 'vec3', 'sampleDirection' );
	const sourceTexture = textureNode.value;
	const uvNode = sourceTexture.isCubeTexture === true ? direction : equirectUV( direction );

	let envMap = textureNode.sample( uvNode );

	if ( envMap.levelNode === null && envMap.biasNode === null && envMap.gradNode === null ) {

		envMap = envMap.level( 0 );

	}

	envMap.setUpdateMatrix( textureNode.updateMatrix );

	const material = _createCopyMaterial( envMap, direction );
	material.contextNode = contextNode;
	material.fragmentNode = material.fragmentNode.context( { forceUVContext: false } );

	return { material, texture: sourceTexture, textureNode };

}

function _createCopyMaterial( envMap, direction ) {

	const material = _createMaterial( 'CubemapBlurCopy' );

	material.fragmentNode = Fn( () => {

		// Supersample to preserve energy in small HDR highlights.
		const dx = dFdx( positionWorldDirection ).div( SUPERSAMPLING ).toVar();
		const dy = dFdy( positionWorldDirection ).div( SUPERSAMPLING ).toVar();
		const origin = positionWorldDirection.sub( dx.add( dy ).mul( 0.5 * ( SUPERSAMPLING - 1 ) ) ).toVar();

		const color = vec3( 0.0 ).toVar();

		Loop( SUPERSAMPLING, SUPERSAMPLING, ( { i, j } ) => {

			direction.assign( normalize( origin.add( dx.mul( float( i ) ) ).add( dy.mul( float( j ) ) ) ) );

			color.addAssign( envMap.rgb );

		} );

		return vec4( color.div( SUPERSAMPLING * SUPERSAMPLING ), 1.0 );

	} )();

	return material;

}

function _createBlurPass() {

	const envMap = cubeTexture( _defaultCubeTexture );
	const sigma = uniform( 0 );
	const level = uniform( 0 );
	const spacing = uniform( 0 );
	const radius = uniform( 0, 'int' );

	const material = _createMaterial( 'CubemapBlur' );

	material.fragmentNode = Fn( () => {

		const direction = positionWorldDirection;

		const up = select( abs( direction.z ).lessThan( 0.999 ), vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 0.0, 0.0 ) );
		const tangent = normalize( cross( up, direction ) ).toVar();
		const bitangent = cross( direction, tangent ).toVar();

		const k = float( - 0.5 ).div( sigma.mul( sigma ) ).toVar();

		const color = vec3( 0.0 ).toVar();
		const weightSum = float( 0.0 ).toVar();

		// Weight tangent-plane taps by angular Gaussian and solid angle.
		// Uniform bounds prevent loop unrolling.
		const range = { start: radius.negate(), end: radius, condition: '<=' };

		Loop( range, { start: 0, end: radius, condition: '<=' }, ( { i, j } ) => {

			const offset = vec2( float( i ), float( j ) ).mul( spacing ).toVar();
			const r2 = dot( offset, offset ).toVar();

			const theta = atan( sqrt( r2 ) );
			const weight = exp( k.mul( theta.mul( theta ) ) ).mul( inverseSqrt( r2.add( 1.0 ).pow( 3.0 ) ) ).toVar();

			const tap = direction.add( tangent.mul( offset.x ) ).add( bitangent.mul( offset.y ) );

			color.addAssign( envMap.sample( tap ).level( level ).rgb.mul( weight ) );
			weightSum.addAssign( weight );

			// Mirrored taps share Gaussian and solid angle weights.
			If( j.greaterThan( 0 ), () => {

				const mirroredTap = direction.add( tangent.mul( offset.x ) ).sub( bitangent.mul( offset.y ) );
				color.addAssign( envMap.sample( mirroredTap ).level( level ).rgb.mul( weight ) );
				weightSum.addAssign( weight );

			} );

		} );

		return vec4( color.div( weightSum ), 1.0 );

	} )();

	return { material, envMap, sigma, level, spacing, radius };

}

function _createSpherePass() {

	const envMap = cubeTexture( _defaultCubeTexture );
	const sigma = uniform( 0 );
	const level = Math.log2( SOURCE_SIZE / SPHERE_SOURCE_SIZE );
	const n = SPHERE_SOURCE_SIZE;

	const material = _createMaterial( 'CubemapBlurSphere' );

	material.fragmentNode = Fn( () => {

		const direction = positionWorldDirection;

		const k = float( - 0.5 ).div( sigma.mul( sigma ) ).toVar();

		const color = vec3( 0.0 ).toVar();
		const weightSum = float( 0.0 ).toVar();

		// Pair antipodal samples to reuse angle and solid angle calculations.
		Loop( 3 * n * n, ( { i: t } ) => {

			const axis = t.div( n * n ).toVar();
			const texel = t.sub( axis.mul( n * n ) ).toVar();

			const st = vec2( float( texel.mod( n ) ), float( texel.div( n ) ) ).add( 0.5 ).div( n ).mul( 2.0 ).sub( 1.0 ).toVar();

			const d = select( axis.equal( 0 ), vec3( 1.0, st ), select( axis.equal( 1 ), vec3( st.x, 1.0, st.y ), vec3( st, 1.0 ) ) ).toVar();
			const r2 = dot( d, d ).toVar();
			const solidAngle = inverseSqrt( r2.mul( r2 ).mul( r2 ) ).toVar();

			const theta = acos( clamp( dot( direction, d.mul( inverseSqrt( r2 ) ) ), - 1.0, 1.0 ) ).toVar();
			const weight = exp( k.mul( theta.mul( theta ) ) ).mul( solidAngle ).toVar();

			color.addAssign( envMap.sample( d ).level( level ).rgb.mul( weight ) );
			weightSum.addAssign( weight );

			theta.assign( float( Math.PI ).sub( theta ) );
			weight.assign( exp( k.mul( theta.mul( theta ) ) ).mul( solidAngle ) );

			color.addAssign( envMap.sample( d.negate() ).level( level ).rgb.mul( weight ) );
			weightSum.addAssign( weight );

		} );

		return vec4( color.div( weightSum ), 1.0 );

	} )();

	return { material, envMap, sigma };

}

export default CubemapBlurGenerator;
