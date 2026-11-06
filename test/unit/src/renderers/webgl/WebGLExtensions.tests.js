import { assert, describe, test } from 'vitest';

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

describe( 'Renderers', () => {

	describe( 'WebGL', () => {

		describe( 'WebGLExtensions', () => {

			// INSTANCING
			test( 'Instancing', () => {

				const gl = new WebglContextMock();
				const extensions = new WebGLExtensions( gl );
				assert.ok( typeof extensions === 'object' );

			} );

			test( 'has', () => {

				const gl = new WebglContextMock( [ 'Extension1', 'Extension2' ] );
				const extensions = new WebGLExtensions( gl );
				assert.ok( extensions.has( 'Extension1' ) );
				assert.ok( extensions.has( 'Extension2' ) );
				assert.ok( extensions.has( 'Extension1' ) );
				assert.notOk( extensions.has( 'NonExistingExtension' ) );

			} );

			test( 'get', () => {

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

		} );

	} );

} );
