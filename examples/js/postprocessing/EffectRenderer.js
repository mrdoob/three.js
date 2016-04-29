
/**
 *
 * Utilities that make it easier to use WebGLRenderer for specific tasks, such as passes.
 *
 * @author bhouston / http://clara.io/
 *
 */

THREE.EffectRenderer = function () {
	return this;
};

THREE.EffectRenderer.getClearState = function ( renderer, optionalClearState ) {

	var clearState = optionalClearState || {};

	clearState.color = renderer.getClearColor();
	clearState.alpha = renderer.getClearAlpha();
	clearState.autoClear = renderer.autoClear;

	return clearState;

},

THREE.EffectRenderer.setClearState = function ( renderer, clearState ) {

	renderer.setClearColor( clearState.color );
	renderer.setClearAlpha( clearState.alpha );
	renderer.autoClear = clearState.autoClear;

};

THREE.EffectRenderer.applyCustomClearState = function( renderer, material, clearColor, clearAlpha ) {

	renderer.autoClear = false;
	clearColor = clearColor || material.clearColor;
	clearAlpha = clearAlpha || material.clearAlpha;

	var clearNeeded = ( clearColor !== undefined )&&( clearColor !== null );
	if( clearNeeded ) {
		renderer.setClearColor( clearColor );
		renderer.setClearAlpha( clearAlpha || 0.0 );
	}

	return clearNeeded;

};

THREE.EffectRenderer.renderOverride = function ( renderer, overrideMaterial, scene, camera, renderTarget, clearColor, clearAlpha ) {

	var self = THREE.EffectRenderer;

	var clearState = self.getClearState( renderer );
	var clearNeeded = self.applyCustomClearState( renderer, overrideMaterial, clearColor, clearAlpha );

	scene.overrideMaterial = overrideMaterial;
	renderer.render( scene, camera, renderTarget, clearNeeded );
	scene.overrideMaterial = null;

	self.setClearState( renderer, clearState );

};

THREE.EffectRenderer.renderPass = function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

	var self = THREE.EffectRenderer;

	if( ! self.passScene ) {
		self.passCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		self.passQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		self.passScene = new THREE.Scene();
		self.passScene.add( self.passQuad );
	}

	var clearState = self.getClearState( renderer );
	var clearNeeded = self.applyCustomClearState( renderer, passMaterial, clearColor, clearAlpha );

	self.passQuad.material = passMaterial;
	renderer.render( self.passScene, self.passCamera, renderTarget, clearNeeded );

	self.setClearState( renderer, clearState );

};

THREE.EffectRenderer.renderCopyPass = function( renderer, source, opacity, renderTarget, clearColor, clearAlpha ) {

	var self = THREE.EffectRenderer;

	if( ! self.copyShader ) {
		if ( THREE.CopyShader === undefined )
			console.error( "THREE.EffectRenderer relies on THREE.CopyShader" );
			
		self.copyShader = new THREE.ShaderMaterial( THREE.CopyShader );
	}

	self.copyShader.tDiffuse = source;
	self.copyShader.opacity = opacity;

	self.renderPass( renderer, er.copyShader, renderTarget, clearColor, clearAlpha );

};
