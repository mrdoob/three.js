import { Color } from '../../math/Color.js';

// renderer state

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

export function resetRendererState( renderer, state ) {

	state = saveRendererState( renderer, state );

	renderer.setMRT( null );
	renderer.setRenderObjectFunction( null );
	renderer.setClearColor( 0x000000, 1 );
	renderer.autoClear = true;

	return state;

}

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

// scene state

export function saveSceneState( scene, state = {} ) {

	state.background = scene.background;
	state.backgroundNode = scene.backgroundNode;
	state.fog = scene.fog;
	state.fogNode = scene.fogNode;
	state.overrideMaterial = scene.overrideMaterial;

	return state;

}

export function resetSceneState( scene, state ) {

	state = saveSceneState( scene, state );

	scene.background = null;
	scene.backgroundNode = null;
	scene.fog = null;
	scene.fogNode = null;
	scene.overrideMaterial = null;

	return state;

}

export function restoreSceneState( scene, state ) {

	scene.background = state.background;
	scene.backgroundNode = state.backgroundNode;
	scene.fog = state.fog;
	scene.fogNode = state.fogNode;
	scene.overrideMaterial = state.overrideMaterial;

}

// renderer and scene state

export function saveRendererAndSceneState( renderer, scene, state = {} ) {

	state = saveRendererState( renderer, state );
	state = saveSceneState( scene, state );

	return state;

}

export function resetRendererAndSceneState( renderer, scene, state ) {

	state = resetRendererState( renderer, state );
	state = resetSceneState( scene, state );

	return state;

}

export function restoreRendererAndSceneState( renderer, scene, state ) {

	restoreRendererState( renderer, state );
	restoreSceneState( scene, state );

}
