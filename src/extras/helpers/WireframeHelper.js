/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	var geometry = new THREE.WireframeGeometry( object.geometry );
	var skinning = !!geometry.attributes.skinIndex;
	if ( skinning && object.skeleton ) {
		this.skeleton = object.skeleton;
		this.bindMatrix = object.bindMatrix;
		this.bindMatrixInverse = object.bindMatrixInverse;
	}
	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: color, skinning: skinning } ), THREE.LinePieces );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper;
