/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'Mesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.drawMode = THREE.TrianglesDrawMode;

	this.updateMorphTargets();

};

THREE.Mesh.prototype = Object.create( THREE.Object3D.prototype );
THREE.Mesh.prototype.constructor = THREE.Mesh;

THREE.Mesh.prototype.setDrawMode = function ( value ) {

	this.drawMode = value;

};

THREE.Mesh.prototype.updateMorphTargets = function () {

	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

		this.morphTargetBase = - 1;
		this.morphTargetInfluences = [];
		this.morphTargetDictionary = {};

		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {

			this.morphTargetInfluences.push( 0 );
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

		}

	}

};

THREE.Mesh.prototype.getMorphTargetIndexByName = function ( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];

	}

	console.warn( 'THREE.Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.' );

	return 0;

};

var intersectionPointWorld = new THREE.Vector3();

function checkIntersection( object, raycaster, ray, pA, pB, pC, point ){

	var intersect;
	var material = object.material;

	if ( material.side === THREE.BackSide ) {

		intersect = ray.intersectTriangle( pC, pB, pA, true, point );

	} else {

		intersect = ray.intersectTriangle( pA, pB, pC, material.side !== THREE.DoubleSide, point );

	}

	if ( intersect === null ) return null;

	intersectionPointWorld.copy( point );
	intersectionPointWorld.applyMatrix4( object.matrixWorld );

	var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: intersectionPointWorld.clone(),
		object: object
	};

}

var vA = new THREE.Vector3();
var vB = new THREE.Vector3();
var vC = new THREE.Vector3();

var uvA = new THREE.Vector2();
var uvB = new THREE.Vector2();
var uvC = new THREE.Vector2();
var intersectionPoint = new THREE.Vector3();

function check( object, raycaster, ray, uvs, a, b, c ) {

	var intersection = checkIntersection( object, raycaster, ray, vA, vB, vC, intersectionPoint );

	if ( intersection ) {

		if ( uvs ) {

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			intersection.uv = uvIntersection( intersectionPoint,  vA, vB, vC,  uvA, uvB, uvC );

		}

		intersection.face = new THREE.Face3( a, b, c, THREE.Triangle.normal( vA, vB, vC ) );
		intersection.faceIndex = a;

	}

	return intersection;

}

var barycoord = new THREE.Vector3();
function uvIntersection( point, p1, p2, p3, uv1, uv2, uv3 ) {

	THREE.Triangle.barycoordFromPoint( point, p1, p2, p3, barycoord );

	uv1.multiplyScalar( barycoord.x );
	uv2.multiplyScalar( barycoord.y );
	uv3.multiplyScalar( barycoord.z );

	uv1.add( uv2 ).add( uv3 );

	return uv1.clone();

}

THREE.InstancedBufferGeometry.prototype.checkIntersection = function (object, raycaster, ray, intersects) {
	var a, b, c;
	var index = this.index;
	var attributes = this.attributes;
	var positions = attributes.position.array;
	var nInstances = this.maxInstancedCount;
	var uvs;

	if ( attributes.uv !== undefined ){

		uvs = attributes.uv.array;

	}

	if ( index !== null ) {

		var indices = index.array;

		for ( var i = 0, l = indices.length; i < l; i += 3 ) {

			a = indices[ i ];
			b = indices[ i + 1 ];
			c = indices[ i + 2 ];

            for ( var j = 0; j < nInstances; j++ ) {

                this.getPointCoordinates(j, a, vA);
                this.getPointCoordinates(j, b, vB);
                this.getPointCoordinates(j, c, vC);
                
                var intersection =  check( object, raycaster, ray, uvs, a, b, c );
                if (intersection) {

                    intersection.instance = j;
					intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indices buffer semantics
					intersects.push( intersection );

				}

            }

		}

	} else {

		for ( var i = 0, l = positions.length; i < l; i += 9 ) {

			a = i / 3;
			b = a + 1;
			c = a + 2;

            for ( var j = 0; j < nInstances; j++ ) {

				intersection = checkInstancedBufferGeometryIntersection( this, raycaster, ray, uvs, a, b, c, j , getPointCoordinates);

				if ( intersection ) {

					intersection.index = a; // triangle number in positions buffer semantics
					intersects.push( intersection );

				}

            }

		}

	}

}

THREE.BufferGeometry.prototype.checkIntersection = function (object, raycaster, ray, intersects) {

	var a, b, c;
	var index = this.index;
	var attributes = this.attributes;
	var positions = attributes.position.array;

	if ( attributes.uv !== undefined ){

		uvs = attributes.uv.array;

	}

	if ( index !== null ) {

		var indices = index.array;

		for ( var i = 0, l = indices.length; i < l; i += 3 ) {

			a = indices[ i ];
			b = indices[ i + 1 ];
			c = indices[ i + 2 ];

        	vA.fromArray( positions, a * 3 );
        	vB.fromArray( positions, b * 3 );
        	vC.fromArray( positions, c * 3 );
        	var intersection =  check( object, raycaster, ray, uvs, a, b, c );

			if ( intersection ) {

				intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indices buffer semantics
				intersects.push( intersection );

			}

		}

	} else {


		for ( var i = 0, l = positions.length; i < l; i += 9 ) {

			a = i / 3;
			b = a + 1;
			c = a + 2;

        	vA.fromArray( positions, a * 3 );
        	vB.fromArray( positions, b * 3 );
        	vC.fromArray( positions, c * 3 );
        	intersection =  check( object, raycaster, ray, uvs, a, b, c );

			if ( intersection ) {

				intersection.index = a; // triangle number in positions buffer semantics
				intersects.push( intersection );

			}

		}

	}

}

THREE.Geometry.prototype.checkIntersection = function (object, raycaster, ray, intersects)  {

	var fvA, fvB, fvC;
	var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
	var materials = isFaceMaterial === true ? object.material.materials : null;

	var vertices = this.vertices;
	var faces = this.faces;
	var faceVertexUvs = this.faceVertexUvs[ 0 ];
	if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;

    var intersectionPoint = new THREE.Vector3();

	for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

		var face = faces[ f ];
		var faceMaterial = isFaceMaterial === true ? materials[ face.materialIndex ] : material;

		if ( faceMaterial === undefined ) continue;

		fvA = vertices[ face.a ];
		fvB = vertices[ face.b ];
		fvC = vertices[ face.c ];

		if ( faceMaterial.morphTargets === true ) {

			var morphTargets = object.morphTargets;
			var morphInfluences = object.morphTargetInfluences;

			vA.set( 0, 0, 0 );
			vB.set( 0, 0, 0 );
			vC.set( 0, 0, 0 );

			for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

				var influence = morphInfluences[ t ];

				if ( influence === 0 ) continue;

				var targets = morphTargets[ t ].vertices;

				vA.addScaledVector( tempA.subVectors( targets[ face.a ], fvA ), influence );
				vB.addScaledVector( tempB.subVectors( targets[ face.b ], fvB ), influence );
				vC.addScaledVector( tempC.subVectors( targets[ face.c ], fvC ), influence );

			}

			vA.add( fvA );
			vB.add( fvB );
			vC.add( fvC );

			fvA = vA;
			fvB = vB;
			fvC = vC;

		}

		intersection = checkIntersection( object, raycaster, ray, fvA, fvB, fvC, intersectionPoint );

		if ( intersection ) {

			if ( uvs ) {

				var uvs_f = uvs[ f ];
				uvA.copy( uvs_f[ 0 ] );
				uvB.copy( uvs_f[ 1 ] );
				uvC.copy( uvs_f[ 2 ] );

				intersection.uv = uvIntersection( intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC );

			}

			intersection.face = face;
			intersection.faceIndex = f;
			intersects.push( intersection );

		}

	}

}

THREE.Mesh.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();
	var self = this;

	return function raycast( raycaster, intersects ) {

		var geometry = this.geometry;
		var material = this.material;

		if ( material === undefined ) return;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		var matrixWorld = this.matrixWorld;

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectSphere( sphere ) === false ) return;

		// Check boundingBox before continuing

		inverseMatrix.getInverse( matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		if ( geometry.boundingBox !== null ) {

			if ( ray.intersectBox( geometry.boundingBox ) === false ) return;

		}

		geometry.checkIntersection(this, raycaster, ray, intersects)

	};

}() );

THREE.Mesh.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};
