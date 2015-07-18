/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RaytracingRenderer = function ( parameters ) {

	console.log( 'THREE.RaytracingRenderer', THREE.REVISION );

	parameters = parameters || {};

	var scope = this;

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var maxRecursionDepth = 3;

	var canvasWidth, canvasHeight;
	var canvasWidthHalf, canvasHeightHalf;

	var clearColor = new THREE.Color( 0x000000 );

	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var cameraPosition = new THREE.Vector3();

	var raycaster = new THREE.Raycaster( origin, direction );
	var raycasterLight = new THREE.Raycaster();

	var perspective;
	var modelViewMatrix = new THREE.Matrix4();
	var cameraNormalMatrix = new THREE.Matrix3();

	var objects;
	var lights = [];
	var cache = {};

	var animationFrameId = null;

	this.domElement = canvas;

	this.autoClear = true;

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );

	};

	this.setPixelRatio = function () {};

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

	//

	var spawnRay = ( function () {

		var diffuseColor = new THREE.Color();
		var specularColor = new THREE.Color();
		var lightColor = new THREE.Color();
		var schlick = new THREE.Color();

		var lightContribution = new THREE.Color();

		var eyeVector = new THREE.Vector3();
		var lightVector = new THREE.Vector3();
		var normalVector = new THREE.Vector3();
		var halfVector = new THREE.Vector3();

		var localPoint = new THREE.Vector3();
		var reflectionVector = new THREE.Vector3();

		var tmpVec = new THREE.Vector3();

		var tmpColor = [];

		for ( var i = 0; i < maxRecursionDepth; i ++ ) {

			tmpColor[ i ] = new THREE.Color();

		}

		return function ( rayOrigin, rayDirection, outputColor, recursionDepth ) {

			var ray = raycaster.ray;

			ray.origin = rayOrigin;
			ray.direction = rayDirection;

			//

			var rayLight = raycasterLight.ray;

			//

			outputColor.setRGB( 0, 0, 0 );

			//

			var intersections = raycaster.intersectObjects( objects, true );

			// ray didn't find anything
			// (here should come setting of background color?)

			if ( intersections.length === 0 ) {

				return;

			}

			// ray hit

			var intersection = intersections[ 0 ];

			var point = intersection.point;
			var object = intersection.object;
			var material = object.material;
			var face = intersection.face;

			var vertices = object.geometry.vertices;

			//

			var _object = cache[ object.id ];

			localPoint.copy( point ).applyMatrix4( _object.inverseMatrix );
			eyeVector.subVectors( raycaster.ray.origin, point ).normalize();

			// resolve pixel diffuse color

			if ( material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshBasicMaterial ) {

				diffuseColor.copyGammaToLinear( material.color );

			} else {

				diffuseColor.setRGB( 1, 1, 1 );

			}

			if ( material.vertexColors === THREE.FaceColors ) {

				diffuseColor.multiply( face.color );

			}

			// compute light shading

			rayLight.origin.copy( point );

			if ( material instanceof THREE.MeshBasicMaterial ) {

				for ( var i = 0, l = lights.length; i < l; i ++ ) {

					var light = lights[ i ];

					lightVector.setFromMatrixPosition( light.matrixWorld );
					lightVector.sub( point );

					rayLight.direction.copy( lightVector ).normalize();

					var intersections = raycasterLight.intersectObjects( objects, true );

					// point in shadow

					if ( intersections.length > 0 ) continue;

					// point visible

					outputColor.add( diffuseColor );

				}

			} else if ( material instanceof THREE.MeshLambertMaterial ||
						material instanceof THREE.MeshPhongMaterial ) {

				var normalComputed = false;

				for ( var i = 0, l = lights.length; i < l; i ++ ) {

					var light = lights[ i ];

					lightColor.copyGammaToLinear( light.color );

					lightVector.setFromMatrixPosition( light.matrixWorld );
					lightVector.sub( point );

					rayLight.direction.copy( lightVector ).normalize();

					var intersections = raycasterLight.intersectObjects( objects, true );

					// point in shadow

					if ( intersections.length > 0 ) continue;

					// point lit

					if ( normalComputed === false ) {

						// the same normal can be reused for all lights
						// (should be possible to cache even more)

						computePixelNormal( normalVector, localPoint, material.shading, face, vertices );
						normalVector.applyMatrix3( _object.normalMatrix ).normalize();

						normalComputed = true;

					}

					// compute attenuation

					var attenuation = 1.0;

					if ( light.physicalAttenuation === true ) {

						attenuation = lightVector.length();
						attenuation = 1.0 / ( attenuation * attenuation );

					}

					lightVector.normalize();

					// compute diffuse

					var dot = Math.max( normalVector.dot( lightVector ), 0 );
					var diffuseIntensity = dot * light.intensity;

					lightContribution.copy( diffuseColor );
					lightContribution.multiply( lightColor );
					lightContribution.multiplyScalar( diffuseIntensity * attenuation );

					outputColor.add( lightContribution );

					// compute specular

					if ( material instanceof THREE.MeshPhongMaterial ) {

						halfVector.addVectors( lightVector, eyeVector ).normalize();

						var dotNormalHalf = Math.max( normalVector.dot( halfVector ), 0.0 );
						var specularIntensity = Math.max( Math.pow( dotNormalHalf, material.shininess ), 0.0 ) * diffuseIntensity;

						var specularNormalization = ( material.shininess + 2.0 ) / 8.0;

						specularColor.copyGammaToLinear( material.specular );

						var alpha = Math.pow( Math.max( 1.0 - lightVector.dot( halfVector ), 0.0 ), 5.0 );

						schlick.r = specularColor.r + ( 1.0 - specularColor.r ) * alpha;
						schlick.g = specularColor.g + ( 1.0 - specularColor.g ) * alpha;
						schlick.b = specularColor.b + ( 1.0 - specularColor.b ) * alpha;

						lightContribution.copy( schlick );

						lightContribution.multiply( lightColor );
						lightContribution.multiplyScalar( specularNormalization * specularIntensity * attenuation );
						outputColor.add( lightContribution );

					}

				}

			}

			// reflection / refraction

			var reflectivity = material.reflectivity;

			if ( ( material.mirror || material.glass ) && reflectivity > 0 && recursionDepth < maxRecursionDepth ) {

				if ( material.mirror ) {

					reflectionVector.copy( rayDirection );
					reflectionVector.reflect( normalVector );

				} else if ( material.glass ) {

					var eta = material.refractionRatio;

					var dotNI = rayDirection.dot( normalVector )
					var k = 1.0 - eta * eta * ( 1.0 - dotNI * dotNI );

					if ( k < 0.0 ) {

						reflectionVector.set( 0, 0, 0 );

					} else {

						reflectionVector.copy( rayDirection );
						reflectionVector.multiplyScalar( eta );

						var alpha = eta * dotNI + Math.sqrt( k );
						tmpVec.copy( normalVector );
						tmpVec.multiplyScalar( alpha );
						reflectionVector.sub( tmpVec );

					}

				}

				var theta = Math.max( eyeVector.dot( normalVector ), 0.0 );
				var rf0 = reflectivity;
				var fresnel = rf0 + ( 1.0 - rf0 ) * Math.pow( ( 1.0 - theta ), 5.0 );

				var weight = fresnel;

				var zColor = tmpColor[ recursionDepth ];

				spawnRay( point, reflectionVector, zColor, recursionDepth + 1 );

				if ( material.specular !== undefined ) {

					zColor.multiply( material.specular );

				}

				zColor.multiplyScalar( weight );
				outputColor.multiplyScalar( 1 - weight );
				outputColor.add( zColor );

			}

		};

	}() );

	var computePixelNormal = ( function () {

		var tmpVec1 = new THREE.Vector3();
		var tmpVec2 = new THREE.Vector3();
		var tmpVec3 = new THREE.Vector3();

		return function ( outputVector, point, shading, face, vertices ) {

			var faceNormal = face.normal;
			var vertexNormals = face.vertexNormals;

			if ( shading === THREE.FlatShading ) {

				outputVector.copy( faceNormal );

			} else if ( shading === THREE.SmoothShading ) {

				// compute barycentric coordinates

				var vA = vertices[ face.a ];
				var vB = vertices[ face.b ];
				var vC = vertices[ face.c ];

				tmpVec3.crossVectors( tmpVec1.subVectors( vB, vA ), tmpVec2.subVectors( vC, vA ) );
				var areaABC = faceNormal.dot( tmpVec3 );

				tmpVec3.crossVectors( tmpVec1.subVectors( vB, point ), tmpVec2.subVectors( vC, point ) );
				var areaPBC = faceNormal.dot( tmpVec3 );
				var a = areaPBC / areaABC;

				tmpVec3.crossVectors( tmpVec1.subVectors( vC, point ), tmpVec2.subVectors( vA, point ) );
				var areaPCA = faceNormal.dot( tmpVec3 );
				var b = areaPCA / areaABC;

				var c = 1.0 - a - b;

				// compute interpolated vertex normal

				tmpVec1.copy( vertexNormals[ 0 ] );
				tmpVec1.multiplyScalar( a );

				tmpVec2.copy( vertexNormals[ 1 ] );
				tmpVec2.multiplyScalar( b );

				tmpVec3.copy( vertexNormals[ 2 ] );
				tmpVec3.multiplyScalar( c );

				outputVector.addVectors( tmpVec1, tmpVec2 );
				outputVector.add( tmpVec3 );

			}

		};

	}() );

	var renderBlock = ( function () {

		var blockSize = 64;

		var canvasBlock = document.createElement( 'canvas' );
		canvasBlock.width = blockSize;
		canvasBlock.height = blockSize;

		var contextBlock = canvasBlock.getContext( '2d', {

			alpha: parameters.alpha === true

		} );

		var imagedata = contextBlock.getImageData( 0, 0, blockSize, blockSize );
		var data = imagedata.data;

		var pixelColor = new THREE.Color();

		return function ( blockX, blockY ) {

			var index = 0;

			for ( var y = 0; y < blockSize; y ++ ) {

				for ( var x = 0; x < blockSize; x ++, index += 4 ) {

					// spawn primary ray at pixel position

					origin.copy( cameraPosition );

					direction.set( x + blockX - canvasWidthHalf, - ( y + blockY - canvasHeightHalf ), - perspective );
					direction.applyMatrix3( cameraNormalMatrix ).normalize();

					spawnRay( origin, direction, pixelColor, 0 );

					// convert from linear to gamma

					data[ index ]     = Math.sqrt( pixelColor.r ) * 255;
					data[ index + 1 ] = Math.sqrt( pixelColor.g ) * 255;
					data[ index + 2 ] = Math.sqrt( pixelColor.b ) * 255;

				}

			}

			context.putImageData( imagedata, blockX, blockY );

			blockX += blockSize;

			if ( blockX >= canvasWidth ) {

				blockX = 0;
				blockY += blockSize;

				if ( blockY >= canvasHeight ) {

					scope.dispatchEvent( { type: "complete" } );
					return;

				}

			}

			context.fillRect( blockX, blockY, blockSize, blockSize );

			animationFrameId = requestAnimationFrame( function () {

				renderBlock( blockX, blockY );

			} );

		};

	}() );

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		cancelAnimationFrame( animationFrameId );

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices

		if ( camera.parent === undefined ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );
		cameraPosition.setFromMatrixPosition( camera.matrixWorld );

		//

		cameraNormalMatrix.getNormalMatrix( camera.matrixWorld );
		origin.copy( cameraPosition );

		perspective = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * canvasHeight;

		objects = scene.children;

		// collect lights and set up object matrices

		lights.length = 0;

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.Light ) {

				lights.push( object );

			}

			if ( cache[ object.id ] === undefined ) {

				cache[ object.id ] = {
					normalMatrix: new THREE.Matrix3(),
					inverseMatrix: new THREE.Matrix4()
				};

			}

			modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld )

			var _object = cache[ object.id ];

			_object.normalMatrix.getNormalMatrix( modelViewMatrix );
			_object.inverseMatrix.getInverse( object.matrixWorld );

		} );

		renderBlock( 0, 0 );

	};

};

THREE.EventDispatcher.prototype.apply(THREE.RaytracingRenderer.prototype);
