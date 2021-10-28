import {
	UniformsLib,
	UniformsUtils
} from '../../../../../build/three.module.js';

import { Node } from '../../core/Node.js';
import { ExpressionNode } from '../../core/ExpressionNode.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';
import { SpecularMIPLevelNode } from '../../utils/SpecularMIPLevelNode.js';

class StandardNode extends Node {

	constructor() {

		super();

		this.color = new ColorNode( 0xFFFFFF );
		this.roughness = new FloatNode( 1 );
		this.metalness = new FloatNode( 0 );

	}

	build( builder ) {

		let code;

		builder.define( 'STANDARD' );

		const useClearcoat = this.clearcoat || this.clearcoatRoughness || this.clearCoatNormal;

		if ( useClearcoat ) {

			builder.define( 'CLEARCOAT' );

		}

		builder.requires.lights = true;

		builder.extensions.derivatives = true;
		builder.extensions.shaderTextureLOD = true;

		if ( builder.isShader( 'vertex' ) ) {

			const position = this.position ? this.position.analyzeAndFlow( builder, 'v3', { cache: 'position' } ) : undefined;

			builder.mergeUniform( UniformsUtils.merge( [

				UniformsLib.fog,
				UniformsLib.lights

			] ) );

			if ( UniformsLib.LTC_1 ) {

				// add ltc data textures to material uniforms

				builder.uniforms.ltc_1 = { value: undefined };
				builder.uniforms.ltc_2 = { value: undefined };

			}

			builder.addParsCode( /* glsl */`
				varying vec3 vViewPosition;

				#ifndef FLAT_SHADED

					varying vec3 vNormal;

				#endif

				//"#include <encodings_pars_fragment> // encoding functions
				#include <fog_pars_vertex>
				#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>`

			);

			const output = [
				'#include <beginnormal_vertex>',
				'#include <morphnormal_vertex>',
				'#include <skinbase_vertex>',
				'#include <skinnormal_vertex>',
				'#include <defaultnormal_vertex>',

				'#ifndef FLAT_SHADED', // Normal computed with derivatives when FLAT_SHADED

				'	vNormal = normalize( transformedNormal );',

				'#endif',

				'#include <begin_vertex>'
			];

			if ( position ) {

				output.push(
					position.code,
					position.result ? 'transformed = ' + position.result + ';' : ''
				);

			}

			output.push(
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <fog_vertex>',
				'#include <logdepthbuf_vertex>',
				'#include <clipping_planes_vertex>',

				'	vViewPosition = - mvPosition.xyz;',

				'#include <worldpos_vertex>',
				'#include <shadowmap_vertex>'
			);

			code = output.join( '\n' );

		} else {

			const roughnessNode = new ExpressionNode( 'material.roughness', 'f' );
			const clearcoatRoughnessNode = new ExpressionNode( 'material.clearcoatRoughness', 'f' );

			const contextEnvironment = {
				roughness: roughnessNode,
				bias: new SpecularMIPLevelNode( roughnessNode ),
				viewNormal: new ExpressionNode( 'normal', 'v3' ),
				worldNormal: new ExpressionNode( 'inverseTransformDirection( geometry.normal, viewMatrix )', 'v3' ),
				gamma: true
			};

			const contextGammaOnly = {
				gamma: true
			};

			const contextClearcoatEnvironment = {
				roughness: clearcoatRoughnessNode,
				bias: new SpecularMIPLevelNode( clearcoatRoughnessNode ),
				viewNormal: new ExpressionNode( 'clearcoatNormal', 'v3' ),
				worldNormal: new ExpressionNode( 'inverseTransformDirection( geometry.clearcoatNormal, viewMatrix )', 'v3' ),
				gamma: true
			};

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

			if ( this.sheenColor ) this.sheenColor.analyze( builder );

			// build code

			const mask = this.mask ? this.mask.flow( builder, 'b' ) : undefined;

			const color = this.color.flow( builder, 'c', { slot: 'color', context: contextGammaOnly } );
			const roughness = this.roughness.flow( builder, 'f' );
			const metalness = this.metalness.flow( builder, 'f' );

			const alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined;

			const normal = this.normal ? this.normal.flow( builder, 'v3' ) : undefined;

			const clearcoat = this.clearcoat ? this.clearcoat.flow( builder, 'f' ) : undefined;
			const clearcoatRoughness = this.clearcoatRoughness ? this.clearcoatRoughness.flow( builder, 'f' ) : undefined;
			const clearcoatNormal = this.clearcoatNormal ? this.clearcoatNormal.flow( builder, 'v3' ) : undefined;

			const reflectivity = this.reflectivity ? this.reflectivity.flow( builder, 'f' ) : undefined;

			const light = this.light ? this.light.flow( builder, 'v3', { cache: 'light' } ) : undefined;

			const ao = this.ao ? this.ao.flow( builder, 'f' ) : undefined;
			const ambient = this.ambient ? this.ambient.flow( builder, 'c' ) : undefined;
			const shadow = this.shadow ? this.shadow.flow( builder, 'c' ) : undefined;
			const emissive = this.emissive ? this.emissive.flow( builder, 'c', { slot: 'emissive' } ) : undefined;

			let environment;

			if ( this.environment ) {

				environment = {
					radiance: this.environment.flow( builder, 'c', { cache: 'radiance', context: contextEnvironment, slot: 'radiance' } )
				};

				if ( builder.requires.irradiance ) {

					environment.irradiance = this.environment.flow( builder, 'c', { cache: 'irradiance', context: contextEnvironment, slot: 'irradiance' } );

				}

			}

			const clearcoatEnv = useClearcoat && environment ? this.environment.flow( builder, 'c', { cache: 'clearcoat', context: contextClearcoatEnvironment, slot: 'environment' } ) : undefined;

			const sheenColor = this.sheenColor ? this.sheenColor.flow( builder, 'c' ) : undefined;

			builder.requires.transparent = alpha !== undefined;

			builder.addParsCode( /* glsl */`
				varying vec3 vViewPosition;

				#define NODE_MAXIMUM_SPECULAR_COEFFICIENT 0.16
				#define NODE_DEFAULT_SPECULAR_COEFFICIENT 0.04

				#ifndef FLAT_SHADED

					varying vec3 vNormal;

				#endif

				#include <dithering_pars_fragment>
				#include <fog_pars_fragment>
				#include <bsdfs>
				#include <lights_pars_begin>
				#include <lights_physical_pars_fragment>
				#include <shadowmap_pars_fragment>
				#include <logdepthbuf_pars_fragment>`
			);

			const output = [
				'#include <clipping_planes_fragment>',

				// add before: prevent undeclared normal
				'	#include <normal_fragment_begin>',
				'	#include <clearcoat_normal_fragment_begin>',

				// add before: prevent undeclared material
				'	PhysicalMaterial material;',
				'	material.diffuseColor = vec3( 1.0 );'
			];

			if ( mask ) {

				output.push(
					mask.code,
					'if ( ! ' + mask.result + ' ) discard;'
				);

			}

			output.push(
				color.code,
				'	vec3 diffuseColor = ' + color.result + ';',
				'	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );',

				'#include <logdepthbuf_fragment>',

				roughness.code,
				'	float roughnessFactor = ' + roughness.result + ';',

				metalness.code,
				'	float metalnessFactor = ' + metalness.result + ';'
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

			// anti-aliasing code by @elalish

			output.push(
				'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
				'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
			);

			// optimization for now

			output.push(
				'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor * ( 1.0 - metalnessFactor )' ) + ';',

				'material.roughness = max( roughnessFactor, 0.0525 );',
				'material.roughness += geometryRoughness;',
				'material.roughness = min( material.roughness, 1.0 );',

				'material.roughness = clamp( roughnessFactor, 0.04, 1.0 );'
			);

			if ( clearcoat ) {

				output.push(
					clearcoat.code,
					'material.clearcoat = saturate( ' + clearcoat.result + ' );' // Burley clearcoat model
				);

			} else if ( useClearcoat ) {

				output.push( 'material.clearcoat = 0.0;' );

			}

			if ( clearcoatRoughness ) {

				output.push(
					clearcoatRoughness.code,
					'material.clearcoatRoughness = max( ' + clearcoatRoughness.result + ', 0.0525 );',
					'material.clearcoatRoughness += geometryRoughness;',
					'material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );'
				);

			} else if ( useClearcoat ) {

				output.push( 'material.clearcoatRoughness = 0.0;' );

			}

			if ( sheenColor ) {

				output.push( 'material.sheenColor = ' + sheenColor.result + ';' );

			}

			if ( reflectivity ) {

				output.push(
					reflectivity.code,
					'material.specularColor = mix( vec3( NODE_MAXIMUM_SPECULAR_COEFFICIENT * pow2( ' + reflectivity.result + ' ) ), diffuseColor, metalnessFactor );'
				);

			} else {

				output.push(
					'material.specularColor = mix( vec3( NODE_DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor, metalnessFactor );'
				);

			}

			output.push(
				'#include <lights_fragment_begin>'
			);

			if ( light ) {

				output.push(
					light.code,
					'reflectedLight.directDiffuse = ' + light.result + ';'
				);

				// apply color

				output.push(
					'diffuseColor *= 1.0 - metalnessFactor;',

					'reflectedLight.directDiffuse *= diffuseColor;',
					'reflectedLight.indirectDiffuse *= diffuseColor;'
				);

			}

			if ( ao ) {

				output.push(
					ao.code,
					'reflectedLight.indirectDiffuse *= ' + ao.result + ';',
					'float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );',
					'reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ' + ao.result + ', material.roughness );'
				);

			}

			if ( ambient ) {

				output.push(
					ambient.code,
					'reflectedLight.indirectDiffuse += ' + ambient.result + ';'
				);

			}

			if ( shadow ) {

				output.push(
					shadow.code,
					'reflectedLight.directDiffuse *= ' + shadow.result + ';',
					'reflectedLight.directSpecular *= ' + shadow.result + ';'
				);

			}

			if ( emissive ) {

				output.push(
					emissive.code,
					'reflectedLight.directDiffuse += ' + emissive.result + ';'
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
						'clearcoatRadiance += ' + clearcoatEnv.result + ';'
					);

				}

				output.push( 'radiance += ' + environment.radiance.result + ';' );

				if ( builder.requires.irradiance ) {

					output.push( 'iblIrradiance += PI * ' + environment.irradiance.result + ';' );

				}

			}

			output.push(
				'#include <lights_fragment_end>'
			);

			output.push( 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;' );

			if ( alpha ) {

				output.push( 'gl_FragColor = vec4( outgoingLight, ' + alpha.result + ' );' );

			} else {

				output.push( 'gl_FragColor = vec4( outgoingLight, 1.0 );' );

			}

			output.push(
				'#include <tonemapping_fragment>',
				'#include <encodings_fragment>',
				'#include <fog_fragment>',
				'#include <premultiplied_alpha_fragment>',
				'#include <dithering_fragment>'
			);

			code = output.join( '\n' );

		}

		return code;

	}

	copy( source ) {

		super.copy( source );

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

		if ( source.sheenColor ) this.sheenColor = source.sheenColor;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

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

			if ( this.sheenColor ) data.sheenColor = this.sheenColor.toJSON( meta ).uuid;

		}

		return data;

	}

}

StandardNode.prototype.nodeType = 'Standard';

export { StandardNode };
