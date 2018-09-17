/**
 * @author Kai Salmen / www.kaisalmen.de
 */

'use strict';

var WLGLTFLoader = function ( manager ) {
	THREE.GLTFLoader.call( this, manager );
	this.dracoBuilderPath = '../../';
	this.dracoLibsPath = '';
	this.baseObject3d = null;
};

WLGLTFLoader.prototype = Object.create( THREE.GLTFLoader.prototype );
WLGLTFLoader.prototype.constructor = WLGLTFLoader;

WLGLTFLoader.prototype.setDracoBuilderPath = function ( dracoBuilderPath ) {
	this.dracoBuilderPath = dracoBuilderPath;
};

WLGLTFLoader.prototype.setDracoLibsPath = function ( dracoLibsPath ) {
	this.dracoLibsPath = dracoLibsPath;
};

WLGLTFLoader.prototype.getParseFunctionName = function () {
	return '_parse';
};

WLGLTFLoader.prototype.setBaseObject3d = function ( baseObject3d ) {
	this.baseObject3d = baseObject3d;
};

WLGLTFLoader.prototype._parse = function ( arrayBuffer, options ) {
	var dracoLoader = new WWDRACOLoader();
	dracoLoader.setDracoBuilderPath( this.dracoBuilderPath );
	dracoLoader.setDracoLibsPath( this.dracoLibsPath );
	this.setDRACOLoader( dracoLoader );

	var scope = this;
	var scopedOnLoad = function ( gltf ) {
		var meshes = gltf.scene.children;
		var mesh;
		for ( var i in meshes ) {

			mesh = meshes[ i ];
			scope.baseObject3d.add( mesh );

		}
	};

	this.parse( arrayBuffer, this.path, scopedOnLoad );
};

