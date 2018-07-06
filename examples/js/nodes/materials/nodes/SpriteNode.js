/**
 * @author sunag / http://www.sunag.com.br/
 */

import { GLNode } from '../../core/GLNode.js';
import { ColorNode } from '../../inputs/ColorNode.js';

function SpriteNode() {

	GLNode.call( this );

	this.color = new ColorNode( 0xEEEEEE );
	this.spherical = true;

};

SpriteNode.prototype = Object.create( GLNode.prototype );
SpriteNode.prototype.constructor = SpriteNode;
SpriteNode.prototype.nodeType = "Sprite";

SpriteNode.prototype.build = function ( builder ) {

	var output, code;

	builder.define( 'SPRITE' );

	builder.requires.lights = false;
	builder.requires.transparent = this.alpha != undefined;

	if ( builder.isShader( 'vertex' ) ) {

		var transform = this.transform ? this.transform.parseAndBuildCode( builder, 'v3', { cache: 'transform' } ) : undefined;

		builder.mergeUniform( THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ "fog" ]
		] ) );

		builder.addParsCode( [
			"#include <fog_pars_vertex>"
		].join( "\n" ) );

		output = [
			"#include <begin_vertex>"
		];

		if ( transform ) {

			output.push(
				transform.code,
				transform.result ? "transformed = " + transform.result + ";" : ''
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

			// apply
			'gl_Position = projectionMatrix * modelViewMtx * modelMtx * vec4( transformed, 1.0 );'
		);

	} else {

		builder.addParsCode( [
			"#include <fog_pars_fragment>",
		].join( "\n" ) );

		// parse all nodes to reuse generate codes

		this.color.parse( builder, { slot: 'color' } );

		if ( this.alpha ) this.alpha.parse( builder );

		// build code

		var color = this.color.buildCode( builder, 'c', { slot: 'color' } );
		var alpha = this.alpha ? this.alpha.buildCode( builder, 'f' ) : undefined;

		output = [ color.code ];

		if ( alpha ) {

			output.push(
				alpha.code,
				"gl_FragColor = vec4( " + color.result + ", " + alpha.result + " );"
			);

		} else {

			output.push( "gl_FragColor = vec4( " + color.result + ", 1.0 );" );

		}

		output.push( "#include <fog_fragment>" );

	}

	return output.join( "\n" );

};

SpriteNode.prototype.copy = function ( source ) {
			
	GLNode.prototype.copy.call( this, source );
	
	// vertex
	
	if ( source.transform ) this.transform = source.transform;
	
	// fragment
	
	this.color = source.color;
	
	if ( source.spherical !== undefined ) this.spherical = source.transform;
	
	if ( source.alpha ) this.alpha = source.alpha;

};

SpriteNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		// vertex

		if ( this.transform ) data.transform = this.transform.toJSON( meta ).uuid;

		// fragment

		data.color = this.color.toJSON( meta ).uuid;
		
		if ( this.spherical === false ) data.spherical = false;

		if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;

	}

	return data;

};

export { SpriteNode };
