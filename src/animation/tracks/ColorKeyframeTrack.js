import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 *
 * A Track of keyframe values that represent color.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

class ColorKeyframeTrack extends KeyframeTrack {

	constructor( name, times, values, interpolation ) {

		super( name, times, values, interpolation );

	}

}

ColorKeyframeTrack.prototype.ValueTypeName = 'color';

export { ColorKeyframeTrack };
