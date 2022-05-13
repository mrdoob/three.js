( function () {

	/**
 * Experimenting of primitive geometry creation using Surface Parametric equations
 */

	const ParametricGeometries = {
		klein: function ( v, u, target ) {

			u *= Math.PI;
			v *= 2 * Math.PI;
			u = u * 2;
			let x, z;

			if ( u < Math.PI ) {

				x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + 2 * ( 1 - Math.cos( u ) / 2 ) * Math.cos( u ) * Math.cos( v );
				z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

			} else {

				x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + 2 * ( 1 - Math.cos( u ) / 2 ) * Math.cos( v + Math.PI );
				z = - 8 * Math.sin( u );

			}

			const y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );
			target.set( x, y, z );

		},
		plane: function ( width, height ) {

			return function ( u, v, target ) {

				const x = u * width;
				const y = 0;
				const z = v * height;
				target.set( x, y, z );

			};

		},
		mobius: function ( u, t, target ) {

			// flat mobius strip
			// http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
			u = u - 0.5;
			const v = 2 * Math.PI * t;
			const a = 2;
			const x = Math.cos( v ) * ( a + u * Math.cos( v / 2 ) );
			const y = Math.sin( v ) * ( a + u * Math.cos( v / 2 ) );
			const z = u * Math.sin( v / 2 );
			target.set( x, y, z );

		},
		mobius3d: function ( u, t, target ) {

			// volumetric mobius strip
			u *= Math.PI;
			t *= 2 * Math.PI;
			u = u * 2;
			const phi = u / 2;
			const major = 2.25,
				a = 0.125,
				b = 0.65;
			let x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi );
			const z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi );
			const y = ( major + x ) * Math.sin( u );
			x = ( major + x ) * Math.cos( u );
			target.set( x, y, z );

		}
	};
	/*********************************************
 *
 * Parametric Replacement for TubeGeometry
 *
 *********************************************/

	ParametricGeometries.TubeGeometry = class TubeGeometry extends THREE.ParametricGeometry {

		constructor( path, segments = 64, radius = 1, segmentsRadius = 8, closed = false ) {

			const numpoints = segments + 1;
			const frames = path.computeFrenetFrames( segments, closed ),
				tangents = frames.tangents,
				normals = frames.normals,
				binormals = frames.binormals;
			const position = new THREE.Vector3();

			function ParametricTube( u, v, target ) {

				v *= 2 * Math.PI;
				const i = Math.floor( u * ( numpoints - 1 ) );
				path.getPointAt( u, position );
				const normal = normals[ i ];
				const binormal = binormals[ i ];
				const cx = - radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.

				const cy = radius * Math.sin( v );
				position.x += cx * normal.x + cy * binormal.x;
				position.y += cx * normal.y + cy * binormal.y;
				position.z += cx * normal.z + cy * binormal.z;
				target.copy( position );

			}

			super( ParametricTube, segments, segmentsRadius ); // proxy internals

			this.tangents = tangents;
			this.normals = normals;
			this.binormals = binormals;
			this.path = path;
			this.segments = segments;
			this.radius = radius;
			this.segmentsRadius = segmentsRadius;
			this.closed = closed;

		}

	};
	/*********************************************
  *
  * Parametric Replacement for TorusKnotGeometry
  *
  *********************************************/

	ParametricGeometries.TorusKnotGeometry = class TorusKnotGeometry extends ParametricGeometries.TubeGeometry {

		constructor( radius = 200, tube = 40, segmentsT = 64, segmentsR = 8, p = 2, q = 3 ) {

			class TorusKnotCurve extends THREE.Curve {

				getPoint( t, optionalTarget = new THREE.Vector3() ) {

					const point = optionalTarget;
					t *= Math.PI * 2;
					const r = 0.5;
					const x = ( 1 + r * Math.cos( q * t ) ) * Math.cos( p * t );
					const y = ( 1 + r * Math.cos( q * t ) ) * Math.sin( p * t );
					const z = r * Math.sin( q * t );
					return point.set( x, y, z ).multiplyScalar( radius );

				}

			}

			const segments = segmentsT;
			const radiusSegments = segmentsR;
			const extrudePath = new TorusKnotCurve();
			super( extrudePath, segments, tube, radiusSegments, true, false );
			this.radius = radius;
			this.tube = tube;
			this.segmentsT = segmentsT;
			this.segmentsR = segmentsR;
			this.p = p;
			this.q = q;

		}

	};
	/*********************************************
  *
  * Parametric Replacement for SphereGeometry
  *
  *********************************************/

	ParametricGeometries.SphereGeometry = class SphereGeometry extends THREE.ParametricGeometry {

		constructor( size, u, v ) {

			function sphere( u, v, target ) {

				u *= Math.PI;
				v *= 2 * Math.PI;
				const x = size * Math.sin( u ) * Math.cos( v );
				const y = size * Math.sin( u ) * Math.sin( v );
				const z = size * Math.cos( u );
				target.set( x, y, z );

			}

			super( sphere, u, v );

		}

	};
	/*********************************************
  *
  * Parametric Replacement for PlaneGeometry
  *
  *********************************************/

	ParametricGeometries.PlaneGeometry = class PlaneGeometry extends THREE.ParametricGeometry {

		constructor( width, depth, segmentsWidth, segmentsDepth ) {

			function plane( u, v, target ) {

				const x = u * width;
				const y = 0;
				const z = v * depth;
				target.set( x, y, z );

			}

			super( plane, segmentsWidth, segmentsDepth );

		}

	};

	THREE.ParametricGeometries = ParametricGeometries;

} )();
