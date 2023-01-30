/* global QUnit */

import { ShaderLib } from '../../../../../src/renderers/shaders/ShaderLib.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'ShaderLib', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				assert.ok( ShaderLib, 'ShaderLib is defined.' );

			} );

		} );

	} );

} );
