var BLOCK = 128;
var startX, startY;

var scene, camera, renderer, loader, sceneId;

importScripts( '../../../build/three.js' );


self.onmessage = function ( e ) {

	var data = e.data;
	if ( ! data ) return;

	if ( data.init ) {

		var
			width = data.init[ 0 ],
			height = data.init[ 1 ];

		BLOCK = data.blockSize;

		if ( ! renderer ) renderer = new THREE.RaytracingRendererWorker();
		if ( ! loader ) loader = new THREE.ObjectLoader();

		renderer.setSize( width, height );

		// TODO fix passing maxRecursionDepth as parameter.
		// if (data.maxRecursionDepth) maxRecursionDepth = data.maxRecursionDepth;

	}

	if ( data.scene ) {

		scene = loader.parse( data.scene );
		camera = loader.parse( data.camera );

		var meta = data.annex;
		scene.traverse( function ( o ) {

			if ( o.isPointLight ) {

				o.physicalAttenuation = true;

			}

			var mat = o.material;

			if ( ! mat ) return;

			var material = meta[ mat.uuid ];

			for ( var m in material ) {

				mat[ m ] = material[ m ];

			}

		} );

		sceneId = data.sceneId;

	}

	if ( data.render && scene && camera ) {

		startX = data.x;
		startY = data.y;
		renderer.render( scene, camera );

	}

};

/**
 * DOM-less version of Raytracing Renderer
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author zz95 / http://github.com/zz85
 */

THREE.RaytracingRendererWorker = function () {

	var maxRecursionDepth = 3;

	var canvasWidth, canvasHeight;
	var canvasWidthHalf, canvasHeightHalf;
	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var cameraPosition = new THREE.Vector3();

	var raycaster = new THREE.Raycaster( origin, direction );
	var ray = raycaster.ray;

	var raycasterLight = new THREE.Raycaster();
	var rayLight = raycasterLight.ray;

	var perspective;
	var cameraNormalMatrix = new THREE.Matrix3();

	var objects;
	var lights = [];
	var cache = {};

	this.setSize = function ( width, height ) {

		canvasWidth = width;
		canvasHeight = height;

		canvasWidthHalf = Math.floor( canvasWidth / 2 );
		canvasHeightHalf = Math.floor( canvasHeight / 2 );

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

		return function spawnRay( rayOrigin, rayDirection, outputColor, recursionDepth ) {

			outputColor.setRGB( 0, 0, 0 );

			//

			ray.origin = rayOrigin;
			ray.direction = rayDirection;

			var intersections = raycaster.intersectObjects( objects, true );

			// ray didn't find anything
			// (here should come setting of background color?)

			if ( intersections.length === 0 ) return;

			// ray hit

			var intersection = intersections[ 0 ];

			var point = intersection.point;
			var object = intersection.object;
			var material = object.material;
			var face = intersection.face;

			var geometry = object.geometry;

			//

			var _object = cache[ object.id ];

			eyeVector.subVectors( ray.origin, point ).normalize();

			// resolve pixel diffuse color

			if ( material.isMeshLambertMaterial ||
				 material.isMeshPhongMaterial ||
				 material.isMeshBasicMaterial ) {

				diffuseColor.copyGammaToLinear( material.color );

			} else {

				diffuseColor.setRGB( 1, 1, 1 );

			}

			if ( material.vertexColors === THREE.FaceColors ) {

				diffuseColor.multiply( face.color );

			}

			// compute light shading

			rayLight.origin.copy( point );

			if ( material.isMeshBasicMaterial ) {

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

			} else if ( material.isMeshLambertMaterial || material.isMeshPhongMaterial ) {

				var normalComputed = false;

				for ( var i = 0, l = lights.length; i < l; i ++ ) {

					var light = lights[ i ];

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

						localPoint.copy( point ).applyMatrix4( _object.inverseMatrix );
						computePixelNormal( normalVector, localPoint, material.flatShading, face, geometry );
						normalVector.applyMatrix3( _object.normalMatrix ).normalize();

						normalComputed = true;

					}

					lightColor.copyGammaToLinear( light.color );

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

					if ( material.isMeshPhongMaterial ) {

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

					var dotNI = rayDirection.dot( normalVector );
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

		var vA = new THREE.Vector3();
		var vB = new THREE.Vector3();
		var vC = new THREE.Vector3();

		var tmpVec1 = new THREE.Vector3();
		var tmpVec2 = new THREE.Vector3();
		var tmpVec3 = new THREE.Vector3();

		return function computePixelNormal( outputVector, point, flatShading, face, geometry ) {

			var faceNormal = face.normal;

			if ( flatShading === true ) {

				outputVector.copy( faceNormal );

			} else {

				var positions = geometry.attributes.position;
				var normals = geometry.attributes.normal;

				vA.fromBufferAttribute( positions, face.a );
				vB.fromBufferAttribute( positions, face.b );
				vC.fromBufferAttribute( positions, face.c );

				// compute barycentric coordinates

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

				tmpVec1.fromBufferAttribute( normals, face.a );
				tmpVec2.fromBufferAttribute( normals, face.b );
				tmpVec3.fromBufferAttribute( normals, face.c );

				tmpVec1.multiplyScalar( a );
				tmpVec2.multiplyScalar( b );
				tmpVec3.multiplyScalar( c );

				outputVector.addVectors( tmpVec1, tmpVec2 );
				outputVector.add( tmpVec3 );

			}

		};

	}() );

	var renderBlock = ( function () {

		var blockSize = BLOCK;

		var data = new Uint8ClampedArray( blockSize * blockSize * 4 );

		var pixelColor = new THREE.Color();

		return function renderBlock( blockX, blockY ) {

			var index = 0;

			for ( var y = 0; y < blockSize; y ++ ) {

				for ( var x = 0; x < blockSize; x ++, index += 4 ) {

					// spawn primary ray at pixel position

					origin.copy( cameraPosition );

					direction.set( x + blockX - canvasWidthHalf, - ( y + blockY - canvasHeightHalf ), - perspective );
					direction.applyMatrix3( cameraNormalMatrix ).normalize();

					spawnRay( origin, direction, pixelColor, 0 );

					// convert from linear to gamma

					data[ index + 0 ] = Math.sqrt( pixelColor.r ) * 255;
					data[ index + 1 ] = Math.sqrt( pixelColor.g ) * 255;
					data[ index + 2 ] = Math.sqrt( pixelColor.b ) * 255;
					data[ index + 3 ] = 255;

				}

			}

			// Use transferable objects! :)
			self.postMessage( {
				data: data.buffer,
				blockX: blockX,
				blockY: blockY,
				blockSize: blockSize,
				sceneId: sceneId,
				time: Date.now(), // time for this renderer
			}, [ data.buffer ] );

			data = new Uint8ClampedArray( blockSize * blockSize * 4 );

		};

	}() );

	this.render = function ( scene, camera ) {

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices

		if ( camera.parent === null ) camera.updateMatrixWorld();

		cameraPosition.setFromMatrixPosition( camera.matrixWorld );

		//

		cameraNormalMatrix.getNormalMatrix( camera.matrixWorld );

		perspective = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * canvasHeight;

		objects = scene.children;

		// collect lights and set up object matrices

		lights.length = 0;

		scene.traverse( function ( object ) {

			if ( object.isPointLight ) {

				lights.push( object );

			}

			if ( cache[ object.id ] === undefined ) {

				cache[ object.id ] = {
					normalMatrix: new THREE.Matrix3(),
					inverseMatrix: new THREE.Matrix4()
				};

			}

			var _object = cache[ object.id ];

			_object.normalMatrix.getNormalMatrix( object.matrixWorld );
			_object.inverseMatrix.getInverse( object.matrixWorld );

		} );

		renderBlock( startX, startY );

	};

};

Object.assign( THREE.RaytracingRendererWorker.prototype, THREE.EventDispatcher.prototype );
