/**
 * 	SEA3D - Google Draco
 * 	@author Sunag / http://www.sunag.com.br/
 */

import { SEA3D } from "./SEA3DLoader.js";

//
//	Lossy Compression
//

function GeometryDraco( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var attrib = data.readUShort(),
		i;

	this.isBig = ( attrib & 1 ) !== 0;

	data.readVInt = this.isBig ? data.readUInt : data.readUShort;

	this.groups = [];

	if ( attrib & 32 ) {

		this.uv = [];
		this.uv.length = data.readUByte();

	}

	if ( attrib & 1024 ) {

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

	}

	var module = GeometryDraco.getModule(),
		dracoData = new Int8Array( data.concat( data.position, data.bytesAvailable ).buffer );

	var decoder = new module.Decoder();

	var buffer = new module.DecoderBuffer();
	buffer.Init( dracoData, dracoData.length );
	
	var mesh = new module.Mesh();

	var decodingStatus = decoder.DecodeBufferToMesh( buffer, mesh );

	if ( ! decodingStatus.ok() ) {

		data.position += 5; // jump "DRACO" magic string
		var version = data.readUByte() + '.' + data.readUByte(); // draco version

		console.error( "SEA3D Draco", version, "decoding failed:", decodingStatus.error_msg(), "You may need update 'draco_decoder.js'." );

		// use an empty geometry
		this.vertex = new Float32Array();

		return;

	}

	var index = 0;

	this.vertex = this.readFloat32Array( module, decoder, mesh, index ++ );

	if ( attrib & 4 ) this.normal = this.readFloat32Array( module, decoder, mesh, index ++ );

	if ( attrib & 32 ) {

		for ( i = 0; i < this.uv.length; i ++ ) {

			this.uv[ i ] = this.readFloat32Array( module, decoder, mesh, index ++ );

		}

	}

	if ( attrib & 64 ) {

		this.jointPerVertex = decoder.GetAttribute( mesh, index ).num_components();

		this.joint = this.readUint16Array( module, decoder, mesh, index ++ );
		this.weight = this.readFloat32Array( module, decoder, mesh, index ++ );

	}

	this.indexes = this.readIndices( module, decoder, mesh );

	module.destroy( mesh );
	module.destroy( buffer );
	module.destroy( decoder );

};

GeometryDraco.getModule = function () {

	if ( ! this.module ) {

		this.module = DracoDecoderModule();

	}

	return this.module;

};

GeometryDraco.prototype.type = "sdrc";

GeometryDraco.prototype.readIndices = function ( module, decoder, mesh ) {

	var numFaces = mesh.num_faces(),
		numIndices = numFaces * 3,
		indices = new ( numIndices >= 0xFFFE ? Uint32Array : Uint16Array )( numIndices );

	var ia = new module.DracoInt32Array();

	for ( var i = 0; i < numFaces; ++ i ) {

		  decoder.GetFaceFromMesh( mesh, i, ia );

		  var index = i * 3;

		  indices[ index ] = ia.GetValue( 0 );
		  indices[ index + 1 ] = ia.GetValue( 1 );
		  indices[ index + 2 ] = ia.GetValue( 2 );

	}

	module.destroy( ia );

	return indices;

};

GeometryDraco.prototype.readFloat32Array = function ( module, decoder, mesh, attrib ) {

	var attribute = decoder.GetAttribute( mesh, attrib ),
		numPoints = mesh.num_points();

	var dracoArray = new module.DracoFloat32Array();
	decoder.GetAttributeFloatForAllPoints( mesh, attribute, dracoArray );

	var size = numPoints * attribute.num_components(),
		output = new Float32Array( size );

	for ( var i = 0; i < size; ++ i ) {

		output[ i ] = dracoArray.GetValue( i );

	}

	module.destroy( dracoArray );

	return output;

};

GeometryDraco.prototype.readUint16Array = function ( module, decoder, mesh, attrib, type ) {

	var attribute = decoder.GetAttribute( mesh, attrib ),
		numPoints = mesh.num_points();

	var dracoArray = new module.DracoUInt16Array();
	decoder.GetAttributeUInt16ForAllPoints( mesh, attribute, dracoArray );

	var size = numPoints * attribute.num_components(),
		output = new Uint16Array( size );

	for ( var i = 0; i < size; ++ i ) {

		output[ i ] = dracoArray.GetValue( i );

	}

	module.destroy( dracoArray );

	return output;

};

//
//	Extension
//

SEA3D.EXTENSIONS_LOADER.push( {

	setTypeRead: function () {

		this.file.addClass( GeometryDraco, true );
		this.file.typeRead[ GeometryDraco.prototype.type ] = this.readGeometryBuffer;

	}

} );
