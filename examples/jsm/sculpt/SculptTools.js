import {
	TRI_INDEX,
	Flags,
	getMemory,
	replaceElement,
	removeElement,
	tidy,
	intersectionArrays,
	sqrDist,
	triangleInsideSphere,
	pointInsideTriangle
} from './SculptUtils.js';

// ---- Subdivision ----

const SubData = {
	_mesh: null,
	_linear: false,
	_verticesMap: new Map(),
	_center: [ 0, 0, 0 ],
	_radius2: 0,
	_edgeMax2: 0
};

function subFillTriangle( iTri, iv1, iv2, iv3, ivMid ) {

	const mesh = SubData._mesh;
	const vrv = mesh.getVerticesRingVert();
	const vrf = mesh.getVerticesRingFace();
	const pil = mesh.getFacePosInLeaf();
	const fleaf = mesh.getFaceLeaf();
	const fstf = mesh.getFacesStateFlags();
	const fAr = mesh.getFaces();

	let j = iTri * 4;
	fAr[ j ] = iv1; fAr[ j + 1 ] = ivMid; fAr[ j + 2 ] = iv3; fAr[ j + 3 ] = TRI_INDEX;
	const leaf = fleaf[ iTri ];
	const iTrisLeaf = leaf._iFaces;

	vrv[ ivMid ].push( iv3 );
	vrv[ iv3 ].push( ivMid );

	const iNewTri = mesh.getNbTriangles();
	vrf[ ivMid ].push( iTri, iNewTri );

	j = iNewTri * 4;
	fAr[ j ] = ivMid; fAr[ j + 1 ] = iv2; fAr[ j + 2 ] = iv3; fAr[ j + 3 ] = TRI_INDEX;
	fstf[ iNewTri ] = Flags.STATE;
	fleaf[ iNewTri ] = leaf;
	pil[ iNewTri ] = iTrisLeaf.length;
	vrf[ iv3 ].push( iNewTri );
	replaceElement( vrf[ iv2 ], iTri, iNewTri );
	iTrisLeaf.push( iNewTri );
	mesh.addNbFace( 1 );

}

function subFillTriangles( iTris ) {

	const mesh = SubData._mesh;
	const vrv = mesh.getVerticesRingVert();
	const fAr = mesh.getFaces();
	const nbTris = iTris.length;
	const iTrisNext = new Uint32Array( getMemory( 4 * 2 * nbTris ), 0, 2 * nbTris );
	let nbNext = 0;
	const vMap = SubData._verticesMap;

	for ( let i = 0; i < nbTris; ++ i ) {

		const iTri = iTris[ i ];
		const j = iTri * 4;
		const iv1 = fAr[ j ], iv2 = fAr[ j + 1 ], iv3 = fAr[ j + 2 ];
		const val1 = vMap.get( Math.min( iv1, iv2 ) + '+' + Math.max( iv1, iv2 ) );
		const val2 = vMap.get( Math.min( iv2, iv3 ) + '+' + Math.max( iv2, iv3 ) );
		const val3 = vMap.get( Math.min( iv1, iv3 ) + '+' + Math.max( iv1, iv3 ) );
		const num1 = vrv[ iv1 ].length, num2 = vrv[ iv2 ].length, num3 = vrv[ iv3 ].length;
		let split = 0;
		if ( val1 ) {

			if ( val2 ) {

				if ( val3 ) { if ( num1 < num2 && num1 < num3 ) split = 2; else if ( num2 < num3 ) split = 3; else split = 1; }
				else if ( num1 < num3 ) split = 2; else split = 1;

			} else if ( val3 && num2 < num3 ) split = 3;
			else split = 1;

		} else if ( val2 ) {

			if ( val3 && num2 < num1 ) split = 3; else split = 2;

		} else if ( val3 ) split = 3;

		if ( split === 1 ) subFillTriangle( iTri, iv1, iv2, iv3, val1 );
		else if ( split === 2 ) subFillTriangle( iTri, iv2, iv3, iv1, val2 );
		else if ( split === 3 ) subFillTriangle( iTri, iv3, iv1, iv2, val3 );
		else continue;
		iTrisNext[ nbNext ++ ] = iTri;
		iTrisNext[ nbNext ++ ] = mesh.getNbTriangles() - 1;

	}

	return new Uint32Array( iTrisNext.subarray( 0, nbNext ) );

}

function halfEdgeSplit( iTri, iv1, iv2, iv3 ) {

	const mesh = SubData._mesh;
	const vAr = mesh.getVertices();
	const nAr = mesh.getNormals();
	const cAr = mesh.getColors();
	const mAr = mesh.getMaterials();
	const fAr = mesh.getFaces();
	const pil = mesh.getFacePosInLeaf();
	const fleaf = mesh.getFaceLeaf();
	const vrv = mesh.getVerticesRingVert();
	const vrf = mesh.getVerticesRingFace();
	const fstf = mesh.getFacesStateFlags();
	const vstf = mesh.getVerticesStateFlags();

	const vMap = SubData._verticesMap;
	const key = Math.min( iv1, iv2 ) + '+' + Math.max( iv1, iv2 );
	let isNewVertex = false;
	let ivMid = vMap.get( key );
	if ( ivMid === undefined ) {

		ivMid = mesh.getNbVertices();
		isNewVertex = true;
		vMap.set( key, ivMid );

	}

	vrv[ iv3 ].push( ivMid );
	let id = iTri * 4;
	fAr[ id ] = iv1; fAr[ id + 1 ] = ivMid; fAr[ id + 2 ] = iv3; fAr[ id + 3 ] = TRI_INDEX;

	const iNewTri = mesh.getNbTriangles();
	id = iNewTri * 4;
	fAr[ id ] = ivMid; fAr[ id + 1 ] = iv2; fAr[ id + 2 ] = iv3; fAr[ id + 3 ] = TRI_INDEX;
	fstf[ iNewTri ] = Flags.STATE;

	vrf[ iv3 ].push( iNewTri );
	replaceElement( vrf[ iv2 ], iTri, iNewTri );
	const leaf = fleaf[ iTri ];
	const iTrisLeaf = leaf._iFaces;
	fleaf[ iNewTri ] = leaf;
	pil[ iNewTri ] = iTrisLeaf.length;
	iTrisLeaf.push( iNewTri );

	if ( ! isNewVertex ) {

		vrv[ ivMid ].push( iv3 );
		vrf[ ivMid ].push( iTri, iNewTri );
		mesh.addNbFace( 1 );
		return;

	}

	const id1 = iv1 * 3, id2 = iv2 * 3;
	const v1x = vAr[ id1 ], v1y = vAr[ id1 + 1 ], v1z = vAr[ id1 + 2 ];
	const n1x = nAr[ id1 ], n1y = nAr[ id1 + 1 ], n1z = nAr[ id1 + 2 ];
	const v2x = vAr[ id2 ], v2y = vAr[ id2 + 1 ], v2z = vAr[ id2 + 2 ];
	const n2x = nAr[ id2 ], n2y = nAr[ id2 + 1 ], n2z = nAr[ id2 + 2 ];

	const n1n2x = n1x + n2x, n1n2y = n1y + n2y, n1n2z = n1z + n2z;
	id = ivMid * 3;
	nAr[ id ] = n1n2x * 0.5; nAr[ id + 1 ] = n1n2y * 0.5; nAr[ id + 2 ] = n1n2z * 0.5;
	cAr[ id ] = ( cAr[ id1 ] + cAr[ id2 ] ) * 0.5;
	cAr[ id + 1 ] = ( cAr[ id1 + 1 ] + cAr[ id2 + 1 ] ) * 0.5;
	cAr[ id + 2 ] = ( cAr[ id1 + 2 ] + cAr[ id2 + 2 ] ) * 0.5;
	mAr[ id ] = ( mAr[ id1 ] + mAr[ id2 ] ) * 0.5;
	mAr[ id + 1 ] = ( mAr[ id1 + 1 ] + mAr[ id2 + 1 ] ) * 0.5;
	mAr[ id + 2 ] = ( mAr[ id1 + 2 ] + mAr[ id2 + 2 ] ) * 0.5;

	if ( SubData._linear ) {

		vAr[ id ] = ( v1x + v2x ) * 0.5;
		vAr[ id + 1 ] = ( v1y + v2y ) * 0.5;
		vAr[ id + 2 ] = ( v1z + v2z ) * 0.5;

	} else {

		let nn1x = n1x, nn1y = n1y, nn1z = n1z;
		let len = nn1x * nn1x + nn1y * nn1y + nn1z * nn1z;
		if ( len === 0 ) { nn1x = 1; } else { len = 1 / Math.sqrt( len ); nn1x *= len; nn1y *= len; nn1z *= len; }
		let nn2x = n2x, nn2y = n2y, nn2z = n2z;
		len = nn2x * nn2x + nn2y * nn2y + nn2z * nn2z;
		if ( len === 0 ) { nn2x = 1; } else { len = 1 / Math.sqrt( len ); nn2x *= len; nn2y *= len; nn2z *= len; }
		let d = nn1x * nn2x + nn1y * nn2y + nn1z * nn2z;
		let angle = 0;
		if ( d <= - 1 ) angle = Math.PI;
		else if ( d >= 1 ) angle = 0;
		else angle = Math.acos( d );

		const ex = v1x - v2x, ey = v1y - v2y, ez = v1z - v2z;
		let offset = angle * 0.12 * Math.sqrt( ex * ex + ey * ey + ez * ez );
		len = n1n2x * n1n2x + n1n2y * n1n2y + n1n2z * n1n2z;
		if ( len > 0 ) offset /= Math.sqrt( len );
		if ( ( ex * ( n1x - n2x ) + ey * ( n1y - n2y ) + ez * ( n1z - n2z ) ) < 0 ) offset = - offset;
		vAr[ id ] = ( v1x + v2x ) * 0.5 + n1n2x * offset;
		vAr[ id + 1 ] = ( v1y + v2y ) * 0.5 + n1n2y * offset;
		vAr[ id + 2 ] = ( v1z + v2z ) * 0.5 + n1n2z * offset;

	}

	vstf[ ivMid ] = Flags.STATE;
	vrv[ ivMid ] = [ iv1, iv2, iv3 ];
	vrf[ ivMid ] = [ iTri, iNewTri ];
	replaceElement( vrv[ iv1 ], iv2, ivMid );
	replaceElement( vrv[ iv2 ], iv1, ivMid );
	mesh.addNbVertice( 1 );
	mesh.addNbFace( 1 );

}

function subFindSplit( iTri, checkInsideSphere ) {

	const mesh = SubData._mesh;
	const vAr = mesh.getVertices();
	const fAr = mesh.getFaces();
	const mAr = mesh.getMaterials();
	const id = iTri * 4;
	const ind1 = fAr[ id ] * 3, ind2 = fAr[ id + 1 ] * 3, ind3 = fAr[ id + 2 ] * 3;
	const v1 = [ vAr[ ind1 ], vAr[ ind1 + 1 ], vAr[ ind1 + 2 ] ];
	const v2 = [ vAr[ ind2 ], vAr[ ind2 + 1 ], vAr[ ind2 + 2 ] ];
	const v3 = [ vAr[ ind3 ], vAr[ ind3 + 1 ], vAr[ ind3 + 2 ] ];

	if ( checkInsideSphere && ! triangleInsideSphere( SubData._center, SubData._radius2, v1, v2, v3 ) && ! pointInsideTriangle( SubData._center, v1, v2, v3 ) )
		return 0;

	const m1 = mAr[ ind1 + 2 ], m2 = mAr[ ind2 + 2 ], m3 = mAr[ ind3 + 2 ];
	const length1 = sqrDist( v1, v2 ), length2 = sqrDist( v2, v3 ), length3 = sqrDist( v1, v3 );
	if ( length1 > length2 && length1 > length3 ) return ( m1 + m2 ) * 0.5 * length1 > SubData._edgeMax2 ? 1 : 0;
	else if ( length2 > length3 ) return ( m2 + m3 ) * 0.5 * length2 > SubData._edgeMax2 ? 2 : 0;
	else return ( m1 + m3 ) * 0.5 * length3 > SubData._edgeMax2 ? 3 : 0;

}

function subdivide( iTris ) {

	const mesh = SubData._mesh;
	const nbVertsInit = mesh.getNbVertices();
	const nbTrisInit = mesh.getNbTriangles();
	SubData._verticesMap = new Map();

	// Init split
	let nbTris = iTris.length;
	let buffer = getMemory( ( 4 + 1 ) * nbTris );
	let iTrisSubd = new Uint32Array( buffer, 0, nbTris );
	let splitArr = new Uint8Array( buffer, 4 * nbTris, nbTris );
	let acc = 0;
	for ( let i = 0; i < nbTris; ++ i ) {

		const iTri = iTris[ i ];
		const splitNum = subFindSplit( iTri, true );
		if ( splitNum === 0 ) continue;
		splitArr[ acc ] = splitNum;
		iTrisSubd[ acc ++ ] = iTri;

	}

	iTrisSubd = new Uint32Array( iTrisSubd.subarray( 0, acc ) );
	splitArr = new Uint8Array( splitArr.subarray( 0, acc ) );

	if ( iTrisSubd.length > 5 ) {

		iTrisSubd = mesh.expandsFaces( iTrisSubd, 3 );
		const newSplit = new Uint8Array( iTrisSubd.length );
		newSplit.set( splitArr );
		splitArr = newSplit;

	}

	// Subdivide triangles
	const fAr = mesh.getFaces();
	mesh.reAllocateArrays( splitArr.length );
	for ( let i = 0, l = iTrisSubd.length; i < l; ++ i ) {

		const iTri = iTrisSubd[ i ];
		let splitNum = splitArr[ i ];
		if ( splitNum === 0 ) splitNum = subFindSplit( iTri );
		const ind = iTri * 4;
		if ( splitNum === 1 ) halfEdgeSplit( iTri, fAr[ ind ], fAr[ ind + 1 ], fAr[ ind + 2 ] );
		else if ( splitNum === 2 ) halfEdgeSplit( iTri, fAr[ ind + 1 ], fAr[ ind + 2 ], fAr[ ind ] );
		else if ( splitNum === 3 ) halfEdgeSplit( iTri, fAr[ ind + 2 ], fAr[ ind ], fAr[ ind + 1 ] );

	}

	// Gather new triangles and fill cracks
	let nbNewTris = mesh.getNbTriangles() - nbTrisInit;
	let newTriangles = new Uint32Array( nbNewTris );
	for ( let i = 0; i < nbNewTris; ++ i ) newTriangles[ i ] = nbTrisInit + i;
	newTriangles = mesh.expandsFaces( newTriangles, 1 );

	let temp = iTris;
	nbTris = iTris.length;
	iTris = new Uint32Array( nbTris + newTriangles.length );
	iTris.set( temp );
	iTris.set( newTriangles, nbTris );

	// De-duplicate
	const ftf = mesh.getFacesTagFlags();
	const tagFlag = ++ Flags.TAG;
	const iTrisMask = new Uint32Array( getMemory( iTris.length * 4 ), 0, iTris.length );
	let nbTriMask = 0;
	for ( let i = 0, l = iTris.length; i < l; ++ i ) {

		const iTri = iTris[ i ];
		if ( ftf[ iTri ] === tagFlag ) continue;
		ftf[ iTri ] = tagFlag;
		iTrisMask[ nbTriMask ++ ] = iTri;

	}

	let resultTris = new Uint32Array( iTrisMask.subarray( 0, nbTriMask ) );

	const nbTrianglesOld = mesh.getNbTriangles();
	while ( newTriangles.length > 0 ) {

		mesh.reAllocateArrays( newTriangles.length );
		newTriangles = subFillTriangles( newTriangles );

	}

	nbNewTris = mesh.getNbTriangles() - nbTrianglesOld;
	temp = resultTris;
	resultTris = new Uint32Array( nbTriMask + nbNewTris );
	resultTris.set( temp );
	for ( let i = 0; i < nbNewTris; ++ i ) resultTris[ nbTriMask + i ] = nbTrianglesOld + i;

	// Smooth new vertices and tag sculpt flag
	const nbVNew = mesh.getNbVertices() - nbVertsInit;
	let vNew = new Uint32Array( nbVNew );
	for ( let i = 0; i < nbVNew; ++ i ) vNew[ i ] = nbVertsInit + i;
	vNew = mesh.expandsVertices( vNew, 1 );

	if ( ! SubData._linear ) {

		const expV = vNew.subarray( nbVNew );
		smoothTangentVerts( mesh, expV, 1.0 );

	}

	const vAr = mesh.getVertices();
	const vscf = mesh.getVerticesSculptFlags();
	const cx = SubData._center[ 0 ], cy = SubData._center[ 1 ], cz = SubData._center[ 2 ];
	const sculptMask = Flags.SCULPT;
	for ( let i = 0, l = vNew.length; i < l; ++ i ) {

		const ind = vNew[ i ];
		const j = ind * 3;
		const dx = vAr[ j ] - cx, dy = vAr[ j + 1 ] - cy, dz = vAr[ j + 2 ] - cz;
		vscf[ ind ] = ( dx * dx + dy * dy + dz * dz ) < SubData._radius2 ? sculptMask : sculptMask - 1;

	}

	return resultTris;

}

function subdivisionPass( mesh, iTris, center, radius2, detail2 ) {

	SubData._mesh = mesh;
	SubData._linear = false;
	SubData._center[ 0 ] = center[ 0 ]; SubData._center[ 1 ] = center[ 1 ]; SubData._center[ 2 ] = center[ 2 ];
	SubData._radius2 = radius2;
	SubData._edgeMax2 = detail2;

	let nbTriangles = 0;
	while ( nbTriangles !== mesh.getNbTriangles() ) {

		nbTriangles = mesh.getNbTriangles();
		iTris = subdivide( iTris );

	}

	return iTris;

}

// ---- Decimation ----

const DecData = {
	_mesh: null,
	_iTrisToDelete: [],
	_iVertsToDelete: [],
	_iVertsDecimated: []
};

function decDeleteTriangle( iTri ) {

	const mesh = DecData._mesh;
	const vrf = mesh.getVerticesRingFace();
	const ftf = mesh.getFacesTagFlags();
	const fAr = mesh.getFaces();
	const pil = mesh.getFacePosInLeaf();
	const fleaf = mesh.getFaceLeaf();
	const fstf = mesh.getFacesStateFlags();

	const oldPos = pil[ iTri ];
	const iTrisLeaf = fleaf[ iTri ]._iFaces;
	const lastTri = iTrisLeaf[ iTrisLeaf.length - 1 ];
	if ( iTri !== lastTri ) { iTrisLeaf[ oldPos ] = lastTri; pil[ lastTri ] = oldPos; }
	iTrisLeaf.pop();

	const lastPos = mesh.getNbTriangles() - 1;
	if ( lastPos === iTri ) { mesh.addNbFace( - 1 ); return; }
	const id = lastPos * 4;
	const iv1 = fAr[ id ], iv2 = fAr[ id + 1 ], iv3 = fAr[ id + 2 ];
	replaceElement( vrf[ iv1 ], lastPos, iTri );
	replaceElement( vrf[ iv2 ], lastPos, iTri );
	replaceElement( vrf[ iv3 ], lastPos, iTri );

	const leafLast = fleaf[ lastPos ];
	const pilLast = pil[ lastPos ];
	leafLast._iFaces[ pilLast ] = iTri;
	fleaf[ iTri ] = leafLast;
	pil[ iTri ] = pilLast;
	ftf[ iTri ] = ftf[ lastPos ];
	fstf[ iTri ] = fstf[ lastPos ];
	const j = iTri * 4;
	fAr[ j ] = iv1; fAr[ j + 1 ] = iv2; fAr[ j + 2 ] = iv3; fAr[ j + 3 ] = TRI_INDEX;
	DecData._iVertsDecimated.push( iv1, iv2, iv3 );
	mesh.addNbFace( - 1 );

}

function decDeleteVertex( iVert ) {

	const mesh = DecData._mesh;
	const vrv = mesh.getVerticesRingVert();
	const vrf = mesh.getVerticesRingFace();
	const vAr = mesh.getVertices();
	const nAr = mesh.getNormals();
	const cAr = mesh.getColors();
	const mAr = mesh.getMaterials();
	const fAr = mesh.getFaces();
	const vtf = mesh.getVerticesTagFlags();
	const vstf = mesh.getVerticesStateFlags();
	const vsctf = mesh.getVerticesSculptFlags();

	const lastPos = mesh.getNbVertices() - 1;
	if ( iVert === lastPos ) { mesh.addNbVertice( - 1 ); return; }

	const iTris = vrf[ lastPos ];
	const ring = vrv[ lastPos ];
	for ( let i = 0, l = iTris.length; i < l; ++ i ) {

		const id = iTris[ i ] * 4;
		if ( fAr[ id ] === lastPos ) fAr[ id ] = iVert;
		else if ( fAr[ id + 1 ] === lastPos ) fAr[ id + 1 ] = iVert;
		else fAr[ id + 2 ] = iVert;

	}

	for ( let i = 0, l = ring.length; i < l; ++ i ) replaceElement( vrv[ ring[ i ] ], lastPos, iVert );

	vrv[ iVert ] = vrv[ lastPos ].slice();
	vrf[ iVert ] = vrf[ lastPos ].slice();
	vtf[ iVert ] = vtf[ lastPos ];
	vstf[ iVert ] = vstf[ lastPos ];
	vsctf[ iVert ] = vsctf[ lastPos ];
	const idLast = lastPos * 3, id = iVert * 3;
	vAr[ id ] = vAr[ idLast ]; vAr[ id + 1 ] = vAr[ idLast + 1 ]; vAr[ id + 2 ] = vAr[ idLast + 2 ];
	nAr[ id ] = nAr[ idLast ]; nAr[ id + 1 ] = nAr[ idLast + 1 ]; nAr[ id + 2 ] = nAr[ idLast + 2 ];
	cAr[ id ] = cAr[ idLast ]; cAr[ id + 1 ] = cAr[ idLast + 1 ]; cAr[ id + 2 ] = cAr[ idLast + 2 ];
	mAr[ id ] = mAr[ idLast ]; mAr[ id + 1 ] = mAr[ idLast + 1 ]; mAr[ id + 2 ] = mAr[ idLast + 2 ];
	mesh.addNbVertice( - 1 );

}

function decEdgeCollapse( iTri1, iTri2, iv1, iv2, ivOpp1, ivOpp2, iTris ) {

	const mesh = DecData._mesh;
	const vAr = mesh.getVertices();
	const nAr = mesh.getNormals();
	const cAr = mesh.getColors();
	const mAr = mesh.getMaterials();
	const fAr = mesh.getFaces();
	const vtf = mesh.getVerticesTagFlags();
	const ftf = mesh.getFacesTagFlags();
	const vrv = mesh.getVerticesRingVert();
	const vrf = mesh.getVerticesRingFace();

	const ring1 = vrv[ iv1 ], ring2 = vrv[ iv2 ];
	const tris1 = vrf[ iv1 ], tris2 = vrf[ iv2 ];

	if ( ring1.length !== tris1.length || ring2.length !== tris2.length ) return;
	const ringOpp1 = vrv[ ivOpp1 ], ringOpp2 = vrv[ ivOpp2 ];
	const trisOpp1 = vrf[ ivOpp1 ], trisOpp2 = vrf[ ivOpp2 ];
	if ( ringOpp1.length !== trisOpp1.length || ringOpp2.length !== trisOpp2.length ) return;

	DecData._iVertsDecimated.push( iv1, iv2 );
	const sortFunc = ( a, b ) => a - b;
	ring1.sort( sortFunc );
	ring2.sort( sortFunc );

	if ( intersectionArrays( ring1, ring2 ).length >= 3 ) {

		// Edge flip
		removeElement( tris1, iTri2 );
		removeElement( tris2, iTri1 );
		trisOpp1.push( iTri2 );
		trisOpp2.push( iTri1 );
		let id = iTri1 * 4;
		if ( fAr[ id ] === iv2 ) fAr[ id ] = ivOpp2;
		else if ( fAr[ id + 1 ] === iv2 ) fAr[ id + 1 ] = ivOpp2;
		else fAr[ id + 2 ] = ivOpp2;
		id = iTri2 * 4;
		if ( fAr[ id ] === iv1 ) fAr[ id ] = ivOpp1;
		else if ( fAr[ id + 1 ] === iv1 ) fAr[ id + 1 ] = ivOpp1;
		else fAr[ id + 2 ] = ivOpp1;
		mesh._computeRingVertices( iv1 );
		mesh._computeRingVertices( iv2 );
		mesh._computeRingVertices( ivOpp1 );
		mesh._computeRingVertices( ivOpp2 );
		return;

	}

	let id = iv1 * 3;
	const id2 = iv2 * 3;
	let nx = nAr[ id ] + nAr[ id2 ], ny = nAr[ id + 1 ] + nAr[ id2 + 1 ], nz = nAr[ id + 2 ] + nAr[ id2 + 2 ];
	let len = nx * nx + ny * ny + nz * nz;
	if ( len === 0 ) { nx = 1; } else { len = 1 / Math.sqrt( len ); nx *= len; ny *= len; nz *= len; }
	nAr[ id ] = nx; nAr[ id + 1 ] = ny; nAr[ id + 2 ] = nz;
	cAr[ id ] = ( cAr[ id ] + cAr[ id2 ] ) * 0.5;
	cAr[ id + 1 ] = ( cAr[ id + 1 ] + cAr[ id2 + 1 ] ) * 0.5;
	cAr[ id + 2 ] = ( cAr[ id + 2 ] + cAr[ id2 + 2 ] ) * 0.5;
	mAr[ id ] = ( mAr[ id ] + mAr[ id2 ] ) * 0.5;
	mAr[ id + 1 ] = ( mAr[ id + 1 ] + mAr[ id2 + 1 ] ) * 0.5;
	mAr[ id + 2 ] = ( mAr[ id + 2 ] + mAr[ id2 + 2 ] ) * 0.5;

	removeElement( tris1, iTri1 ); removeElement( tris1, iTri2 );
	removeElement( tris2, iTri1 ); removeElement( tris2, iTri2 );
	removeElement( trisOpp1, iTri1 ); removeElement( trisOpp2, iTri2 );

	for ( let i = 0, l = tris2.length; i < l; ++ i ) {

		const tri2 = tris2[ i ];
		tris1.push( tri2 );
		const idx = tri2 * 4;
		if ( fAr[ idx ] === iv2 ) fAr[ idx ] = iv1;
		else if ( fAr[ idx + 1 ] === iv2 ) fAr[ idx + 1 ] = iv1;
		else fAr[ idx + 2 ] = iv1;

	}

	for ( let i = 0, l = ring2.length; i < l; ++ i ) ring1.push( ring2[ i ] );

	mesh._computeRingVertices( iv1 );

	// Flat smooth
	let meanX = 0, meanY = 0, meanZ = 0;
	const nbRing1 = ring1.length;
	for ( let i = 0; i < nbRing1; ++ i ) {

		const ivRing = ring1[ i ];
		mesh._computeRingVertices( ivRing );
		const ivr3 = ivRing * 3;
		meanX += vAr[ ivr3 ]; meanY += vAr[ ivr3 + 1 ]; meanZ += vAr[ ivr3 + 2 ];

	}

	meanX /= nbRing1; meanY /= nbRing1; meanZ /= nbRing1;
	const dotN = nx * ( meanX - vAr[ id ] ) + ny * ( meanY - vAr[ id + 1 ] ) + nz * ( meanZ - vAr[ id + 2 ] );
	vAr[ id ] = meanX - nx * dotN;
	vAr[ id + 1 ] = meanY - ny * dotN;
	vAr[ id + 2 ] = meanZ - nz * dotN;

	vtf[ iv2 ] = ftf[ iTri1 ] = ftf[ iTri2 ] = - 1;
	DecData._iVertsToDelete.push( iv2 );
	DecData._iTrisToDelete.push( iTri1, iTri2 );

	for ( let i = 0, l = tris1.length; i < l; ++ i ) iTris.push( tris1[ i ] );

}

function decDecimateTriangles( iTri1, iTri2, iTris ) {

	if ( iTri2 === - 1 ) return;
	const fAr = DecData._mesh.getFaces();
	const id1 = iTri1 * 4, id2 = iTri2 * 4;
	const iv11 = fAr[ id1 ], iv21 = fAr[ id1 + 1 ], iv31 = fAr[ id1 + 2 ];
	const iv12 = fAr[ id2 ], iv22 = fAr[ id2 + 1 ], iv32 = fAr[ id2 + 2 ];

	if ( iv11 === iv12 ) {

		if ( iv21 === iv32 ) decEdgeCollapse( iTri1, iTri2, iv11, iv21, iv31, iv22, iTris );
		else decEdgeCollapse( iTri1, iTri2, iv11, iv31, iv21, iv32, iTris );

	} else if ( iv11 === iv22 ) {

		if ( iv21 === iv12 ) decEdgeCollapse( iTri1, iTri2, iv11, iv21, iv31, iv32, iTris );
		else decEdgeCollapse( iTri1, iTri2, iv11, iv31, iv21, iv12, iTris );

	} else if ( iv11 === iv32 ) {

		if ( iv21 === iv22 ) decEdgeCollapse( iTri1, iTri2, iv11, iv21, iv31, iv12, iTris );
		else decEdgeCollapse( iTri1, iTri2, iv11, iv31, iv21, iv22, iTris );

	} else if ( iv21 === iv12 ) decEdgeCollapse( iTri1, iTri2, iv31, iv21, iv11, iv22, iTris );
	else if ( iv21 === iv22 ) decEdgeCollapse( iTri1, iTri2, iv31, iv21, iv11, iv32, iTris );
	else decEdgeCollapse( iTri1, iTri2, iv31, iv21, iv11, iv12, iTris );

}

function decFindOppositeTriangle( iTri, iv1, iv2 ) {

	const vrf = DecData._mesh.getVerticesRingFace();
	const iTris1 = vrf[ iv1 ].slice().sort( ( a, b ) => a - b );
	const iTris2 = vrf[ iv2 ].slice().sort( ( a, b ) => a - b );
	const res = intersectionArrays( iTris1, iTris2 );
	if ( res.length !== 2 ) return - 1;
	return res[ 0 ] === iTri ? res[ 1 ] : res[ 0 ];

}

function decimationPass( mesh, iTris, center, radius2, detail2 ) {

	DecData._mesh = mesh;
	DecData._iVertsDecimated.length = 0;
	DecData._iTrisToDelete.length = 0;
	DecData._iVertsToDelete.length = 0;

	const radius = Math.sqrt( radius2 );
	const ftf = mesh.getFacesTagFlags();
	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const fAr = mesh.getFaces();
	const cenx = center[ 0 ], ceny = center[ 1 ], cenz = center[ 2 ];

	const nbInit = iTris.length;
	const dynArr = new Array( nbInit );
	for ( let i = 0; i < nbInit; ++ i ) dynArr[ i ] = iTris[ i ];

	for ( let i = 0; i < dynArr.length; ++ i ) {

		const iTri = dynArr[ i ];
		if ( ftf[ iTri ] < 0 ) continue;
		const id = iTri * 4;
		const iv1 = fAr[ id ], iv2 = fAr[ id + 1 ], iv3 = fAr[ id + 2 ];
		const ind1 = iv1 * 3, ind2 = iv2 * 3, ind3 = iv3 * 3;
		const v1x = vAr[ ind1 ], v1y = vAr[ ind1 + 1 ], v1z = vAr[ ind1 + 2 ];
		const v2x = vAr[ ind2 ], v2y = vAr[ ind2 + 1 ], v2z = vAr[ ind2 + 2 ];
		const v3x = vAr[ ind3 ], v3y = vAr[ ind3 + 1 ], v3z = vAr[ ind3 + 2 ];

		let dx = ( v1x + v2x + v3x ) / 3.0 - cenx;
		let dy = ( v1y + v2y + v3y ) / 3.0 - ceny;
		let dz = ( v1z + v2z + v3z ) / 3.0 - cenz;
		let fallOff = dx * dx + dy * dy + dz * dz;

		if ( fallOff < radius2 ) fallOff = 1.0;
		else if ( fallOff < radius2 * 2.0 ) {

			fallOff = ( Math.sqrt( fallOff ) - radius ) / ( radius * Math.SQRT2 - radius );
			const f2 = fallOff * fallOff;
			fallOff = 3.0 * f2 * f2 - 4.0 * f2 * fallOff + 1.0;

		} else continue;

		dx = v2x - v1x; dy = v2y - v1y; dz = v2z - v1z;
		const len1 = dx * dx + dy * dy + dz * dz;
		dx = v2x - v3x; dy = v2y - v3y; dz = v2z - v3z;
		const len2 = dx * dx + dy * dy + dz * dz;
		dx = v1x - v3x; dy = v1y - v3y; dz = v1z - v3z;
		const len3 = dx * dx + dy * dy + dz * dz;

		const m1 = mAr[ ind1 + 2 ], m2 = mAr[ ind2 + 2 ], m3 = mAr[ ind3 + 2 ];
		if ( len1 < len2 && len1 < len3 ) {

			if ( len1 < detail2 * fallOff * ( m1 + m2 ) * 0.5 )
				decDecimateTriangles( iTri, decFindOppositeTriangle( iTri, iv1, iv2 ), dynArr );

		} else if ( len2 < len3 ) {

			if ( len2 < detail2 * fallOff * ( m2 + m3 ) * 0.5 )
				decDecimateTriangles( iTri, decFindOppositeTriangle( iTri, iv2, iv3 ), dynArr );

		} else {

			if ( len3 < detail2 * fallOff * ( m1 + m3 ) * 0.5 )
				decDecimateTriangles( iTri, decFindOppositeTriangle( iTri, iv1, iv3 ), dynArr );

		}

	}

	// Apply deletion
	tidy( DecData._iTrisToDelete );
	for ( let i = DecData._iTrisToDelete.length - 1; i >= 0; -- i ) decDeleteTriangle( DecData._iTrisToDelete[ i ] );
	tidy( DecData._iVertsToDelete );
	for ( let i = DecData._iVertsToDelete.length - 1; i >= 0; -- i ) decDeleteVertex( DecData._iVertsToDelete[ i ] );

	// Get valid modified triangles
	const iVertsDecimated = DecData._iVertsDecimated;
	const nbVertices = mesh.getNbVertices();
	const vtfDec = mesh.getVerticesTagFlags();
	let tagFlag = ++ Flags.TAG;
	const validVertices = new Uint32Array( getMemory( iVertsDecimated.length * 4 ), 0, iVertsDecimated.length );
	let nbValid = 0;
	for ( let i = 0, l = iVertsDecimated.length; i < l; ++ i ) {

		const iVert = iVertsDecimated[ i ];
		if ( iVert >= nbVertices || vtfDec[ iVert ] === tagFlag ) continue;
		vtfDec[ iVert ] = tagFlag;
		validVertices[ nbValid ++ ] = iVert;

	}

	const newTris = mesh.getFacesFromVertices( new Uint32Array( validVertices.subarray( 0, nbValid ) ) );
	const temp = dynArr;
	const nbTris = temp.length;
	const combined = new Uint32Array( nbTris + newTris.length );
	for ( let i = 0; i < nbTris; ++ i ) combined[ i ] = temp[ i ];
	combined.set( newTris, nbTris );

	tagFlag = ++ Flags.TAG;
	const nbTriangles = mesh.getNbTriangles();
	const validTris = new Uint32Array( getMemory( combined.length * 4 ), 0, combined.length );
	let nbValidTris = 0;
	for ( let i = 0, l = combined.length; i < l; ++ i ) {

		const t = combined[ i ];
		if ( t >= nbTriangles || ftf[ t ] === tagFlag ) continue;
		ftf[ t ] = tagFlag;
		validTris[ nbValidTris ++ ] = t;

	}

	return new Uint32Array( validTris.subarray( 0, nbValidTris ) );

}

// ---- Tool Helpers (shared across all tools) ----

function laplacianSmooth( mesh, iVerts, smoothVerts, vField ) {

	const vrings = mesh.getVerticesRingVert();
	const vertOnEdge = mesh.getVerticesOnEdge();
	const vAr = vField || mesh.getVertices();
	const nbVerts = iVerts.length;

	for ( let i = 0; i < nbVerts; ++ i ) {

		const i3 = i * 3;
		const id = iVerts[ i ];
		const ring = vrings[ id ];
		const vcount = ring.length;
		if ( vcount <= 2 ) {

			const idv = id * 3;
			smoothVerts[ i3 ] = vAr[ idv ]; smoothVerts[ i3 + 1 ] = vAr[ idv + 1 ]; smoothVerts[ i3 + 2 ] = vAr[ idv + 2 ];
			continue;

		}

		let avx = 0, avy = 0, avz = 0;
		if ( vertOnEdge[ id ] === 1 ) {

			let nbVertEdge = 0;
			for ( let j = 0, l = vcount; j < l; ++ j ) {

				const idv = ring[ j ];
				if ( vertOnEdge[ idv ] === 1 ) {

					const idv3 = idv * 3;
					avx += vAr[ idv3 ]; avy += vAr[ idv3 + 1 ]; avz += vAr[ idv3 + 2 ];
					++ nbVertEdge;

				}

			}

			if ( nbVertEdge >= 2 ) {

				smoothVerts[ i3 ] = avx / nbVertEdge; smoothVerts[ i3 + 1 ] = avy / nbVertEdge; smoothVerts[ i3 + 2 ] = avz / nbVertEdge;
				continue;

			}

			avx = avy = avz = 0;

		}

		for ( let j = 0; j < vcount; ++ j ) {

			const idv = ring[ j ] * 3;
			avx += vAr[ idv ]; avy += vAr[ idv + 1 ]; avz += vAr[ idv + 2 ];

		}

		smoothVerts[ i3 ] = avx / vcount; smoothVerts[ i3 + 1 ] = avy / vcount; smoothVerts[ i3 + 2 ] = avz / vcount;

	}

}

function smoothTangentVerts( mesh, iVerts, intensity ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const nAr = mesh.getNormals();
	const nbVerts = iVerts.length;
	const smoothVerts = new Float32Array( getMemory( nbVerts * 4 * 3 ), 0, nbVerts * 3 );
	laplacianSmooth( mesh, iVerts, smoothVerts );
	for ( let i = 0; i < nbVerts; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		let nx = nAr[ ind ], ny = nAr[ ind + 1 ], nz = nAr[ ind + 2 ];
		let len = nx * nx + ny * ny + nz * nz;
		if ( len === 0 ) continue;
		len = 1 / Math.sqrt( len );
		nx *= len; ny *= len; nz *= len;
		const i3 = i * 3;
		const smx = smoothVerts[ i3 ], smy = smoothVerts[ i3 + 1 ], smz = smoothVerts[ i3 + 2 ];
		const d = nx * ( smx - vx ) + ny * ( smy - vy ) + nz * ( smz - vz );
		const mI = intensity * mAr[ ind + 2 ];
		vAr[ ind ] = vx + ( smx - nx * d - vx ) * mI;
		vAr[ ind + 1 ] = vy + ( smy - ny * d - vy ) * mI;
		vAr[ ind + 2 ] = vz + ( smz - nz * d - vz ) * mI;

	}

}

function getFrontVertices( mesh, iVertsInRadius, eyeDir ) {

	const nbVerts = iVertsInRadius.length;
	const iVertsFront = new Uint32Array( getMemory( 4 * nbVerts ), 0, nbVerts );
	let acc = 0;
	const nAr = mesh.getNormals();
	const ex = eyeDir[ 0 ], ey = eyeDir[ 1 ], ez = eyeDir[ 2 ];
	for ( let i = 0; i < nbVerts; ++ i ) {

		const id = iVertsInRadius[ i ];
		const j = id * 3;
		if ( nAr[ j ] * ex + nAr[ j + 1 ] * ey + nAr[ j + 2 ] * ez <= 0 ) iVertsFront[ acc ++ ] = id;

	}

	return new Uint32Array( iVertsFront.subarray( 0, acc ) );

}

function areaNormal( mesh, iVerts ) {

	const nAr = mesh.getNormals();
	const mAr = mesh.getMaterials();
	let anx = 0, any = 0, anz = 0;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const f = mAr[ ind + 2 ];
		anx += nAr[ ind ] * f; any += nAr[ ind + 1 ] * f; anz += nAr[ ind + 2 ] * f;

	}

	const len = Math.sqrt( anx * anx + any * any + anz * anz );
	if ( len === 0 ) return null;
	const inv = 1.0 / len;
	return [ anx * inv, any * inv, anz * inv ];

}

function areaCenter( mesh, iVerts ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	let ax = 0, ay = 0, az = 0, acc = 0;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const f = mAr[ ind + 2 ];
		acc += f;
		ax += vAr[ ind ] * f; ay += vAr[ ind + 1 ] * f; az += vAr[ ind + 2 ] * f;

	}

	return [ ax / acc, ay / acc, az / acc ];

}

// ---- Tool implementations ----

function toolBrush( mesh, iVerts, aNormal, center, radiusSq, intensity, negative ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	let deform = intensity * radius * 0.1;
	if ( negative ) deform = - deform;
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	const anx = aNormal[ 0 ], any = aNormal[ 1 ], anz = aNormal[ 2 ];
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const dx = vAr[ ind ] - cx, dy = vAr[ ind + 1 ] - cy, dz = vAr[ ind + 2 ] - cz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		if ( dist >= 1.0 ) continue;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= mAr[ ind + 2 ] * deform;
		vAr[ ind ] += anx * fallOff;
		vAr[ ind + 1 ] += any * fallOff;
		vAr[ ind + 2 ] += anz * fallOff;

	}

}

function toolFlatten( mesh, iVerts, aNormal, aCenter2, center, radiusSq, intensity, negative ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	const ax = aCenter2[ 0 ], ay = aCenter2[ 1 ], az = aCenter2[ 2 ];
	const anx = aNormal[ 0 ], any = aNormal[ 1 ], anz = aNormal[ 2 ];
	const comp = negative ? - 1 : 1;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		const distToPlane = ( vx - ax ) * anx + ( vy - ay ) * any + ( vz - az ) * anz;
		if ( distToPlane * comp > 0 ) continue;
		const dx = vx - cx, dy = vy - cy, dz = vz - cz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		if ( dist >= 1.0 ) continue;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= distToPlane * intensity * mAr[ ind + 2 ];
		vAr[ ind ] -= anx * fallOff;
		vAr[ ind + 1 ] -= any * fallOff;
		vAr[ ind + 2 ] -= anz * fallOff;

	}

}

function toolInflate( mesh, iVerts, center, radiusSq, intensity, negative ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const nAr = mesh.getNormals();
	const radius = Math.sqrt( radiusSq );
	let deform = intensity * radius * 0.1;
	if ( negative ) deform = - deform;
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const dx = vAr[ ind ] - cx, dy = vAr[ ind + 1 ] - cy, dz = vAr[ ind + 2 ] - cz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		if ( dist >= 1.0 ) continue;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff = deform * fallOff;
		const nx = nAr[ ind ], ny = nAr[ ind + 1 ], nz = nAr[ ind + 2 ];
		const nLen = Math.sqrt( nx * nx + ny * ny + nz * nz );
		if ( nLen > 0 ) fallOff /= nLen;
		fallOff *= mAr[ ind + 2 ];
		vAr[ ind ] += nx * fallOff;
		vAr[ ind + 1 ] += ny * fallOff;
		vAr[ ind + 2 ] += nz * fallOff;

	}

}

function toolSmooth( mesh, iVerts, intensity ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const nbVerts = iVerts.length;
	const smoothVerts = new Float32Array( getMemory( nbVerts * 4 * 3 ), 0, nbVerts * 3 );
	laplacianSmooth( mesh, iVerts, smoothVerts );
	for ( let i = 0; i < nbVerts; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		const i3 = i * 3;
		const mI = intensity * mAr[ ind + 2 ];
		const intComp = 1.0 - mI;
		vAr[ ind ] = vx * intComp + smoothVerts[ i3 ] * mI;
		vAr[ ind + 1 ] = vy * intComp + smoothVerts[ i3 + 1 ] * mI;
		vAr[ ind + 2 ] = vz * intComp + smoothVerts[ i3 + 2 ] * mI;

	}

}

function toolPinch( mesh, iVerts, center, radiusSq, intensity, negative ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	let deform = intensity * 0.05;
	if ( negative ) deform = - deform;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		const dx = cx - vx, dy = cy - vy, dz = cz - vz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= deform * mAr[ ind + 2 ];
		vAr[ ind ] = vx + dx * fallOff;
		vAr[ ind + 1 ] = vy + dy * fallOff;
		vAr[ ind + 2 ] = vz + dz * fallOff;

	}

}

function toolCrease( mesh, iVerts, aNormal, center, radiusSq, intensity, negative ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	const anx = aNormal[ 0 ], any = aNormal[ 1 ], anz = aNormal[ 2 ];
	const deform = intensity * 0.07;
	let brushFactor = deform * radius;
	if ( negative ) brushFactor = - brushFactor;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const dx = cx - vAr[ ind ], dy = cy - vAr[ ind + 1 ], dz = cz - vAr[ ind + 2 ];
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		if ( dist >= 1.0 ) continue;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= mAr[ ind + 2 ];
		const brushMod = Math.pow( fallOff, 5 ) * brushFactor;
		const pinchF = fallOff * deform;
		vAr[ ind ] = vx + dx * pinchF + anx * brushMod;
		vAr[ ind + 1 ] = vy + dy * pinchF + any * brushMod;
		vAr[ ind + 2 ] = vz + dz * pinchF + anz * brushMod;

	}

}

function toolDrag( mesh, iVerts, center, radiusSq, dragDir ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	const dirx = dragDir[ 0 ], diry = dragDir[ 1 ], dirz = dragDir[ 2 ];
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		const dx = vx - cx, dy = vy - cy, dz = vz - cz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= mAr[ ind + 2 ];
		vAr[ ind ] = vx + dirx * fallOff;
		vAr[ ind + 1 ] = vy + diry * fallOff;
		vAr[ ind + 2 ] = vz + dirz * fallOff;

	}

}

function toolScale( mesh, iVerts, center, radiusSq, deltaScale ) {

	const vAr = mesh.getVertices();
	const mAr = mesh.getMaterials();
	const radius = Math.sqrt( radiusSq );
	const cx = center[ 0 ], cy = center[ 1 ], cz = center[ 2 ];
	const scale = deltaScale * 0.01;
	for ( let i = 0, l = iVerts.length; i < l; ++ i ) {

		const ind = iVerts[ i ] * 3;
		const vx = vAr[ ind ], vy = vAr[ ind + 1 ], vz = vAr[ ind + 2 ];
		const dx = vx - cx, dy = vy - cy, dz = vz - cz;
		const dist = Math.sqrt( dx * dx + dy * dy + dz * dz ) / radius;
		let fallOff = dist * dist;
		fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
		fallOff *= scale * mAr[ ind + 2 ];
		vAr[ ind ] = vx + dx * fallOff;
		vAr[ ind + 1 ] = vy + dy * fallOff;
		vAr[ ind + 2 ] = vz + dz * fallOff;

	}

}

export {
	subdivisionPass,
	decimationPass,
	getFrontVertices,
	areaNormal,
	areaCenter,
	toolBrush,
	toolFlatten,
	toolInflate,
	toolSmooth,
	toolPinch,
	toolCrease,
	toolDrag,
	toolScale
};
