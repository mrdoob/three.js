/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { PropertyMixer } from '../../../../src/animation/PropertyMixer';

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'PropertyMixer', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PRIVATE STUFF
		QUnit.test( "_select", ( assert ) => {} );

		QUnit.test( "_slerp", ( assert ) => {} );

		QUnit.test( "_lerp", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "accumulate", ( assert ) => {} );

		QUnit.test( "apply", ( assert ) => {} );

		QUnit.test( "saveOriginalState", ( assert ) => {} );

		QUnit.test( "restoreOriginalState", ( assert ) => {} );

	} );

} );

