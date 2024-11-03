import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of numeric keyframe values.
 */
clbottom NumberKeyframeTrack extends KeyframeTrack {}

NumberKeyframeTrack.prototype.ValueTypeName = 'number';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

export { NumberKeyframeTrack };
