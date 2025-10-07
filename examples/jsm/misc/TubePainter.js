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

	const material = new MeshStandardMaterial( {
		vertexColors: true
	} );

	const mesh = new Mesh( geometry, material );
	mesh.frustumCulled = false;

	//

	function getPoints( size ) {

		const PI2 = Math.PI * 2;

		const sides = 10;
		const array = [];
		const radius = 0.01 * size;

		for ( let i = 0; i < sides; i ++ ) {

			const angle = ( i / sides ) * PI2;
			array.push( new Vector3( Math.sin( angle ) * radius, Math.cos( angle ) * radius, 0 ) );

		}

		return array;

	}

	//

	const vector1 = new Vector3();
	const vector2 = new Vector3();
	const vector3 = new Vector3();
	const vector4 = new Vector3();

	const color = new Color( 0xffffff );
	let size = 1;

	function addCap( position, matrix, isEndCap, capSize ) {

		let count = geometry.drawRange.count;

		const points = getPoints( capSize );
		const center = position.clone();

		const capNormal = new Vector3();
		capNormal.set(
			matrix.elements[ 8 ],
			matrix.elements[ 9 ],
			matrix.elements[ 10 ]
		);

		if ( isEndCap ) {

			capNormal.negate();

		}

		capNormal.normalize();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			const vertex1 = points[ i ];
			const vertex2 = points[ ( i + 1 ) % il ];

			if ( isEndCap ) {

				vector1.copy( center );
				vector2.copy( vertex1 ).applyMatrix4( matrix ).add( position );
				vector3.copy( vertex2 ).applyMatrix4( matrix ).add( position );

			} else {

				vector1.copy( center );
				vector2.copy( vertex2 ).applyMatrix4( matrix ).add( position );
				vector3.copy( vertex1 ).applyMatrix4( matrix ).add( position );

			}

			vector1.toArray( positions.array, ( count + 0 ) * 3 );
			vector2.toArray( positions.array, ( count + 1 ) * 3 );
			vector3.toArray( positions.array, ( count + 2 ) * 3 );

			capNormal.toArray( normals.array, ( count + 0 ) * 3 );
			capNormal.toArray( normals.array, ( count + 1 ) * 3 );
			capNormal.toArray( normals.array, ( count + 2 ) * 3 );

			color.toArray( colors.array, ( count + 0 ) * 3 );
			color.toArray( colors.array, ( count + 1 ) * 3 );
			color.toArray( colors.array, ( count + 2 ) * 3 );

			count += 3;

		}

		geometry.drawRange.count = count;

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

			color.toArray( colors.array, ( count + 0 ) * 3 );
			color.toArray( colors.array, ( count + 1 ) * 3 );
			color.toArray( colors.array, ( count + 2 ) * 3 );

			color.toArray( colors.array, ( count + 3 ) * 3 );
			color.toArray( colors.array, ( count + 4 ) * 3 );
			color.toArray( colors.array, ( count + 5 ) * 3 );

			count += 6;

		}

		geometry.drawRange.count = count;

	}

	//

	const direction = new Vector3();
	const side = new Vector3();
	const normal = new Vector3();

	const point1 = new Vector3();
	const point2 = new Vector3();

	const matrix1 = new Matrix4();
	const matrix2 = new Matrix4();

	const lastNormal = new Vector3( 0, 1, 0 );
	const prevDirection = new Vector3( 0, 0, 1 );
	const rotationAxis = new Vector3();

	let isFirstSegment = true;
	let isDrawing = false;
	let hasSegments = false;

	let segmentStartIndex = null;
	let lastSegmentPosition = new Vector3();
	let lastSegmentSize = 1;
	let nextSegmentStartSize = 1;

	function calculateRMF( applySmoothing ) {

		if ( isFirstSegment === true ) {

			if ( Math.abs( direction.y ) < 0.99 ) {

				normal.set( 0, 1, 0 ).sub( direction.clone().multiplyScalar( direction.y ) ).normalize();

			} else {

				normal.set( 1, 0, 0 ).sub( direction.clone().multiplyScalar( direction.x ) ).normalize();

			}

		} else {

			rotationAxis.crossVectors( prevDirection, direction );
			const rotAxisLength = rotationAxis.length();

			if ( rotAxisLength > 0.0001 ) {

				rotationAxis.divideScalar( rotAxisLength );
				const c1 = - 2.0 / ( 1.0 + prevDirection.dot( direction ) );
				const temp = new Vector3().addVectors( prevDirection, direction );
				const dot = lastNormal.dot( temp );
				normal.copy( lastNormal ).addScaledVector( temp, c1 * dot );

			} else {

				normal.copy( lastNormal );

			}

		}

		side.crossVectors( direction, normal ).normalize();
		normal.crossVectors( side, direction ).normalize();

		if ( applySmoothing === true && isFirstSegment === false ) {

			const smoothFactor = 0.3;
			normal.lerp( lastNormal, smoothFactor ).normalize();
			side.crossVectors( direction, normal ).normalize();
			normal.crossVectors( side, direction ).normalize();

		}

		lastNormal.copy( normal );
		prevDirection.copy( direction );

		matrix1.makeBasis( side, normal, direction.clone().negate() );

	}

	function moveTo( position ) {

		if ( isDrawing ) {

			if ( segmentStartIndex !== null ) {

				addCap( point1, matrix1, true, size );

			} else {

				addCap( point2, matrix2, true, size );

			}

			update();

			isDrawing = false;

		}

		point2.copy( position );

		lastNormal.set( 0, 1, 0 );

		segmentStartIndex = null;
		lastSegmentPosition.copy( position );
		lastSegmentSize = size;

		isFirstSegment = true;
		hasSegments = false;

	}

	function lineTo( position ) {

		isDrawing = true;

		point1.copy( position );

		const fromPos = segmentStartIndex === null ? point2 : lastSegmentPosition;
		direction.subVectors( point1, fromPos );
		const length = direction.length();

		if ( length === 0 ) return;

		const minDistance = 0.01 * size;
		const shouldCommit = length >= minDistance;

		if ( segmentStartIndex === null ) {

			nextSegmentStartSize = isFirstSegment ? size : lastSegmentSize;

			lineToInternal( point1 );
			const afterCount = geometry.drawRange.count;

			const points = getPoints( size );
			const segmentVertices = points.length * 6;
			segmentStartIndex = afterCount - segmentVertices;

			if ( shouldCommit === false ) {

				lastSegmentPosition.copy( fromPos );

			}

		} else {

			updatePendingSegment( point1 );

		}

		if ( shouldCommit ) {

			if ( hasSegments ) {

				smoothConnectionNormals();

			}

			point2.copy( point1 );
			matrix2.copy( matrix1 );

			lastSegmentPosition.copy( point1 );
			lastSegmentSize = size;
			segmentStartIndex = null;
			hasSegments = true;

		}

	}

	function smoothConnectionNormals() {

		if ( segmentStartIndex === null ) return;

		const points = getPoints( size );
		const segmentVertexCount = points.length * 6;

		const prevSegmentIndex = segmentStartIndex - segmentVertexCount;

		for ( let i = 0; i < points.length; i ++ ) {

			const prevIdx1 = prevSegmentIndex + i * 6 + 2;
			const prevIdx2 = prevSegmentIndex + i * 6 + 5;
			const currIdx1 = segmentStartIndex + i * 6 + 0;

			const avgNormal = new Vector3();

			avgNormal.set(
				normals.array[ prevIdx1 * 3 + 0 ],
				normals.array[ prevIdx1 * 3 + 1 ],
				normals.array[ prevIdx1 * 3 + 2 ]
			);

			avgNormal.add( new Vector3(
				normals.array[ currIdx1 * 3 + 0 ],
				normals.array[ currIdx1 * 3 + 1 ],
				normals.array[ currIdx1 * 3 + 2 ]
			) );

			avgNormal.normalize();

			avgNormal.toArray( normals.array, prevIdx1 * 3 );
			avgNormal.toArray( normals.array, prevIdx2 * 3 );
			avgNormal.toArray( normals.array, currIdx1 * 3 );

		}

		normals.addUpdateRange( prevSegmentIndex * 3, segmentVertexCount * 3 );
		normals.addUpdateRange( segmentStartIndex * 3, segmentVertexCount * 3 );
		normals.needsUpdate = true;

	}

	function updatePendingSegment( position ) {

		point1.copy( position );

		direction.subVectors( point1, point2 );
		const length = direction.length();

		if ( length === 0 ) return;

		direction.divideScalar( length );

		calculateRMF( true );

		const currentPoints = getPoints( size );
		const previousPoints = getPoints( nextSegmentStartSize );
		let vertexIndex = segmentStartIndex;

		for ( let i = 0, il = currentPoints.length; i < il; i ++ ) {

			const currentVertex1 = currentPoints[ i ];
			const currentVertex2 = currentPoints[ ( i + 1 ) % il ];
			const previousVertex1 = previousPoints[ i ];
			const previousVertex2 = previousPoints[ ( i + 1 ) % il ];

			vector1.copy( previousVertex1 ).applyMatrix4( matrix2 ).add( point2 );
			vector2.copy( previousVertex2 ).applyMatrix4( matrix2 ).add( point2 );
			vector3.copy( currentVertex2 ).applyMatrix4( matrix1 ).add( point1 );
			vector4.copy( currentVertex1 ).applyMatrix4( matrix1 ).add( point1 );

			vector1.toArray( positions.array, ( vertexIndex + 0 ) * 3 );
			vector2.toArray( positions.array, ( vertexIndex + 1 ) * 3 );
			vector4.toArray( positions.array, ( vertexIndex + 2 ) * 3 );

			vector2.toArray( positions.array, ( vertexIndex + 3 ) * 3 );
			vector3.toArray( positions.array, ( vertexIndex + 4 ) * 3 );
			vector4.toArray( positions.array, ( vertexIndex + 5 ) * 3 );

			vertexIndex += 6;

		}

		positions.addUpdateRange( segmentStartIndex * 3, ( vertexIndex - segmentStartIndex ) * 3 );
		positions.needsUpdate = true;

	}

	function lineToInternal( position ) {

		point1.copy( position );

		direction.subVectors( point1, point2 );
		const length = direction.length();

		if ( length === 0 ) return;

		direction.divideScalar( length );

		calculateRMF( true );

		if ( isFirstSegment === true ) {

			matrix2.copy( matrix1 );
			addCap( point2, matrix2, false, nextSegmentStartSize );
			isFirstSegment = false;

		}

		stroke( point1, point2, matrix1, matrix2, size, nextSegmentStartSize );

	}

	function setSize( value ) {

		size = value;

	}

	function setColor( value ) {

		color.copy( value );

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

		count = geometry.drawRange.count;

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
