/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { KeyframeTrack } from '../../../../src/animation/KeyframeTrack';
import { KeyframeTrackConstructor } from '../../../../src/animation/KeyframeTrackConstructor'; // Todo: why so pain ?
import { KeyframeTrackPrototype } from '../../../../src/animation/KeyframeTrackPrototype'; // Todo: why so pain ?

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'KeyframeTrack', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// STATIC STUFF
		QUnit.test( "parse", ( assert ) => {} );

		QUnit.test( "toJSON", ( assert ) => {} );

		QUnit.test( "_getTrackTypeForValueTypeName", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "TimeBufferType", ( assert ) => {} );

		QUnit.test( "ValueBufferType", ( assert ) => {} );

		QUnit.test( "DefaultInterpolation", ( assert ) => {} );

		QUnit.test( "InterpolantFactoryMethodDiscrete", ( assert ) => {} );

		QUnit.test( "InterpolantFactoryMethodLinear", ( assert ) => {} );

		QUnit.test( "InterpolantFactoryMethodSmooth", ( assert ) => {} );

		QUnit.test( "setInterpolation", ( assert ) => {} );

		QUnit.test( "getInterpolation", ( assert ) => {} );

		QUnit.test( "getValueSize", ( assert ) => {} );

		QUnit.test( "shift", ( assert ) => {} );

		QUnit.test( "scale", ( assert ) => {} );

		QUnit.test( "trim", ( assert ) => {} );

		QUnit.test( "validate", ( assert ) => {} );

		QUnit.test( "optimize", ( assert ) => {} );

	} );

} );

