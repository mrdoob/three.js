/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	UniformsLib,
	UniformsUtils
} from '../../../../build/three.module.js';

import { NodeMaterial } from './NodeMaterial.js';
import { Node } from '../core/Node.js';
import { ColorNode } from '../inputs/ColorNode.js';
import { NodeContext } from '../core/NodeContext.js';
import { NodeUtils } from '../core/NodeUtils.js';

export class SpriteNode extends Node {

	constructor() {

		super();

		this.color = new ColorNode( 0xEEEEEE );
		this.spherical = true;

		this.nodeType = "Sprite";

	}

	build( builder ) {

		var output;

		builder.define( 'SPRITE' );

		builder.requires.lights = false;
		builder.requires.transparent = this.alpha !== undefined;

		if ( builder.isShader( 'vertex' ) ) {

			var position = this.position ? this.position.analyzeAndFlow( builder, 'v3', new NodeContext().setCache( 'position' ) ) : undefined;

			builder.mergeUniform( UniformsUtils.merge( [
				UniformsLib.fog
			] ) );

			builder.addParsCode( [
				"#include <fog_pars_vertex>",
				"#include <logdepthbuf_pars_vertex>",
				"#include <clipping_planes_pars_vertex>"
			].join( "\n" ) );

			output = [
				"#include <clipping_planes_fragment>",
				"#include <begin_vertex>"
			];

			if ( position ) {

				output.push(
					position.code,
					position.result ? "transformed = " + position.result + ";" : ''
				);

			}

			output.push(
				"#include <project_vertex>",
				"#include <fog_vertex>",

				'mat4 modelViewMtx = modelViewMatrix;',
				'mat4 modelMtx = modelMatrix;',

				// ignore position from modelMatrix (use vary position)
				'modelMtx[3][0] = 0.0;',
				'modelMtx[3][1] = 0.0;',
				'modelMtx[3][2] = 0.0;'
			);

			if ( ! this.spherical ) {

				output.push(
					'modelMtx[1][1] = 1.0;'
				);

			}

			output.push(
				// http://www.geeks3d.com/20140807/billboarding-vertex-shader-glsl/
				// First colunm.
				'modelViewMtx[0][0] = 1.0;',
				'modelViewMtx[0][1] = 0.0;',
				'modelViewMtx[0][2] = 0.0;'
			);

			if ( this.spherical ) {

				output.push(
					// Second colunm.
					'modelViewMtx[1][0] = 0.0;',
					'modelViewMtx[1][1] = 1.0;',
					'modelViewMtx[1][2] = 0.0;'
				);

			}

			output.push(
				// Thrid colunm.
				'modelViewMtx[2][0] = 0.0;',
				'modelViewMtx[2][1] = 0.0;',
				'modelViewMtx[2][2] = 1.0;',

				"gl_Position = projectionMatrix * modelViewMtx * modelMtx * vec4( transformed, 1.0 );",

				"#include <logdepthbuf_vertex>",
				"#include <clipping_planes_vertex>",
				"#include <fog_vertex>"
			);

		} else {

			builder.addParsCode( [
				"#include <fog_pars_fragment>",
				"#include <logdepthbuf_pars_fragment>",
				"#include <clipping_planes_pars_fragment>"
			].join( "\n" ) );

			builder.addCode( [
				"#include <clipping_planes_fragment>",
				"#include <logdepthbuf_fragment>"
			].join( "\n" ) );

			// flow context

			var colorFlowContext = new NodeContext().setSlot( 'color' );

			// analyze all nodes to reuse generate codes

			if ( this.mask ) this.mask.analyze( builder );

			if ( this.alpha ) this.alpha.analyze( builder );

			this.color.analyze( builder, colorFlowContext );

			// build code

			var mask = this.mask ? this.mask.flow( builder, 'b' ) : undefined,
				alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined,
				color = this.color.flow( builder, 'c', colorFlowContext ),
				output = [];

			if ( mask ) {

				output.push(
					mask.code,
					'if ( ! ' + mask.result + ' ) discard;'
				);

			}

			if ( alpha ) {

				output.push(
					alpha.code,
					'#ifdef ALPHATEST',

					'if ( ' + alpha.result + ' <= ALPHATEST ) discard;',

					'#endif',
					color.code,
					"gl_FragColor = vec4( " + color.result + ", " + alpha.result + " );"
				);

			} else {

				output.push(
					color.code,
					"gl_FragColor = vec4( " + color.result + ", 1.0 );"
				);

			}

			output.push(
				"#include <tonemapping_fragment>",
				"#include <encodings_fragment>",
				"#include <fog_fragment>"
			);

		}

		return output.join( "\n" );

	}

	copy( source ) {

		super.copy( source );

		// vertex

		if ( source.position ) this.position = source.position;

		// fragment

		this.color = source.color;

		if ( source.spherical !== undefined ) this.spherical = source.spherical;

		if ( source.mask ) this.mask = source.mask;

		if ( source.alpha ) this.alpha = source.alpha;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			// vertex

			if ( this.position ) data.position = this.position.toJSON( meta ).uuid;

			// fragment

			data.color = this.color.toJSON( meta ).uuid;

			if ( this.spherical === false ) data.spherical = false;

			if ( this.mask ) data.mask = this.mask.toJSON( meta ).uuid;

			if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;

		}

		return data;

	}

}

export class SpriteNodeMaterial extends NodeMaterial {

	constructor() {

		var node = new SpriteNode();

		super( node, node );

		this.type = "SpriteNodeMaterial";

	}

}

NodeUtils.addShortcuts( SpriteNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'mask',
	'position',
	'spherical'
], true );
