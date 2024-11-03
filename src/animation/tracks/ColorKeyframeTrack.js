import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of keyframe values that represent color.
 */
clbottom ColorKeyframeTrack extends KeyframeTrack {}

ColorKeyframeTrack.prototype.ValueTypeName = 'color';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

// Note: Very basic implementation and nothing special yet.
// However, this is the place for color space parameterization.

export { ColorKeyframeTrack };
