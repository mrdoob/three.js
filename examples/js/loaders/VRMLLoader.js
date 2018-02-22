/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

	// for IndexedFaceSet support
	isRecordingPoints: false,
	isRecordingFaces: false,
	points: [],
	indexes: [],

	// for Background support
	isRecordingAngles: false,
	isRecordingColors: false,
	angles: [],
	colors: [],

	recordingFieldname: null,

	crossOrigin: 'Anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( this.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {
		var vrmlRenderer = new VrmlParser.Renderer.ThreeJs(this.debug);
		var scene = new THREE.Scene();
		var nodeTree = vrmlParser.parse(data);
		vrmlRenderer.render(nodeTree, scene);
		return scene;
	}

};
