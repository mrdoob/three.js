/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.HTMLGroup = function ( dom ) {

	THREE.Group.call( this );

	this.type = 'HTMLGroup';

	/*
	dom.addEventListener( 'mousemove', function ( event ) {

		console.log( 'mousemove' );

	} );

	dom.addEventListener( 'click', function ( event ) {

		console.log( 'click' );

	} );
	*/

};

THREE.HTMLGroup.prototype = Object.assign( Object.create( THREE.Group.prototype ), {

	constructor: THREE.HTMLGroup

} );

THREE.HTMLMesh = function ( dom ) {

	var texture = new THREE.HTMLTexture( dom );

	var geometry = new THREE.PlaneBufferGeometry( texture.image.width * 0.05, texture.image.height * 0.05 );
	var material = new THREE.MeshBasicMaterial( { map: texture } );

	THREE.Mesh.call( this, geometry, material );

	this.type = 'HTMLMesh';

};

THREE.HTMLMesh.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: THREE.HTMLMesh

} );

THREE.HTMLTexture = function ( dom ) {

	THREE.CanvasTexture.call( this, html2canvas( dom ) );

	this.dom = dom;

	this.anisotropy = 16;

};

THREE.HTMLTexture.prototype = Object.assign( Object.create( THREE.CanvasTexture.prototype ), {

	constructor: THREE.HTMLTexture,

	update: function () {

		console.log( 'yo!', this, this.dom );

		this.image = html2canvas( this.dom );
		this.needsUpdate = true;

	}

} );
