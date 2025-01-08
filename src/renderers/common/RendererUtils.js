import { Color } from '../../math/Color.js';

/** @module RendererUtils **/

/**
 * Saves the state of the given renderer and stores it into the given state object.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function saveRendererState( renderer, state = {} ) {

	state.toneMapping = renderer.toneMapping;
	state.toneMappingExposure = renderer.toneMappingExposure;
	state.outputColorSpace = renderer.outputColorSpace;
	state.renderTarget = renderer.getRenderTarget();
	state.activeCubeFace = renderer.getActiveCubeFace();
	state.activeMipmapLevel = renderer.getActiveMipmapLevel();
	state.renderObjectFunction = renderer.getRenderObjectFunction();
	state.pixelRatio = renderer.getPixelRatio();
	state.mrt = renderer.getMRT();
	state.clearColor = renderer.getClearColor( state.clearColor || new Color() );
	state.clearAlpha = renderer.getClearAlpha();
	state.autoClear = renderer.autoClear;
	state.scissorTest = renderer.getScissorTest();

	return state;

}

/**
 * Saves the state of the given renderer and stores it into the given state object.
 * Besides, the function also resets the state of the renderer to its default values.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function resetRendererState( renderer, state ) {

	state = saveRendererState( renderer, state );

	renderer.setMRT( null );
	renderer.setRenderObjectFunction( null );
	renderer.setClearColor( 0x000000, 1 );
	renderer.autoClear = true;

	return state;

}

/**
 * Restores the state of the given renderer from the given state object.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Object} state - The state to restore.
 */
export function restoreRendererState( renderer, state ) {

	renderer.toneMapping = state.toneMapping;
	renderer.toneMappingExposure = state.toneMappingExposure;
	renderer.outputColorSpace = state.outputColorSpace;
	renderer.setRenderTarget( state.renderTarget, state.activeCubeFace, state.activeMipmapLevel );
	renderer.setRenderObjectFunction( state.renderObjectFunction );
	renderer.setPixelRatio( state.pixelRatio );
	renderer.setMRT( state.mrt );
	renderer.setClearColor( state.clearColor, state.clearAlpha );
	renderer.autoClear = state.autoClear;
	renderer.setScissorTest( state.scissorTest );

}

/**
 * Saves the state of the given scene and stores it into the given state object.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Scene} scene - The scene.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function saveSceneState( scene, state = {} ) {

	state.background = scene.background;
	state.backgroundNode = scene.backgroundNode;
	state.overrideMaterial = scene.overrideMaterial;

	return state;

}

/**
 * Saves the state of the given scene and stores it into the given state object.
 * Besides, the function also resets the state of the scene to its default values.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Scene} scene - The scene.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function resetSceneState( scene, state ) {

	state = saveSceneState( scene, state );

	scene.background = null;
	scene.backgroundNode = null;
	scene.overrideMaterial = null;

	return state;

}

/**
 * Restores the state of the given scene from the given state object.
 *
 * @function
 * @param {Scene} scene - The scene.
 * @param {Object} state - The state to restore.
 */
export function restoreSceneState( scene, state ) {

	scene.background = state.background;
	scene.backgroundNode = state.backgroundNode;
	scene.overrideMaterial = state.overrideMaterial;

}

/**
 * Saves the state of the given renderer and scene and stores it into the given state object.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Scene} scene - The scene.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function saveRendererAndSceneState( renderer, scene, state = {} ) {

	state = saveRendererState( renderer, state );
	state = saveSceneState( scene, state );

	return state;

}

/**
 * Saves the state of the given renderer and scene and stores it into the given state object.
 * Besides, the function also resets the state of the renderer and scene to its default values.
 *
 * If not state object is provided, the function creates one.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Scene} scene - The scene.
 * @param {Object} [state={}] - The state.
 * @return {Object} The state.
 */
export function resetRendererAndSceneState( renderer, scene, state ) {

	state = resetRendererState( renderer, state );
	state = resetSceneState( scene, state );

	return state;

}

/**
 * Restores the state of the given renderer and scene from the given state object.
 *
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {Scene} scene - The scene.
 * @param {Object} state - The state to restore.
 */
export function restoreRendererAndSceneState( renderer, scene, state ) {

	restoreRendererState( renderer, state );
	restoreSceneState( scene, state );

}
