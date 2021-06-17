import {
	UniformsLib,
	UniformsUtils
} from '../../../../../build/three.module.js';

import { Node } from '../../core/Node.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';

class PhongNode extends Node {

	constructor() {

		super();

		this.color = new ColorNode( 0xEEEEEE );
		this.specular = new ColorNode( 0x111111 );
		this.shininess = new FloatNode( 30 );

	}

	build( builder ) {

		let code;

		builder.define( 'PHONG' );

		builder.requires.lights = true;

		if ( builder.isShader( 'vertex' ) ) {

			const position = this.position ? this.position.analyzeAndFlow( builder, 'v3', { cache: 'position' } ) : undefined;

			builder.mergeUniform( UniformsUtils.merge( [

				UniformsLib.fog,
				UniformsLib.lights

			] ) );

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

				'#ifndef FLAT_SHADED', // normal computed with derivatives when FLAT_SHADED

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
				'	#include <morphtarget_vertex>',
				'	#include <skinning_vertex>',
				'	#include <project_vertex>',
				'	#include <fog_vertex>',
				'	#include <logdepthbuf_vertex>',
				'	#include <clipping_planes_vertex>',

				'	vViewPosition = - mvPosition.xyz;',

				'	#include <worldpos_vertex>',
				'	#include <shadowmap_vertex>',
				'	#include <fog_vertex>'
			);

			code = output.join( '\n' );

		} else {

			// analyze all nodes to reuse generate codes

			if ( this.mask ) this.mask.analyze( builder );

			this.color.analyze( builder, { slot: 'color' } );
			this.specular.analyze( builder );
			this.shininess.analyze( builder );

			if ( this.alpha ) this.alpha.analyze( builder );

			if ( this.normal ) this.normal.analyze( builder );

			if ( this.light ) this.light.analyze( builder, { cache: 'light' } );

			if ( this.ao ) this.ao.analyze( builder );
			if ( this.ambient ) this.ambient.analyze( builder );
			if ( this.shadow ) this.shadow.analyze( builder );
			if ( this.emissive ) this.emissive.analyze( builder, { slot: 'emissive' } );

			if ( this.environment ) this.environment.analyze( builder, { slot: 'environment' } );
			if ( this.environmentAlpha && this.environment ) this.environmentAlpha.analyze( builder );

			// build code

			const mask = this.mask ? this.mask.flow( builder, 'b' ) : undefined;

			const color = this.color.flow( builder, 'c', { slot: 'color' } );
			const specular = this.specular.flow( builder, 'c' );
			const shininess = this.shininess.flow( builder, 'f' );

			const alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined;

			const normal = this.normal ? this.normal.flow( builder, 'v3' ) : undefined;

			const light = this.light ? this.light.flow( builder, 'v3', { cache: 'light' } ) : undefined;

			const ao = this.ao ? this.ao.flow( builder, 'f' ) : undefined;
			const ambient = this.ambient ? this.ambient.flow( builder, 'c' ) : undefined;
			const shadow = this.shadow ? this.shadow.flow( builder, 'c' ) : undefined;
			const emissive = this.emissive ? this.emissive.flow( builder, 'c', { slot: 'emissive' } ) : undefined;

			const environment = this.environment ? this.environment.flow( builder, 'c', { slot: 'environment' } ) : undefined;
			const environmentAlpha = this.environmentAlpha && this.environment ? this.environmentAlpha.flow( builder, 'f' ) : undefined;

			builder.requires.transparent = alpha !== undefined;

			builder.addParsCode( /* glsl */`
				#include <fog_pars_fragment>
				#include <bsdfs>
				#include <lights_pars_begin>
				#include <lights_phong_pars_fragment>
				#include <shadowmap_pars_fragment>
				#include <logdepthbuf_pars_fragment>`
			);

			const output = [
				// prevent undeclared normal
				'#include <normal_fragment_begin>',

				// prevent undeclared material
				'	BlinnPhongMaterial material;'
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

				specular.code,
				'	vec3 specular = ' + specular.result + ';',

				shininess.code,
				'	float shininess = max( 0.0001, ' + shininess.result + ' );',

				'	float specularStrength = 1.0;' // Ignored in MaterialNode ( replace to specular )
			);

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

				'#include <lights_fragment_begin>',
				'#include <lights_fragment_end>'
			);

			if ( light ) {

				output.push(
					light.code,
					'reflectedLight.directDiffuse = ' + light.result + ';'
				);

				// apply color

				output.push(
					'reflectedLight.directDiffuse *= diffuseColor;',
					'reflectedLight.indirectDiffuse *= diffuseColor;'
				);

			}

			if ( ao ) {

				output.push(
					ao.code,
					'reflectedLight.indirectDiffuse *= ' + ao.result + ';'
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

			output.push( 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular;' );

			if ( environment ) {

				output.push( environment.code );

				if ( environmentAlpha ) {

					output.push(
						environmentAlpha.code,
						'outgoingLight = mix( outgoingLight, ' + environment.result + ', ' + environmentAlpha.result + ' );'
					);

				} else {

					output.push( 'outgoingLight = ' + environment.result + ';' );

				}

			}
			/*
			switch( builder.material.combine ) {

				case ENVMAP_BLENDING_MULTIPLY:

					//output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;" );
					//outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

					break;


			}
		*/

			if ( alpha ) {

				output.push( 'gl_FragColor = vec4( outgoingLight, ' + alpha.result + ' );' );

			} else {

				output.push( 'gl_FragColor = vec4( outgoingLight, 1.0 );' );

			}

			output.push(
				'#include <tonemapping_fragment>',
				'#include <encodings_fragment>',
				'#include <fog_fragment>',
				'#include <premultiplied_alpha_fragment>'
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
		this.specular = source.specular;
		this.shininess = source.shininess;

		if ( source.mask ) this.mask = source.mask;

		if ( source.alpha ) this.alpha = source.alpha;

		if ( source.normal ) this.normal = source.normal;

		if ( source.light ) this.light = source.light;
		if ( source.shadow ) this.shadow = source.shadow;

		if ( source.ao ) this.ao = source.ao;

		if ( source.emissive ) this.emissive = source.emissive;
		if ( source.ambient ) this.ambient = source.ambient;

		if ( source.environment ) this.environment = source.environment;
		if ( source.environmentAlpha ) this.environmentAlpha = source.environmentAlpha;

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
			data.specular = this.specular.toJSON( meta ).uuid;
			data.shininess = this.shininess.toJSON( meta ).uuid;

			if ( this.mask ) data.mask = this.mask.toJSON( meta ).uuid;

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

	}

}

PhongNode.prototype.nodeType = 'Phong';

export { PhongNode };
