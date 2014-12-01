/**
 * @author WestLangley / http://github.com/WestLangley
 */

// a helper to show the world-axis-aligned bounding box for an object

THREE.BoundingBoxHelper = function ( object, color ) {

	if ( color === undefined ) color = 0x888888;
	this.colors = {
    		main: new THREE.Color()
	};
	this.colors.main.set( color );

	this.object = object;

	this.box = new THREE.Box3();

	THREE.Mesh.call( this, new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: this.colors.main, wireframe: true } ) );

};

THREE.BoundingBoxHelper.prototype = Object.create( THREE.Mesh.prototype );
THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper;

THREE.BoundingBoxHelper.prototype.update = function () {

	this.box.setFromObject( this.object );

	this.box.size( this.scale );

	this.box.center( this.position );

};

THREE.BoundingBoxHelper.prototype.setColor = function ( color ) {
	
	this.colors.main.set( color );
	this.material.color.copy( this.colors.main );
	
};
