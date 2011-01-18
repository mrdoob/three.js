/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function () {

	this.id = THREE.Object3DCounter.value ++;

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.rotationMatrix = new THREE.Matrix4();
	this.tmpMatrix = new THREE.Matrix4();

	this.screen = new THREE.Vector3();

	this.autoUpdateMatrix = true;
	this.visible = true;

};

THREE.Object3D.prototype = {

	updateMatrix: function () {

		var p = this.position, r = this.rotation, s = this.scale, m = this.tmpMatrix;

		this.matrix.setTranslation( p.x, p.y, p.z );

		this.rotationMatrix.setRotX( r.x );

		if ( r.y != 0 ) {
		       m.setRotY( r.y );
		       this.rotationMatrix.multiplySelf( m );
		}

		if ( r.z != 0 ) {
		       m.setRotZ( r.z );
		       this.rotationMatrix.multiplySelf( m );
		}

		this.matrix.multiplySelf( this.rotationMatrix );

		if ( s.x != 0 || s.y != 0 || s.z != 0 ) {
		       m.setScale( s.x, s.y, s.z );
		       this.matrix.multiplySelf( m );
		}
		
	}

};

THREE.Object3DCounter = { value: 0 };
