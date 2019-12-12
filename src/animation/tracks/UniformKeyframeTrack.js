import { KeyframeTrack } from '../KeyframeTrack.js';

function UniformKeyframeTrack( name, times, values, uniType, interpolation ) {

	KeyframeTrack.call( this, name, times, values, interpolation );
	this.ValueTypeName = uniType;

}

UniformKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrack.prototype ), {

	constructor: UniformKeyframeTrack,

	ValueTypeName: "uniform",

	ValueBufferType: Array

} );

export { UniformKeyframeTrack };
