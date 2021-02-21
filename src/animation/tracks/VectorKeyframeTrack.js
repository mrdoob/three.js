import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of vectored keyframe values.
 */
class VectorKeyframeTrack extends KeyframeTrack {}

VectorKeyframeTrack.prototype.ValueTypeName = 'vector';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

export { VectorKeyframeTrack };
