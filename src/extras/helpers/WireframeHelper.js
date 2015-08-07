/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	var geometry = new THREE.WireframeGeometry( object.geometry );
	var skinning = geometry.skinning === true;
	if ( skinning && object.skeleton ) {
		this.skeleton = object.skeleton;
		this.bindMatrix = object.bindMatrix;
		this.bindMatrixInverse = object.bindMatrixInverse;
	}
	THREE.LineSegments.call( this, geometry, new THREE.LineBasicMaterial( { color: color, skinning: skinning } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

THREE.WireframeHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper;
