/**
 * Generated from 'examples\modules\loaders\KMZLoader.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./ColladaLoader.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './ColladaLoader.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,THREE,ColladaLoader_js) { 'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 */


exports.KMZLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

exports.KMZLoader.prototype = {

	constructor: exports.KMZLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		function findFile( url ) {

			for ( var path in zip.files ) {

				if ( path.substr( - url.length ) === url ) {

					return zip.files[ path ];

				}

			}

		}

		var manager = new THREE.LoadingManager();
		manager.setURLModifier( function ( url ) {

			var image = findFile( url );

			if ( image ) {

				console.log( 'Loading', url );

				var blob = new Blob( [ image.asArrayBuffer() ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		var zip = new JSZip( data ); // eslint-disable-line no-undef

		if ( zip.files[ 'doc.kml' ] ) {

			var xml = new DOMParser().parseFromString( zip.files[ 'doc.kml' ].asText(), 'application/xml' );

			var model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				var loader = new ColladaLoader_js.ColladaLoader( manager );
				return loader.parse( zip.files[ model.textContent ].asText() );

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( var path in zip.files ) {

				var extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					var loader = new ColladaLoader_js.ColladaLoader( manager );
					return loader.parse( zip.files[ path ].asText() );

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new THREE.Group() };

	}

};

Object.defineProperty(exports, '__esModule', { value: true });

})));
