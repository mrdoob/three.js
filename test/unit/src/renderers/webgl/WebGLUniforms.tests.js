/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLUniforms } from '../../../../../src/renderers/webgl/WebGLUniforms';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLUniforms', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "setValue", ( assert ) => {} );

			QUnit.test( "setOptional", ( assert ) => {} );

			QUnit.test( "upload", ( assert ) => {} );

			QUnit.test( "seqWithValue", ( assert ) => {} );

		} );

	} );

} );
