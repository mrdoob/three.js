import { AnimationUtils } from './AnimationUtils';

function KeyframeTrackConstructor ( name, times, values, interpolation ) {
	this.isKeyframeTrack = true;

	if( name === undefined ) throw new Error( "track name is undefined" );

	if( times === undefined || times.length === 0 ) {

		throw new Error( "no keyframes in track named " + name );

	}

	this.name = name;

	this.times = AnimationUtils.convertArray( times, this.TimeBufferType );
	this.values = AnimationUtils.convertArray( values, this.ValueBufferType );

	this.setInterpolation( interpolation || this.DefaultInterpolation );

	this.validate();
	this.optimize();

}

export { KeyframeTrackConstructor };