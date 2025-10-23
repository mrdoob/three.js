import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DynamicDrawUsage,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Vector3
} from 'three';

/**
 * @classdesc This module can be used to paint tube-like meshes
 * along a sequence of points. This module is used in a XR
 * painter demo.
 *
 * ```js
 * const painter = new TubePainter();
 * scene.add( painter.mesh );
 * ```
 *
 * @name TubePainter
 * @class
 * @three_import import { TubePainter } from 'three/addons/misc/TubePainter.js';
 */
function TubePainter() {

	const BUFFER_SIZE = 1000000 * 3;

	const positions = new BufferAttribute( new Float32Array( BUFFER_SIZE ), 3 );
	positions.usage = DynamicDrawUsage;

	const normals = new BufferAttribute( new Float32Array( BUFFER_SIZE ), 3 );
	normals.usage = DynamicDrawUsage;

	const colors = new BufferAttribute( new Float32Array( BUFFER_SIZE ), 3 );
	colors.usage = DynamicDrawUsage;

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', positions );
	geometry.setAttribute( 'normal', normals );
	geometry.setAttribute( 'color', colors );
	geometry.drawRange.count = 0;

	const material = new MeshStandardMaterial( { vertexColors: true } );

	const mesh = new Mesh( geometry, material );
	mesh.frustumCulled = false;

	//

	function getPoints( size ) {

		const PI2 = Math.PI * 2;

		const sides = 15;
		const array = [];
		const radius = 0.01 * size;

		for ( let i = 0; i < sides; i ++ ) {

			const angle = ( i / sides ) * PI2;
			array.push( new Vector3( Math.sin( angle ) * radius, Math.cos( angle ) * radius, 0 ) );

		}

		return array;

	}

	//

	const vector = new Vector3();

	const vector1 = new Vector3();
	const vector2 = new Vector3();
	const vector3 = new Vector3();
	const vector4 = new Vector3();

	const color1 = new Color( 0xffffff );
	const color2 = new Color( 0xffffff );

	let size1 = 1;
	let size2 = 1;

	function addCap( position, matrix, isEndCap, capSize ) {

		let count = geometry.drawRange.count;

		const points = getPoints( capSize );
		const sides = points.length;
		const radius = 0.01 * capSize;
		const latSegments = 4;
		const directionSign = isEndCap ? - 1 : 1;

		for ( let lat = 0; lat < latSegments; lat ++ ) {

			const phi1 = ( lat / latSegments ) * Math.PI * 0.5;
			const phi2 = ( ( lat + 1 ) / latSegments ) * Math.PI * 0.5;

			const z1 = Math.sin( phi1 ) * radius * directionSign;
			const r1 = Math.cos( phi1 ) * radius;

			const z2 = Math.sin( phi2 ) * radius * directionSign;
			const r2 = Math.cos( phi2 ) * radius;

			for ( let i = 0; i < sides; i ++ ) {

				const theta1 = ( i / sides ) * Math.PI * 2;
				const theta2 = ( ( i + 1 ) / sides ) * Math.PI * 2;

				// First ring
				const x1 = Math.sin( theta1 ) * r1;
				const y1 = Math.cos( theta1 ) * r1;

				const x2 = Math.sin( theta2 ) * r1;
				const y2 = Math.cos( theta2 ) * r1;

				// Second ring
				const x3 = Math.sin( theta1 ) * r2;
				const y3 = Math.cos( theta1 ) * r2;

				const x4 = Math.sin( theta2 ) * r2;
				const y4 = Math.cos( theta2 ) * r2;

				// Transform to world space
				vector1.set( x1, y1, z1 ).applyMatrix4( matrix ).add( position );
				vector2.set( x2, y2, z1 ).applyMatrix4( matrix ).add( position );
				vector3.set( x3, y3, z2 ).applyMatrix4( matrix ).add( position );
				vector4.set( x4, y4, z2 ).applyMatrix4( matrix ).add( position );

				// First triangle
				normal.set( x1, y1, z1 ).normalize().transformDirection( matrix );
				vector.set( x2, y2, z1 ).normalize().transformDirection( matrix );
				side.set( x3, y3, z2 ).normalize().transformDirection( matrix );

				if ( isEndCap ) {

					vector1.toArray( positions.array, count * 3 );
					vector2.toArray( positions.array, ( count + 1 ) * 3 );
					vector3.toArray( positions.array, ( count + 2 ) * 3 );

					normal.toArray( normals.array, count * 3 );
					vector.toArray( normals.array, ( count + 1 ) * 3 );
					side.toArray( normals.array, ( count + 2 ) * 3 );

				} else {

					vector1.toArray( positions.array, count * 3 );
					vector3.toArray( positions.array, ( count + 1 ) * 3 );
					vector2.toArray( positions.array, ( count + 2 ) * 3 );

					normal.toArray( normals.array, count * 3 );
					side.toArray( normals.array, ( count + 1 ) * 3 );
					vector.toArray( normals.array, ( count + 2 ) * 3 );

				}

				color1.toArray( colors.array, count * 3 );
				color1.toArray( colors.array, ( count + 1 ) * 3 );
				color1.toArray( colors.array, ( count + 2 ) * 3 );

				count += 3;

				// Second triangle
				if ( r2 > 0.001 ) {

					normal.set( x2, y2, z1 ).normalize().transformDirection( matrix );
					vector.set( x4, y4, z2 ).normalize().transformDirection( matrix );
					side.set( x3, y3, z2 ).normalize().transformDirection( matrix );

					if ( isEndCap ) {

						vector2.toArray( positions.array, count * 3 );
						vector4.toArray( positions.array, ( count + 1 ) * 3 );
						vector3.toArray( positions.array, ( count + 2 ) * 3 );

						normal.toArray( normals.array, count * 3 );
						vector.toArray( normals.array, ( count + 1 ) * 3 );
						side.toArray( normals.array, ( count + 2 ) * 3 );

					} else {

						vector3.toArray( positions.array, count * 3 );
						vector4.toArray( positions.array, ( count + 1 ) * 3 );
						vector2.toArray( positions.array, ( count + 2 ) * 3 );

						side.toArray( normals.array, count * 3 );
						vector.toArray( normals.array, ( count + 1 ) * 3 );
						normal.toArray( normals.array, ( count + 2 ) * 3 );

					}

					color1.toArray( colors.array, count * 3 );
					color1.toArray( colors.array, ( count + 1 ) * 3 );
					color1.toArray( colors.array, ( count + 2 ) * 3 );

					count += 3;

				}

			}

		}

		geometry.drawRange.count = count;

	}

	function updateEndCap( position, matrix, capSize ) {

		if ( endCapStartIndex === null ) return;

		const points = getPoints( capSize );
		const sides = points.length;
		const radius = 0.01 * capSize;
		const latSegments = 4;

		let count = endCapStartIndex;

		for ( let lat = 0; lat < latSegments; lat ++ ) {

			const phi1 = ( lat / latSegments ) * Math.PI * 0.5;
			const phi2 = ( ( lat + 1 ) / latSegments ) * Math.PI * 0.5;

			const z1 = - Math.sin( phi1 ) * radius;
			const r1 = Math.cos( phi1 ) * radius;

			const z2 = - Math.sin( phi2 ) * radius;
			const r2 = Math.cos( phi2 ) * radius;

			for ( let i = 0; i < sides; i ++ ) {

				const theta1 = ( i / sides ) * Math.PI * 2;
				const theta2 = ( ( i + 1 ) / sides ) * Math.PI * 2;

				// First ring
				const x1 = Math.sin( theta1 ) * r1;
				const y1 = Math.cos( theta1 ) * r1;

				const x2 = Math.sin( theta2 ) * r1;
				const y2 = Math.cos( theta2 ) * r1;

				// Second ring
				const x3 = Math.sin( theta1 ) * r2;
				const y3 = Math.cos( theta1 ) * r2;

				const x4 = Math.sin( theta2 ) * r2;
				const y4 = Math.cos( theta2 ) * r2;

				// Transform positions to world space
				vector1.set( x1, y1, z1 ).applyMatrix4( matrix ).add( position );
				vector2.set( x2, y2, z1 ).applyMatrix4( matrix ).add( position );
				vector3.set( x3, y3, z2 ).applyMatrix4( matrix ).add( position );
				vector4.set( x4, y4, z2 ).applyMatrix4( matrix ).add( position );

				// Transform normals to world space
				normal.set( x1, y1, z1 ).normalize().transformDirection( matrix );
				vector.set( x2, y2, z1 ).normalize().transformDirection( matrix );
				side.set( x3, y3, z2 ).normalize().transformDirection( matrix );

				// First triangle
				vector1.toArray( positions.array, count * 3 );
				vector2.toArray( positions.array, ( count + 1 ) * 3 );
				vector3.toArray( positions.array, ( count + 2 ) * 3 );

				normal.toArray( normals.array, count * 3 );
				vector.toArray( normals.array, ( count + 1 ) * 3 );
				side.toArray( normals.array, ( count + 2 ) * 3 );

				color1.toArray( colors.array, count * 3 );
				color1.toArray( colors.array, ( count + 1 ) * 3 );
				color1.toArray( colors.array, ( count + 2 ) * 3 );

				count += 3;

				// Second triangle
				if ( r2 > 0.001 ) {

					normal.set( x2, y2, z1 ).normalize().transformDirection( matrix );
					vector.set( x4, y4, z2 ).normalize().transformDirection( matrix );
					side.set( x3, y3, z2 ).normalize().transformDirection( matrix );

					vector2.toArray( positions.array, count * 3 );
					vector4.toArray( positions.array, ( count + 1 ) * 3 );
					vector3.toArray( positions.array, ( count + 2 ) * 3 );

					normal.toArray( normals.array, count * 3 );
					vector.toArray( normals.array, ( count + 1 ) * 3 );
					side.toArray( normals.array, ( count + 2 ) * 3 );

					color1.toArray( colors.array, count * 3 );
					color1.toArray( colors.array, ( count + 1 ) * 3 );
					color1.toArray( colors.array, ( count + 2 ) * 3 );

					count += 3;

				}

			}

		}

		positions.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );
		normals.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );
		colors.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );

	}

	function stroke( position1, position2, matrix1, matrix2, size1, size2 ) {

		if ( position1.distanceToSquared( position2 ) === 0 ) return;

		let count = geometry.drawRange.count;

		const points1 = getPoints( size1 );
		const points2 = getPoints( size2 );

		for ( let i = 0, il = points2.length; i < il; i ++ ) {

			const vertex1_2 = points2[ i ];
			const vertex2_2 = points2[ ( i + 1 ) % il ];
			const vertex1_1 = points1[ i ];
			const vertex2_1 = points1[ ( i + 1 ) % il ];

			vector1.copy( vertex1_2 ).applyMatrix4( matrix2 ).add( position2 );
			vector2.copy( vertex2_2 ).applyMatrix4( matrix2 ).add( position2 );
			vector3.copy( vertex2_1 ).applyMatrix4( matrix1 ).add( position1 );
			vector4.copy( vertex1_1 ).applyMatrix4( matrix1 ).add( position1 );

			vector1.toArray( positions.array, ( count + 0 ) * 3 );
			vector2.toArray( positions.array, ( count + 1 ) * 3 );
			vector4.toArray( positions.array, ( count + 2 ) * 3 );

			vector2.toArray( positions.array, ( count + 3 ) * 3 );
			vector3.toArray( positions.array, ( count + 4 ) * 3 );
			vector4.toArray( positions.array, ( count + 5 ) * 3 );

			vector1.copy( vertex1_2 ).applyMatrix4( matrix2 ).normalize();
			vector2.copy( vertex2_2 ).applyMatrix4( matrix2 ).normalize();
			vector3.copy( vertex2_1 ).applyMatrix4( matrix1 ).normalize();
			vector4.copy( vertex1_1 ).applyMatrix4( matrix1 ).normalize();

			vector1.toArray( normals.array, ( count + 0 ) * 3 );
			vector2.toArray( normals.array, ( count + 1 ) * 3 );
			vector4.toArray( normals.array, ( count + 2 ) * 3 );

			vector2.toArray( normals.array, ( count + 3 ) * 3 );
			vector3.toArray( normals.array, ( count + 4 ) * 3 );
			vector4.toArray( normals.array, ( count + 5 ) * 3 );

			color2.toArray( colors.array, ( count + 0 ) * 3 );
			color2.toArray( colors.array, ( count + 1 ) * 3 );
			color1.toArray( colors.array, ( count + 2 ) * 3 );

			color2.toArray( colors.array, ( count + 3 ) * 3 );
			color1.toArray( colors.array, ( count + 4 ) * 3 );
			color1.toArray( colors.array, ( count + 5 ) * 3 );

			count += 6;

		}

		geometry.drawRange.count = count;

	}

	//

	const direction = new Vector3();
	const normal = new Vector3();
	const side = new Vector3();

	const point1 = new Vector3();
	const point2 = new Vector3();

	const matrix1 = new Matrix4();
	const matrix2 = new Matrix4();

	const lastNormal = new Vector3();
	const prevDirection = new Vector3();
	const rotationAxis = new Vector3();

	let isFirstSegment = true;

	let endCapStartIndex = null;
	let endCapVertexCount = 0;

	function calculateRMF() {

		if ( isFirstSegment === true ) {

			if ( Math.abs( direction.y ) < 0.99 ) {

				vector.copy( direction ).multiplyScalar( direction.y );
				normal.set( 0, 1, 0 ).sub( vector ).normalize();

			} else {

				vector.copy( direction ).multiplyScalar( direction.x );
				normal.set( 1, 0, 0 ).sub( vector ).normalize();

			}

		} else {

			rotationAxis.crossVectors( prevDirection, direction );

			const rotAxisLength = rotationAxis.length();

			if ( rotAxisLength > 0.0001 ) {

				rotationAxis.divideScalar( rotAxisLength );
				vector.addVectors( prevDirection, direction );
				const c1 = - 2.0 / ( 1.0 + prevDirection.dot( direction ) );
				const dot = lastNormal.dot( vector );
				normal.copy( lastNormal ).addScaledVector( vector, c1 * dot );

			} else {

				normal.copy( lastNormal );

			}

		}

		side.crossVectors( direction, normal ).normalize();
		normal.crossVectors( side, direction ).normalize();

		if ( isFirstSegment === false ) {

			const smoothFactor = 0.3;

			normal.lerp( lastNormal, smoothFactor ).normalize();
			side.crossVectors( direction, normal ).normalize();
			normal.crossVectors( side, direction ).normalize();

		}

		lastNormal.copy( normal );
		prevDirection.copy( direction );

		matrix1.makeBasis( side, normal, vector.copy( direction ).negate() );

	}

	function moveTo( position ) {

		point2.copy( position );

		lastNormal.set( 0, 1, 0 );

		isFirstSegment = true;

		endCapStartIndex = null;
		endCapVertexCount = 0;

	}

	function lineTo( position ) {

		point1.copy( position );

		direction.subVectors( point1, point2 );

		const length = direction.length();

		if ( length === 0 ) return;

		direction.normalize();

		calculateRMF();

		if ( isFirstSegment === true ) {

			color2.copy( color1 );
			size2 = size1;

			matrix2.copy( matrix1 );

			addCap( point2, matrix2, false, size2 );

			// End cap is added immediately after start cap and updated in-place
			endCapStartIndex = geometry.drawRange.count;
			addCap( point1, matrix1, true, size1 );
			endCapVertexCount = geometry.drawRange.count - endCapStartIndex;

		}

		stroke( point1, point2, matrix1, matrix2, size1, size2 );

		updateEndCap( point1, matrix1, size1 );

		point2.copy( point1 );
		matrix2.copy( matrix1 );

		color2.copy( color1 );
		size2 = size1;

		isFirstSegment = false;

	}

	function setSize( value ) {

		size1 = value;

	}

	function setColor( value ) {

		color1.copy( value );

	}

	//

	let count = 0;

	function update() {

		const start = count;
		const end = geometry.drawRange.count;

		if ( start === end ) return;

		positions.addUpdateRange( start * 3, ( end - start ) * 3 );
		positions.needsUpdate = true;

		normals.addUpdateRange( start * 3, ( end - start ) * 3 );
		normals.needsUpdate = true;

		colors.addUpdateRange( start * 3, ( end - start ) * 3 );
		colors.needsUpdate = true;

		count = end;

	}

	return {
		/**
		 * The "painted" tube mesh. Must be added to the scene.
		 *
		 * @name TubePainter#mesh
		 * @type {Mesh}
		 */
		mesh: mesh,

		/**
		 * Moves the current painting position to the given value.
		 *
		 * @method
		 * @name TubePainter#moveTo
		 * @param {Vector3} position The new painting position.
		 */
		moveTo: moveTo,

		/**
		 * Draw a stroke from the current position to the given one.
		 * This method extends the tube while drawing with the XR
		 * controllers.
		 *
		 * @method
		 * @name TubePainter#lineTo
		 * @param {Vector3} position The destination position.
		 */
		lineTo: lineTo,

		/**
		 * Sets the size of newly rendered tube segments.
		 *
		 * @method
		 * @name TubePainter#setSize
		 * @param {number} size The size.
		 */
		setSize: setSize,

		/**
		 * Sets the color of newly rendered tube segments.
		 *
		 * @method
		 * @name TubePainter#setColor
		 * @param {Color} color The color.
		 */
		setColor: setColor,

		/**
		 * Updates the internal geometry buffers so the new painted
		 * segments are rendered.
		 *
		 * @method
		 * @name TubePainter#update
		 */
		update: update
	};

}

export { TubePainter };
