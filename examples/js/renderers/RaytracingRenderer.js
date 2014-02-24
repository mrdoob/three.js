/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.RaytracingRenderer = function ( parameters ) {

	console.log( 'THREE.RaytracingRenderer', THREE.REVISION );

	parameters = parameters || {};

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var canvasWidth, canvasHeight;
	var canvasWidthHalf, canvasHeightHalf;

	var clearColor = new THREE.Color( 0x000000 );

	var blockX = 0;
	var blockY = 0;
	var blockSize = 64;

	var canvasBlock = document.createElement( 'canvas' );
	canvasBlock.width = blockSize;
	canvasBlock.height = blockSize;

	var contextBlock = canvasBlock.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var imagedata = contextBlock.getImageData( 0, 0, blockSize, blockSize );
	var data = imagedata.data;

	var viewMatrix = new THREE.Matrix4();
	var viewProjectionMatrix = new THREE.Matrix4();

	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var raycaster = new THREE.Raycaster( origin, direction );

	var objects;

	this.domElement = canvas;

	this.autoClear = true;

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );

	};

	this.setSize = function ( width, height ) {

		canvas.width = width;
		canvas.height = height;

		canvasWidth = canvas.width;
		canvasHeight = canvas.height;

		canvasWidthHalf = Math.floor( canvasWidth / 2 );
		canvasHeightHalf = Math.floor( canvasHeight / 2 );

		context.fillStyle = 'white';

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

	};

	var renderBlock = function () {

		for ( var i = 0, l = data.length; i < l; i += 4 ) {

			data[ i ] = 0;
			data[ i + 1 ] = 0;
			data[ i + 2 ] = 0;

		}

		var index = 0;

		for ( var y = 0; y < blockSize; y ++ ) {

			for ( var x = 0; x < blockSize; x ++ ) {

				direction.set( x + blockX - canvasWidthHalf, y + blockY - canvasHeightHalf, - 500 );
				direction.normalize();

				var intersections = raycaster.intersectObjects( objects, true );

				if ( intersections.length > 0 ) {

					var intersection = intersections[ 0 ];

					var object = intersection.object;
					var material = object.material;
					var face = intersection.face;

					var color;

					if ( material.vertexColors === THREE.NoColors ) {

						color = material.color;

					} else if ( material.vertexColors === THREE.FaceColors ) {

						color = face.color;

					}

					data[ index ] = color.r * 255;
					data[ index + 1 ] = color.g * 255;
					data[ index + 2 ] = color.b * 255;

				}

				index += 4;

			}

		}

		context.putImageData( imagedata, blockX, blockY );

		blockX += blockSize;

		if ( blockX >= canvasWidth ) {

			blockX = 0;
			blockY += blockSize;

			if ( blockY >= canvasHeight ) return;

		}

		context.fillRect( blockX, blockY, blockSize, blockSize );

		requestAnimationFrame( renderBlock );

	};

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		origin.copy( camera.position );

		objects = scene.children;

		renderBlock();

	}

};
