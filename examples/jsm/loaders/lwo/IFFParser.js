/**
 * === IFFParser ===
 * - Parses data from the IFF buffer.
 * - LWO3 files are in IFF format and can contain the following data types, referred to by shorthand codes
 *
 * ATOMIC DATA TYPES
 *  ID Tag - 4x 7 bit uppercase ASCII chars: ID4
 *  signed integer, 1, 2, or 4 byte length: I1, I2, I4
 *  unsigned integer, 1, 2, or 4 byte length: U1, U2, U4
 *  float, 4 byte length: F4
 *  string, series of ASCII chars followed by null byte (If the length of the string including the null terminating byte is odd, an extra null is added so that the data that follows will begin on an even byte boundary): S0
 *
 * COMPOUND DATA TYPES
 *  Variable-length Index (index into an array or collection): U2 or U4 : VX
 *  Color (RGB): F4 + F4 + F4: COL12
 *  Coordinate (x, y, z): F4 + F4 + F4: VEC12
 *  Percentage F4 data type from 0->1 with 1 = 100%: FP4
 *  Angle in radian F4: ANG4
 *  Filename (string) S0: FNAM0
 *  XValue F4 + index (VX) + optional envelope( ENVL ): XVAL
 *  XValue vector VEC12 + index (VX) + optional envelope( ENVL ): XVAL3
 *
 *  The IFF file is arranged in chunks:
 *  CHUNK = ID4 + length (U4) + length X bytes of data + optional 0 pad byte
 *  optional 0 pad byte is there to ensure chunk ends on even boundary, not counted in size
 *
 * COMPOUND DATA TYPES
 * - Chunks are combined in Forms (collections of chunks)
 * - FORM = string 'FORM' (ID4) + length (U4) + type (ID4) + optional ( CHUNK | FORM )
 * - CHUNKS and FORMS are collectively referred to as blocks
 * - The entire file is contained in one top level FORM
 *
 **/

import { LWO2Parser } from './LWO2Parser.js';
import { LWO3Parser } from './LWO3Parser.js';

class IFFParser {

	constructor() {

		this.debugger = new Debugger();
		// this.debugger.enable(); // un-comment to log IFF hierarchy.

	}

	parse( buffer ) {

		this.reader = new DataViewReader( buffer );

		this.tree = {
			materials: {},
			layers: [],
			tags: [],
			textures: [],
		};

		// start out at the top level to add any data before first layer is encountered
		this.currentLayer = this.tree;
		this.currentForm = this.tree;

		this.parseTopForm();

		if ( this.tree.format === undefined ) return;

		if ( this.tree.format === 'LWO2' ) {

			this.parser = new LWO2Parser( this );
			while ( ! this.reader.endOfFile() ) this.parser.parseBlock();

		} else if ( this.tree.format === 'LWO3' ) {

			this.parser = new LWO3Parser( this );
			while ( ! this.reader.endOfFile() ) this.parser.parseBlock();

		}

		this.debugger.offset = this.reader.offset;
		this.debugger.closeForms();

		return this.tree;

	}

	parseTopForm() {

		this.debugger.offset = this.reader.offset;

		var topForm = this.reader.getIDTag();

		if ( topForm !== 'FORM' ) {

			console.warn( 'LWOLoader: Top-level FORM missing.' );
			return;

		}

		var length = this.reader.getUint32();

		this.debugger.dataOffset = this.reader.offset;
		this.debugger.length = length;

		var type = this.reader.getIDTag();

		if ( type === 'LWO2' ) {

			this.tree.format = type;

		} else if ( type === 'LWO3' ) {

			this.tree.format = type;

		}

		this.debugger.node = 0;
		this.debugger.nodeID = type;
		this.debugger.log();

		return;

	}


	///
	// FORM PARSING METHODS
	///

	// Forms are organisational and can contain any number of sub chunks and sub forms
	// FORM ::= 'FORM'[ID4], length[U4], type[ID4], ( chunk[CHUNK] | form[FORM] ) * }
	parseForm( length ) {

		var type = this.reader.getIDTag();

		switch ( type ) {

			// SKIPPED FORMS
			// if skipForm( length ) is called, the entire form and any sub forms and chunks are skipped

			case 'ISEQ': // Image sequence
			case 'ANIM': // plug in animation
			case 'STCC': // Color-cycling Still
			case 'VPVL':
			case 'VPRM':
			case 'NROT':
			case 'WRPW': // image wrap w ( for cylindrical and spherical projections)
			case 'WRPH': // image wrap h
			case 'FUNC':
			case 'FALL':
			case 'OPAC':
			case 'GRAD': // gradient texture
			case 'ENVS':
			case 'VMOP':
			case 'VMBG':

			// Car Material FORMS
			case 'OMAX':
			case 'STEX':
			case 'CKBG':
			case 'CKEY':
			case 'VMLA':
			case 'VMLB':
				this.debugger.skipped = true;
				this.skipForm( length ); // not currently supported
				break;

			// if break; is called directly, the position in the lwoTree is not created
			// any sub chunks and forms are added to the parent form instead
			case 'META':
			case 'NNDS':
			case 'NODS':
			case 'NDTA':
			case 'ADAT':
			case 'AOVS':
			case 'BLOK':

			// used by texture nodes
			case 'IBGC': // imageBackgroundColor
			case 'IOPC': // imageOpacity
			case 'IIMG': // hold reference to image path
			case 'TXTR':
				// this.setupForm( type, length );
				this.debugger.length = 4;
				this.debugger.skipped = true;
				break;

			case 'IFAL': // imageFallof
			case 'ISCL': // imageScale
			case 'IPOS': // imagePosition
			case 'IROT': // imageRotation
			case 'IBMP':
			case 'IUTD':
			case 'IVTD':
				this.parseTextureNodeAttribute( type );
				break;

			case 'ENVL':
				this.parseEnvelope( length );
				break;

				// CLIP FORM AND SUB FORMS

			case 'CLIP':
				if ( this.tree.format === 'LWO2' ) {

					this.parseForm( length );

				} else {

					this.parseClip( length );

				}

				break;

			case 'STIL':
				this.parseImage();
				break;

			case 'XREF': // clone of another STIL
				this.reader.skip( 8 ); // unknown
				this.currentForm.referenceTexture = {
					index: this.reader.getUint32(),
					refName: this.reader.getString() // internal unique ref
				};
				break;

				// Not in spec, used by texture nodes

			case 'IMST':
				this.parseImageStateForm( length );
				break;

				// SURF FORM AND SUB FORMS

			case 'SURF':
				this.parseSurfaceForm( length );
				break;

			case 'VALU': // Not in spec
				this.parseValueForm( length );
				break;

			case 'NTAG':
				this.parseSubNode( length );
				break;

			case 'ATTR': // BSDF Node Attributes
			case 'SATR': // Standard Node Attributes
				this.setupForm( 'attributes', length );
				break;

			case 'NCON':
				this.parseConnections( length );
				break;

			case 'SSHA':
				this.parentForm = this.currentForm;
				this.currentForm = this.currentSurface;
				this.setupForm( 'surfaceShader', length );
				break;

			case 'SSHD':
				this.setupForm( 'surfaceShaderData', length );
				break;

			case 'ENTR': // Not in spec
				this.parseEntryForm( length );
				break;

				// Image Map Layer

			case 'IMAP':
				this.parseImageMap( length );
				break;

			case 'TAMP':
				this.parseXVAL( 'amplitude', length );
				break;

				//Texture Mapping Form

			case 'TMAP':
				this.setupForm( 'textureMap', length );
				break;

			case 'CNTR':
				this.parseXVAL3( 'center', length );
				break;

			case 'SIZE':
				this.parseXVAL3( 'scale', length );
				break;

			case 'ROTA':
				this.parseXVAL3( 'rotation', length );
				break;

			default:
				this.parseUnknownForm( type, length );

		}

		this.debugger.node = 0;
		this.debugger.nodeID = type;
		this.debugger.log();

	}

	setupForm( type, length ) {

		if ( ! this.currentForm ) this.currentForm = this.currentNode;

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		if ( ! this.currentForm[ type ] ) {

			this.currentForm[ type ] = {};
			this.currentForm = this.currentForm[ type ];


		} else {

			// should never see this unless there's a bug in the reader
			console.warn( 'LWOLoader: form already exists on parent: ', type, this.currentForm );

			this.currentForm = this.currentForm[ type ];

		}


	}

	skipForm( length ) {

		this.reader.skip( length - 4 );

	}

	parseUnknownForm( type, length ) {

		console.warn( 'LWOLoader: unknown FORM encountered: ' + type, length );

		printBuffer( this.reader.dv.buffer, this.reader.offset, length - 4 );
		this.reader.skip( length - 4 );

	}

	parseSurfaceForm( length ) {

		this.reader.skip( 8 ); // unknown Uint32 x2

		var name = this.reader.getString();

		var surface = {
			attributes: {}, // LWO2 style non-node attributes will go here
			connections: {},
			name: name,
			inputName: name,
			nodes: {},
			source: this.reader.getString(),
		};

		this.tree.materials[ name ] = surface;
		this.currentSurface = surface;

		this.parentForm = this.tree.materials;
		this.currentForm = surface;
		this.currentFormEnd = this.reader.offset + length;

	}

	parseSurfaceLwo2( length ) {

		var name = this.reader.getString();

		var surface = {
			attributes: {}, // LWO2 style non-node attributes will go here
			connections: {},
			name: name,
			nodes: {},
			source: this.reader.getString(),
		};

		this.tree.materials[ name ] = surface;
		this.currentSurface = surface;

		this.parentForm = this.tree.materials;
		this.currentForm = surface;
		this.currentFormEnd = this.reader.offset + length;

	}

	parseSubNode( length ) {

		// parse the NRNM CHUNK of the subnode FORM to get
		// a meaningful name for the subNode
		// some subnodes can be renamed, but Input and Surface cannot

		this.reader.skip( 8 ); // NRNM + length
		var name = this.reader.getString();

		var node = {
			name: name
		};
		this.currentForm = node;
		this.currentNode = node;

		this.currentFormEnd = this.reader.offset + length;


	}

	// collect attributes from all nodes at the top level of a surface
	parseConnections( length ) {

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		this.currentForm = this.currentSurface.connections;

	}

	// surface node attribute data, e.g. specular, roughness etc
	parseEntryForm( length ) {

		this.reader.skip( 8 ); // NAME + length
		var name = this.reader.getString();
		this.currentForm = this.currentNode.attributes;

		this.setupForm( name, length );

	}

	// parse values from material - doesn't match up to other LWO3 data types
	// sub form of entry form
	parseValueForm() {

		this.reader.skip( 8 ); // unknown + length

		var valueType = this.reader.getString();

		if ( valueType === 'double' ) {

			this.currentForm.value = this.reader.getUint64();

		} else if ( valueType === 'int' ) {

			this.currentForm.value = this.reader.getUint32();

		} else if ( valueType === 'vparam' ) {

			this.reader.skip( 24 );
			this.currentForm.value = this.reader.getFloat64();

		} else if ( valueType === 'vparam3' ) {

			this.reader.skip( 24 );
			this.currentForm.value = this.reader.getFloat64Array( 3 );

		}

	}

	// holds various data about texture node image state
	// Data other than mipMapLevel unknown
	parseImageStateForm() {

		this.reader.skip( 8 ); // unknown

		this.currentForm.mipMapLevel = this.reader.getFloat32();

	}

	// LWO2 style image data node OR LWO3 textures defined at top level in editor (not as SURF node)
	parseImageMap( length ) {

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		if ( ! this.currentForm.maps ) this.currentForm.maps = [];

		var map = {};
		this.currentForm.maps.push( map );
		this.currentForm = map;

		this.reader.skip( 10 ); // unknown, could be an issue if it contains a VX

	}

	parseTextureNodeAttribute( type ) {

		this.reader.skip( 28 ); // FORM + length + VPRM + unknown + Uint32 x2 + float32

		this.reader.skip( 20 ); // FORM + length + VPVL + float32 + Uint32

		switch ( type ) {

			case 'ISCL':
				this.currentNode.scale = this.reader.getFloat32Array( 3 );
				break;
			case 'IPOS':
				this.currentNode.position = this.reader.getFloat32Array( 3 );
				break;
			case 'IROT':
				this.currentNode.rotation = this.reader.getFloat32Array( 3 );
				break;
			case 'IFAL':
				this.currentNode.falloff = this.reader.getFloat32Array( 3 );
				break;

			case 'IBMP':
				this.currentNode.amplitude = this.reader.getFloat32();
				break;
			case 'IUTD':
				this.currentNode.uTiles = this.reader.getFloat32();
				break;
			case 'IVTD':
				this.currentNode.vTiles = this.reader.getFloat32();
				break;

		}

		this.reader.skip( 2 ); // unknown


	}

	// ENVL forms are currently ignored
	parseEnvelope( length ) {

		this.reader.skip( length - 4 ); // skipping  entirely for now

	}

	///
	// CHUNK PARSING METHODS
	///

	// clips can either be defined inside a surface node, or at the top
	// level and they have a different format in each case
	parseClip( length ) {

		var tag = this.reader.getIDTag();

		// inside surface node
		if ( tag === 'FORM' ) {

			this.reader.skip( 16 );

			this.currentNode.fileName = this.reader.getString();

			return;

		}

		// otherwise top level
		this.reader.setOffset( this.reader.offset - 4 );

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		this.reader.skip( 8 ); // unknown

		var texture = {
			index: this.reader.getUint32()
		};
		this.tree.textures.push( texture );
		this.currentForm = texture;

	}

	parseClipLwo2( length ) {

		var texture = {
			index: this.reader.getUint32(),
			fileName: ''
		};

		// search STIL block
		while ( true ) {

			var tag = this.reader.getIDTag();
			var n_length = this.reader.getUint16();
			if ( tag === 'STIL' ) {

				texture.fileName = this.reader.getString();
				break;

			}

			if ( n_length >= length ) {

				break;

			}

		}

		this.tree.textures.push( texture );
		this.currentForm = texture;

	}

	parseImage() {

		this.reader.skip( 8 ); // unknown
		this.currentForm.fileName = this.reader.getString();

	}

	parseXVAL( type, length ) {

		var endOffset = this.reader.offset + length - 4;
		this.reader.skip( 8 );

		this.currentForm[ type ] = this.reader.getFloat32();

		this.reader.setOffset( endOffset ); // set end offset directly to skip optional envelope

	}

	parseXVAL3( type, length ) {

		var endOffset = this.reader.offset + length - 4;
		this.reader.skip( 8 );

		this.currentForm[ type ] = {
			x: this.reader.getFloat32(),
			y: this.reader.getFloat32(),
			z: this.reader.getFloat32(),
		};

		this.reader.setOffset( endOffset );

	}

	// Tags associated with an object
	// OTAG { type[ID4], tag-string[S0] }
	parseObjectTag() {

		if ( ! this.tree.objectTags ) this.tree.objectTags = {};

		this.tree.objectTags[ this.reader.getIDTag() ] = {
			tagString: this.reader.getString()
		};

	}

	// Signals the start of a new layer. All the data chunks which follow will be included in this layer until another layer chunk is encountered.
	// LAYR: number[U2], flags[U2], pivot[VEC12], name[S0], parent[U2]
	parseLayer( length ) {

		var number = this.reader.getUint16();
		var flags = this.reader.getUint16(); // If the least significant bit of flags is set, the layer is hidden.
		var pivot = this.reader.getFloat32Array( 3 ); // Note: this seems to be superfluous, as the geometry is translated when pivot is present
		var layer = {
			number: number,
			flags: flags, // If the least significant bit of flags is set, the layer is hidden.
			pivot: [ - pivot[ 0 ], pivot[ 1 ], pivot[ 2 ] ], // Note: this seems to be superfluous, as the geometry is translated when pivot is present
			name: this.reader.getString(),
		};

		this.tree.layers.push( layer );
		this.currentLayer = layer;

		var parsedLength = 16 + stringOffset( this.currentLayer.name ); // index ( 2 ) + flags( 2 ) + pivot( 12 ) + stringlength

		// if we have not reached then end of the layer block, there must be a parent defined
		this.currentLayer.parent = ( parsedLength < length ) ? this.reader.getUint16() : - 1; // omitted or -1 for no parent

	}

	// VEC12 * ( F4 + F4 + F4 ) array of x,y,z vectors
	// Converting from left to right handed coordinate system:
	// x -> -x and switch material FrontSide -> BackSide
	parsePoints( length ) {

		this.currentPoints = [];
		for ( var i = 0; i < length / 4; i += 3 ) {

			// x -> -x to match three.js right handed coords
			this.currentPoints.push( - this.reader.getFloat32(), this.reader.getFloat32(), this.reader.getFloat32() );

		}

	}

	// parse VMAP or VMAD
	// Associates a set of floating-point vectors with a set of points.
	// VMAP: { type[ID4], dimension[U2], name[S0], ( vert[VX], value[F4] # dimension ) * }

	// VMAD Associates a set of floating-point vectors with the vertices of specific polygons.
	// Similar to VMAP UVs, but associates with polygon vertices rather than points
	// to solve to problem of UV seams:  VMAD chunks are paired with VMAPs of the same name,
	// if they exist. The vector values in the VMAD will then replace those in the
	// corresponding VMAP, but only for calculations involving the specified polygons.
	// VMAD { type[ID4], dimension[U2], name[S0], ( vert[VX], poly[VX], value[F4] # dimension ) * }
	parseVertexMapping( length, discontinuous ) {

		var finalOffset = this.reader.offset + length;

		var channelName = this.reader.getString();

		if ( this.reader.offset === finalOffset ) {

			// then we are in a texture node and the VMAP chunk is just a reference to a UV channel name
			this.currentForm.UVChannel = channelName;
			return;

		}

		// otherwise reset to initial length and parse normal VMAP CHUNK
		this.reader.setOffset( this.reader.offset - stringOffset( channelName ) );

		var type = this.reader.getIDTag();

		this.reader.getUint16(); // dimension
		var name = this.reader.getString();

		var remainingLength = length - 6 - stringOffset( name );

		switch ( type ) {

			case 'TXUV':
				this.parseUVMapping( name, finalOffset, discontinuous );
				break;
			case 'MORF':
			case 'SPOT':
				this.parseMorphTargets( name, finalOffset, type ); // can't be discontinuous
				break;
			// unsupported VMAPs
			case 'APSL':
			case 'NORM':
			case 'WGHT':
			case 'MNVW':
			case 'PICK':
			case 'RGB ':
			case 'RGBA':
				this.reader.skip( remainingLength );
				break;
			default:
				console.warn( 'LWOLoader: unknown vertex map type: ' + type );
				this.reader.skip( remainingLength );

		}

	}

	parseUVMapping( name, finalOffset, discontinuous ) {

		var uvIndices = [];
		var polyIndices = [];
		var uvs = [];

		while ( this.reader.offset < finalOffset ) {

			uvIndices.push( this.reader.getVariableLengthIndex() );

			if ( discontinuous ) polyIndices.push( this.reader.getVariableLengthIndex() );

			uvs.push( this.reader.getFloat32(), this.reader.getFloat32() );

		}

		if ( discontinuous ) {

			if ( ! this.currentLayer.discontinuousUVs ) this.currentLayer.discontinuousUVs = {};

			this.currentLayer.discontinuousUVs[ name ] = {
				uvIndices: uvIndices,
				polyIndices: polyIndices,
				uvs: uvs,
			};

		} else {

			if ( ! this.currentLayer.uvs ) this.currentLayer.uvs = {};

			this.currentLayer.uvs[ name ] = {
				uvIndices: uvIndices,
				uvs: uvs,
			};

		}

	}

	parseMorphTargets( name, finalOffset, type ) {

		var indices = [];
		var points = [];

		type = ( type === 'MORF' ) ? 'relative' : 'absolute';

		while ( this.reader.offset < finalOffset ) {

			indices.push( this.reader.getVariableLengthIndex() );
			// z -> -z to match three.js right handed coords
			points.push( this.reader.getFloat32(), this.reader.getFloat32(), - this.reader.getFloat32() );

		}

		if ( ! this.currentLayer.morphTargets ) this.currentLayer.morphTargets = {};

		this.currentLayer.morphTargets[ name ] = {
			indices: indices,
			points: points,
			type: type,
		};

	}

	// A list of polygons for the current layer.
	// POLS { type[ID4], ( numvert+flags[U2], vert[VX] # numvert ) * }
	parsePolygonList( length ) {

		var finalOffset = this.reader.offset + length;
		var type = this.reader.getIDTag();

		var indices = [];

		// hold a list of polygon sizes, to be split up later
		var polygonDimensions = [];

		while ( this.reader.offset < finalOffset ) {

			var numverts = this.reader.getUint16();

			//var flags = numverts & 64512; // 6 high order bits are flags - ignoring for now
			numverts = numverts & 1023; // remaining ten low order bits are vertex num
			polygonDimensions.push( numverts );

			for ( var j = 0; j < numverts; j ++ ) indices.push( this.reader.getVariableLengthIndex() );

		}

		var geometryData = {
			type: type,
			vertexIndices: indices,
			polygonDimensions: polygonDimensions,
			points: this.currentPoints
		};

		// Note: assuming that all polys will be lines or points if the first is
		if ( polygonDimensions[ 0 ] === 1 ) geometryData.type = 'points';
		else if ( polygonDimensions[ 0 ] === 2 ) geometryData.type = 'lines';

		this.currentLayer.geometry = geometryData;

	}

	// Lists the tag strings that can be associated with polygons by the PTAG chunk.
	// TAGS { tag-string[S0] * }
	parseTagStrings( length ) {

		this.tree.tags = this.reader.getStringArray( length );

	}

	// Associates tags of a given type with polygons in the most recent POLS chunk.
	// PTAG { type[ID4], ( poly[VX], tag[U2] ) * }
	parsePolygonTagMapping( length ) {

		var finalOffset = this.reader.offset + length;
		var type = this.reader.getIDTag();
		if ( type === 'SURF' ) this.parseMaterialIndices( finalOffset );
		else { //PART, SMGP, COLR not supported

			this.reader.skip( length - 4 );

		}

	}

	parseMaterialIndices( finalOffset ) {

		// array holds polygon index followed by material index
		this.currentLayer.geometry.materialIndices = [];

		while ( this.reader.offset < finalOffset ) {

			var polygonIndex = this.reader.getVariableLengthIndex();
			var materialIndex = this.reader.getUint16();

			this.currentLayer.geometry.materialIndices.push( polygonIndex, materialIndex );

		}

	}

	parseUnknownCHUNK( blockID, length ) {

		console.warn( 'LWOLoader: unknown chunk type: ' + blockID + ' length: ' + length );

		// print the chunk plus some bytes padding either side
		// printBuffer( this.reader.dv.buffer, this.reader.offset - 20, length + 40 );

		var data = this.reader.getString( length );

		this.currentForm[ blockID ] = data;

	}

}


class DataViewReader {

	constructor( buffer ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this._textDecoder = new TextDecoder();
		this._bytes = new Uint8Array( buffer );

	}

	size() {

		return this.dv.buffer.byteLength;

	}

	setOffset( offset ) {

		if ( offset > 0 && offset < this.dv.buffer.byteLength ) {

			this.offset = offset;

		} else {

			console.error( 'LWOLoader: invalid buffer offset' );

		}

	}

	endOfFile() {

		if ( this.offset >= this.size() ) return true;
		return false;

	}

	skip( length ) {

		this.offset += length;

	}

	getUint8() {

		var value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	}

	getUint16() {

		var value = this.dv.getUint16( this.offset );
		this.offset += 2;
		return value;

	}

	getInt32() {

		var value = this.dv.getInt32( this.offset, false );
		this.offset += 4;
		return value;

	}

	getUint32() {

		var value = this.dv.getUint32( this.offset, false );
		this.offset += 4;
		return value;

	}

	getUint64() {

		var low, high;

		high = this.getUint32();
		low = this.getUint32();
		return high * 0x100000000 + low;

	}

	getFloat32() {

		var value = this.dv.getFloat32( this.offset, false );
		this.offset += 4;
		return value;

	}

	getFloat32Array( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	}

	getFloat64() {

		var value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	}

	getFloat64Array( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	}

	// get variable-length index data type
	// VX ::= index[U2] | (index + 0xFF000000)[U4]
	// If the index value is less than 65,280 (0xFF00),then VX === U2
	// otherwise VX === U4 with bits 24-31 set
	// When reading an index, if the first byte encountered is 255 (0xFF), then
	// the four-byte form is being used and the first byte should be discarded or masked out.
	getVariableLengthIndex() {

		var firstByte = this.getUint8();

		if ( firstByte === 255 ) {

			return this.getUint8() * 65536 + this.getUint8() * 256 + this.getUint8();

		}

		return firstByte * 256 + this.getUint8();

	}

	// An ID tag is a sequence of 4 bytes containing 7-bit ASCII values
	getIDTag() {

		return this.getString( 4 );

	}

	getString( size ) {

		if ( size === 0 ) return;

		const start = this.offset;

		let result;
		let length;

		if ( size ) {

			length = size;
			result = this._textDecoder.decode( new Uint8Array( this.dv.buffer, start, size ) );

		} else {

			// use 1:1 mapping of buffer to avoid redundant new array creation.
			length = this._bytes.indexOf( 0, start ) - start;

			result = this._textDecoder.decode( new Uint8Array( this.dv.buffer, start, length ) );

			// account for null byte in length
			length ++;

			// if string with terminating nullbyte is uneven, extra nullbyte is added, skip that too
			length += length % 2;

		}

		this.skip( length );

		return result;

	}

	getStringArray( size ) {

		var a = this.getString( size );
		a = a.split( '\0' );

		return a.filter( Boolean ); // return array with any empty strings removed

	}

}


// ************** DEBUGGER  **************

class Debugger {

	constructor() {

		this.active = false;
		this.depth = 0;
		this.formList = [];

	}

	enable() {

		this.active = true;

	}

	log() {

		if ( ! this.active ) return;

		var nodeType;

		switch ( this.node ) {

			case 0:
				nodeType = 'FORM';
				break;

			case 1:
				nodeType = 'CHK';
				break;

			case 2:
				nodeType = 'S-CHK';
				break;

		}

		console.log(
			'| '.repeat( this.depth ) +
			nodeType,
			this.nodeID,
			`( ${this.offset} ) -> ( ${this.dataOffset + this.length} )`,
			( ( this.node == 0 ) ? ' {' : '' ),
			( ( this.skipped ) ? 'SKIPPED' : '' ),
			( ( this.node == 0 && this.skipped ) ? '}' : '' )
		);

		if ( this.node == 0 && ! this.skipped ) {

			this.depth += 1;
			this.formList.push( this.dataOffset + this.length );

		}

		this.skipped = false;

	}

	closeForms() {

		if ( ! this.active ) return;

		for ( var i = this.formList.length - 1; i >= 0; i -- ) {

			if ( this.offset >= this.formList[ i ] ) {

				this.depth -= 1;
				console.log( '| '.repeat( this.depth ) + '}' );
				this.formList.splice( - 1, 1 );

			}

		}

	}

}

// ************** UTILITY FUNCTIONS **************

function isEven( num ) {

	return num % 2;

}

// calculate the length of the string in the buffer
// this will be string.length + nullbyte + optional padbyte to make the length even
function stringOffset( string ) {

	return string.length + 1 + ( isEven( string.length + 1 ) ? 1 : 0 );

}

// for testing purposes, dump buffer to console
// printBuffer( this.reader.dv.buffer, this.reader.offset, length );
function printBuffer( buffer, from, to ) {

	console.log( new TextDecoder().decode( new Uint8Array( buffer, from, to ) ) );

}

export { IFFParser };
