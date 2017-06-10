function generateGeometry( objectType, numObjects ) {

	var geometry = new THREE.Geometry();

	function applyVertexColors( g, c ) {

		g.faces.forEach( function( f ) {

			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

			for ( var j = 0; j < n; j ++ ) {

				f.vertexColors[ j ] = c;

			}

		} );

	}

	for ( var i = 0; i < numObjects; i ++ ) {

		var position = new THREE.Vector3();

		position.x = Math.random() * 10000 - 5000;
		position.y = Math.random() * 6000 - 3000;
		position.z = Math.random() * 8000 - 4000;

		var rotation = new THREE.Euler();

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;

		var scale = new THREE.Vector3();

		var geom, color = new THREE.Color();

		scale.x = Math.random() * 200 + 100;

		if ( objectType == "cube" ) {

			geom = new THREE.BoxGeometry( 1, 1, 1 );
			scale.y = Math.random() * 200 + 100;
			scale.z = Math.random() * 200 + 100;
			color.setRGB( 0, 0, Math.random() + 0.1 );

		} else if ( objectType == "sphere" ) {

			geom = new THREE.IcosahedronGeometry( 1, 1 );
			scale.y = scale.z = scale.x;
			color.setRGB( Math.random() + 0.1, 0, 0 );

		}

		// give the geom's vertices a random color, to be displayed
		applyVertexColors( geom, color );

		var mesh = new THREE.Mesh( geom );
		mesh.position.copy( position );
		mesh.rotation.copy( rotation );
		mesh.scale.copy( scale );
		mesh.updateMatrix();

		geometry.merge( mesh.geometry, mesh.matrix );

	}

	return geometry;

}

function Scene ( type, numObjects, cameraZ, fov, rotationSpeed, clearColor ) {

	this.clearColor = clearColor;

	this.camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.z = cameraZ;

	// Setup scene
	this.scene = new THREE.Scene();
	this.scene.add( new THREE.AmbientLight( 0x555555 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	this.scene.add( light );

	this.rotationSpeed = rotationSpeed;

	var defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
	this.mesh = new THREE.Mesh( generateGeometry( type, numObjects ), defaultMaterial );
	this.scene.add( this.mesh );

	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	this.fbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	this.render = function( delta, rtt ) {

		this.mesh.rotation.x += delta * this.rotationSpeed.x;
		this.mesh.rotation.y += delta * this.rotationSpeed.y;
		this.mesh.rotation.z += delta * this.rotationSpeed.z;

		renderer.setClearColor( this.clearColor );

		if ( rtt )
			renderer.render( this.scene, this.camera, this.fbo, true );
		else
			renderer.render( this.scene, this.camera );

	};

}
