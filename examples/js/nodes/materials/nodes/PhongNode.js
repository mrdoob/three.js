/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../../core/Node.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';

function PhongNode() {

	Node.call( this );

	this.color = new ColorNode( 0xEEEEEE );
	this.specular = new ColorNode( 0x111111 );
	this.shininess = new FloatNode( 30 );

}

PhongNode.prototype = Object.create( Node.prototype );
PhongNode.prototype.constructor = PhongNode;
PhongNode.prototype.nodeType = "Phong";

PhongNode.prototype.build = function ( builder ) {

	var code;

	builder.define( 'PHONG' );

	builder.requires.lights = true;

	if ( builder.isShader( 'vertex' ) ) {

		var position = this.position ? this.position.parseAndBuildCode( builder, 'v3', { cache: 'position' } ) : undefined;

		builder.mergeUniform( THREE.UniformsUtils.merge( [

			THREE.UniformsLib.fog,
			THREE.UniformsLib.lights

		] ) );

		builder.addParsCode( [
			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			//"#include <encodings_pars_fragment>", // encoding functions
			"#include <fog_pars_vertex>",
			"#include <morphtarget_pars_vertex>",
			"#include <skinning_pars_vertex>",
			"#include <shadowmap_pars_vertex>",
			"#include <logdepthbuf_pars_vertex>",
			"#include <clipping_planes_pars_vertex>"
		].join( "\n" ) );

		var output = [
			"#include <beginnormal_vertex>",
			"#include <morphnormal_vertex>",
			"#include <skinbase_vertex>",
			"#include <skinnormal_vertex>",
			"#include <defaultnormal_vertex>",

			"#ifndef FLAT_SHADED", // normal computed with derivatives when FLAT_SHADED

			"	vNormal = normalize( transformedNormal );",

			"#endif",

			"#include <begin_vertex>"
		];

		if ( position ) {

			output.push(
				position.code,
				position.result ? "transformed = " + position.result + ";" : ''
			);

		}

		output.push(
			"	#include <morphtarget_vertex>",
			"	#include <skinning_vertex>",
			"	#include <project_vertex>",
			"	#include <fog_vertex>",
			"	#include <logdepthbuf_vertex>",
			"	#include <clipping_planes_vertex>",

			"	vViewPosition = - mvPosition.xyz;",

			"	#include <worldpos_vertex>",
			"	#include <shadowmap_vertex>",
			"	#include <fog_vertex>"
		);

		code = output.join( "\n" );

	} else {

		// parse all nodes to reuse generate codes

		this.color.parse( builder, { slot: 'color' } );
		this.specular.parse( builder );
		this.shininess.parse( builder );

		if ( this.alpha ) this.alpha.parse( builder );

		if ( this.normal ) this.normal.parse( builder );

		if ( this.light ) this.light.parse( builder, { cache: 'light' } );

		if ( this.ao ) this.ao.parse( builder );
		if ( this.ambient ) this.ambient.parse( builder );
		if ( this.shadow ) this.shadow.parse( builder );
		if ( this.emissive ) this.emissive.parse( builder, { slot: 'emissive' } );

		if ( this.environment ) this.environment.parse( builder, { slot: 'environment' } );
		if ( this.environmentAlpha && this.environment ) this.environmentAlpha.parse( builder );

		// build code

		var color = this.color.buildCode( builder, 'c', { slot: 'color' } );
		var specular = this.specular.buildCode( builder, 'c' );
		var shininess = this.shininess.buildCode( builder, 'f' );

		var alpha = this.alpha ? this.alpha.buildCode( builder, 'f' ) : undefined;

		var normal = this.normal ? this.normal.buildCode( builder, 'v3' ) : undefined;

		var light = this.light ? this.light.buildCode( builder, 'v3', { cache: 'light' } ) : undefined;

		var ao = this.ao ? this.ao.buildCode( builder, 'f' ) : undefined;
		var ambient = this.ambient ? this.ambient.buildCode( builder, 'c' ) : undefined;
		var shadow = this.shadow ? this.shadow.buildCode( builder, 'c' ) : undefined;
		var emissive = this.emissive ? this.emissive.buildCode( builder, 'c', { slot: 'emissive' } ) : undefined;

		var environment = this.environment ? this.environment.buildCode( builder, 'c', { slot: 'environment' } ) : undefined;
		var environmentAlpha = this.environmentAlpha && this.environment ? this.environmentAlpha.buildCode( builder, 'f' ) : undefined;

		builder.requires.transparent = alpha != undefined;

		builder.addParsCode( [
			"#include <fog_pars_fragment>",
			"#include <bsdfs>",
			"#include <lights_pars_begin>",
			"#include <lights_phong_pars_fragment>",
			"#include <shadowmap_pars_fragment>",
			"#include <logdepthbuf_pars_fragment>"
		].join( "\n" ) );

		var output = [
			// prevent undeclared normal
			"#include <normal_fragment_begin>",

			// prevent undeclared material
			"	BlinnPhongMaterial material;",

			color.code,
			"	vec3 diffuseColor = " + color.result + ";",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",

			"#include <logdepthbuf_fragment>",

			specular.code,
			"	vec3 specular = " + specular.result + ";",

			shininess.code,
			"	float shininess = max( 0.0001, " + shininess.result + " );",

			"	float specularStrength = 1.0;" // Ignored in MaterialNode ( replace to specular )
		];

		if ( alpha ) {

			output.push(
				alpha.code,
				'#ifdef ALPHATEST',

				'if ( ' + alpha.result + ' <= ALPHATEST ) discard;',

				'#endif'
			);

		}

		if ( normal ) {

			output.push(
				normal.code,
				'normal = ' + normal.result + ';'
			);

		}

		// optimization for now

		output.push( 'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor' ) + ';' );

		output.push(
			// accumulation
			'material.specularColor = specular;',
			'material.specularShininess = shininess;',
			'material.specularStrength = specularStrength;',

			"#include <lights_fragment_begin>",
			"#include <lights_fragment_end>"
		);

		if ( light ) {

			output.push(
				light.code,
				"reflectedLight.directDiffuse = " + light.result + ";"
			);

			// apply color

			output.push(
				"reflectedLight.directDiffuse *= diffuseColor;",
				"reflectedLight.indirectDiffuse *= diffuseColor;"
			);

		}

		if ( ao ) {

			output.push(
				ao.code,
				"reflectedLight.indirectDiffuse *= " + ao.result + ";"
			);

		}

		if ( ambient ) {

			output.push(
				ambient.code,
				"reflectedLight.indirectDiffuse += " + ambient.result + ";"
			);

		}

		if ( shadow ) {

			output.push(
				shadow.code,
				"reflectedLight.directDiffuse *= " + shadow.result + ";",
				"reflectedLight.directSpecular *= " + shadow.result + ";"
			);

		}

		if ( emissive ) {

			output.push(
				emissive.code,
				"reflectedLight.directDiffuse += " + emissive.result + ";"
			);

		}

		output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular;" );

		if ( environment ) {

			output.push( environment.code );

			if ( environmentAlpha ) {

				output.push(
					environmentAlpha.code,
					"outgoingLight = mix( outgoingLight, " + environment.result + ", " + environmentAlpha.result + " );"
				);

			} else {

				output.push( "outgoingLight = " + environment.result + ";" );

			}

		}
		/*
		switch( builder.material.combine ) {

			case THREE.ENVMAP_BLENDING_MULTIPLY:

				//output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;" );
				//outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

				break;


		}
	*/
		if ( alpha ) {

			output.push( "gl_FragColor = vec4( outgoingLight, " + alpha.result + " );" );

		} else {

			output.push( "gl_FragColor = vec4( outgoingLight, 1.0 );" );

		}

		output.push(
			"#include <premultiplied_alpha_fragment>",
			"#include <tonemapping_fragment>",
			"#include <encodings_fragment>",
			"#include <fog_fragment>"
		);

		code = output.join( "\n" );

	}

	return code;

};

PhongNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	// vertex

	if ( source.position ) this.position = source.position;

	// fragment

	this.color = source.color;
	this.specular = source.specular;
	this.shininess = source.shininess;

	if ( source.alpha ) this.alpha = source.alpha;

	if ( source.normal ) this.normal = source.normal;

	if ( source.light ) this.light = source.light;
	if ( source.shadow ) this.shadow = source.shadow;

	if ( source.ao ) this.ao = source.ao;

	if ( source.emissive ) this.emissive = source.emissive;
	if ( source.ambient ) this.ambient = source.ambient;

	if ( source.environment ) this.environment = source.environment;
	if ( source.environmentAlpha ) this.environmentAlpha = source.environmentAlpha;

};

PhongNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		// vertex

		if ( this.position ) data.position = this.position.toJSON( meta ).uuid;

		// fragment

		data.color = this.color.toJSON( meta ).uuid;
		data.specular = this.specular.toJSON( meta ).uuid;
		data.shininess = this.shininess.toJSON( meta ).uuid;

		if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;

		if ( this.normal ) data.normal = this.normal.toJSON( meta ).uuid;

		if ( this.light ) data.light = this.light.toJSON( meta ).uuid;

		if ( this.ao ) data.ao = this.ao.toJSON( meta ).uuid;
		if ( this.ambient ) data.ambient = this.ambient.toJSON( meta ).uuid;
		if ( this.shadow ) data.shadow = this.shadow.toJSON( meta ).uuid;
		if ( this.emissive ) data.emissive = this.emissive.toJSON( meta ).uuid;

		if ( this.environment ) data.environment = this.environment.toJSON( meta ).uuid;
		if ( this.environmentAlpha ) data.environmentAlpha = this.environmentAlpha.toJSON( meta ).uuid;

	}

	return data;

};

export { PhongNode };
