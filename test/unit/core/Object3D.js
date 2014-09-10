/**
 * @author dmtaub / http://www.dmtaub.com
 */

module( "Object3D" );


THREE.CustomObject = function (){
	THREE.Object3D.call( this );
	this.type = "CustomObject";
};

THREE.CustomObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CustomObject.parse = function (data) {

	return (new THREE.CustomObject());
	// nothing special to initialize this one

};

THREE.CustomTypes = { 'CustomObject': THREE.CustomObject };

test( "custom type initializes", function() {

	var object = new THREE.CustomObject();

	ok( object instanceof THREE.Object3D, "Passed!" );
	ok( object instanceof THREE.CustomObject, "Passed!" );

});



test( "custom type serializes", function() {

	var object = new THREE.CustomObject();
	window.o=object;
	var strObj = object.toJSON();

	var loader = new THREE.ObjectLoader();

	var deserialized = loader.parse(strObj); 

	window.d=deserialized;

	ok( deserialized instanceof THREE.Object3D, "Passed!" );
	ok( deserialized instanceof THREE.CustomObject, "Passed!" );
	
});
