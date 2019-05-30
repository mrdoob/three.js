/**
 * 	SEA3D - o3dgc
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

//
//	Lossy Compression
//

SEA3D.GeometryGC = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var i;
	var attrib = data.readUShort();
	var uvIDs = [], jointID, weightID;

	this.isBig = ( attrib & 1 ) != 0;

	data.readVInt = this.isBig ? data.readUInt : data.readUShort;

	// Geometry Flags
	// ..
	// 1 isBig
	// 2 groups
	// 4 uv
	// 8 tangent
	// 16 colors
	// 32 joints
	// 64 morph
	// 128 vertex-animation
	// ..

	if ( attrib & 2 ) {

		this.groups = [];

		var numGroups = data.readUByte(),
			groupOffset = 0;

		for ( i = 0; i < numGroups; i ++ )		{

			var groupLength = data.readVInt() * 3;

			this.groups.push( {
				start: groupOffset,
				count: groupLength,
			} );

			groupOffset += groupLength;

		}

	} else {

		this.groups = [];

	}

	if ( attrib & 4 ) {

		this.uv = [];

		var uvCount = data.readUByte();

		for ( i = 0; i < uvCount; i ++ ) {

			uvIDs[ i ] = data.readUByte();

		}

	}

	if ( attrib & 32 ) {

		jointID = data.readUByte();
		weightID = data.readUByte();

	}

	var size = data.readUInt();
	var bytes = data.concat( data.position, size );

	var bstream = new o3dgc.BinaryStream( bytes.buffer );

	var decoder = new o3dgc.SC3DMCDecoder();
	var ifs = new o3dgc.IndexedFaceSet();

	decoder.DecodeHeader( ifs, bstream );

	var numIndexes = ifs.GetNCoordIndex();
	var numVertex = ifs.GetNCoord();

	if ( ! this.groups.length ) this.groups.push( { start: 0, count: numIndexes * 3 } );

	this.indexes = this.isBig ? new Uint32Array( numIndexes * 3 ) : new Uint16Array( numIndexes * 3 );
	this.vertex = new Float32Array( numVertex * 3 );

	ifs.SetCoordIndex( this.indexes );
	ifs.SetCoord( this.vertex );

	if ( ifs.GetNNormal() > 0 ) {

		this.normal = new Float32Array( numVertex * 3 );
		ifs.SetNormal( this.normal );

	}

	for ( i = 0; i < uvIDs.length; i ++ ) {

		this.uv[ i ] = new Float32Array( numVertex * 2 );
		ifs.SetFloatAttribute( uvIDs[ i ], this.uv[ i ] );

	}

	if ( jointID !== undefined ) {

		this.jointPerVertex = ifs.GetIntAttributeDim( jointID );

		this.joint = new Uint16Array( numVertex * this.jointPerVertex );
		this.weight = new Float32Array( numVertex * this.jointPerVertex );

		ifs.SetIntAttribute( jointID, this.joint );
		ifs.SetFloatAttribute( weightID, this.weight );

	}

	// decode mesh

	decoder.DecodePlayload( ifs, bstream );

};

SEA3D.GeometryGC.prototype.type = "s3D";

//
//	Extension
//

THREE.SEA3D.EXTENSIONS_LOADER.push( {

	setTypeRead: function () {

		this.file.addClass( SEA3D.GeometryGC, true );

		this.file.typeRead[ SEA3D.GeometryGC.prototype.type ] = this.readGeometryBuffer;

	}

} );
