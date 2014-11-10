/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {};

APP.Player = function () {

	var loader = new THREE.ObjectLoader();
	var camera, scene, renderer;
	var scripts;
	
	this.dom = undefined;

	this.load = function ( json ) {

		renderer = new THREE.WebGLRenderer( { antialias: true } );

		scene = loader.parse( json );

		/*
		scripts = [];

		scene.traverse( function ( child ) {

			if ( child.script !== undefined ) {

				var script = new Function( 'scene', 'time', child.script.source ).bind( child );
				scripts.push( script );

			}

		} );
		*/

		this.dom = renderer.domElement;

	};

	this.setCamera = function ( master ) {

		camera = master.clone();

	};

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

	};

	var request;

	var animate = function ( time ) {

		request = requestAnimationFrame( animate );

		/*
		for ( var i = 0; i < scripts.length; i ++ ) {

			scripts[ i ]( scene, time );

		}
		*/

		renderer.render( scene, camera );

	};

	this.play = function () {

		request = requestAnimationFrame( animate );

	};

	this.stop = function () {

		cancelAnimationFrame( request );

	};

};

APP.Script = function ( source ) {

	this.uuid = THREE.Math.generateUUID();
	this.source = source;

};
