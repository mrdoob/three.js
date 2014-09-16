/**
 * @author dmtaub / http://www.dmtaub.com
 */

module( "Object3D" );


THREE.CustomObject = function (){
	THREE.Object3D.call( this );
	this.type = "CustomObject";
};

THREE.CustomObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CustomObject.parse = function (data, geometries, materials) {

	return ( new THREE.CustomObject() );
	// nothing special to initialize this one

};

THREE.CustomMesh = function ( geometry, material ){
	THREE.Mesh.call( this, geometry, material );
	this.type = "CustomMesh";
};

THREE.CustomMesh.prototype = Object.create( THREE.Mesh.prototype );

THREE.CustomMesh.parse = function (data, geometries, materials) {

	var geometry = geometries[ data.geometry ];
	var material = materials[ data.material ];

	if ( ( geometry === undefined ) || ( material === undefined ) )
		throw "missing geometry or material"

	return ( new THREE.CustomMesh(data, geometry, material) );
	// nothing special to initialize this one

};



THREE.CustomTypes = { 
	'CustomObject': THREE.CustomObject,
	'CustomMesh': THREE.CustomMesh
 };

test( "custom objects initialize", function() {

	var object = new THREE.CustomObject();

	ok( object instanceof THREE.Object3D, "Passed!" );
	ok( object instanceof THREE.CustomObject, "Passed!" );

});



test( "custom object serializes/deserializes", function() {

	var object = new THREE.CustomObject();

	var strObj = object.toJSON();

	var loader = new THREE.ObjectLoader();

	var deserialized = loader.parse(strObj); 

	ok( deserialized instanceof THREE.Object3D, "Passed!" );
	ok( deserialized instanceof THREE.CustomObject, "Passed!" );
	
});


test( "custom mesh serializes/deserializes", function() {

	var geometry = new THREE.SphereGeometry();
	var material = new THREE.MeshBasicMaterial();

	var object = new THREE.CustomMesh(geometry, material);

	var strObj = object.toJSON();

	var loader = new THREE.ObjectLoader();

	var deserialized = loader.parse(strObj); 

	ok( deserialized instanceof THREE.Mesh, "Passed!" );
	ok( deserialized instanceof THREE.CustomMesh, "Passed!" );
	
});
