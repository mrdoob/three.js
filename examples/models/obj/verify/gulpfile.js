
'use strict';

var fs = require( 'fs' );

var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );


var obj_verify = {
	vertices: [],
	normals: [],
	uvs: [],
	facesV: [],
	facesVn: [],
	facesVt: [],
	materials: []
};

obj_verify.vertices.push( [ - 1, 1, 1 ] );
obj_verify.vertices.push( [ - 1, - 1, 1 ] );
obj_verify.vertices.push( [ 1, - 1, 1 ] );
obj_verify.vertices.push( [ 1, 1, 1 ] );
obj_verify.vertices.push( [ - 1, 1, - 1 ] );
obj_verify.vertices.push( [ - 1, - 1, - 1 ] );
obj_verify.vertices.push( [ 1, - 1, - 1 ] );
obj_verify.vertices.push( [ 1, 1, - 1 ] );

obj_verify.normals.push( [ 0, 0, 1 ] );
obj_verify.normals.push( [ 0, 0, - 1 ] );
obj_verify.normals.push( [ 0, 1, 0 ] );
obj_verify.normals.push( [ 0, - 1, 0 ] );
obj_verify.normals.push( [ 1, 0, 0 ] );
obj_verify.normals.push( [ - 1, 0, 0 ] );

obj_verify.uvs.push( [ 0, 1 ] );
obj_verify.uvs.push( [ 1, 1 ] );
obj_verify.uvs.push( [ 1, 0 ] );
obj_verify.uvs.push( [ 0, 0 ] );

obj_verify.facesV.push( [ 1, 2, 3, 4 ] );
obj_verify.facesV.push( [ 8, 7, 6, 5 ] );
obj_verify.facesV.push( [ 4, 3, 7, 8 ] );
obj_verify.facesV.push( [ 5, 1, 4, 8 ] );
obj_verify.facesV.push( [ 5, 6, 2, 1 ] );
obj_verify.facesV.push( [ 2, 6, 7, 3 ] );

obj_verify.facesVn.push( [ 1, 1, 1, 1 ] );
obj_verify.facesVn.push( [ 2, 2, 2, 2 ] );
obj_verify.facesVn.push( [ 5, 5, 5, 5 ] );
obj_verify.facesVn.push( [ 3, 3, 3, 3 ] );
obj_verify.facesVn.push( [ 6, 6, 6, 6 ] );
obj_verify.facesVn.push( [ 4, 4, 4, 4 ] );

obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );
obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );
obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );
obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );
obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );
obj_verify.facesVt.push( [ 1, 2, 3, 4 ] );

obj_verify.materials.push( 'usemtl red' );
obj_verify.materials.push( 'usemtl blue' );
obj_verify.materials.push( 'usemtl green' );
obj_verify.materials.push( 'usemtl lightblue' );
obj_verify.materials.push( 'usemtl orange' );
obj_verify.materials.push( 'usemtl purple' );


function vobjCreateVertices( factor, offsets ) {

	var output = '\n';
	for ( var x, y, z, i = 0, v = obj_verify.vertices, length = v.length; i < length; i ++ ) {

		x = v[ i ][ 0 ] * factor + offsets[ 0 ];
		y = v[ i ][ 1 ] * factor + offsets[ 1 ];
		z = v[ i ][ 2 ] * factor + offsets[ 2 ];
		output += 'v ' + x + ' ' + y + ' ' + z + '\n';

	}
	return output;

}

function vobjCreateUvs() {

	var output = '\n';
	for ( var x, y, i = 0, vn = obj_verify.uvs, length = vn.length; i < length; i ++ ) {

		x = vn[ i ][ 0 ];
		y = vn[ i ][ 1 ];
		output += 'vt ' + x + ' ' + y + '\n';

	}
	return output;

}

function vobjCreateNormals() {

	var output = '\n';
	for ( var x, y, z, i = 0, vn = obj_verify.normals, length = vn.length; i < length; i ++ ) {

		x = vn[ i ][ 0 ];
		y = vn[ i ][ 1 ];
		z = vn[ i ][ 2 ];
		output += 'vn ' + x + ' ' + y + ' ' + z + '\n';

	}
	return output;

}

function vobjCreateCubeV( offsets, groups, usemtls ) {

	var output = '\n';
	if ( groups === null || groups.length === 0 ) groups = [ null, null, null, null, null, null ];
	if ( usemtls === null || usemtls.length === 0 ) usemtls = [ null, null, null, null, null, null ];
	for ( var group, usemtl, f0, f1, f2, f3, i = 0, facesV = obj_verify.facesV, length = facesV.length; i < length; i ++ ) {

		f0 = facesV[ i ][ 0 ] + offsets[ 0 ];
		f1 = facesV[ i ][ 1 ] + offsets[ 0 ];
		f2 = facesV[ i ][ 2 ] + offsets[ 0 ];
		f3 = facesV[ i ][ 3 ] + offsets[ 0 ];

		group = groups[ i ];
		usemtl = usemtls[ i ];
		if ( group ) output += 'g ' + group + '\n';
		if ( usemtl ) output += 'usemtl ' + usemtl + '\n';
		output += 'f ' + f0 + ' ' + f1 + ' ' + f2 + ' ' + f3 + '\n';

	}
	return output;

}

function vobjCreateCubeVVn( offsets, groups, usemtls ) {

	var output = '\n';
	if ( groups === null || groups.length === 0 ) groups = [ null, null, null, null, null, null ];
	if ( usemtls === null || usemtls.length === 0 ) usemtls = [ null, null, null, null, null, null ];
	for ( var group, usemtl, f0, f1, f2, f3, i = 0, facesV = obj_verify.facesV, facesVn = obj_verify.facesVn; i < 6; i ++ ) {

		f0 = facesV[ i ][ 0 ] + offsets[ 0 ] + '//' + ( facesVn[ i ][ 0 ] + offsets[ 1 ] );
		f1 = facesV[ i ][ 1 ] + offsets[ 0 ] + '//' + ( facesVn[ i ][ 1 ] + offsets[ 1 ] );
		f2 = facesV[ i ][ 2 ] + offsets[ 0 ] + '//' + ( facesVn[ i ][ 2 ] + offsets[ 1 ] );
		f3 = facesV[ i ][ 3 ] + offsets[ 0 ] + '//' + ( facesVn[ i ][ 3 ] + offsets[ 1 ] );

		group = groups[ i ];
		usemtl = usemtls[ i ];
		if ( group ) output += 'g ' + group + '\n';
		if ( usemtl ) output += 'usemtl ' + usemtl + '\n';
		output += 'f ' + f0 + ' ' + f1 + ' ' + f2 + ' ' + f3 + '\n';

	}
	return output;

}

function vobjCreateCubeVVt( offsets, groups, usemtls ) {

	var output = '\n';
	if ( groups === null || groups.length === 0 ) groups = [ null, null, null, null, null, null ];
	if ( usemtls === null || usemtls.length === 0 ) usemtls = [ null, null, null, null, null, null ];
	for ( var group, usemtl, f0, f1, f2, f3, i = 0, facesV = obj_verify.facesV, facesVt = obj_verify.facesVt; i < 6; i ++ ) {

		f0 = facesV[ i ][ 0 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 0 ] + offsets[ 1 ] );
		f1 = facesV[ i ][ 1 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 1 ] + offsets[ 1 ] );
		f2 = facesV[ i ][ 2 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 2 ] + offsets[ 1 ] );
		f3 = facesV[ i ][ 3 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 3 ] + offsets[ 1 ] );

		group = groups[ i ];
		usemtl = usemtls[ i ];
		if ( group ) output += 'g ' + group + '\n';
		if ( usemtl ) output += 'usemtl ' + usemtl + '\n';
		output += 'f ' + f0 + ' ' + f1 + ' ' + f2 + ' ' + f3 + '\n';

	}
	return output;

}

function vobjCreateCubeVVnVt( offsets, groups, usemtls ) {

	var output = '\n';
	if ( groups === null || groups.length === 0 ) groups = [ null, null, null, null, null, null ];
	if ( usemtls === null || usemtls.length === 0 ) usemtls = [ null, null, null, null, null, null ];
	for ( var group, usemtl, f0, f1, f2, f3, i = 0, facesV = obj_verify.facesV, facesVt = obj_verify.facesVt, facesVn = obj_verify.facesVn; i < 6; i ++ ) {

		f0 = facesV[ i ][ 0 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 0 ] + offsets[ 1 ] ) + '/' + ( facesVn[ i ][ 0 ] + offsets[ 2 ] );
		f1 = facesV[ i ][ 1 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 1 ] + offsets[ 1 ] ) + '/' + ( facesVn[ i ][ 1 ] + offsets[ 2 ] );
		f2 = facesV[ i ][ 2 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 2 ] + offsets[ 1 ] ) + '/' + ( facesVn[ i ][ 2 ] + offsets[ 2 ] );
		f3 = facesV[ i ][ 3 ] + offsets[ 0 ] + '/' + ( facesVt[ i ][ 3 ] + offsets[ 1 ] ) + '/' + ( facesVn[ i ][ 3 ] + offsets[ 2 ] );

		group = groups[ i ];
		usemtl = usemtls[ i ];
		if ( group ) output += 'g ' + group + '\n';
		if ( usemtl ) output += 'usemtl ' + usemtl + '\n';
		output += 'f ' + f0 + ' ' + f1 + ' ' + f2 + ' ' + f3 + '\n';

	}
	return output;

}

gulp.task( 'default', function () {

	gutil.log( 'Building: verify.obj' );
	var offsets = [ 0, 0, 0 ];
	var pos = [ - 150, 50, 0 ];
	fs.writeFileSync( './verify.obj', '# Verification OBJ created with gulp\n\n' );
	fs.appendFileSync( './verify.obj', 'mtllib verify.mtl\n\n# Cube no materials. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateCubeV( offsets, null, null ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Cube with two materials. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateCubeV( offsets, null, [ 'orange', null, null, 'purple', null, null ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Cube with normals no materials. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateNormals() );
	fs.appendFileSync( './verify.obj', vobjCreateCubeVVn( offsets, [ 'cube3', null, null, null, null, null ], [ 'lightblue', null, null, null, null, null ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Cube with uvs and red material. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateUvs() );
	fs.appendFileSync( './verify.obj', vobjCreateCubeVVt( offsets, null, [ 'red', null, null, null, null, null ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# cube with uvs and normals and material. Translated x' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );

	fs.appendFileSync( './verify.obj', vobjCreateCubeVVnVt( offsets, [], [ 'red', null, null, 'blue', null, 'green' ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	offsets[ 1 ] += 6;
	fs.appendFileSync( './verify.obj', '\n\n# cube with uvs and normals and two materials and group for every quad. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateNormals() );
	fs.appendFileSync( './verify.obj', vobjCreateCubeVVnVt( [ - 9, offsets[ 1 ], offsets[ 2 ] ],
		[ 'cube6a', 'cube6b', 'cube6c', 'cube6d', 'cube6e', 'cube6f' ],
		[ 'green', null, null, 'orange', null, null ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# cube with uvs and normals and six materials and six groups, one for every quad. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', vobjCreateCubeVVnVt( offsets,
		[ 'cube6a', 'cube6b', 'cube6c', 'cube6d', 'cube6e', 'cube6f' ],
		[ 'red', 'blue', 'green', 'lightblue', 'orange', 'purple' ] ) );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Point. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', '\np -8 -7 -6 -5 -4 -3 -2 -1\n' );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Line. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', 'l -8 -7 -6 -5 -4 -3 -2 -1 -8 -5 -8 -4 -7 -6 -7 -3 -5 -1 -3 -2 -6 -2 -4 -1\n' );

	pos[ 0 ] += 50;
	offsets[ 0 ] += 8;
	fs.appendFileSync( './verify.obj', '\n\n# Line UV. Translated x:' + pos[ 0 ] );
	fs.appendFileSync( './verify.obj', vobjCreateVertices( 10, pos ) );
	fs.appendFileSync( './verify.obj', '\nl -8/-2 -7/-1 -6/-2 -5/-1\n' );



} );
