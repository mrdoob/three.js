/**
 * A structural type describing any object with numeric `x`, `y`, and `z`
 * components, exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object that stores third-order spherical
 * harmonics as nine RGB coefficient vectors, exactly like
 * {@link SphericalHarmonics3#coefficients}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link SphericalHarmonics3} instance. Since
 * {@link SphericalHarmonics3} exposes a compatible `coefficients` array,
 * instances of that class satisfy this type without any special handling.
 *
 * @typedef {Object} SphericalHarmonics3Like
 * @property {Array<Vector3Like>} coefficients - An array of 9 SH coefficient vectors.
 */

/**
 * Creates a new, plain {@link SphericalHarmonics3Like} object with nine zero
 * coefficient vectors.
 *
 * Unlike `new SphericalHarmonics3()`, the returned object is not a class
 * instance and carries no `isSphericalHarmonics3` flag - it only satisfies
 * the {@link SphericalHarmonics3Like} shape. This keeps functional-only call
 * sites free of any dependency on the {@link SphericalHarmonics3} class so
 * that unused operations can be tree-shaken.
 *
 * @return {SphericalHarmonics3Like} A new SH-like object in the default state.
 */
export function sh3Create() {

	return {

		coefficients: [

			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 }

		]

	};

}

/**
 * Sets the given SH coefficients on the target by copying the values.
 *
 * @param {Array<Vector3Like>} coefficients - The SH coefficients.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3Set( coefficients, target = sh3Create() ) {

	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const src = coefficients[ i ];
		const dst = tc[ i ];

		dst.x = src.x;
		dst.y = src.y;
		dst.z = src.z;

	}

	return target;

}

/**
 * Sets all SH coefficients of the target to `0`.
 *
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3Zero( target = sh3Create() ) {

	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const dst = tc[ i ];

		dst.x = 0;
		dst.y = 0;
		dst.z = 0;

	}

	return target;

}

/**
 * Returns the radiance in the direction of the given normal.
 *
 * @param {SphericalHarmonics3Like} sh - The spherical harmonics.
 * @param {Vector3Like} normal - The normal vector (assumed to be unit length).
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The radiance.
 */
export function sh3GetAt( sh, normal, target = { x: 0, y: 0, z: 0 } ) {

	// normal is assumed to be unit length

	const x = normal.x, y = normal.y, z = normal.z;

	const coeff = sh.coefficients;

	// band 0
	const c0 = coeff[ 0 ];
	target.x = c0.x * 0.282095;
	target.y = c0.y * 0.282095;
	target.z = c0.z * 0.282095;

	// band 1
	const s1y = 0.488603 * y;
	const c1 = coeff[ 1 ];
	target.x += c1.x * s1y;
	target.y += c1.y * s1y;
	target.z += c1.z * s1y;

	const s1z = 0.488603 * z;
	const c2 = coeff[ 2 ];
	target.x += c2.x * s1z;
	target.y += c2.y * s1z;
	target.z += c2.z * s1z;

	const s1x = 0.488603 * x;
	const c3 = coeff[ 3 ];
	target.x += c3.x * s1x;
	target.y += c3.y * s1x;
	target.z += c3.z * s1x;

	// band 2
	const s2xy = 1.092548 * ( x * y );
	const c4 = coeff[ 4 ];
	target.x += c4.x * s2xy;
	target.y += c4.y * s2xy;
	target.z += c4.z * s2xy;

	const s2yz = 1.092548 * ( y * z );
	const c5 = coeff[ 5 ];
	target.x += c5.x * s2yz;
	target.y += c5.y * s2yz;
	target.z += c5.z * s2yz;

	const s2zz = 0.315392 * ( 3.0 * z * z - 1.0 );
	const c6 = coeff[ 6 ];
	target.x += c6.x * s2zz;
	target.y += c6.y * s2zz;
	target.z += c6.z * s2zz;

	const s2xz = 1.092548 * ( x * z );
	const c7 = coeff[ 7 ];
	target.x += c7.x * s2xz;
	target.y += c7.y * s2xz;
	target.z += c7.z * s2xz;

	const s2xx = 0.546274 * ( x * x - y * y );
	const c8 = coeff[ 8 ];
	target.x += c8.x * s2xx;
	target.y += c8.y * s2xx;
	target.z += c8.z * s2xx;

	return target;

}

/**
 * Returns the irradiance (radiance convolved with cosine lobe) in the
 * direction of the given normal.
 *
 * @param {SphericalHarmonics3Like} sh - The spherical harmonics.
 * @param {Vector3Like} normal - The normal vector (assumed to be unit length).
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The irradiance.
 */
export function sh3GetIrradianceAt( sh, normal, target = { x: 0, y: 0, z: 0 } ) {

	// normal is assumed to be unit length

	const x = normal.x, y = normal.y, z = normal.z;

	const coeff = sh.coefficients;

	// band 0
	const c0 = coeff[ 0 ];
	target.x = c0.x * 0.886227; // π * 0.282095
	target.y = c0.y * 0.886227;
	target.z = c0.z * 0.886227;

	// band 1
	const s1y = 2.0 * 0.511664 * y; // ( 2 * π / 3 ) * 0.488603
	const c1 = coeff[ 1 ];
	target.x += c1.x * s1y;
	target.y += c1.y * s1y;
	target.z += c1.z * s1y;

	const s1z = 2.0 * 0.511664 * z;
	const c2 = coeff[ 2 ];
	target.x += c2.x * s1z;
	target.y += c2.y * s1z;
	target.z += c2.z * s1z;

	const s1x = 2.0 * 0.511664 * x;
	const c3 = coeff[ 3 ];
	target.x += c3.x * s1x;
	target.y += c3.y * s1x;
	target.z += c3.z * s1x;

	// band 2
	const s2xy = 2.0 * 0.429043 * x * y; // ( π / 4 ) * 1.092548
	const c4 = coeff[ 4 ];
	target.x += c4.x * s2xy;
	target.y += c4.y * s2xy;
	target.z += c4.z * s2xy;

	const s2yz = 2.0 * 0.429043 * y * z;
	const c5 = coeff[ 5 ];
	target.x += c5.x * s2yz;
	target.y += c5.y * s2yz;
	target.z += c5.z * s2yz;

	const s2zz = 0.743125 * z * z - 0.247708; // ( π / 4 ) * 0.315392 * 3
	const c6 = coeff[ 6 ];
	target.x += c6.x * s2zz;
	target.y += c6.y * s2zz;
	target.z += c6.z * s2zz;

	const s2xz = 2.0 * 0.429043 * x * z;
	const c7 = coeff[ 7 ];
	target.x += c7.x * s2xz;
	target.y += c7.y * s2xz;
	target.z += c7.z * s2xz;

	const s2xx = 0.429043 * ( x * x - y * y ); // ( π / 4 ) * 0.546274
	const c8 = coeff[ 8 ];
	target.x += c8.x * s2xx;
	target.y += c8.y * s2xx;
	target.z += c8.z * s2xx;

	return target;

}

/**
 * Adds the coefficients of `b` to those of `a` and stores the result in the target.
 *
 * @param {SphericalHarmonics3Like} a - The first SH.
 * @param {SphericalHarmonics3Like} b - The SH to add.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3Add( a, b, target = sh3Create() ) {

	const ac = a.coefficients;
	const bc = b.coefficients;
	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const srcA = ac[ i ];
		const srcB = bc[ i ];
		const dst = tc[ i ];

		dst.x = srcA.x + srcB.x;
		dst.y = srcA.y + srcB.y;
		dst.z = srcA.z + srcB.z;

	}

	return target;

}

/**
 * Adds a scaled copy of `b` to `a` and stores the result in the target.
 *
 * @param {SphericalHarmonics3Like} a - The first SH.
 * @param {SphericalHarmonics3Like} b - The SH to add.
 * @param {number} s - The scale factor.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3AddScaledSH( a, b, s, target = sh3Create() ) {

	const ac = a.coefficients;
	const bc = b.coefficients;
	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const srcA = ac[ i ];
		const srcB = bc[ i ];
		const dst = tc[ i ];

		dst.x = srcA.x + srcB.x * s;
		dst.y = srcA.y + srcB.y * s;
		dst.z = srcA.z + srcB.z * s;

	}

	return target;

}

/**
 * Scales the given SH by the given scale factor.
 *
 * @param {SphericalHarmonics3Like} sh - The SH to scale.
 * @param {number} s - The scale factor.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3Scale( sh, s, target = sh3Create() ) {

	const sc = sh.coefficients;
	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const src = sc[ i ];
		const dst = tc[ i ];

		dst.x = src.x * s;
		dst.y = src.y * s;
		dst.z = src.z * s;

	}

	return target;

}

/**
 * Linearly interpolates between `a` and `b` by the given alpha factor.
 *
 * @param {SphericalHarmonics3Like} a - The first SH.
 * @param {SphericalHarmonics3Like} b - The SH to interpolate with.
 * @param {number} alpha - The alpha factor.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3Lerp( a, b, alpha, target = sh3Create() ) {

	const ac = a.coefficients;
	const bc = b.coefficients;
	const tc = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const srcA = ac[ i ];
		const srcB = bc[ i ];
		const dst = tc[ i ];

		dst.x = srcA.x + ( srcB.x - srcA.x ) * alpha;
		dst.y = srcA.y + ( srcB.y - srcA.y ) * alpha;
		dst.z = srcA.z + ( srcB.z - srcA.z ) * alpha;

	}

	return target;

}

/**
 * Returns `true` if the two spherical harmonics are equal.
 *
 * @param {SphericalHarmonics3Like} a - The first spherical harmonics.
 * @param {SphericalHarmonics3Like} b - The second spherical harmonics.
 * @return {boolean} Whether the two spherical harmonics are equal.
 */
export function sh3Equals( a, b ) {

	const ac = a.coefficients;
	const bc = b.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const ca = ac[ i ];
		const cb = bc[ i ];

		if ( ca.x !== cb.x || ca.y !== cb.y || ca.z !== cb.z ) {

			return false;

		}

	}

	return true;

}

/**
 * Copies the values of the given spherical harmonics into the target.
 *
 * @param {SphericalHarmonics3Like} sh - The spherical harmonics to copy.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} A copy of `sh`.
 */
export function sh3Copy( sh, target = sh3Create() ) {

	return sh3Set( sh.coefficients, target );

}

/**
 * Sets the SH coefficients of the target from the given array.
 *
 * @param {Array<number>|TypedArray} array - An array holding the SH coefficients.
 * @param {number} [offset=0] - The array offset where to start copying.
 * @param {SphericalHarmonics3Like} [target] - The target the result is stored to.
 * @return {SphericalHarmonics3Like} The target, for chaining.
 */
export function sh3FromArray( array, offset = 0, target = sh3Create() ) {

	const coefficients = target.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const dst = coefficients[ i ];
		const j = offset + ( i * 3 );

		dst.x = array[ j ];
		dst.y = array[ j + 1 ];
		dst.z = array[ j + 2 ];

	}

	return target;

}

/**
 * Returns an array with the SH coefficients, or copies them into the provided
 * array. The coefficients are represented as numbers.
 *
 * @param {SphericalHarmonics3Like} sh - The spherical harmonics.
 * @param {Array<number>|TypedArray} [array=[]] - The target array.
 * @param {number} [offset=0] - The array offset where to start copying.
 * @return {Array<number>|TypedArray} An array with flat SH coefficients.
 */
export function sh3ToArray( sh, array = [], offset = 0 ) {

	const coefficients = sh.coefficients;

	for ( let i = 0; i < 9; i ++ ) {

		const src = coefficients[ i ];
		const j = offset + ( i * 3 );

		array[ j ] = src.x;
		array[ j + 1 ] = src.y;
		array[ j + 2 ] = src.z;

	}

	return array;

}

/**
 * Computes the SH basis for the given normal vector.
 *
 * @param {Vector3Like} normal - The normal (assumed to be unit length).
 * @param {Array<number>} shBasis - The target array holding the SH basis.
 */
export function sh3GetBasisAt( normal, shBasis ) {

	// normal is assumed to be unit length

	const x = normal.x, y = normal.y, z = normal.z;

	// band 0
	shBasis[ 0 ] = 0.282095;

	// band 1
	shBasis[ 1 ] = 0.488603 * y;
	shBasis[ 2 ] = 0.488603 * z;
	shBasis[ 3 ] = 0.488603 * x;

	// band 2
	shBasis[ 4 ] = 1.092548 * x * y;
	shBasis[ 5 ] = 1.092548 * y * z;
	shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
	shBasis[ 7 ] = 1.092548 * x * z;
	shBasis[ 8 ] = 0.546274 * ( x * x - y * y );

}
