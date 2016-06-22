/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	THREE.LineSegments.call( this, new THREE.WireframeGeometry( object.geometry ), new THREE.LineBasicMaterial( { color: color } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

THREE.WireframeHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper;
