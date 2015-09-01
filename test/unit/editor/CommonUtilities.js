// module( "CommonUtilities" );

function aBox( name ) {

	var width = 100;
	var height = 100;
	var depth = 100;

	var widthSegments = 1;
	var heightSegments = 1;
	var depthSegments = 1;

	var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
	mesh.name = name || "Box 1";

	return mesh;

}

function aSphere( name ) {

	var width = 100;
	var height = 100;
	var depth = 100;

	var widthSegments = 1;
	var heightSegments = 1;
	var depthSegments = 1;

	var geometry = new THREE.SphereGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
	mesh.name = name || "Sphere 1";

	return mesh;

}

function aPointlight( name ) {

	var object = new THREE.PointLight( 54321, 1.0, 0.0, 1.0 );
	object.name = name || "PointLight 1";

	return object;

}

function aPerspectiveCamera( name ) {

	var object = new THREE.PerspectiveCamera( 50.1, 0.4, 1.03, 999.05 );
	object.name = name || "PerspectiveCamera 1";

	return object;

}

function getScriptCount( editor ) {

	var scriptsKeys = Object.keys( editor.scripts );
	var scriptCount = 0;

	for ( var i = 0; i < scriptsKeys.length; i++ ) {

		scriptCount += editor.scripts[ scriptsKeys[i] ].length;

	}

	return scriptCount;
}
