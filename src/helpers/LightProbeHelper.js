import { Mesh } from '../objects/Mesh.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { SphereBufferGeometry } from '../geometries/SphereGeometry.js';

import LightProbeHelper_vert from './LightProbeHelper_vert.glsl.js';
import LightProbeHelper_frag from './LightProbeHelper_frag.glsl.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 */

function LightProbeHelper( lightProbe, size ) {

	this.lightProbe = lightProbe;

	this.size = size;

	var defines = {};
	defines[ 'GAMMA_OUTPUT' ] = "";

	// material
	var material = new ShaderMaterial( {

		defines: defines,

		uniforms: {

			sh: { value: this.lightProbe.sh.coefficients }, // by reference

			intensity: { value: this.lightProbe.intensity }

		},

		vertexShader: LightProbeHelper_vert,

		fragmentShader: LightProbeHelper_frag

	} );

	var geometry = new SphereBufferGeometry( 1, 32, 16 );

	Mesh.call( this, geometry, material );

	this.onBeforeRender();

}

LightProbeHelper.prototype = Object.create( Mesh.prototype );
LightProbeHelper.prototype.constructor = LightProbeHelper;

LightProbeHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

};

LightProbeHelper.prototype.onBeforeRender = function () {

	return function update() {

		this.position.copy( this.lightProbe.position );

		this.scale.set( 1, 1, 1 ).multiplyScalar( this.size );

		this.material.uniforms.intensity.value = this.lightProbe.intensity;

	};

}();

export { LightProbeHelper };
