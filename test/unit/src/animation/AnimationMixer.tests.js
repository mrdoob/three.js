/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationMixer } from '../../../../src/animation/AnimationMixer';

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'AnimationMixer', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PRIVATE STUFF
		QUnit.test( "_bindAction", ( assert ) => {} );

		QUnit.test( "_activateAction", ( assert ) => {} );

		QUnit.test( "_deactivateAction", ( assert ) => {} );

		QUnit.test( "_initMemoryManager", ( assert ) => {} );

		QUnit.test( "_isActiveAction", ( assert ) => {} );

		QUnit.test( "_addInactiveAction", ( assert ) => {} );

		QUnit.test( "_removeInactiveAction", ( assert ) => {} );

		QUnit.test( "_removeInactiveBindingsForAction", ( assert ) => {} );

		QUnit.test( "_lendAction", ( assert ) => {} );

		QUnit.test( "_takeBackAction", ( assert ) => {} );

		QUnit.test( "_addInactiveBinding", ( assert ) => {} );

		QUnit.test( "_removeInactiveBinding", ( assert ) => {} );

		QUnit.test( "_lendBinding", ( assert ) => {} );

		QUnit.test( "_takeBackBinding", ( assert ) => {} );

		QUnit.test( "_lendControlInterpolant", ( assert ) => {} );

		QUnit.test( "_takeBackControlInterpolant", ( assert ) => {} );

		QUnit.test( "_controlInterpolantsResultBuffer", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "clipAction", ( assert ) => {} );

		QUnit.test( "existingAction", ( assert ) => {} );

		QUnit.test( "stopAllAction", ( assert ) => {} );

		QUnit.test( "update", ( assert ) => {} );

		QUnit.test( "getRoot", ( assert ) => {} );

		QUnit.test( "uncacheClip", ( assert ) => {} );

		QUnit.test( "uncacheRoot", ( assert ) => {} );

		QUnit.test( "uncacheAction", ( assert ) => {} );

	} );

} );
