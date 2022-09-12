( function () {

	/**
 * Utility class for sampling weighted random points on the surface of a mesh.
 *
 * Building the sampler is a one-time O(n) operation. Once built, any number of
 * random samples may be selected in O(logn) time. Memory usage is O(n).
 *
 * References:
 * - http://www.joesfer.com/?p=84
 * - https://stackoverflow.com/a/4322940/1314762
 */

	const _face = new THREE.Triangle();

	const _color = new THREE.Vector3();

	const _uv = new THREE.Vector3();

	const _targetUV = new THREE.Vector3();

	const _uv1 = new THREE.Vector2();

	const _uv2 = new THREE.Vector2();

	const _uv3 = new THREE.Vector2();

	class MeshSurfaceSampler {

		constructor( mesh ) {

			let geometry = mesh.geometry;
			const material = mesh.material;

			if ( ! geometry.isBufferGeometry || geometry.attributes.position.itemSize !== 3 ) {

				throw new Error( 'THREE.MeshSurfaceSampler: Requires BufferGeometry triangle mesh.' );

			}

			if ( geometry.index ) {

				console.warn( 'THREE.MeshSurfaceSampler: Converting geometry to non-indexed BufferGeometry.' );
				geometry = geometry.toNonIndexed();

			}

			this.geometry = geometry;
			this.randomFunction = Math.random;
			this.positionAttribute = this.geometry.getAttribute( 'position' );
			this.colorAttribute = this.geometry.getAttribute( 'color' );
			this.uvAttribute = this.geometry.getAttribute( 'uv' );

			if ( material.map ) {

				const canvas = document.createElement( 'canvas' );
				canvas.width = material.map.image.width;
				canvas.height = material.map.image.height;

				const context = canvas.getContext( '2d' );
				context.drawImage( material.map.image, 0, 0 );

				this.colorMapData = context.getImageData( 0, 0, canvas.width, canvas.height );

			}

			this.weightAttribute = null;
			this.distribution = null;

		}

		setWeightAttribute( name ) {

			this.weightAttribute = name ? this.geometry.getAttribute( name ) : null;
			return this;

		}

		build() {

			const positionAttribute = this.positionAttribute;
			const weightAttribute = this.weightAttribute;
			const faceWeights = new Float32Array( positionAttribute.count / 3 ); // Accumulate weights for each mesh face.

			for ( let i = 0; i < positionAttribute.count; i += 3 ) {

				let faceWeight = 1;

				if ( weightAttribute ) {

					faceWeight = weightAttribute.getX( i ) + weightAttribute.getX( i + 1 ) + weightAttribute.getX( i + 2 );

				}

				_face.a.fromBufferAttribute( positionAttribute, i );

				_face.b.fromBufferAttribute( positionAttribute, i + 1 );

				_face.c.fromBufferAttribute( positionAttribute, i + 2 );

				faceWeight *= _face.getArea();
				faceWeights[ i / 3 ] = faceWeight;

			} // Store cumulative total face weights in an array, where weight index
			// corresponds to face index.


			this.distribution = new Float32Array( positionAttribute.count / 3 );
			let cumulativeTotal = 0;

			for ( let i = 0; i < faceWeights.length; i ++ ) {

				cumulativeTotal += faceWeights[ i ];
				this.distribution[ i ] = cumulativeTotal;

			}

			return this;

		}

		setRandomGenerator( randomFunction ) {

			this.randomFunction = randomFunction;
			return this;

		}

		sample( targetPosition, targetNormal, targetColor ) {

			const cumulativeTotal = this.distribution[ this.distribution.length - 1 ];
			const faceIndex = this.binarySearch( this.randomFunction() * cumulativeTotal );
			return this.sampleFace( faceIndex, targetPosition, targetNormal, targetColor );

		}

		binarySearch( x ) {

			const dist = this.distribution;
			let start = 0;
			let end = dist.length - 1;
			let index = - 1;

			while ( start <= end ) {

				const mid = Math.ceil( ( start + end ) / 2 );

				if ( mid === 0 || dist[ mid - 1 ] <= x && dist[ mid ] > x ) {

					index = mid;
					break;

				} else if ( x < dist[ mid ] ) {

					end = mid - 1;

				} else {

					start = mid + 1;

				}

			}

			return index;

		}

		emod( n, m ) {

			return ( ( n % m ) + m ) % m;

		}

		sampleFace( faceIndex, targetPosition, targetNormal, targetColor ) {

			let u = this.randomFunction();
			let v = this.randomFunction();

			if ( u + v > 1 ) {

				u = 1 - u;
				v = 1 - v;

			}

			_face.a.fromBufferAttribute( this.positionAttribute, faceIndex * 3 );

			_face.b.fromBufferAttribute( this.positionAttribute, faceIndex * 3 + 1 );

			_face.c.fromBufferAttribute( this.positionAttribute, faceIndex * 3 + 2 );

			targetPosition.set( 0, 0, 0 ).addScaledVector( _face.a, u ).addScaledVector( _face.b, v ).addScaledVector( _face.c, 1 - ( u + v ) );

			if ( targetNormal !== undefined ) {

				_face.getNormal( targetNormal );

			}

			if ( targetColor !== undefined && this.colorAttribute !== undefined ) {

				_face.a.fromBufferAttribute( this.colorAttribute, faceIndex * 3 );

				_face.b.fromBufferAttribute( this.colorAttribute, faceIndex * 3 + 1 );

				_face.c.fromBufferAttribute( this.colorAttribute, faceIndex * 3 + 2 );

				_color.set( 0, 0, 0 ).addScaledVector( _face.a, u ).addScaledVector( _face.b, v ).addScaledVector( _face.c, 1 - ( u + v ) );

				targetColor.r = _color.x;
				targetColor.g = _color.y;
				targetColor.b = _color.z;

			} else if ( targetColor !== undefined && this.uvAttribute !== undefined ) {

				_uv.set( 0, 0, 0 ).addScaledVector( _face.a, u ).addScaledVector( _face.b, v ).addScaledVector( _face.c, 1 - ( u + v ) );

				_uv1.fromBufferAttribute( this.uvAttribute, faceIndex * 3 );

				_uv2.fromBufferAttribute( this.uvAttribute, faceIndex * 3 + 1 );

				_uv3.fromBufferAttribute( this.uvAttribute, faceIndex * 3 + 2 );

				_face.getUV( _uv, _uv1, _uv2, _uv3, _targetUV );


				u = _targetUV.x;
				v = _targetUV.y;

				const tx = Math.min( this.emod( u, 1 ) * this.colorMapData.width | 0, this.colorMapData.width - 1 );
				const ty = Math.min( this.emod( v, 1 ) * this.colorMapData.height | 0, this.colorMapData.height - 1 );
				const offset = ( ty * this.colorMapData.width + tx ) * 4;

				targetColor.r = this.colorMapData.data[ offset ] / 255;
				targetColor.g = this.colorMapData.data[ offset + 1 ] / 255;
				targetColor.b = this.colorMapData.data[ offset + 2 ] / 255;

			}

			return this;

		}

	}

	THREE.MeshSurfaceSampler = MeshSurfaceSampler;

} )();
