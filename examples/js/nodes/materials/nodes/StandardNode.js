/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../../core/Node.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';
import { RoughnessToBlinnExponentNode } from '../../bsdfs/RoughnessToBlinnExponentNode.js';

function StandardNode() {

	Node.call( this );

	this.color = new ColorNode( 0xEEEEEE );
	this.roughness = new FloatNode( 0.5 );
	this.metalness = new FloatNode( 0.5 );

}

StandardNode.prototype = Object.create( Node.prototype );
StandardNode.prototype.constructor = StandardNode;
StandardNode.prototype.nodeType = "Standard";

StandardNode.prototype.build = function ( builder ) {

	var code;

	builder.define( this.clearCoat || this.clearCoatRoughness ? 'PHYSICAL' : 'STANDARD' );

	builder.requires.lights = true;

	builder.extensions.shaderTextureLOD = true;

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

			"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

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
			"#include <morphtarget_vertex>",
			"#include <skinning_vertex>",
			"#include <project_vertex>",
			"#include <fog_vertex>",
			"#include <logdepthbuf_vertex>",
			"#include <clipping_planes_vertex>",

			"	vViewPosition = - mvPosition.xyz;",

			"#include <worldpos_vertex>",
			"#include <shadowmap_vertex>"
		);

		code = output.join( "\n" );

	} else {

		var contextEnvironment = {
			bias: RoughnessToBlinnExponentNode,
			gamma: true
		};

		var contextGammaOnly = {
			gamma: true
		};

		var useClearCoat = ! builder.isDefined( 'STANDARD' );

		// parse all nodes to reuse generate codes

		if ( this.mask ) this.mask.parse( builder );

		this.color.parse( builder, { slot: 'color', context: contextGammaOnly } );
		this.roughness.parse( builder );
		this.metalness.parse( builder );

		if ( this.alpha ) this.alpha.parse( builder );

		if ( this.normal ) this.normal.parse( builder );

		if ( this.clearCoat ) this.clearCoat.parse( builder );
		if ( this.clearCoatRoughness ) this.clearCoatRoughness.parse( builder );

		if ( this.reflectivity ) this.reflectivity.parse( builder );

		if ( this.light ) this.light.parse( builder, { cache: 'light' } );

		if ( this.ao ) this.ao.parse( builder );
		if ( this.ambient ) this.ambient.parse( builder );
		if ( this.shadow ) this.shadow.parse( builder );
		if ( this.emissive ) this.emissive.parse( builder, { slot: 'emissive' } );

		if ( this.environment ) this.environment.parse( builder, { cache: 'env', context: contextEnvironment, slot: 'environment' } ); // isolate environment from others inputs ( see TextureNode, CubeTextureNode )

		// build code

		var mask = this.mask ? this.mask.buildCode( builder, 'f' ) : undefined;

		var color = this.color.buildCode( builder, 'c', { slot: 'color', context: contextGammaOnly } );
		var roughness = this.roughness.buildCode( builder, 'f' );
		var metalness = this.metalness.buildCode( builder, 'f' );

		var alpha = this.alpha ? this.alpha.buildCode( builder, 'f' ) : undefined;

		var normal = this.normal ? this.normal.buildCode( builder, 'v3' ) : undefined;

		var clearCoat = this.clearCoat ? this.clearCoat.buildCode( builder, 'f' ) : undefined;
		var clearCoatRoughness = this.clearCoatRoughness ? this.clearCoatRoughness.buildCode( builder, 'f' ) : undefined;

		var reflectivity = this.reflectivity ? this.reflectivity.buildCode( builder, 'f' ) : undefined;

		var light = this.light ? this.light.buildCode( builder, 'v3', { cache: 'light' } ) : undefined;

		var ao = this.ao ? this.ao.buildCode( builder, 'f' ) : undefined;
		var ambient = this.ambient ? this.ambient.buildCode( builder, 'c' ) : undefined;
		var shadow = this.shadow ? this.shadow.buildCode( builder, 'c' ) : undefined;
		var emissive = this.emissive ? this.emissive.buildCode( builder, 'c', { slot: 'emissive' } ) : undefined;

		var environment = this.environment ? this.environment.buildCode( builder, 'c', { cache: 'env', context: contextEnvironment, slot: 'environment' } ) : undefined;

		var clearCoatEnv = useClearCoat && environment ? this.environment.buildCode( builder, 'c', { cache: 'clearCoat', context: contextEnvironment, slot: 'environment' } ) : undefined;

		builder.requires.transparent = alpha !== undefined;

		builder.addParsCode( [

			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			"#include <dithering_pars_fragment>",
			"#include <fog_pars_fragment>",
			"#include <bsdfs>",
			"#include <lights_pars_begin>",
			"#include <lights_physical_pars_fragment>",
			"#include <shadowmap_pars_fragment>",
			"#include <logdepthbuf_pars_fragment>"
		].join( "\n" ) );

		var output = [
			"#include <clipping_planes_fragment>",

			// add before: prevent undeclared normal
			"	#include <normal_fragment_begin>",

			// add before: prevent undeclared material
			"	PhysicalMaterial material;",
			"	material.diffuseColor = vec3( 1.0 );"
		];

		if ( mask ) {

			output.push(
				mask.code,
				'if ( ' + mask.result + ' ) discard;'
			);

		}

		output.push(
			color.code,
			"	vec3 diffuseColor = " + color.result + ";",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",

			"#include <logdepthbuf_fragment>",

			roughness.code,
			"	float roughnessFactor = " + roughness.result + ";",

			metalness.code,
			"	float metalnessFactor = " + metalness.result + ";"
		);

		if ( alpha ) {

			output.push(
				alpha.code,
				'#ifdef ALPHATEST',

				'	if ( ' + alpha.result + ' <= ALPHATEST ) discard;',

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

		output.push(
			'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor * (1.0 - metalnessFactor)' ) + ';',
			'material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );'
		);

		if ( clearCoat ) {

			output.push(
				clearCoat.code,
				'material.clearCoat = saturate( ' + clearCoat.result + ' );'
			);

		} else if ( useClearCoat ) {

			output.push( 'material.clearCoat = 0.0;' );

		}

		if ( clearCoatRoughness ) {

			output.push(
				clearCoatRoughness.code,
				'material.clearCoatRoughness = clamp( ' + clearCoatRoughness.result + ', 0.04, 1.0 );'
			);

		} else if ( useClearCoat ) {

			output.push( 'material.clearCoatRoughness = 0.0;' );

		}

		if ( reflectivity ) {

			output.push(
				reflectivity.code,
				'material.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( ' + reflectivity.result + ' ) ), diffuseColor, metalnessFactor );'
			);

		} else {

			output.push(
				'material.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor, metalnessFactor );'
			);

		}

		output.push(
			"#include <lights_fragment_begin>"
		);

		if ( light ) {

			output.push(
				light.code,
				"reflectedLight.directDiffuse = " + light.result + ";"
			);

			// apply color

			output.push(
				"diffuseColor *= 1.0 - metalnessFactor;",

				"reflectedLight.directDiffuse *= diffuseColor;",
				"reflectedLight.indirectDiffuse *= diffuseColor;"
			);

		}

		if ( ao ) {

			output.push(
				ao.code,
				"reflectedLight.indirectDiffuse *= " + ao.result + ";",
				"float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );",
				"reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, " + ao.result + ", material.specularRoughness );"
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

		if ( environment ) {

			output.push( environment.code );

			if ( clearCoatEnv ) {

				output.push(
					clearCoatEnv.code,
					"clearCoatRadiance += " + clearCoatEnv.result + ";"
				);

			}

			output.push( "radiance += " + environment.result + ";" );

		}

		output.push(
			"#include <lights_fragment_end>"
		);

		output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;" );

		if ( alpha ) {

			output.push( "gl_FragColor = vec4( outgoingLight, " + alpha.result + " );" );

		} else {

			output.push( "gl_FragColor = vec4( outgoingLight, 1.0 );" );

		}

		output.push(
			"#include <tonemapping_fragment>",
			"#include <encodings_fragment>",
			"#include <fog_fragment>",
			"#include <premultiplied_alpha_fragment>",
			"#include <dithering_fragment>"
		);

		code = output.join( "\n" );

	}

	return code;

};

StandardNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	// vertex

	if ( source.position ) this.position = source.position;

	// fragment

	this.color = source.color;
	this.roughness = source.roughness;
	this.metalness = source.metalness;

	if ( source.mask ) this.mask = source.mask;

	if ( source.alpha ) this.alpha = source.alpha;

	if ( source.normal ) this.normal = source.normal;

	if ( source.clearCoat ) this.clearCoat = source.clearCoat;
	if ( source.clearCoatRoughness ) this.clearCoatRoughness = source.clearCoatRoughness;

	if ( source.reflectivity ) this.reflectivity = source.reflectivity;

	if ( source.light ) this.light = source.light;
	if ( source.shadow ) this.shadow = source.shadow;

	if ( source.ao ) this.ao = source.ao;

	if ( source.emissive ) this.emissive = source.emissive;
	if ( source.ambient ) this.ambient = source.ambient;

	if ( source.environment ) this.environment = source.environment;

};

StandardNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		// vertex

		if ( this.position ) data.position = this.position.toJSON( meta ).uuid;

		// fragment

		data.color = this.color.toJSON( meta ).uuid;
		data.roughness = this.roughness.toJSON( meta ).uuid;
		data.metalness = this.metalness.toJSON( meta ).uuid;

		if ( this.mask ) data.mask = this.mask.toJSON( meta ).uuid;

		if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;

		if ( this.normal ) data.normal = this.normal.toJSON( meta ).uuid;

		if ( this.clearCoat ) data.clearCoat = this.clearCoat.toJSON( meta ).uuid;
		if ( this.clearCoatRoughness ) data.clearCoatRoughness = this.clearCoatRoughness.toJSON( meta ).uuid;

		if ( this.reflectivity ) data.reflectivity = this.reflectivity.toJSON( meta ).uuid;

		if ( this.light ) data.light = this.light.toJSON( meta ).uuid;
		if ( this.shadow ) data.shadow = this.shadow.toJSON( meta ).uuid;

		if ( this.ao ) data.ao = this.ao.toJSON( meta ).uuid;

		if ( this.emissive ) data.emissive = this.emissive.toJSON( meta ).uuid;
		if ( this.ambient ) data.ambient = this.ambient.toJSON( meta ).uuid;

		if ( this.environment ) data.environment = this.environment.toJSON( meta ).uuid;

	}

	return data;

};

export { StandardNode };
