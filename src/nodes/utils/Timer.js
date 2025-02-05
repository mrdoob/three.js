import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../core/UniformNode.js';

/**
 * Represents the elapsed time in seconds.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const time = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.time );

/**
 * Represents the delta time in seconds.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const deltaTime = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.deltaTime );

/**
 * Represents the current frame ID.
 *
 * @tsl
 * @type {UniformNode<uint>}
 */
export const frameId = /*@__PURE__*/ uniform( 0, 'uint' ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.frameId );

// Deprecated

/**
 * @tsl
 * @function
 * @deprecated since r170. Use {@link time} instead.
 *
 * @param {number} [timeScale=1] - The time scale.
 * @returns {UniformNode<float>}
 */
export const timerLocal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerLocal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

/**
 * @tsl
 * @function
 * @deprecated since r170. Use {@link time} instead.
 *
 * @param {number} [timeScale=1] - The time scale.
 * @returns {UniformNode<float>}
 */
export const timerGlobal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerGlobal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

/**
 * @tsl
 * @function
 * @deprecated since r170. Use {@link deltaTime} instead.
 *
 * @param {number} [timeScale=1] - The time scale.
 * @returns {UniformNode<float>}
 */
export const timerDelta = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerDelta() is deprecated. Use "deltaTime" instead.' );
	return deltaTime.mul( timeScale );

};
