import {
	BufferAttribute,
	BufferGeometry,
	DynamicDrawUsage,
	Mesh,
	MeshStandardMaterial,
	colorCopy,
	colorSetHex,
	colorToArray,
	mat3Create,
	mat3GetNormalMatrix,
	mat4Copy,
	mat4Create,
	mat4MakeBasis,
	vec3Add,
	vec3AddScaledVector,
	vec3AddVectors,
	vec3ApplyMatrix4,
	vec3ApplyNormalMatrix,
	vec3Copy,
	vec3Create,
	vec3CrossVectors,
	vec3DistanceToSquared,
	vec3DivideScalar,
	vec3Dot,
	vec3Length,
	vec3Lerp,
	vec3MultiplyScalar,
	vec3Negate,
	vec3Normalize,
	vec3Set,
	vec3Sub,
	vec3SubVectors,
	vec3ToArray
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

	const normalMatrix = mat3Create();
	const normalMatrix1 = mat3Create();
	const normalMatrix2 = mat3Create();

	//

	function getPoints( size ) {

		const PI2 = Math.PI * 2;

		const sides = 15;
		const array = [];
		const radius = 0.01 * size;

		for ( let i = 0; i < sides; i ++ ) {

			const angle = ( i / sides ) * PI2;
			array.push( vec3Set( vec3Create(), Math.sin( angle ) * radius, Math.cos( angle ) * radius, 0 ) );

		}

		return array;

	}

	//

	const vector = vec3Create();

	const vector1 = vec3Create();
	const vector2 = vec3Create();
	const vector3 = vec3Create();
	const vector4 = vec3Create();

	const color1 = colorSetHex( 0xffffff );
	const color2 = colorSetHex( 0xffffff );

	let size1 = 1;
	let size2 = 1;

	function addCap( position, matrix, isEndCap, capSize ) {

		let count = geometry.drawRange.count;

		const points = getPoints( capSize );
		const sides = points.length;
		const radius = 0.01 * capSize;
		const latSegments = 4;
		const directionSign = isEndCap ? - 1 : 1;

		mat3GetNormalMatrix( matrix, normalMatrix );

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
				vec3Add( vec3ApplyMatrix4( vec3Set( vector1, x1, y1, z1 ), matrix, vector1 ), position, vector1 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector2, x2, y2, z1 ), matrix, vector2 ), position, vector2 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector3, x3, y3, z2 ), matrix, vector3 ), position, vector3 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector4, x4, y4, z2 ), matrix, vector4 ), position, vector4 );

				// First triangle
				vec3ApplyNormalMatrix( vec3Set( normal, x1, y1, z1 ), normalMatrix, normal );
				vec3ApplyNormalMatrix( vec3Set( vector, x2, y2, z1 ), normalMatrix, vector );
				vec3ApplyNormalMatrix( vec3Set( side, x3, y3, z2 ), normalMatrix, side );

				if ( isEndCap ) {

					vec3ToArray( vector1, positions.array, count * 3 );
					vec3ToArray( vector2, positions.array, ( count + 1 ) * 3 );
					vec3ToArray( vector3, positions.array, ( count + 2 ) * 3 );

					vec3ToArray( normal, normals.array, count * 3 );
					vec3ToArray( vector, normals.array, ( count + 1 ) * 3 );
					vec3ToArray( side, normals.array, ( count + 2 ) * 3 );

				} else {

					vec3ToArray( vector1, positions.array, count * 3 );
					vec3ToArray( vector3, positions.array, ( count + 1 ) * 3 );
					vec3ToArray( vector2, positions.array, ( count + 2 ) * 3 );

					vec3ToArray( normal, normals.array, count * 3 );
					vec3ToArray( side, normals.array, ( count + 1 ) * 3 );
					vec3ToArray( vector, normals.array, ( count + 2 ) * 3 );

				}

				colorToArray( color1, colors.array, count * 3 );
				colorToArray( color1, colors.array, ( count + 1 ) * 3 );
				colorToArray( color1, colors.array, ( count + 2 ) * 3 );

				count += 3;

				// Second triangle
				if ( r2 > 0.001 ) {

					vec3ApplyNormalMatrix( vec3Set( normal, x2, y2, z1 ), normalMatrix, normal );
					vec3ApplyNormalMatrix( vec3Set( vector, x4, y4, z2 ), normalMatrix, vector );
					vec3ApplyNormalMatrix( vec3Set( side, x3, y3, z2 ), normalMatrix, side );

					if ( isEndCap ) {

						vec3ToArray( vector2, positions.array, count * 3 );
						vec3ToArray( vector4, positions.array, ( count + 1 ) * 3 );
						vec3ToArray( vector3, positions.array, ( count + 2 ) * 3 );

						vec3ToArray( normal, normals.array, count * 3 );
						vec3ToArray( vector, normals.array, ( count + 1 ) * 3 );
						vec3ToArray( side, normals.array, ( count + 2 ) * 3 );

					} else {

						vec3ToArray( vector3, positions.array, count * 3 );
						vec3ToArray( vector4, positions.array, ( count + 1 ) * 3 );
						vec3ToArray( vector2, positions.array, ( count + 2 ) * 3 );

						vec3ToArray( side, normals.array, count * 3 );
						vec3ToArray( vector, normals.array, ( count + 1 ) * 3 );
						vec3ToArray( normal, normals.array, ( count + 2 ) * 3 );

					}

					colorToArray( color1, colors.array, count * 3 );
					colorToArray( color1, colors.array, ( count + 1 ) * 3 );
					colorToArray( color1, colors.array, ( count + 2 ) * 3 );

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

		mat3GetNormalMatrix( matrix, normalMatrix );

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
				vec3Add( vec3ApplyMatrix4( vec3Set( vector1, x1, y1, z1 ), matrix, vector1 ), position, vector1 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector2, x2, y2, z1 ), matrix, vector2 ), position, vector2 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector3, x3, y3, z2 ), matrix, vector3 ), position, vector3 );
				vec3Add( vec3ApplyMatrix4( vec3Set( vector4, x4, y4, z2 ), matrix, vector4 ), position, vector4 );

				// Transform normals to world space
				vec3ApplyNormalMatrix( vec3Set( normal, x1, y1, z1 ), normalMatrix, normal );
				vec3ApplyNormalMatrix( vec3Set( vector, x2, y2, z1 ), normalMatrix, vector );
				vec3ApplyNormalMatrix( vec3Set( side, x3, y3, z2 ), normalMatrix, side );

				// First triangle
				vec3ToArray( vector1, positions.array, count * 3 );
				vec3ToArray( vector2, positions.array, ( count + 1 ) * 3 );
				vec3ToArray( vector3, positions.array, ( count + 2 ) * 3 );

				vec3ToArray( normal, normals.array, count * 3 );
				vec3ToArray( vector, normals.array, ( count + 1 ) * 3 );
				vec3ToArray( side, normals.array, ( count + 2 ) * 3 );

				colorToArray( color1, colors.array, count * 3 );
				colorToArray( color1, colors.array, ( count + 1 ) * 3 );
				colorToArray( color1, colors.array, ( count + 2 ) * 3 );

				count += 3;

				// Second triangle
				if ( r2 > 0.001 ) {

					vec3ApplyNormalMatrix( vec3Set( normal, x2, y2, z1 ), normalMatrix, normal );
					vec3ApplyNormalMatrix( vec3Set( vector, x4, y4, z2 ), normalMatrix, vector );
					vec3ApplyNormalMatrix( vec3Set( side, x3, y3, z2 ), normalMatrix, side );

					vec3ToArray( vector2, positions.array, count * 3 );
					vec3ToArray( vector4, positions.array, ( count + 1 ) * 3 );
					vec3ToArray( vector3, positions.array, ( count + 2 ) * 3 );

					vec3ToArray( normal, normals.array, count * 3 );
					vec3ToArray( vector, normals.array, ( count + 1 ) * 3 );
					vec3ToArray( side, normals.array, ( count + 2 ) * 3 );

					colorToArray( color1, colors.array, count * 3 );
					colorToArray( color1, colors.array, ( count + 1 ) * 3 );
					colorToArray( color1, colors.array, ( count + 2 ) * 3 );

					count += 3;

				}

			}

		}

		positions.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );
		normals.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );
		colors.addUpdateRange( endCapStartIndex * 3, endCapVertexCount * 3 );

	}

	function stroke( position1, position2, matrix1, matrix2, size1, size2 ) {

		if ( vec3DistanceToSquared( position1, position2 ) === 0 ) return;

		let count = geometry.drawRange.count;

		const points1 = getPoints( size1 );
		const points2 = getPoints( size2 );

		mat3GetNormalMatrix( matrix1, normalMatrix1 );
		mat3GetNormalMatrix( matrix2, normalMatrix2 );

		for ( let i = 0, il = points2.length; i < il; i ++ ) {

			const vertex1_2 = points2[ i ];
			const vertex2_2 = points2[ ( i + 1 ) % il ];
			const vertex1_1 = points1[ i ];
			const vertex2_1 = points1[ ( i + 1 ) % il ];

			vec3Add( vec3ApplyMatrix4( vec3Copy( vertex1_2, vector1 ), matrix2, vector1 ), position2, vector1 );
			vec3Add( vec3ApplyMatrix4( vec3Copy( vertex2_2, vector2 ), matrix2, vector2 ), position2, vector2 );
			vec3Add( vec3ApplyMatrix4( vec3Copy( vertex2_1, vector3 ), matrix1, vector3 ), position1, vector3 );
			vec3Add( vec3ApplyMatrix4( vec3Copy( vertex1_1, vector4 ), matrix1, vector4 ), position1, vector4 );

			vec3ToArray( vector1, positions.array, ( count + 0 ) * 3 );
			vec3ToArray( vector2, positions.array, ( count + 1 ) * 3 );
			vec3ToArray( vector4, positions.array, ( count + 2 ) * 3 );

			vec3ToArray( vector2, positions.array, ( count + 3 ) * 3 );
			vec3ToArray( vector3, positions.array, ( count + 4 ) * 3 );
			vec3ToArray( vector4, positions.array, ( count + 5 ) * 3 );

			vec3ApplyNormalMatrix( vec3Copy( vertex1_2, vector1 ), normalMatrix2, vector1 );
			vec3ApplyNormalMatrix( vec3Copy( vertex2_2, vector2 ), normalMatrix2, vector2 );
			vec3ApplyNormalMatrix( vec3Copy( vertex2_1, vector3 ), normalMatrix1, vector3 );
			vec3ApplyNormalMatrix( vec3Copy( vertex1_1, vector4 ), normalMatrix1, vector4 );

			vec3ToArray( vector1, normals.array, ( count + 0 ) * 3 );
			vec3ToArray( vector2, normals.array, ( count + 1 ) * 3 );
			vec3ToArray( vector4, normals.array, ( count + 2 ) * 3 );

			vec3ToArray( vector2, normals.array, ( count + 3 ) * 3 );
			vec3ToArray( vector3, normals.array, ( count + 4 ) * 3 );
			vec3ToArray( vector4, normals.array, ( count + 5 ) * 3 );

			colorToArray( color2, colors.array, ( count + 0 ) * 3 );
			colorToArray( color2, colors.array, ( count + 1 ) * 3 );
			colorToArray( color1, colors.array, ( count + 2 ) * 3 );

			colorToArray( color2, colors.array, ( count + 3 ) * 3 );
			colorToArray( color1, colors.array, ( count + 4 ) * 3 );
			colorToArray( color1, colors.array, ( count + 5 ) * 3 );

			count += 6;

		}

		geometry.drawRange.count = count;

	}

	//

	const direction = vec3Create();
	const normal = vec3Create();
	const side = vec3Create();

	const point1 = vec3Create();
	const point2 = vec3Create();

	const matrix1 = mat4Create();
	const matrix2 = mat4Create();

	const lastNormal = vec3Create();
	const prevDirection = vec3Create();
	const rotationAxis = vec3Create();

	let isFirstSegment = true;

	let endCapStartIndex = null;
	let endCapVertexCount = 0;

	function calculateRMF() {

		if ( isFirstSegment === true ) {

			if ( Math.abs( direction.y ) < 0.99 ) {

				vec3MultiplyScalar( vec3Copy( direction, vector ), direction.y, vector );
				vec3Normalize( vec3Sub( vec3Set( normal, 0, 1, 0 ), vector, normal ), normal );

			} else {

				vec3MultiplyScalar( vec3Copy( direction, vector ), direction.x, vector );
				vec3Normalize( vec3Sub( vec3Set( normal, 1, 0, 0 ), vector, normal ), normal );

			}

		} else {

			vec3CrossVectors( prevDirection, direction, rotationAxis );

			const rotAxisLength = vec3Length( rotationAxis );

			if ( rotAxisLength > 0.0001 ) {

				vec3DivideScalar( rotationAxis, rotAxisLength, rotationAxis );
				vec3AddVectors( prevDirection, direction, vector );
				const c1 = - 2.0 / ( 1.0 + vec3Dot( prevDirection, direction ) );
				const dot = vec3Dot( lastNormal, vector );
				vec3AddScaledVector( vec3Copy( lastNormal, normal ), vector, c1 * dot, normal );

			} else {

				vec3Copy( lastNormal, normal );

			}

		}

		vec3Normalize( vec3CrossVectors( direction, normal, side ), side );
		vec3Normalize( vec3CrossVectors( side, direction, normal ), normal );

		if ( isFirstSegment === false ) {

			const smoothFactor = 0.3;

			vec3Normalize( vec3Lerp( normal, lastNormal, smoothFactor, normal ), normal );
			vec3Normalize( vec3CrossVectors( direction, normal, side ), side );
			vec3Normalize( vec3CrossVectors( side, direction, normal ), normal );

		}

		vec3Copy( normal, lastNormal );
		vec3Copy( direction, prevDirection );

		mat4MakeBasis( side, normal, vec3Negate( vec3Copy( direction, vector ), vector ), matrix1 );

	}

	function moveTo( position ) {

		vec3Copy( position, point2 );

		vec3Set( lastNormal, 0, 1, 0 );

		isFirstSegment = true;

		endCapStartIndex = null;
		endCapVertexCount = 0;

	}

	function lineTo( position ) {

		vec3Copy( position, point1 );

		vec3SubVectors( point1, point2, direction );

		const length = vec3Length( direction );

		if ( length === 0 ) return;

		vec3Normalize( direction, direction );

		calculateRMF();

		if ( isFirstSegment === true ) {

			colorCopy( color1, color2 );
			size2 = size1;

			mat4Copy( matrix1, matrix2 );

			addCap( point2, matrix2, false, size2 );

			// End cap is added immediately after start cap and updated in-place
			endCapStartIndex = geometry.drawRange.count;
			addCap( point1, matrix1, true, size1 );
			endCapVertexCount = geometry.drawRange.count - endCapStartIndex;

		}

		stroke( point1, point2, matrix1, matrix2, size1, size2 );

		updateEndCap( point1, matrix1, size1 );

		vec3Copy( point1, point2 );
		mat4Copy( matrix1, matrix2 );

		colorCopy( color1, color2 );
		size2 = size1;

		isFirstSegment = false;

	}

	function setSize( value ) {

		size1 = value;

	}

	function setColor( value ) {

		colorCopy( value, color1 );

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
