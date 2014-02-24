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

	var blockX, blockY;
	var blockSize = 64;

	var canvasBlock = document.createElement( 'canvas' );
	canvasBlock.width = blockSize;
	canvasBlock.height = blockSize;

	var contextBlock = canvasBlock.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var imagedata = contextBlock.getImageData( 0, 0, blockSize, blockSize );
	var data = imagedata.data;

	var color = new THREE.Color();
	var lightColor = new THREE.Color();

	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var raycaster = new THREE.Raycaster( origin, direction );
	var raycasterLight = new THREE.Raycaster();

	var perspective;
	var cameraNormalMatrix = new THREE.Matrix3();

	var objects;
	var lights = [];

	var animationFrameId = null;

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

			for ( var x = 0; x < blockSize; x ++, index += 4 ) {

				direction.set( x + blockX - canvasWidthHalf, - ( y + blockY - canvasHeightHalf ), - perspective );
				direction.applyMatrix3( cameraNormalMatrix ).normalize();

				var intersections = raycaster.intersectObjects( objects, true );

				if ( intersections.length > 0 ) {

					var intersection = intersections[ 0 ];

					var point = intersection.point;
					var object = intersection.object;
					var material = object.material;
					var face = intersection.face;

					if ( material.vertexColors === THREE.NoColors ) {

						color.copy( material.color );

					} else if ( material.vertexColors === THREE.FaceColors ) {

						color.copy( face.color );

					}

					if ( material instanceof THREE.MeshLambertMaterial ||
						 material instanceof THREE.MeshPhongMaterial ) {

						lightColor.set( 0, 0, 0 );

						raycasterLight.ray.origin.copy( point );

						for ( var i = 0, l = lights.length; i < l; i ++ ) {

							var light = lights[ i ];

							raycasterLight.ray.direction.copy( light.position ).sub( point ).normalize();

							var intersections = raycasterLight.intersectObjects( objects, true );

							if ( intersections.length === 0 ) {

								var dot = Math.max( face.normal.dot( raycasterLight.ray.direction ), 0 );
								var intensity = dot * light.intensity;

								lightColor.r += light.color.r * intensity;
								lightColor.g += light.color.g * intensity;
								lightColor.b += light.color.b * intensity;

							}

						}

						color.multiply( lightColor );

					}

					data[ index ] = color.r * 255;
					data[ index + 1 ] = color.g * 255;
					data[ index + 2 ] = color.b * 255;

				}

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

		animationFrameId = requestAnimationFrame( renderBlock );

	};

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		cancelAnimationFrame( animationFrameId );

		blockX = 0;
		blockY = 0;

		cameraNormalMatrix.getNormalMatrix( camera.matrixWorld );
		origin.copy( camera.position );

		perspective = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * canvasHeight;

		objects = scene.children;

		// collect lights

		lights.length = 0;

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.Light ) {

				lights.push( object );

			}

		} )

		renderBlock();

	}

};
