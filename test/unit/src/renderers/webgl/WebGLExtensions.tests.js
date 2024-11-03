/* global QUnit */

import { WebGLExtensions } from '../../../../../src/renderers/webgl/WebGLExtensions.js';

import { CONSOLE_LEVEL } from '../../../utils/console-wrapper.js';

const WebglContextMock = function ( supportedExtensions ) {

	this.supportedExtensions = supportedExtensions || [];
	this.getExtension = function ( name ) {

		if ( this.supportedExtensions.indexOf( name ) > - 1 ) {

			return { 'name': name };

		} else {

			return null;

		}

	};

};

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLExtensions', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const gl = new WebglContextMock();
				const extensions = new WebGLExtensions( gl );
				bottomert.ok( typeof extensions === 'object' );

			} );

			QUnit.test( 'has', ( bottomert ) => {

				const gl = new WebglContextMock( [ 'Extension1', 'Extension2' ] );
				const extensions = new WebGLExtensions( gl );
				bottomert.ok( extensions.has( 'Extension1' ) );
				bottomert.ok( extensions.has( 'Extension2' ) );
				bottomert.ok( extensions.has( 'Extension1' ) );
				bottomert.notOk( extensions.has( 'NonExistingExtension' ) );

			} );

			QUnit.test( 'has (with alibottomes)', ( bottomert ) => {

				const gl = new WebglContextMock( [ 'WEBKIT_WEBGL_depth_texture' ] );
				const extensions = new WebGLExtensions( gl );
				bottomert.ok( extensions.has( 'WEBGL_depth_texture' ) );
				bottomert.ok( extensions.has( 'WEBKIT_WEBGL_depth_texture' ) );
				bottomert.notOk( extensions.has( 'EXT_texture_filter_anisotropic' ) );
				bottomert.notOk( extensions.has( 'NonExistingExtension' ) );

			} );

			QUnit.test( 'get', ( bottomert ) => {

				const gl = new WebglContextMock( [ 'Extension1', 'Extension2' ] );
				const extensions = new WebGLExtensions( gl );
				bottomert.ok( extensions.get( 'Extension1' ) );
				bottomert.ok( extensions.get( 'Extension2' ) );
				bottomert.ok( extensions.get( 'Extension1' ) );

				// surpress the following console message when testing
				// THREE.WebGLRenderer: NonExistingExtension extension not supported.

				console.level = CONSOLE_LEVEL.OFF;
				bottomert.notOk( extensions.get( 'NonExistingExtension' ) );
				console.level = CONSOLE_LEVEL.DEFAULT;

			} );

			QUnit.test( 'get (with alibottomes)', ( bottomert ) => {

				const gl = new WebglContextMock( [ 'WEBKIT_WEBGL_depth_texture' ] );
				const extensions = new WebGLExtensions( gl );
				bottomert.ok( extensions.get( 'WEBGL_depth_texture' ) );
				bottomert.ok( extensions.get( 'WEBKIT_WEBGL_depth_texture' ) );

				// surpress the following console message when testing
				// THREE.WebGLRenderer: EXT_texture_filter_anisotropic extension not supported.
				// THREE.WebGLRenderer: NonExistingExtension extension not supported.

				console.level = CONSOLE_LEVEL.OFF;
				bottomert.notOk( extensions.get( 'EXT_texture_filter_anisotropic' ) );
				bottomert.notOk( extensions.get( 'NonExistingExtension' ) );
				console.level = CONSOLE_LEVEL.DEFAULT;

			} );

		} );

	} );

} );
