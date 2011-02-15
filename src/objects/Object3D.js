/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function () {

	this.id = THREE.Object3DCounter.value ++; // TODO: Probably not needed?

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();
	this.rotationMatrix = new THREE.Matrix4();
	this.tmpMatrix = new THREE.Matrix4();

	this.screen = new THREE.Vector3();

	this.autoUpdateMatrix = true;
	this.visible = true;

	this.children = [];

};

THREE.Object3D.prototype = {

	addChild: function ( object ) {

		var i = this.children.indexOf( object );

		if ( i === -1 ) {

			this.children.push( object );

		}

	},

	removeChild: function ( object ) {

		var i = this.children.indexOf( object );

		if ( i !== -1 ) {

			this.children.splice( i, 1 );

		}

	},

	updateMatrix: function () {

		var p = this.position, r = this.rotation, s = this.scale,
		matrix = this.matrix, rotationMatrix = this.rotationMatrix,
		tmpMatrix = this.tmpMatrix;

		matrix.setTranslation( p.x, p.y, p.z );

		rotationMatrix.setRotX( r.x );

		if ( r.y != 0 ) rotationMatrix.multiplySelf( tmpMatrix.setRotY( r.y ) );
		if ( r.z != 0 ) rotationMatrix.multiplySelf( tmpMatrix.setRotZ( r.z ) );

		matrix.multiplySelf( rotationMatrix );

		if ( s.x != 0 || s.y != 0 || s.z != 0 ) matrix.multiplySelf( tmpMatrix.setScale( s.x, s.y, s.z ) );

	}

};

THREE.Object3DCounter = { value: 0 };
