import TempNode from '../core/TempNode.js';
import { addNodeElement, tslFn, nodeObject, float, vec4, int } from '../shadernode/ShaderNode.js';
import { mix, smoothstep } from '../math/MathNode.js';
import { luminance } from './ColorAdjustmentNode.js';
import { uniform } from '../core/UniformNode.js';
import { uniforms } from '../accessors/UniformsNode.js';
import { uv } from '../accessors/UVNode.js';
import { Color } from '../../math/Color.js';
import { passTexture } from './PassNode.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { HalfFloatType } from '../../constants.js';
import { NodeUpdateType } from '../core/constants.js';
import { Vector2 } from '../../math/Vector2.js';
import { loop } from '../utils/LoopNode.js';
import { add } from '../math/OperatorNode.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { texture } from '../accessors/TextureNode.js';
import { Vector3 } from '../../math/Vector3.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

const _clearColor = /*@__PURE__*/ new Color( 0, 0, 0 );
const _currentClearColor = /*@__PURE__*/ new Color();
const _size = /*@__PURE__*/ new Vector2();

const _BlurDirectionX = /*@__PURE__*/ new Vector2( 1.0, 0.0 );
const _BlurDirectionY = /*@__PURE__*/ new Vector2( 0.0, 1.0 );

class BloomNode extends TempNode {

	constructor( inputNode, strength = 1, radius = 0, threshold = 0 ) {

		super();

		this.inputNode = inputNode;
		this.strength = uniform( strength );
		this.radius = uniform( radius );
		this.threshold = uniform( threshold );

		this.smoothWidth = uniform( 0.01 );

		//

		this._renderTargetsHorizontal = [];
		this._renderTargetsVertical = [];
		this._nMips = 5;

		// render targets

		this._renderTargetBright = new RenderTarget( 1, 1, { type: HalfFloatType } );
		this._renderTargetBright.texture.name = 'UnrealBloomPass.bright';
		this._renderTargetBright.texture.generateMipmaps = false;

		for ( let i = 0; i < this._nMips; i ++ ) {

			const renderTargetHorizontal = new RenderTarget( 1, 1, { type: HalfFloatType } );

			renderTargetHorizontal.texture.name = 'UnrealBloomPass.h' + i;
			renderTargetHorizontal.texture.generateMipmaps = false;

			this._renderTargetsHorizontal.push( renderTargetHorizontal );

			const renderTargetVertical = new RenderTarget( 1, 1, { type: HalfFloatType } );

			renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
			renderTargetVertical.texture.generateMipmaps = false;

			this._renderTargetsVertical.push( renderTargetVertical );

		}

		// materials

		this._compositeMaterial = null;
		this._highPassFilterMaterial = null;
		this._separableBlurMaterials = [];

		// pass and texture nodes

		this._textureNodeBright = texture( this._renderTargetBright.texture );
		this._textureNodeBlur0 = texture( this._renderTargetsVertical[ 0 ].texture );
		this._textureNodeBlur1 = texture( this._renderTargetsVertical[ 1 ].texture );
		this._textureNodeBlur2 = texture( this._renderTargetsVertical[ 2 ].texture );
		this._textureNodeBlur3 = texture( this._renderTargetsVertical[ 3 ].texture );
		this._textureNodeBlur4 = texture( this._renderTargetsVertical[ 4 ].texture );

		this._textureOutput = passTexture( this, this._renderTargetsHorizontal[ 0 ].texture );

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	getTextureNode() {

		return this._textureOutput;

	}

	setSize( width, height ) {

		let resx = Math.round( width / 2 );
		let resy = Math.round( height / 2 );

		this._renderTargetBright.setSize( resx, resy );

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._renderTargetsHorizontal[ i ].setSize( resx, resy );
			this._renderTargetsVertical[ i ].setSize( resx, resy );

			this._separableBlurMaterials[ i ].invSize.value.set( 1 / resx, 1 / resy );

			resx = Math.round( resx / 2 );
			resy = Math.round( resy / 2 );

		}

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();
		renderer.getClearColor( _currentClearColor );
		const currentClearAlpha = renderer.getClearAlpha();

		this.setSize( size.width, size.height );

		renderer.setMRT( null );
		renderer.setClearColor( _clearColor, 0 );

		// 1. Extract Bright Areas

		renderer.setRenderTarget( this._renderTargetBright );
		_quadMesh.material = this._highPassFilterMaterial;
		_quadMesh.render( renderer );

		// 2. Blur All the mips progressively

		let inputRenderTarget = this._renderTargetBright;

		for ( let i = 0; i < this._nMips; i ++ ) {

			_quadMesh.material = this._separableBlurMaterials[ i ];

			this._separableBlurMaterials[ i ].colorTexture.value = inputRenderTarget.texture;
			this._separableBlurMaterials[ i ].direction.value = _BlurDirectionX;
			renderer.setRenderTarget( this._renderTargetsHorizontal[ i ] );
			renderer.clear();
			_quadMesh.render( renderer );

			this._separableBlurMaterials[ i ].colorTexture.value = this._renderTargetsHorizontal[ i ].texture;
			this._separableBlurMaterials[ i ].direction.value = _BlurDirectionY;
			renderer.setRenderTarget( this._renderTargetsVertical[ i ] );
			renderer.clear();
			_quadMesh.render( renderer );

			inputRenderTarget = this._renderTargetsVertical[ i ];

		}

		// 3. Composite All the mips

		renderer.setRenderTarget( this._renderTargetsHorizontal[ 0 ] );
		renderer.clear();
		_quadMesh.material = this._compositeMaterial;
		_quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );
		renderer.setClearColor( _currentClearColor, currentClearAlpha );

	}

	setup( builder ) {

		// luminosity high pass material

		const luminosityHighPass = tslFn( () => {

			const texel = this.inputNode;
			const v = luminance( texel.rgb );

			const alpha = smoothstep( this.threshold, this.threshold.add( this.smoothWidth ), v );

			return mix( vec4( 0 ), texel, alpha );

		} );

		this._highPassFilterMaterial = this._highPassFilterMaterial || builder.createNodeMaterial();
		this._highPassFilterMaterial.fragmentNode = luminosityHighPass().context( builder.getSharedContext() );
		this._highPassFilterMaterial.needsUpdate = true;

		// gaussian blur materials

		const kernelSizeArray = [ 3, 5, 7, 9, 11 ];

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._separableBlurMaterials.push( this._getSeperableBlurMaterial( builder, kernelSizeArray[ i ] ) );

		}

		// composite material

		const bloomFactors = uniforms( [ 1.0, 0.8, 0.6, 0.4, 0.2 ] );
		const bloomTintColors = uniforms( [ new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ] );

		const lerpBloomFactor = tslFn( ( [ factor, radius ] ) => {

			const mirrorFactor = float( 1.2 ).sub( factor );
			return mix( factor, mirrorFactor, radius );

		} ).setLayout( {
			name: 'lerpBloomFactor',
			type: 'float',
			inputs: [
				{ name: 'factor', type: 'float' },
				{ name: 'radius', type: 'float' },
			]
		} );


		const compositePass = tslFn( () => {

			const color0 = lerpBloomFactor( bloomFactors.element( 0 ), this.radius ).mul( vec4( bloomTintColors.element( 0 ), 1.0 ) ).mul( this._textureNodeBlur0 );
			const color1 = lerpBloomFactor( bloomFactors.element( 1 ), this.radius ).mul( vec4( bloomTintColors.element( 1 ), 1.0 ) ).mul( this._textureNodeBlur1 );
			const color2 = lerpBloomFactor( bloomFactors.element( 2 ), this.radius ).mul( vec4( bloomTintColors.element( 2 ), 1.0 ) ).mul( this._textureNodeBlur2 );
			const color3 = lerpBloomFactor( bloomFactors.element( 3 ), this.radius ).mul( vec4( bloomTintColors.element( 3 ), 1.0 ) ).mul( this._textureNodeBlur3 );
			const color4 = lerpBloomFactor( bloomFactors.element( 4 ), this.radius ).mul( vec4( bloomTintColors.element( 4 ), 1.0 ) ).mul( this._textureNodeBlur4 );

			const sum = color0.add( color1 ).add( color2 ).add( color3 ).add( color4 );

			return sum.mul( this.strength );

		} );

		this._compositeMaterial = this._compositeMaterial || builder.createNodeMaterial();
		this._compositeMaterial.fragmentNode = compositePass().context( builder.getSharedContext() );
		this._compositeMaterial.needsUpdate = true;

		//

		return this._textureOutput;

	}

	dispose() {

		for ( let i = 0; i < this._renderTargetsHorizontal.length; i ++ ) {

			this._renderTargetsHorizontal[ i ].dispose();

		}

		for ( let i = 0; i < this._renderTargetsVertical.length; i ++ ) {

			this._renderTargetsVertical[ i ].dispose();

		}

		this._renderTargetBright.dispose();

	}

	_getSeperableBlurMaterial( builder, kernelRadius ) {

		const coefficients = [];

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( kernelRadius * kernelRadius ) ) / kernelRadius );

		}

		//

		const colorTexture = texture();
		const gaussianCoefficients = uniforms( coefficients );
		const invSize = uniform( new Vector2() );
		const direction = uniform( new Vector2( 0.5, 0.5 ) );

		const uvNode = uv();
		const sampleTexel = ( uv ) => colorTexture.uv( uv );

		const seperableBlurPass = tslFn( () => {

			const weightSum = gaussianCoefficients.element( 0 ).toVar();
			const diffuseSum = sampleTexel( uvNode ).rgb.mul( weightSum ).toVar();

			loop( { start: int( 1 ), end: int( kernelRadius ), type: 'int', condition: '<' }, ( { i } ) => {

				const x = float( i );
				const w = gaussianCoefficients.element( i );
				const uvOffset = direction.mul( invSize ).mul( x );
				const sample1 = sampleTexel( uvNode.add( uvOffset ) ).rgb;
				const sample2 = sampleTexel( uvNode.sub( uvOffset ) ).rgb;
				diffuseSum.addAssign( add( sample1, sample2 ).mul( w ) );
				weightSum.addAssign( float( 2.0 ).mul( w ) );

			} );

			return vec4( diffuseSum.div( weightSum ), 1.0 );

		} );

		const seperableBlurMaterial = builder.createNodeMaterial();
		seperableBlurMaterial.fragmentNode = seperableBlurPass().context( builder.getSharedContext() );
		seperableBlurMaterial.needsUpdate = true;

		// uniforms
		seperableBlurMaterial.colorTexture = colorTexture;
		seperableBlurMaterial.direction = direction;
		seperableBlurMaterial.invSize = invSize;

		return seperableBlurMaterial;

	}

}

export const bloom = ( node, strength, radius, threshold ) => nodeObject( new BloomNode( nodeObject( node ), strength, radius, threshold ) );

addNodeElement( 'bloom', bloom );

export default BloomNode;
