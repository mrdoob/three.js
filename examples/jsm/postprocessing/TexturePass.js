/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	ShaderMaterial,
	UniformsUtils
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";
import { CopyShader } from "../shaders/CopyShader.js";

var TexturePass = function ( map, opacity ) {

	Pass.call( this );

	if ( CopyShader === undefined )
		console.error( "TexturePass relies on CopyShader" );

	var shader = CopyShader;

	this.map = map;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.uniforms = UniformsUtils.clone( shader.uniforms );

	this.material = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthTest: false,
		depthWrite: false

	} );

	this.needsSwap = false;

	this.fsQuad = new Pass.FullScreenQuad( null );

};

TexturePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: TexturePass,

	render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms[ "opacity" ].value = this.opacity;
		this.uniforms[ "tDiffuse" ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

	}

} );

export { TexturePass };
