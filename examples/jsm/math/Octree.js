import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3
} from '../../../build/three.module.js';
import { Capsule } from '../math/Capsule.js';


var Octree = ( function () {

	var _v1 = new Vector3();
	var _v2 = new Vector3();
	var _plane = new Plane();
	var _line1 = new Line3();
	var _line2 = new Line3();
	var _sphere = new Sphere();
	var _capsule = new Capsule();

	function Octree( box ) {

		this.triangles = [];
		this.box = box;
		this.subTrees = [];

	}

	Object.assign( Octree.prototype, {

		addTriangle: function ( triangle ) {

			if ( ! this.bounds ) this.bounds = new Box3();

			this.bounds.min.x = Math.min( this.bounds.min.x, triangle.a.x, triangle.b.x, triangle.c.x );
			this.bounds.min.y = Math.min( this.bounds.min.y, triangle.a.y, triangle.b.y, triangle.c.y );
			this.bounds.min.z = Math.min( this.bounds.min.z, triangle.a.z, triangle.b.z, triangle.c.z );
			this.bounds.max.x = Math.max( this.bounds.max.x, triangle.a.x, triangle.b.x, triangle.c.x );
			this.bounds.max.y = Math.max( this.bounds.max.y, triangle.a.y, triangle.b.y, triangle.c.y );
			this.bounds.max.z = Math.max( this.bounds.max.z, triangle.a.z, triangle.b.z, triangle.c.z );

			this.triangles.push( triangle );

			return this;

		},

		calcBox: function () {

			this.box = this.bounds.clone();

			// offset small ammount to account for regular grid
			this.box.min.x -= 0.01;
			this.box.min.y -= 0.01;
			this.box.min.z -= 0.01;

			return this;

		},

		split: function ( level ) {

			if ( ! this.box ) return;

			var subTrees = [],
				halfsize = _v2.copy( this.box.max ).sub( this.box.min ).multiplyScalar( 0.5 ),
				box, v, triangle;

			for ( var x = 0; x < 2; x ++ ) {

				for ( var y = 0; y < 2; y ++ ) {

					for ( var z = 0; z < 2; z ++ ) {

						box = new Box3();
						v = _v1.set( x, y, z );

						box.min.copy( this.box.min ).add( v.multiply( halfsize ) );
						box.max.copy( box.min ).add( halfsize );

						subTrees.push( new Octree( box ) );

					}

				}

			}

			while ( triangle = this.triangles.pop() ) {

				for ( var i = 0; i < subTrees.length; i ++ ) {

					if ( subTrees[ i ].box.intersectsTriangle( triangle ) ) {

						subTrees[ i ].triangles.push( triangle );

					}

				}

			}

			for ( var i = 0; i < subTrees.length; i ++ ) {

				var len = subTrees[ i ].triangles.length;

				if ( len > 8 && level < 16 ) {

					subTrees[ i ].split( level + 1 );

				}

				if ( len != 0 ) {

					this.subTrees.push( subTrees[ i ] );

				}

			}

			return this;

		},

		build: function () {

			this.calcBox();
			this.split( 0 );

			return this;

		},

		getRayTriangles: function ( ray, triangles ) {

			for ( var i = 0; i < this.subTrees.length; i ++ ) {

				var subTree = this.subTrees[ i ];
				if ( ! ray.intersectsBox( subTree.box ) ) continue;

				if ( subTree.triangles.length > 0 ) {

					for ( var j = 0; j < subTree.triangles.length; j ++ ) {

						if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

					}

				} else {

					subTree.getRayTriangles( ray, triangles );

				}

			}

			return triangles;

		},

		triangleCapsuleIntersect: function ( capsule, triangle ) {

			var point1, point2, line1, line2;

			triangle.getPlane( _plane );

			var d1 = _plane.distanceToPoint( capsule.start ) - capsule.radius;
			var d2 = _plane.distanceToPoint( capsule.end ) - capsule.radius;

			if ( ( d1 > 0 && d2 > 0 ) || ( d1 < - capsule.radius && d2 < - capsule.radius ) ) {

				return false;

			}

			var delta = Math.abs( d1 / ( Math.abs( d1 ) + Math.abs( d2 ) ) );
			var intersectPoint = _v1.copy( capsule.start ).lerp( capsule.end, delta );

			if ( triangle.containsPoint( intersectPoint ) ) {

				return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs( Math.min( d1, d2 ) ) };

			}

			var r2 = capsule.radius * capsule.radius;

			line1 = _line1.set( capsule.start, capsule.end );

			var lines = [
				[ triangle.a, triangle.b ],
				[ triangle.b, triangle.c ],
				[ triangle.c, triangle.a ]
			];

			for ( var i = 0; i < lines.length; i ++ ) {

				line2 = _line2.set( lines[ i ][ 0 ], lines[ i ][ 1 ] );

				[ point1, point2 ] = capsule.lineLineMinimumPoints( line1, line2 );

				if ( point1.distanceToSquared( point2 ) < r2 ) {

					return { normal: point1.clone().sub( point2 ).normalize(), point: point2.clone(), depth: capsule.radius - point1.distanceTo( point2 ) };

				}

			}

			return false;

		},

		triangleSphereIntersect: function ( sphere, triangle ) {

			triangle.getPlane( _plane );

			if ( ! sphere.intersectsPlane( _plane ) ) return false;

			var depth = Math.abs( _plane.distanceToSphere( sphere ) );
			var r2 = sphere.radius * sphere.radius - depth * depth;

			var plainPoint = _plane.projectPoint( sphere.center, _v1 );

			if ( triangle.containsPoint( sphere.center ) ) {

				return { normal: _plane.normal.clone(), point: plainPoint.clone(), depth: Math.abs( _plane.distanceToSphere( sphere ) ) };

			}

			var lines = [
				[ triangle.a, triangle.b ],
				[ triangle.b, triangle.c ],
				[ triangle.c, triangle.a ]
			];

			for ( var i = 0; i < lines.length; i ++ ) {

				_line1.set( lines[ i ][ 0 ], lines[ i ][ 1 ] );
				_line1.closestPointToPoint( plainPoint, true, _v2 );

				var d = _v2.distanceToSquared( sphere.center );

				if ( d < r2 ) {

					return { normal: sphere.center.clone().sub( _v2 ).normalize(), point: _v2.clone(), depth: sphere.radius - Math.sqrt( d ) };

				}

			}

			return false;

		},

		getSphereTriangles: function ( sphere, triangles ) {

			for ( var i = 0; i < this.subTrees.length; i ++ ) {

				var subTree = this.subTrees[ i ];

				if ( ! sphere.intersectsBox( subTree.box ) ) continue;

				if ( subTree.triangles.length > 0 ) {

					for ( var j = 0; j < subTree.triangles.length; j ++ ) {

						if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

					}

				} else {

					subTree.getSphereTriangles( sphere, triangles );

				}

			}

		},

		getCapsuleTriangles: function ( capsule, triangles ) {

			for ( var i = 0; i < this.subTrees.length; i ++ ) {

				var subTree = this.subTrees[ i ];

				if ( ! capsule.intersectsBox( subTree.box ) ) continue;

				if ( subTree.triangles.length > 0 ) {

					for ( var j = 0; j < subTree.triangles.length; j ++ ) {

						if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

					}

				} else {

					subTree.getCapsuleTriangles( capsule, triangles );

				}

			}

		},

		sphereIntersect( sphere ) {

			_sphere.copy( sphere );

			var triangles = [], result, hit = false;

			this.getSphereTriangles( sphere, triangles );

			for ( var i = 0; i < triangles.length; i ++ ) {

				if ( result = this.triangleSphereIntersect( _sphere, triangles[ i ] ) ) {

					hit = true;

					_sphere.center.add( result.normal.multiplyScalar( result.depth ) );

				}

			}

			if ( hit ) {

				var collisionVector = _sphere.center.clone().sub( sphere.center );
				var depth = collisionVector.length();

				return { normal: collisionVector.normalize(), depth: depth };

			}

			return false;

		},

		capsuleIntersect: function ( capsule ) {

			_capsule.copy( capsule );

			var triangles = [], result, hit = false;

			this.getCapsuleTriangles( _capsule, triangles );

			for ( var i = 0; i < triangles.length; i ++ ) {

				if ( result = this.triangleCapsuleIntersect( _capsule, triangles[ i ] ) ) {

					hit = true;

					_capsule.translate( result.normal.multiplyScalar( result.depth ) );

				}

			}

			if ( hit ) {

				var collisionVector = _capsule.getCenter( new Vector3() ).sub( capsule.getCenter( _v1 ) );
				var depth = collisionVector.length();

				return { normal: collisionVector.normalize(), depth: depth };

			}

			return false;

		},

		rayIntersect: function ( ray ) {

			if ( ray.direction.length() === 0 ) return;

			var triangles = [], triangle, position,
				distance = 1e100,
				result;

			this.getRayTriangles( ray, triangles );

			for ( var i = 0; i < triangles.length; i ++ ) {

				result = ray.intersectTriangle( triangles[ i ].a, triangles[ i ].b, triangles[ i ].c, true, _v1 );

				if ( result ) {

					var newdistance = result.sub( ray.origin ).length();

					if ( distance > newdistance ) {

						position = result.clone().add( ray.origin );
						distance = newdistance;
						triangle = triangles[ i ];

					}

				}

			}

			return distance < 1e100 ? { distance: distance, triangle: triangle, position: position } : false;

		},

		fromGraphNode: function ( group ) {

			group.traverse( ( obj ) => {

				if ( obj.type === 'Mesh' ) {

					obj.updateMatrix();
					obj.updateWorldMatrix();

					var geometry, isTemp = false;

					if ( obj.geometry.index ) {

						isTemp = true;
						geometry = obj.geometry.clone().toNonIndexed();

					} else {

						geometry = obj.geometry;

					}

					var positions = geometry.attributes.position.array;
					var transform = obj.matrixWorld;

					for ( var i = 0; i < positions.length; i += 9 ) {

						var v1 = new Vector3( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
						var v2 = new Vector3( positions[ i + 3 ], positions[ i + 4 ], positions[ i + 5 ] );
						var v3 = new Vector3( positions[ i + 6 ], positions[ i + 7 ], positions[ i + 8 ] );

						v1.applyMatrix4( transform );
						v2.applyMatrix4( transform );
						v3.applyMatrix4( transform );

						this.addTriangle( new Triangle( v1, v2, v3 ) );

					}

					if ( isTemp ) {

						geometry.dispose();

					}

				}

			} );

			this.build();

			return this;

		}

	} );

	return Octree;

} )();

export { Octree };
