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

	function stroke( position1, position2, matrix1, matrix2 ) {

		if ( position1.distanceToSquared( position2 ) === 0 ) return;

		let count = geometry.drawRange.count;

		const points = getPoints( size );

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			const vertex1 = points[ i ];
			const vertex2 = points[ ( i + 1 ) % il ];

			// positions

			vector1.copy( vertex1 ).applyMatrix4( matrix2 ).add( position2 );
			vector2.copy( vertex2 ).applyMatrix4( matrix2 ).add( position2 );
			vector3.copy( vertex2 ).applyMatrix4( matrix1 ).add( position1 );
			vector4.copy( vertex1 ).applyMatrix4( matrix1 ).add( position1 );

			vector1.toArray( positions.array, ( count + 0 ) * 3 );
			vector2.toArray( positions.array, ( count + 1 ) * 3 );
			vector4.toArray( positions.array, ( count + 2 ) * 3 );

			vector2.toArray( positions.array, ( count + 3 ) * 3 );
			vector3.toArray( positions.array, ( count + 4 ) * 3 );
			vector4.toArray( positions.array, ( count + 5 ) * 3 );

			// normals

			vector1.copy( vertex1 ).applyMatrix4( matrix2 ).normalize();
			vector2.copy( vertex2 ).applyMatrix4( matrix2 ).normalize();
			vector3.copy( vertex2 ).applyMatrix4( matrix1 ).normalize();
			vector4.copy( vertex1 ).applyMatrix4( matrix1 ).normalize();

			vector1.toArray( normals.array, ( count + 0 ) * 3 );
			vector2.toArray( normals.array, ( count + 1 ) * 3 );
			vector4.toArray( normals.array, ( count + 2 ) * 3 );

			vector2.toArray( normals.array, ( count + 3 ) * 3 );
			vector3.toArray( normals.array, ( count + 4 ) * 3 );
			vector4.toArray( normals.array, ( count + 5 ) * 3 );

			// colors

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

	const up = new Vector3( 0, 1, 0 );

	const point1 = new Vector3();
	const point2 = new Vector3();

	const matrix1 = new Matrix4();
	const matrix2 = new Matrix4();

	function moveTo( position ) {

		point1.copy( position );
		matrix1.lookAt( point2, point1, up );

		point2.copy( position );
		matrix2.copy( matrix1 );

	}

	function lineTo( position ) {

		point1.copy( position );
		matrix1.lookAt( point2, point1, up );

		stroke( point1, point2, matrix1, matrix2 );

		point2.copy( point1 );
		matrix2.copy( matrix1 );

	}

	function setSize( value ) {

		size = value;

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
