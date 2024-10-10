import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../core/UniformNode.js';

export const time = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.time );
export const deltaTime = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.deltaTime );
export const frameId = /*@__PURE__*/ uniform( 0, 'uint' ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.frameId );

// Deprecated

export const timerLocal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerLocal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

export const timerGlobal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerGlobal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

export const timerDelta = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerDelta() is deprecated. Use "deltaTime" instead.' );
	return deltaTime.mul( timeScale );

};
