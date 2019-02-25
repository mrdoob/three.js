import {
  BokehShader
} from '../../shaders/BokehShader.js';
import {
  Color,
  LinearFilter,
  Mesh,
  MeshDepthMaterial,
  NoBlending,
  OrthographicCamera,
  PlaneBufferGeometry,
  RGBADepthPacking,
  RGBFormat,
  Scene,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget
} from '../../../build/three.module.js';
import {
  Pass
} from '../EffectComposer.js';
/**
 * Depth-of-field post-process with bokeh shader
 */


var BokehPass = function ( scene, camera, params ) {

	Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
	var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
	var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
	var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;

	// render targets

	var width = params.width || window.innerWidth || 1;
	var height = params.height || window.innerHeight || 1;

	this.renderTargetColor = new WebGLRenderTarget( width, height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBFormat
	} );
	this.renderTargetColor.texture.name = "BokehPass.color";

	this.renderTargetDepth = this.renderTargetColor.clone();
	this.renderTargetDepth.texture.name = "BokehPass.depth";

	// depth material

	this.materialDepth = new MeshDepthMaterial();
	this.materialDepth.depthPacking = RGBADepthPacking;
	this.materialDepth.blending = NoBlending;

	// bokeh material

	if ( BokehShader === undefined ) {

		console.error( "THREE.BokehPass relies on THREE.BokehShader" );

	}

	var bokehShader = BokehShader;
	var bokehUniforms = UniformsUtils.clone( bokehShader.uniforms );

	bokehUniforms[ "tDepth" ].value = this.renderTargetDepth.texture;

	bokehUniforms[ "focus" ].value = focus;
	bokehUniforms[ "aspect" ].value = aspect;
	bokehUniforms[ "aperture" ].value = aperture;
	bokehUniforms[ "maxblur" ].value = maxblur;
	bokehUniforms[ "nearClip" ].value = camera.near;
	bokehUniforms[ "farClip" ].value = camera.far;

	this.materialBokeh = new ShaderMaterial( {
		defines: Object.assign( {}, bokehShader.defines ),
		uniforms: bokehUniforms,
		vertexShader: bokehShader.vertexShader,
		fragmentShader: bokehShader.fragmentShader
	} );

	this.uniforms = bokehUniforms;
	this.needsSwap = false;

	this.camera2 = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene2 = new Scene();

	this.quad2 = new Mesh( new PlaneBufferGeometry( 2, 2 ), null );
	this.quad2.frustumCulled = false; // Avoid getting clipped
	this.scene2.add( this.quad2 );

	this.oldClearColor = new Color();
	this.oldClearAlpha = 1;

};

BokehPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: BokehPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		this.quad2.material = this.materialBokeh;

		// Render depth into texture

		this.scene.overrideMaterial = this.materialDepth;

		this.oldClearColor.copy( renderer.getClearColor() );
		this.oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		renderer.setClearColor( 0xffffff );
		renderer.setClearAlpha( 1.0 );
		renderer.setRenderTarget( this.renderTargetDepth );
		renderer.clear();
		renderer.render( this.scene, this.camera );

		// Render bokeh composite

		this.uniforms[ "tColor" ].value = readBuffer.texture;
		this.uniforms[ "nearClip" ].value = this.camera.near;
		this.uniforms[ "farClip" ].value = this.camera.far;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			renderer.render( this.scene2, this.camera2 );

		} else {

			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		this.scene.overrideMaterial = null;
		renderer.setClearColor( this.oldClearColor );
		renderer.setClearAlpha( this.oldClearAlpha );
		renderer.autoClear = this.oldAutoClear;

	}

} );

export {
  BokehPass
};