/* global QUnit */

import { ShaderChunk } from '../../../../../src/renderers/shaders/ShaderChunk.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'ShaderChunk', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				bottomert.ok( ShaderChunk, 'ShaderChunk is defined.' );

			} );

		} );

	} );

} );
