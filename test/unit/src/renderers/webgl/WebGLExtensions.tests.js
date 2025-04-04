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
			QUnit.test( 'Instancing', ( assert ) => {

				const gl = new WebglContextMock();
				const extensions = new WebGLExtensions( gl );
				assert.ok( typeof extensions === 'object' );

			} );

			QUnit.test( 'has', ( assert ) => {

				const gl = new WebglContextMock( [ 'Extension1', 'Extension2' ] );
				const extensions = new WebGLExtensions( gl );
				assert.ok( extensions.has( 'Extension1' ) );
				assert.ok( extensions.has( 'Extension2' ) );
				assert.ok( extensions.has( 'Extension1' ) );
				assert.notOk( extensions.has( 'NonExistingExtension' ) );

			} );

			QUnit.test( 'has (with aliases)', ( assert ) => {

				const gl = new WebglContextMock( [ 'WEBKIT_WEBGL_depth_texture' ] );
				const extensions = new WebGLExtensions( gl );
				assert.ok( extensions.has( 'WEBGL_depth_texture' ) );
				assert.ok( extensions.has( 'WEBKIT_WEBGL_depth_texture' ) );
				assert.notOk( extensions.has( 'EXT_texture_filter_anisotropic' ) );
				assert.notOk( extensions.has( 'NonExistingExtension' ) );

			} );

			QUnit.test( 'get', ( assert ) => {

				const gl = new WebglContextMock( [ 'Extension1', 'Extension2' ] );
				const extensions = new WebGLExtensions( gl );
				assert.ok( extensions.get( 'Extension1' ) );
				assert.ok( extensions.get( 'Extension2' ) );
				assert.ok( extensions.get( 'Extension1' ) );

				// suppress the following console message when testing
				// THREE.WebGLRenderer: NonExistingExtension extension not supported.

				console.level = CONSOLE_LEVEL.OFF;
				assert.notOk( extensions.get( 'NonExistingExtension' ) );
				console.level = CONSOLE_LEVEL.DEFAULT;

			} );

			QUnit.test( 'get (with aliases)', ( assert ) => {

				const gl = new WebglContextMock( [ 'WEBKIT_WEBGL_depth_texture' ] );
				const extensions = new WebGLExtensions( gl );
				assert.ok( extensions.get( 'WEBGL_depth_texture' ) );
				assert.ok( extensions.get( 'WEBKIT_WEBGL_depth_texture' ) );

				// suppress the following console message when testing
				// THREE.WebGLRenderer: EXT_texture_filter_anisotropic extension not supported.
				// THREE.WebGLRenderer: NonExistingExtension extension not supported.

				console.level = CONSOLE_LEVEL.OFF;
				assert.notOk( extensions.get( 'EXT_texture_filter_anisotropic' ) );
				assert.notOk( extensions.get( 'NonExistingExtension' ) );
				console.level = CONSOLE_LEVEL.DEFAULT;

			} );

		} );

	} );

} );
