
/**
 *
 * Utilities that make it easier to use WebGLRenderer for specific tasks, such as passes.
 *
 * @author bhouston / http://clara.io/
 *
 */

THREE.WebGLRendererUtils = function () {
};

THREE.WebGLRendererUtils.saveClearState = function ( renderer, target ) {

	target.clearColor = renderer.getClearColor();
	target.clearAlpha = renderer.getClearAlpha();
	target.autoClear = renderer.autoClear;

};

THREE.WebGLRendererUtils.setClearState = function( renderer, material, clearColor, clearAlpha ) {

	renderer.autoClear = false;
	clearColor = material.clearColor || clearColor;
	clearAlpha = material.clearAlpha || clearAlpha;
	var clearNeeded = ( clearColor !== undefined )&&( clearColor !== null );
	if( clearNeeded ) {
		renderer.setClearColor( clearColor );
		renderer.setClearAlpha( clearAlpha || 0.0 );
	}

	return clearNeeded;

}
THREE.WebGLRendererUtils.restoreClearState = function ( renderer, target ) {

	renderer.setClearColor( target.clearColor );
	renderer.setClearAlpha( target.clearAlpha );
	renderer.autoClear = target.autoClear;

};

THREE.WebGLRendererUtils.renderOverride = function ( renderer, overrideMaterial, scene, camera, renderTarget, clearColor, clearAlpha ) {

	var utils = THREE.WebGLRendererUtils;

	utils.saveClearState( renderer, utils );
	var clearNeeded = utils.setClearState( renderer, overrideMaterial, clearColor, clearAlpha );

	scene.overrideMaterial = overrideMaterial;
	renderer.render( scene, camera, renderTarget, clearNeeded );
	scene.overrideMaterial = null;

	utils.restoreClearState( renderer, utils );

}

THREE.WebGLRendererUtils.renderPass = function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

	var utils = THREE.WebGLRendererUtils;

	if( ! utils.passScene ) {
		utils.passCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		utils.passQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
		utils.passScene = new THREE.Scene();
		utils.passScene.add( utils.passQuad );
	}

	utils.saveClearState( renderer, utils );
	var clearNeeded = utils.setClearState( renderer, passMaterial, clearColor, clearAlpha );

	utils.passQuad.material = passMaterial;
	renderer.render( utils.passScene, utils.passCamera, renderTarget, clearNeeded );

	utils.restoreClearState( renderer, utils );

}
