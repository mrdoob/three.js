import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of numeric keyframe values.
 */
class NumberKeyframeTrack extends KeyframeTrack {}

NumberKeyframeTrack.prototype.ValueTypeName = 'number';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

export { NumberKeyframeTrack };
