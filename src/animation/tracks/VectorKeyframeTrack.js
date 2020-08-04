import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of vectored keyframe values.
 */
class VectorKeyframeTrack extends KeyframeTrack {}

Object.assign( VectorKeyframeTrack.prototype, {

	ValueTypeName: 'vector'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

} );

export { VectorKeyframeTrack };
