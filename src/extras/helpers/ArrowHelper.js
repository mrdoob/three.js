/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://exocortex.com
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  material - Material ( LineBasicMaterial or LineDashedMaterial )
 *  headLength - Number
 *  headWidth - Number
 */

THREE.ArrowHelper = ( function () {

	return function ( dir, origin, length, material, headLength, headWidth ) {

		if ( parseInt( material, 16 ) ) { 
			material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
			console.log( 'Please, for ArrowHelper use a LineBasicMaterial or LineDashedMaterial instead of the HEX' ); 
		}
		if ( material === undefined ) material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
		if ( length === undefined ) { this.length = 1 } else { this.length = length; }
		if ( headLength === undefined ) headLength = 0.2 * this.length;
		if ( headWidth === undefined ) headWidth = 0.2 * headLength;

		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, this.length, 0 ) );
		lineGeometry.computeLineDistances();

		var coneGeometry = new THREE.CylinderGeometry( 0, 0.5, 1, 5, 1 );
		coneGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, - 0.5, 0 ) );

		// dir is assumed to be normalized

		THREE.Object3D.call( this );

		this.position.copy( origin );

		this.line = new THREE.Line( lineGeometry, material );
		this.line.matrixAutoUpdate = false;
		this.add( this.line );

		this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color: material.color } ) );
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		this.setLength( this.length, headLength, headWidth );

	}

}() );

THREE.ArrowHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.ArrowHelper.prototype.setDirection = ( function () {

	var axis = new THREE.Vector3();
	var radians;

	return function ( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			axis.set( dir.z, 0, - dir.x ).normalize();

			radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( axis, radians );

		}

	};

}() );

THREE.ArrowHelper.prototype.setLength = function ( length, headLength, headWidth ) {

	if ( headLength === undefined ) headLength = 0.2 * length;
	if ( headWidth === undefined ) headWidth = 0.2 * headLength;

	this.line.scale.set( 1, length / this.length, 1 );
	this.line.updateMatrix();

	this.cone.scale.set( headWidth, headLength, headWidth );
	this.cone.position.y = length;
	this.cone.updateMatrix();

};

THREE.ArrowHelper.prototype.setColor = function ( color ) {

	this.line.material.color.set( color );
	this.cone.material.color.set( color );

};