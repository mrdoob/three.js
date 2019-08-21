/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	UniformsLib,
	UniformsUtils
} from '../../../../../build/three.module.js';

import { Node } from '../../core/Node.js';
import { ExpressionNode } from '../../core/ExpressionNode.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';
import { RoughnessToBlinnExponentNode } from '../../bsdfs/RoughnessToBlinnExponentNode.js';

function StandardNode() {

	Node.call( this );

	this.color = new ColorNode( 0xEEEEEE );
	this.roughness = new FloatNode( 0.5 );
	this.metalness = new FloatNode( 0.5 );

	this.energyPreservation = true;

}

StandardNode.prototype = Object.create( Node.prototype );
StandardNode.prototype.constructor = StandardNode;
StandardNode.prototype.nodeType = "Standard";

StandardNode.prototype.build = function ( builder ) {

	var code;

	builder.define( this.clearcoat || this.clearcoatRoughness || this.clearcoatNormal ? 'PHYSICAL' : 'STANDARD' );

	builder.requires.lights = true;

	builder.extensions.shaderTextureLOD = true;

	if ( builder.isShader( 'vertex' ) ) {

		var position = this.position ? this.position.analyzeAndFlow( builder, 'v3', { cache: 'position' } ) : undefined;

		builder.mergeUniform( UniformsUtils.merge( [

			UniformsLib.fog,
			UniformsLib.lights

		] ) );

		if ( UniformsLib.LTC_1 ) {

			// add ltc data textures to material uniforms

			builder.uniforms.ltc_1 = { value: undefined };
			builder.uniforms.ltc_2 = { value: undefined };

		}

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
			viewNormal: new ExpressionNode('normal', 'v3'),
			gamma: true
		};

		var contextGammaOnly = {
			gamma: true
		};

		var contextClearcoatEnvironment = {
			bias: RoughnessToBlinnExponentNode,
			viewNormal: new ExpressionNode('clearcoatNormal', 'v3'),
			gamma: true
		};

		var useClearcoat = ! builder.isDefined( 'STANDARD' );

		// analyze all nodes to reuse generate codes

		if ( this.mask ) this.mask.analyze( builder );

		this.color.analyze( builder, { slot: 'color', context: contextGammaOnly } );
		this.roughness.analyze( builder );
		this.metalness.analyze( builder );

		if ( this.alpha ) this.alpha.analyze( builder );

		if ( this.normal ) this.normal.analyze( builder );

		if ( this.clearcoat ) this.clearcoat.analyze( builder );
		if ( this.clearcoatRoughness ) this.clearcoatRoughness.analyze( builder );
		if ( this.clearcoatNormal ) this.clearcoatNormal.analyze( builder );

		if ( this.reflectivity ) this.reflectivity.analyze( builder );

		if ( this.light ) this.light.analyze( builder, { cache: 'light' } );

		if ( this.ao ) this.ao.analyze( builder );
		if ( this.ambient ) this.ambient.analyze( builder );
		if ( this.shadow ) this.shadow.analyze( builder );
		if ( this.emissive ) this.emissive.analyze( builder, { slot: 'emissive' } );

		if ( this.environment ) {

			// isolate environment from others inputs ( see TextureNode, CubeTextureNode )
			// environment.analyze will detect if there is a need of calculate irradiance

			this.environment.analyze( builder, { cache: 'radiance', context: contextEnvironment, slot: 'radiance' } );

			if ( builder.requires.irradiance ) {

				this.environment.analyze( builder, { cache: 'irradiance', context: contextEnvironment, slot: 'irradiance' } );

			}

		}

		if ( this.sheen ) this.sheen.analyze( builder );

		// build code

		var mask = this.mask ? this.mask.flow( builder, 'b' ) : undefined;

		var color = this.color.flow( builder, 'c', { slot: 'color', context: contextGammaOnly } );
		var roughness = this.roughness.flow( builder, 'f' );
		var metalness = this.metalness.flow( builder, 'f' );

		var alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined;

		var normal = this.normal ? this.normal.flow( builder, 'v3' ) : undefined;

		var clearcoat = this.clearcoat ? this.clearcoat.flow( builder, 'f' ) : undefined;
		var clearcoatRoughness = this.clearcoatRoughness ? this.clearcoatRoughness.flow( builder, 'f' ) : undefined;
		var clearcoatNormal = this.clearcoatNormal ? this.clearcoatNormal.flow( builder, 'v3' ) : undefined;

		var reflectivity = this.reflectivity ? this.reflectivity.flow( builder, 'f' ) : undefined;

		var light = this.light ? this.light.flow( builder, 'v3', { cache: 'light' } ) : undefined;

		var ao = this.ao ? this.ao.flow( builder, 'f' ) : undefined;
		var ambient = this.ambient ? this.ambient.flow( builder, 'c' ) : undefined;
		var shadow = this.shadow ? this.shadow.flow( builder, 'c' ) : undefined;
		var emissive = this.emissive ? this.emissive.flow( builder, 'c', { slot: 'emissive' } ) : undefined;

		var environment;

		if ( this.environment ) {

			environment = {
				radiance: this.environment.flow( builder, 'c', { cache: 'radiance', context: contextEnvironment, slot: 'radiance' } )
			};

			if ( builder.requires.irradiance ) {

				environment.irradiance = this.environment.flow( builder, 'c', { cache: 'irradiance', context: contextEnvironment, slot: 'irradiance' } );

			}

		}

		var clearcoatEnv = useClearcoat && environment ? this.environment.flow( builder, 'c', { cache: 'clearcoat', context: contextClearcoatEnvironment, slot: 'environment' } ) : undefined;

		var sheen = this.sheen ? this.sheen.flow( builder, 'c' ) : undefined;

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
			"	#include <clearcoat_normal_fragment_begin>",

			// add before: prevent undeclared material
			"	PhysicalMaterial material;",
			"	material.diffuseColor = vec3( 1.0 );"
		];

		if ( mask ) {

			output.push(
				mask.code,
				'if ( ! ' + mask.result + ' ) discard;'
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

		if ( clearcoatNormal ) {

			output.push(
				clearcoatNormal.code,
				'clearcoatNormal = ' + clearcoatNormal.result + ';'
			);

		}

		// optimization for now

		output.push(
			'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor * (1.0 - metalnessFactor)' ) + ';',
			'material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );'
		);

		if ( clearcoat ) {

			output.push(
				clearcoat.code,
				'material.clearcoat = saturate( ' + clearcoat.result + ' );'
			);

		} else if ( useClearcoat ) {

			output.push( 'material.clearcoat = 0.0;' );

		}

		if ( clearcoatRoughness ) {

			output.push(
				clearcoatRoughness.code,
				'material.clearcoatRoughness = clamp( ' + clearcoatRoughness.result + ', 0.04, 1.0 );'
			);

		} else if ( useClearcoat ) {

			output.push( 'material.clearcoatRoughness = 0.0;' );

		}

		if ( sheen ) {

			output.push( 'material.sheenColor = ' + sheen.result + ';' );

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

			output.push( environment.radiance.code );

			if ( builder.requires.irradiance ) {

				output.push( environment.irradiance.code );

			}

			if ( clearcoatEnv ) {

				output.push(
					clearcoatEnv.code,
					"clearcoatRadiance += " + clearcoatEnv.result + ";"
				);

			}

			output.push( "radiance += " + environment.radiance.result + ";" );

			if ( builder.requires.irradiance ) {

				output.push( "irradiance += PI * " + environment.irradiance.result + ";" );

			}

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

	if ( source.clearcoat ) this.clearcoat = source.clearcoat;
	if ( source.clearcoatRoughness ) this.clearcoatRoughness = source.clearcoatRoughness;
	if ( source.clearcoatNormal ) this.clearcoatNormal = source.clearcoatNormal;

	if ( source.reflectivity ) this.reflectivity = source.reflectivity;

	if ( source.light ) this.light = source.light;
	if ( source.shadow ) this.shadow = source.shadow;

	if ( source.ao ) this.ao = source.ao;

	if ( source.emissive ) this.emissive = source.emissive;
	if ( source.ambient ) this.ambient = source.ambient;

	if ( source.environment ) this.environment = source.environment;

	if ( source.sheen ) this.sheen = source.sheen;

	return this;

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

		if ( this.clearcoat ) data.clearcoat = this.clearcoat.toJSON( meta ).uuid;
		if ( this.clearcoatRoughness ) data.clearcoatRoughness = this.clearcoatRoughness.toJSON( meta ).uuid;
		if ( this.clearcoatNormal ) data.clearcoatNormal = this.clearcoatNormal.toJSON( meta ).uuid;

		if ( this.reflectivity ) data.reflectivity = this.reflectivity.toJSON( meta ).uuid;

		if ( this.light ) data.light = this.light.toJSON( meta ).uuid;
		if ( this.shadow ) data.shadow = this.shadow.toJSON( meta ).uuid;

		if ( this.ao ) data.ao = this.ao.toJSON( meta ).uuid;

		if ( this.emissive ) data.emissive = this.emissive.toJSON( meta ).uuid;
		if ( this.ambient ) data.ambient = this.ambient.toJSON( meta ).uuid;

		if ( this.environment ) data.environment = this.environment.toJSON( meta ).uuid;

		if ( this.sheen ) data.sheen = this.sheen.toJSON( meta ).uuid;

	}

	return data;

};

export { StandardNode };
