/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodePass = function () {

	THREE.ShaderPass.call( this );

	this.name = "";
	this.uuid = THREE.Math.generateUUID();

	this.userData = {};

	this.textureID = 'renderTexture';

	this.fragment = new THREE.RawNode( new THREE.ScreenNode() );

	this.node = new THREE.NodeMaterial();
	this.node.fragment = this.fragment;

	this.build();

};

THREE.NodePass.prototype = Object.create( THREE.ShaderPass.prototype );
THREE.NodePass.prototype.constructor = THREE.NodePass;

THREE.NodeMaterial.addShortcuts( THREE.NodePass.prototype, 'fragment', [ 'value' ] );

THREE.NodePass.prototype.build = function () {

	this.node.build();

	this.uniforms = this.node.uniforms;
	this.material = this.node;

};

THREE.NodePass.prototype.toJSON = function ( meta ) {

	var isRootObject = ( meta === undefined || typeof meta === 'string' );

	if ( isRootObject ) {

		meta = {
			nodes: {}
		};

	}

	if ( meta && ! meta.passes ) meta.passes = {};

	if ( ! meta.passes[ this.uuid ] ) {

		var data = {};

		data.uuid = this.uuid;
		data.type = "NodePass";

		meta.passes[ this.uuid ] = data;

		if ( this.name !== "" ) data.name = this.name;

		if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

		data.value = this.value.toJSON( meta ).uuid;

	}

	meta.pass = this.uuid;

	return meta;

};
