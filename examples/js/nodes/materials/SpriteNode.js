/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SpriteNode = function () {

	THREE.GLNode.call( this );

	this.color = new THREE.ColorNode( 0xEEEEEE );
	this.spherical = true;

};

THREE.SpriteNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.SpriteNode.prototype.constructor = THREE.SpriteNode;

THREE.SpriteNode.prototype.build = function ( builder ) {

	var material = builder.material;
	var output, code;

	material.define( 'SPRITE' );

	material.requestAttribs.light = false;
	material.requestAttribs.transparent = this.alpha != undefined;

	if ( builder.isShader( 'vertex' ) ) {

		var transform = this.transform ? this.transform.parseAndBuildCode( builder, 'v3', { cache: 'transform' } ) : undefined;

		material.mergeUniform( THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ "fog" ]
		] ) );

		material.addVertexPars( [
			"#include <fog_pars_vertex>"
		].join( "\n" ) );

		output = [
			"#include <begin_vertex>"
		];

		if ( transform ) {

			output.push(
				transform.code,
				"transformed = " + transform.result + ";"
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

		material.addFragmentPars( [
			"#include <fog_pars_fragment>",
		].join( "\n" ) );

		// parse all nodes to reuse generate codes

		this.color.parse( builder, { slot: 'color' } );
		if ( this.alpha ) this.alpha.parse( builder );

		// build code

		var color = this.color.buildCode( builder, 'c', { slot: 'color' } );
		var alpha = this.alpha ? this.alpha.buildCode( builder, 'fv1' ) : undefined;

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
