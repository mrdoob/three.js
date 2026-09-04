function sphericalHarmonicsRadianceBand0( sh0 ) {

	return sh0.mul( 0.282095 );

}

function sphericalHarmonicsRadianceBand1( shY, shZ, shX, direction ) {

	const x = direction.x;
	const y = direction.y;
	const z = direction.z;

	return shY.mul( y.mul( 0.4886025 ) )
		.add( shZ.mul( z.mul( 0.4886025 ) ) )
		.add( shX.mul( x.mul( 0.4886025 ) ) );

}

function sphericalHarmonicsRadianceBand2( shXY, shYZ, shZZ, shXZ, shXXYY, direction ) {

	const x = direction.x;
	const y = direction.y;
	const z = direction.z;
	const xx = x.mul( x ).toVar( 'sh2XX' );
	const yy = y.mul( y ).toVar( 'sh2YY' );
	const zz = z.mul( z ).toVar( 'sh2ZZ' );

	return shXY.mul( x.mul( y ).mul( 1.0925484 ) )
		.add( shYZ.mul( y.mul( z ).mul( 1.0925484 ) ) )
		.add( shZZ.mul( zz.mul( 2 ).sub( xx ).sub( yy ).mul( 0.3153915 ) ) )
		.add( shXZ.mul( x.mul( z ).mul( 1.0925484 ) ) )
		.add( shXXYY.mul( xx.sub( yy ).mul( 0.5462742 ) ) );

}

function sphericalHarmonicsRadianceBand3( sh0, sh1, sh2, sh3, sh4, sh5, sh6, direction ) {

	const x = direction.x;
	const y = direction.y;
	const z = direction.z;
	const xx = x.mul( x ).toVar( 'sh3XX' );
	const yy = y.mul( y ).toVar( 'sh3YY' );
	const zz = z.mul( z ).toVar( 'sh3ZZ' );
	const xy = x.mul( y ).toVar( 'sh3XY' );

	return sh0.mul( y.mul( xx.mul( 3 ).sub( yy ) ).mul( - 0.5900436 ) )
		.add( sh1.mul( xy.mul( z ).mul( 2.8906114 ) ) )
		.add( sh2.mul( y.mul( zz.mul( 4 ).sub( xx ).sub( yy ) ).mul( - 0.4570458 ) ) )
		.add( sh3.mul( z.mul( zz.mul( 2 ).sub( xx.mul( 3 ) ).sub( yy.mul( 3 ) ) ).mul( 0.3731763 ) ) )
		.add( sh4.mul( x.mul( zz.mul( 4 ).sub( xx ).sub( yy ) ).mul( - 0.4570458 ) ) )
		.add( sh5.mul( z.mul( xx.sub( yy ) ).mul( 1.4453057 ) ) )
		.add( sh6.mul( x.mul( xx.sub( yy.mul( 3 ) ) ).mul( - 0.5900436 ) ) );

}

function sphericalHarmonicsIrradianceAt( normal, sh0, sh1, sh2, sh3, sh4, sh5, sh6, sh7, sh8 ) {

	const x = normal.x;
	const y = normal.y;
	const z = normal.z;

	return sh0.mul( 0.886227 )
		.add( sh1.mul( 2.0 * 0.511664 ).mul( y ) )
		.add( sh2.mul( 2.0 * 0.511664 ).mul( z ) )
		.add( sh3.mul( 2.0 * 0.511664 ).mul( x ) )
		.add( sh4.mul( 2.0 * 0.429043 ).mul( x ).mul( y ) )
		.add( sh5.mul( 2.0 * 0.429043 ).mul( y ).mul( z ) )
		.add( sh6.mul( z.mul( z ).mul( 0.743125 ).sub( 0.247708 ) ) )
		.add( sh7.mul( 2.0 * 0.429043 ).mul( x ).mul( z ) )
		.add( sh8.mul( 0.429043 ).mul( x.mul( x ).sub( y.mul( y ) ) ) );

}

export {
	sphericalHarmonicsRadianceBand0,
	sphericalHarmonicsRadianceBand1,
	sphericalHarmonicsRadianceBand2,
	sphericalHarmonicsRadianceBand3,
	sphericalHarmonicsIrradianceAt
};
