/**
 * @version 1.1.1
 *
 * @author Lewy Blue https://github.com/looeee
 * @author Guilherme Avila https://github/sciecode
 *
 * @desc Load files in LWO3 and LWO2 format on Three.js
 *
 * LWO3 format specification:
 * 	http://static.lightwave3d.com/sdk/2018/html/filefmts/lwo3.html
 *
 * LWO2 format specification:
 * 	http://static.lightwave3d.com/sdk/2018/html/filefmts/lwo2.html
 *
 * Development and test repository:
 *	https://github.com/threejs/lwoloader
 *
 **/

import {
	AddOperation,
	BackSide,
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	Color,
	DefaultLoadingManager,
	DoubleSide,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	FileLoader,
	Float32BufferAttribute,
	FrontSide,
	LineBasicMaterial,
	LineSegments,
	LoaderUtils,
	Mesh,
	MeshPhongMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	Points,
	PointsMaterial,
	RepeatWrapping,
	TextureLoader,
	Vector2
} from "../../../build/three.module.js";

function LWO2Parser( IFFParser ) {

	this.IFF = IFFParser;

}

LWO2Parser.prototype = {

	constructor: LWO2Parser,

	parseBlock: function () {

		this.IFF.debugger.offset = this.IFF.reader.offset;
		this.IFF.debugger.closeForms();

		var blockID = this.IFF.reader.getIDTag();
		var length = this.IFF.reader.getUint32(); // size of data in bytes
		if ( length > this.IFF.reader.dv.byteLength - this.IFF.reader.offset ) {

			this.IFF.reader.offset -= 4;
			length = this.IFF.reader.getUint16();

		}

		this.IFF.debugger.dataOffset = this.IFF.reader.offset;
		this.IFF.debugger.length = length;

		// Data types may be found in either LWO2 OR LWO3 spec
		switch ( blockID ) {

			case 'FORM': // form blocks may consist of sub -chunks or sub-forms
				this.IFF.parseForm( length );
				break;

			// SKIPPED CHUNKS
			// if break; is called directly, the position in the lwoTree is not created
			// any sub chunks and forms are added to the parent form instead
			// MISC skipped
			case 'ICON': // Thumbnail Icon Image
			case 'VMPA': // Vertex Map Parameter
			case 'BBOX': // bounding box
			// case 'VMMD':
			// case 'VTYP':

			// normal maps can be specified, normally on models imported from other applications. Currently ignored
			case 'NORM':

			// ENVL FORM skipped
			case 'PRE ':
			case 'POST':
			case 'KEY ':
			case 'SPAN':

			// CLIP FORM skipped
			case 'TIME':
			case 'CLRS':
			case 'CLRA':
			case 'FILT':
			case 'DITH':
			case 'CONT':
			case 'BRIT':
			case 'SATR':
			case 'HUE ':
			case 'GAMM':
			case 'NEGA':
			case 'IFLT':
			case 'PFLT':

			// Image Map Layer skipped
			case 'PROJ':
			case 'AXIS':
			case 'AAST':
			case 'PIXB':
			case 'AUVO':
			case 'STCK':

			// Procedural Textures skipped
			case 'PROC':
			case 'VALU':
			case 'FUNC':

			// Gradient Textures skipped
			case 'PNAM':
			case 'INAM':
			case 'GRST':
			case 'GREN':
			case 'GRPT':
			case 'FKEY':
			case 'IKEY':

			// Texture Mapping Form skipped
			case 'CSYS':

			// Surface CHUNKs skipped
			case 'OPAQ': // top level 'opacity' checkbox
			case 'CMAP': // clip map

			// Surface node CHUNKS skipped
			// These mainly specify the node editor setup in LW
			case 'NLOC':
			case 'NZOM':
			case 'NVER':
			case 'NSRV':
			case 'NVSK': // unknown
			case 'NCRD':
			case 'WRPW': // image wrap w ( for cylindrical and spherical projections)
			case 'WRPH': // image wrap h
			case 'NMOD':
			case 'NPRW':
			case 'NPLA':
			case 'NODS':
			case 'VERS':
			case 'ENUM':
			case 'TAG ':
			case 'OPAC':

			// Car Material CHUNKS
			case 'CGMD':
			case 'CGTY':
			case 'CGST':
			case 'CGEN':
			case 'CGTS':
			case 'CGTE':
			case 'OSMP':
			case 'OMDE':
			case 'OUTR':
			case 'FLAG':

			case 'TRNL':
			case 'GLOW':
			case 'GVAL': // glow intensity
			case 'SHRP':
			case 'RFOP':
			case 'RSAN':
			case 'TROP':
			case 'RBLR':
			case 'TBLR':
			case 'CLRH':
			case 'CLRF':
			case 'ADTR':
			case 'LINE':
			case 'ALPH':
			case 'VCOL':
			case 'ENAB':
				this.IFF.debugger.skipped = true;
				this.IFF.reader.skip( length );
				break;

			case 'SURF':
				this.IFF.parseSurfaceLwo2( length );
				break;

			case 'CLIP':
				this.IFF.parseClipLwo2( length );
				break;

			// Texture node chunks (not in spec)
			case 'IPIX': // usePixelBlending
			case 'IMIP': // useMipMaps
			case 'IMOD': // imageBlendingMode
			case 'AMOD': // unknown
			case 'IINV': // imageInvertAlpha
			case 'INCR': // imageInvertColor
			case 'IAXS': // imageAxis ( for non-UV maps)
			case 'IFOT': // imageFallofType
			case 'ITIM': // timing for animated textures
			case 'IWRL':
			case 'IUTI':
			case 'IINX':
			case 'IINY':
			case 'IINZ':
			case 'IREF': // possibly a VX for reused texture nodes
				if ( length === 4 ) this.IFF.currentNode[ blockID ] = this.IFF.reader.getInt32();
				else this.IFF.reader.skip( length );
				break;

			case 'OTAG':
				this.IFF.parseObjectTag();
				break;

			case 'LAYR':
				this.IFF.parseLayer( length );
				break;

			case 'PNTS':
				this.IFF.parsePoints( length );
				break;

			case 'VMAP':
				this.IFF.parseVertexMapping( length );
				break;

			case 'AUVU':
			case 'AUVN':
				this.IFF.reader.skip( length - 1 );
				this.IFF.reader.getVariableLengthIndex(); // VX
				break;

			case 'POLS':
				this.IFF.parsePolygonList( length );
				break;

			case 'TAGS':
				this.IFF.parseTagStrings( length );
				break;

			case 'PTAG':
				this.IFF.parsePolygonTagMapping( length );
				break;

			case 'VMAD':
				this.IFF.parseVertexMapping( length, true );
				break;

			// Misc CHUNKS
			case 'DESC': // Description Line
				this.IFF.currentForm.description = this.IFF.reader.getString();
				break;

			case 'TEXT':
			case 'CMNT':
			case 'NCOM':
				this.IFF.currentForm.comment = this.IFF.reader.getString();
				break;

			// Envelope Form
			case 'NAME':
				this.IFF.currentForm.channelName = this.IFF.reader.getString();
				break;

			// Image Map Layer
			case 'WRAP':
				this.IFF.currentForm.wrap = { w: this.IFF.reader.getUint16(), h: this.IFF.reader.getUint16() };
				break;

			case 'IMAG':
				var index = this.IFF.reader.getVariableLengthIndex();
				this.IFF.currentForm.imageIndex = index;
				break;

			// Texture Mapping Form
			case 'OREF':
				this.IFF.currentForm.referenceObject = this.IFF.reader.getString();
				break;

			case 'ROID':
				this.IFF.currentForm.referenceObjectID = this.IFF.reader.getUint32();
				break;

			// Surface Blocks
			case 'SSHN':
				this.IFF.currentSurface.surfaceShaderName = this.IFF.reader.getString();
				break;

			case 'AOVN':
				this.IFF.currentSurface.surfaceCustomAOVName = this.IFF.reader.getString();
				break;

			// Nodal Blocks
			case 'NSTA':
				this.IFF.currentForm.disabled = this.IFF.reader.getUint16();
				break;

			case 'NRNM':
				this.IFF.currentForm.realName = this.IFF.reader.getString();
				break;

			case 'NNME':
				this.IFF.currentForm.refName = this.IFF.reader.getString();
				this.IFF.currentSurface.nodes[ this.IFF.currentForm.refName ] = this.IFF.currentForm;
				break;

			// Nodal Blocks : connections
			case 'INME':
				if ( ! this.IFF.currentForm.nodeName ) this.IFF.currentForm.nodeName = [];
				this.IFF.currentForm.nodeName.push( this.IFF.reader.getString() );
				break;

			case 'IINN':
				if ( ! this.IFF.currentForm.inputNodeName ) this.IFF.currentForm.inputNodeName = [];
				this.IFF.currentForm.inputNodeName.push( this.IFF.reader.getString() );
				break;

			case 'IINM':
				if ( ! this.IFF.currentForm.inputName ) this.IFF.currentForm.inputName = [];
				this.IFF.currentForm.inputName.push( this.IFF.reader.getString() );
				break;

			case 'IONM':
				if ( ! this.IFF.currentForm.inputOutputName ) this.IFF.currentForm.inputOutputName = [];
				this.IFF.currentForm.inputOutputName.push( this.IFF.reader.getString() );
				break;

			case 'FNAM':
				this.IFF.currentForm.fileName = this.IFF.reader.getString();
				break;

			case 'CHAN': // NOTE: ENVL Forms may also have CHAN chunk, however ENVL is currently ignored
				if ( length === 4 ) this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag();
				else this.IFF.reader.skip( length );
				break;

			// LWO2 Spec chunks: these are needed since the SURF FORMs are often in LWO2 format
			case 'SMAN':
				var maxSmoothingAngle = this.IFF.reader.getFloat32();
				this.IFF.currentSurface.attributes.smooth = ( maxSmoothingAngle < 0 ) ? false : true;
				break;

			// LWO2: Basic Surface Parameters
			case 'COLR':
				this.IFF.currentSurface.attributes.Color = { value: this.IFF.reader.getFloat32Array( 3 ) };
				this.IFF.reader.skip( 2 ); // VX: envelope
				break;

			case 'LUMI':
				this.IFF.currentSurface.attributes.Luminosity = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'SPEC':
				this.IFF.currentSurface.attributes.Specular = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'DIFF':
				this.IFF.currentSurface.attributes.Diffuse = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'REFL':
				this.IFF.currentSurface.attributes.Reflection = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'GLOS':
				this.IFF.currentSurface.attributes.Glossiness = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'TRAN':
				this.IFF.currentSurface.attributes.opacity = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'BUMP':
				this.IFF.currentSurface.attributes.bumpStrength = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'SIDE':
				this.IFF.currentSurface.attributes.side = this.IFF.reader.getUint16();
				break;

			case 'RIMG':
				this.IFF.currentSurface.attributes.reflectionMap = this.IFF.reader.getVariableLengthIndex();
				break;

			case 'RIND':
				this.IFF.currentSurface.attributes.refractiveIndex = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'TIMG':
				this.IFF.currentSurface.attributes.refractionMap = this.IFF.reader.getVariableLengthIndex();
				break;

			case 'IMAP':
				this.IFF.reader.skip( 2 );
				break;

			case 'TMAP':
				this.IFF.debugger.skipped = true;
				this.IFF.reader.skip( length ); // needs implementing
				break;

			case 'IUVI': // uv channel name
				this.IFF.currentNode.UVChannel = this.IFF.reader.getString( length );
				break;

			case 'IUTL': // widthWrappingMode: 0 = Reset, 1 = Repeat, 2 = Mirror, 3 = Edge
				this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
				break;
			case 'IVTL': // heightWrappingMode
				this.IFF.currentNode.heightWrappingMode = this.IFF.reader.getUint32();
				break;

			// LWO2 USE
			case 'BLOK':
				// skip
				break;

			default:
				this.IFF.parseUnknownCHUNK( blockID, length );

		}

		if ( blockID != 'FORM' ) {

			this.IFF.debugger.node = 1;
			this.IFF.debugger.nodeID = blockID;
			this.IFF.debugger.log();

		}

		if ( this.IFF.reader.offset >= this.IFF.currentFormEnd ) {

			this.IFF.currentForm = this.IFF.parentForm;

		}

	}

};

function LWO3Parser( IFFParser ) {

	this.IFF = IFFParser;

}

LWO3Parser.prototype = {

	constructor: LWO3Parser,

	parseBlock: function () {

		this.IFF.debugger.offset = this.IFF.reader.offset;
		this.IFF.debugger.closeForms();

		var blockID = this.IFF.reader.getIDTag();
		var length = this.IFF.reader.getUint32(); // size of data in bytes

		this.IFF.debugger.dataOffset = this.IFF.reader.offset;
		this.IFF.debugger.length = length;

		// Data types may be found in either LWO2 OR LWO3 spec
		switch ( blockID ) {

			case 'FORM': // form blocks may consist of sub -chunks or sub-forms
				this.IFF.parseForm( length );
				break;

			// SKIPPED CHUNKS
			// MISC skipped
			case 'ICON': // Thumbnail Icon Image
			case 'VMPA': // Vertex Map Parameter
			case 'BBOX': // bounding box
			// case 'VMMD':
			// case 'VTYP':

			// normal maps can be specified, normally on models imported from other applications. Currently ignored
			case 'NORM':

			// ENVL FORM skipped
			case 'PRE ':
			case 'POST':
			case 'KEY ':
			case 'SPAN':

			// CLIP FORM skipped
			case 'TIME':
			case 'CLRS':
			case 'CLRA':
			case 'FILT':
			case 'DITH':
			case 'CONT':
			case 'BRIT':
			case 'SATR':
			case 'HUE ':
			case 'GAMM':
			case 'NEGA':
			case 'IFLT':
			case 'PFLT':

			// Image Map Layer skipped
			case 'PROJ':
			case 'AXIS':
			case 'AAST':
			case 'PIXB':
			case 'STCK':

			// Procedural Textures skipped
			case 'VALU':

			// Gradient Textures skipped
			case 'PNAM':
			case 'INAM':
			case 'GRST':
			case 'GREN':
			case 'GRPT':
			case 'FKEY':
			case 'IKEY':

			// Texture Mapping Form skipped
			case 'CSYS':

				// Surface CHUNKs skipped
			case 'OPAQ': // top level 'opacity' checkbox
			case 'CMAP': // clip map

			// Surface node CHUNKS skipped
			// These mainly specify the node editor setup in LW
			case 'NLOC':
			case 'NZOM':
			case 'NVER':
			case 'NSRV':
			case 'NCRD':
			case 'NMOD':
			case 'NSEL':
			case 'NPRW':
			case 'NPLA':
			case 'VERS':
			case 'ENUM':
			case 'TAG ':

			// Car Material CHUNKS
			case 'CGMD':
			case 'CGTY':
			case 'CGST':
			case 'CGEN':
			case 'CGTS':
			case 'CGTE':
			case 'OSMP':
			case 'OMDE':
			case 'OUTR':
			case 'FLAG':

			case 'TRNL':
			case 'SHRP':
			case 'RFOP':
			case 'RSAN':
			case 'TROP':
			case 'RBLR':
			case 'TBLR':
			case 'CLRH':
			case 'CLRF':
			case 'ADTR':
			case 'GLOW':
			case 'LINE':
			case 'ALPH':
			case 'VCOL':
			case 'ENAB':
				this.IFF.debugger.skipped = true;
				this.IFF.reader.skip( length );
				break;

			// Texture node chunks (not in spec)
			case 'IPIX': // usePixelBlending
			case 'IMIP': // useMipMaps
			case 'IMOD': // imageBlendingMode
			case 'AMOD': // unknown
			case 'IINV': // imageInvertAlpha
			case 'INCR': // imageInvertColor
			case 'IAXS': // imageAxis ( for non-UV maps)
			case 'IFOT': // imageFallofType
			case 'ITIM': // timing for animated textures
			case 'IWRL':
			case 'IUTI':
			case 'IINX':
			case 'IINY':
			case 'IINZ':
			case 'IREF': // possibly a VX for reused texture nodes
				if ( length === 4 ) this.IFF.currentNode[ blockID ] = this.IFF.reader.getInt32();
				else this.IFF.reader.skip( length );
				break;

			case 'OTAG':
				this.IFF.parseObjectTag();
				break;

			case 'LAYR':
				this.IFF.parseLayer( length );
				break;

			case 'PNTS':
				this.IFF.parsePoints( length );
				break;

			case 'VMAP':
				this.IFF.parseVertexMapping( length );
				break;

			case 'POLS':
				this.IFF.parsePolygonList( length );
				break;

			case 'TAGS':
				this.IFF.parseTagStrings( length );
				break;

			case 'PTAG':
				this.IFF.parsePolygonTagMapping( length );
				break;

			case 'VMAD':
				this.IFF.parseVertexMapping( length, true );
				break;

			// Misc CHUNKS
			case 'DESC': // Description Line
				this.IFF.currentForm.description = this.IFF.reader.getString();
				break;

			case 'TEXT':
			case 'CMNT':
			case 'NCOM':
				this.IFF.currentForm.comment = this.IFF.reader.getString();
				break;

			// Envelope Form
			case 'NAME':
				this.IFF.currentForm.channelName = this.IFF.reader.getString();
				break;

			// Image Map Layer
			case 'WRAP':
				this.IFF.currentForm.wrap = { w: this.IFF.reader.getUint16(), h: this.IFF.reader.getUint16() };
				break;

			case 'IMAG':
				var index = this.IFF.reader.getVariableLengthIndex();
				this.IFF.currentForm.imageIndex = index;
				break;

			// Texture Mapping Form
			case 'OREF':
				this.IFF.currentForm.referenceObject = this.IFF.reader.getString();
				break;

			case 'ROID':
				this.IFF.currentForm.referenceObjectID = this.IFF.reader.getUint32();
				break;

			// Surface Blocks
			case 'SSHN':
				this.IFF.currentSurface.surfaceShaderName = this.IFF.reader.getString();
				break;

			case 'AOVN':
				this.IFF.currentSurface.surfaceCustomAOVName = this.IFF.reader.getString();
				break;

			// Nodal Blocks
			case 'NSTA':
				this.IFF.currentForm.disabled = this.IFF.reader.getUint16();
				break;

			case 'NRNM':
				this.IFF.currentForm.realName = this.IFF.reader.getString();
				break;

			case 'NNME':
				this.IFF.currentForm.refName = this.IFF.reader.getString();
				this.IFF.currentSurface.nodes[ this.IFF.currentForm.refName ] = this.IFF.currentForm;
				break;

			// Nodal Blocks : connections
			case 'INME':
				if ( ! this.IFF.currentForm.nodeName ) this.IFF.currentForm.nodeName = [];
				this.IFF.currentForm.nodeName.push( this.IFF.reader.getString() );
				break;

			case 'IINN':
				if ( ! this.IFF.currentForm.inputNodeName ) this.IFF.currentForm.inputNodeName = [];
				this.IFF.currentForm.inputNodeName.push( this.IFF.reader.getString() );
				break;

			case 'IINM':
				if ( ! this.IFF.currentForm.inputName ) this.IFF.currentForm.inputName = [];
				this.IFF.currentForm.inputName.push( this.IFF.reader.getString() );
				break;

			case 'IONM':
				if ( ! this.IFF.currentForm.inputOutputName ) this.IFF.currentForm.inputOutputName = [];
				this.IFF.currentForm.inputOutputName.push( this.IFF.reader.getString() );
				break;

			case 'FNAM':
				this.IFF.currentForm.fileName = this.IFF.reader.getString();
				break;

			case 'CHAN': // NOTE: ENVL Forms may also have CHAN chunk, however ENVL is currently ignored
				if ( length === 4 ) this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag();
				else this.IFF.reader.skip( length );
				break;

			// LWO2 Spec chunks: these are needed since the SURF FORMs are often in LWO2 format
			case 'SMAN':
				var maxSmoothingAngle = this.IFF.reader.getFloat32();
				this.IFF.currentSurface.attributes.smooth = ( maxSmoothingAngle < 0 ) ? false : true;
				break;

			// LWO2: Basic Surface Parameters
			case 'COLR':
				this.IFF.currentSurface.attributes.Color = { value: this.IFF.reader.getFloat32Array( 3 ) };
				this.IFF.reader.skip( 2 ); // VX: envelope
				break;

			case 'LUMI':
				this.IFF.currentSurface.attributes.Luminosity = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'SPEC':
				this.IFF.currentSurface.attributes.Specular = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'DIFF':
				this.IFF.currentSurface.attributes.Diffuse = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'REFL':
				this.IFF.currentSurface.attributes.Reflection = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'GLOS':
				this.IFF.currentSurface.attributes.Glossiness = { value: this.IFF.reader.getFloat32() };
				this.IFF.reader.skip( 2 );
				break;

			case 'TRAN':
				this.IFF.currentSurface.attributes.opacity = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'BUMP':
				this.IFF.currentSurface.attributes.bumpStrength = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'SIDE':
				this.IFF.currentSurface.attributes.side = this.IFF.reader.getUint16();
				break;

			case 'RIMG':
				this.IFF.currentSurface.attributes.reflectionMap = this.IFF.reader.getVariableLengthIndex();
				break;

			case 'RIND':
				this.IFF.currentSurface.attributes.refractiveIndex = this.IFF.reader.getFloat32();
				this.IFF.reader.skip( 2 );
				break;

			case 'TIMG':
				this.IFF.currentSurface.attributes.refractionMap = this.IFF.reader.getVariableLengthIndex();
				break;

			case 'IMAP':
				this.IFF.currentSurface.attributes.imageMapIndex = this.IFF.reader.getUint32();
				break;

			case 'IUVI': // uv channel name
				this.IFF.currentNode.UVChannel = this.IFF.reader.getString( length );
				break;

			case 'IUTL': // widthWrappingMode: 0 = Reset, 1 = Repeat, 2 = Mirror, 3 = Edge
				this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
				break;
			case 'IVTL': // heightWrappingMode
				this.IFF.currentNode.heightWrappingMode = this.IFF.reader.getUint32();
				break;

			default:
				this.IFF.parseUnknownCHUNK( blockID, length );

		}

		if ( blockID != 'FORM' ) {

			this.IFF.debugger.node = 1;
			this.IFF.debugger.nodeID = blockID;
			this.IFF.debugger.log();

		}

		if ( this.IFF.reader.offset >= this.IFF.currentFormEnd ) {

			this.IFF.currentForm = this.IFF.parentForm;

		}

	}

};

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

function IFFParser( ) {

	this.debugger = new Debugger();
	// this.debugger.enable(); // un-comment to log IFF hierarchy.

}

IFFParser.prototype = {

	constructor: IFFParser,

	parse: function ( buffer ) {

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

	},

	parseTopForm() {

		this.debugger.offset = this.reader.offset;

		var topForm = this.reader.getIDTag();

		if ( topForm !== 'FORM' ) {

			console.warn( "LWOLoader: Top-level FORM missing." );
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

	},


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

	},

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


	},

	skipForm( length ) {

		this.reader.skip( length - 4 );

	},

	parseUnknownForm( type, length ) {

		console.warn( 'LWOLoader: unknown FORM encountered: ' + type, length );

		printBuffer( this.reader.dv.buffer, this.reader.offset, length - 4 );
		this.reader.skip( length - 4 );

	},

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

	},

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

	},

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


	},

	// collect attributes from all nodes at the top level of a surface
	parseConnections( length ) {

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		this.currentForm = this.currentSurface.connections;

	},

	// surface node attribute data, e.g. specular, roughness etc
	parseEntryForm( length ) {

		this.reader.skip( 8 ); // NAME + length
		var name = this.reader.getString();
		this.currentForm = this.currentNode.attributes;

		this.setupForm( name, length );

	},

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

	},

	// holds various data about texture node image state
	// Data other thanmipMapLevel unknown
	parseImageStateForm() {

		this.reader.skip( 8 ); // unknown

		this.currentForm.mipMapLevel = this.reader.getFloat32();

	},

	// LWO2 style image data node OR LWO3 textures defined at top level in editor (not as SURF node)
	parseImageMap( length ) {

		this.currentFormEnd = this.reader.offset + length;
		this.parentForm = this.currentForm;

		if ( ! this.currentForm.maps ) this.currentForm.maps = [];

		var map = {};
		this.currentForm.maps.push( map );
		this.currentForm = map;

		this.reader.skip( 10 ); // unknown, could be an issue if it contains a VX

	},

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


	},

	// ENVL forms are currently ignored
	parseEnvelope( length ) {

		this.reader.skip( length - 4 ); // skipping  entirely for now

	},

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

	},

	parseClipLwo2( length ) {

		var texture = {
			index: this.reader.getUint32(),
			fileName: ""
		};

		// seach STIL block
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

	},

	parseImage() {

		this.reader.skip( 8 ); // unknown
		this.currentForm.fileName = this.reader.getString();

	},

	parseXVAL( type, length ) {

		var endOffset = this.reader.offset + length - 4;
		this.reader.skip( 8 );

		this.currentForm[ type ] = this.reader.getFloat32();

		this.reader.setOffset( endOffset ); // set end offset directly to skip optional envelope

	},

	parseXVAL3( type, length ) {

		var endOffset = this.reader.offset + length - 4;
		this.reader.skip( 8 );

		this.currentForm[ type ] = {
			x: this.reader.getFloat32(),
			y: this.reader.getFloat32(),
			z: this.reader.getFloat32(),
		};

		this.reader.setOffset( endOffset );

	},

	// Tags associated with an object
	// OTAG { type[ID4], tag-string[S0] }
	parseObjectTag() {

		if ( ! this.tree.objectTags ) this.tree.objectTags = {};

		this.tree.objectTags[ this.reader.getIDTag() ] = {
			tagString: this.reader.getString()
		};

	},

	// Signals the start of a new layer. All the data chunks which follow will be included in this layer until another layer chunk is encountered.
	// LAYR: number[U2], flags[U2], pivot[VEC12], name[S0], parent[U2]
	parseLayer( length ) {

		var layer = {
			number: this.reader.getUint16(),
			flags: this.reader.getUint16(), // If the least significant bit of flags is set, the layer is hidden.
			pivot: this.reader.getFloat32Array( 3 ), // Note: this seems to be superflous, as the geometry is translated when pivot is present
			name: this.reader.getString(),
		};

		this.tree.layers.push( layer );
		this.currentLayer = layer;

		var parsedLength = 16 + stringOffset( this.currentLayer.name ); // index ( 2 ) + flags( 2 ) + pivot( 12 ) + stringlength

		// if we have not reached then end of the layer block, there must be a parent defined
		this.currentLayer.parent = ( parsedLength < length ) ? this.reader.getUint16() : - 1; // omitted or -1 for no parent

	},

	// VEC12 * ( F4 + F4 + F4 ) array of x,y,z vectors
	// Converting from left to right handed coordinate system:
	// x -> -x and switch material FrontSide -> BackSide
	parsePoints( length ) {

		this.currentPoints = [];
		for ( var i = 0; i < length / 4; i += 3 ) {

			// z -> -z to match three.js right handed coords
			this.currentPoints.push( this.reader.getFloat32(), this.reader.getFloat32(), - this.reader.getFloat32() );

		}

	},

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

	},

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

	},

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

	},

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

	},

	// Lists the tag strings that can be associated with polygons by the PTAG chunk.
	// TAGS { tag-string[S0] * }
	parseTagStrings( length ) {

		this.tree.tags = this.reader.getStringArray( length );

	},

	// Associates tags of a given type with polygons in the most recent POLS chunk.
	// PTAG { type[ID4], ( poly[VX], tag[U2] ) * }
	parsePolygonTagMapping( length ) {

		var finalOffset = this.reader.offset + length;
		var type = this.reader.getIDTag();
		if ( type === 'SURF' ) this.parseMaterialIndices( finalOffset );
		else { //PART, SMGP, COLR not supported

			this.reader.skip( length - 4 );

		}

	},

	parseMaterialIndices( finalOffset ) {

		// array holds polygon index followed by material index
		this.currentLayer.geometry.materialIndices = [];

		while ( this.reader.offset < finalOffset ) {

			var polygonIndex = this.reader.getVariableLengthIndex();
			var materialIndex = this.reader.getUint16();

			this.currentLayer.geometry.materialIndices.push( polygonIndex, materialIndex );

		}

	},

	parseUnknownCHUNK( blockID, length ) {

		console.warn( 'LWOLoader: unknown chunk type: ' + blockID + ' length: ' + length );

		// print the chunk plus some bytes padding either side
		// printBuffer( this.reader.dv.buffer, this.reader.offset - 20, length + 40 );

		var data = this.reader.getString( length );

		this.currentForm[ blockID ] = data;

	}

};

function DataViewReader( buffer ) {

	this.dv = new DataView( buffer );
	this.offset = 0;

}

DataViewReader.prototype = {

	constructor: DataViewReader,

	size: function () {

		return this.dv.buffer.byteLength;

	},

	setOffset( offset ) {

		if ( offset > 0 && offset < this.dv.buffer.byteLength ) {

			this.offset = offset;

		} else {

			console.error( 'LWOLoader: invalid buffer offset' );

		}

	},

	endOfFile: function () {

		if ( this.offset >= this.size() ) return true;
		return false;

	},

	skip: function ( length ) {

		this.offset += length;

	},

	getUint8: function () {

		var value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	},

	getUint16: function () {

		var value = this.dv.getUint16( this.offset );
		this.offset += 2;
		return value;

	},

	getInt32: function () {

		var value = this.dv.getInt32( this.offset, false );
		this.offset += 4;
		return value;

	},

	getUint32: function () {

		var value = this.dv.getUint32( this.offset, false );
		this.offset += 4;
		return value;

	},

	getUint64: function () {

		var low, high;

		high = this.getUint32();
		low = this.getUint32();
		return high * 0x100000000 + low;

	},

	getFloat32: function () {

		var value = this.dv.getFloat32( this.offset, false );
		this.offset += 4;
		return value;

	},

	getFloat32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	},

	getFloat64: function () {

		var value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	},

	getFloat64Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	},

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

	},

	// An ID tag is a sequence of 4 bytes containing 7-bit ASCII values
	getIDTag() {

		return this.getString( 4 );

	},

	getString: function ( size ) {

		if ( size === 0 ) return;

		// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
		var a = [];

		if ( size ) {

			for ( var i = 0; i < size; i ++ ) {

				a[ i ] = this.getUint8();

			}

		} else {

			var currentChar;
			var len = 0;

			while ( currentChar !== 0 ) {

				currentChar = this.getUint8();
				if ( currentChar !== 0 ) a.push( currentChar );
				len ++;

			}

			if ( ! isEven( len + 1 ) ) this.getUint8(); // if string with terminating nullbyte is uneven, extra nullbyte is added

		}

		return LoaderUtils.decodeText( new Uint8Array( a ) );

	},

	getStringArray: function ( size ) {

		var a = this.getString( size );
		a = a.split( '\0' );

		return a.filter( Boolean ); // return array with any empty strings removed

	}

};

// ************** DEBUGGER  **************

function Debugger( ) {

	this.active = false;
	this.depth = 0;
	this.formList = [];

}

Debugger.prototype = {

	constructor: Debugger,

	enable: function () {

		this.active = true;

	},

	log: function () {

		if ( ! this.active ) return;

		var nodeType;

		switch ( this.node ) {

			case 0:
				nodeType = "FORM";
				break;

			case 1:
				nodeType = "CHK";
				break;

			case 2:
				nodeType = "S-CHK";
				break;

		}

		console.log(
			"| ".repeat( this.depth ) +
			nodeType,
			this.nodeID,
			`( ${this.offset} ) -> ( ${this.dataOffset + this.length} )`,
			( ( this.node == 0 ) ? " {" : "" ),
			( ( this.skipped ) ? "SKIPPED" : "" ),
			( ( this.node == 0 && this.skipped ) ? "}" : "" )
		);

		if ( this.node == 0 && ! this.skipped ) {

			this.depth += 1;
			this.formList.push( this.dataOffset + this.length );

		}

		this.skipped = false;

	},

	closeForms: function () {

		if ( ! this.active ) return;

		for ( var i = this.formList.length - 1; i >= 0; i -- ) {

			if ( this.offset >= this.formList[ i ] ) {

				this.depth -= 1;
				console.log( "| ".repeat( this.depth ) + "}" );
				this.formList.splice( - 1, 1 );

			}

		}

	}

};

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

	console.log( LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) ) );

}

var lwoTree;

var LWOLoader = function ( manager, parameters ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	parameters = parameters || {};

	this.resourcePath = ( parameters.resourcePath !== undefined ) ? parameters.resourcePath : undefined;

};

LWOLoader.prototype = {

	constructor: LWOLoader,

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var self = this;

		var path = ( self.path === undefined ) ? extractParentUrl( url, 'Objects' ) : self.path;

		// give the mesh a default name based on the filename
		var modelName = url.split( path ).pop().split( '.' )[ 0 ];

		var loader = new FileLoader( this.manager );
		loader.setPath( self.path );
		loader.setResponseType( 'arraybuffer' );

		loader.load( url, function ( buffer ) {

			// console.time( 'Total parsing: ' );
			onLoad( self.parse( buffer, path, modelName ) );
			// console.timeEnd( 'Total parsing: ' );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	setResourcePath: function ( value ) {

		this.resourcePath = value;
		return this;

	},

	parse: function ( iffBuffer, path, modelName ) {

		lwoTree = new IFFParser().parse( iffBuffer );

		// console.log( 'lwoTree', lwoTree );

		var textureLoader = new TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		return new LWOTreeParser( textureLoader ).parse( modelName );

	}

};

// Parse the lwoTree object
function LWOTreeParser( textureLoader ) {

	this.textureLoader = textureLoader;

}

LWOTreeParser.prototype = {

	constructor: LWOTreeParser,

	parse: function ( modelName ) {

		this.materials = new MaterialParser( this.textureLoader ).parse();
		this.defaultLayerName = modelName;

		this.meshes = this.parseLayers();

		return {
			materials: this.materials,
			meshes: this.meshes,
		};

	},

	parseLayers() {

		// array of all meshes for building hierarchy
		var meshes = [];

		// final array containing meshes with scene graph hierarchy set up
		var finalMeshes = [];

		var geometryParser = new GeometryParser();

		var self = this;
		lwoTree.layers.forEach( function ( layer ) {

			var geometry = geometryParser.parse( layer.geometry, layer );

			var mesh = self.parseMesh( geometry, layer );

			meshes[ layer.number ] = mesh;

			if ( layer.parent === - 1 ) finalMeshes.push( mesh );
			else meshes[ layer.parent ].add( mesh );


		} );

		this.applyPivots( finalMeshes );

		return finalMeshes;

	},

	parseMesh( geometry, layer ) {

		var mesh;

		var materials = this.getMaterials( geometry.userData.matNames, layer.geometry.type );

		this.duplicateUVs( geometry, materials );

		if ( layer.geometry.type === 'points' ) mesh = new Points( geometry, materials );
		else if ( layer.geometry.type === 'lines' ) mesh = new LineSegments( geometry, materials );
		else mesh = new Mesh( geometry, materials );

		if ( layer.name ) mesh.name = layer.name;
		else mesh.name = this.defaultLayerName + '_layer_' + layer.number;

		mesh.userData.pivot = layer.pivot;

		return mesh;

	},

	// TODO: may need to be reversed in z to convert LWO to three.js coordinates
	applyPivots( meshes ) {

		meshes.forEach( function ( mesh ) {

			mesh.traverse( function ( child ) {

				var pivot = child.userData.pivot;

				child.position.x += pivot[ 0 ];
				child.position.y += pivot[ 1 ];
				child.position.z += pivot[ 2 ];

				if ( child.parent ) {

					var parentPivot = child.parent.userData.pivot;

					child.position.x -= parentPivot[ 0 ];
					child.position.y -= parentPivot[ 1 ];
					child.position.z -= parentPivot[ 2 ];

				}

			} );

		} );

	},

	getMaterials( namesArray, type ) {

		var materials = [];

		var self = this;

		namesArray.forEach( function ( name, i ) {

			materials[ i ] = self.getMaterialByName( name );

		} );

		// convert materials to line or point mats if required
		if ( type === 'points' || type === 'lines' ) {

			materials.forEach( function ( mat, i ) {

				var spec = {
					color: mat.color,
				};

				if ( type === 'points' ) {

					spec.size = 0.1;
					spec.map = mat.map;
					spec.morphTargets = mat.morphTargets;
					materials[ i ] = new PointsMaterial( spec );

				} else if ( type === 'lines' ) {

					materials[ i ] = new LineBasicMaterial( spec );

				}

			} );

		}

		// if there is only one material, return that directly instead of array
		var filtered = materials.filter( Boolean );
		if ( filtered.length === 1 ) return filtered[ 0 ];

		return materials;

	},

	getMaterialByName( name ) {

		return this.materials.filter( function ( m ) {

			return m.name === name;

		} )[ 0 ];

	},

	// If the material has an aoMap, duplicate UVs
	duplicateUVs( geometry, materials ) {

		var duplicateUVs = false;

		if ( ! Array.isArray( materials ) ) {

			if ( materials.aoMap ) duplicateUVs = true;

		} else {

			materials.forEach( function ( material ) {

				if ( material.aoMap ) duplicateUVs = true;

			} );

		}

		if ( ! duplicateUVs ) return;

		geometry.addAttribute( 'uv2', new BufferAttribute( geometry.attributes.uv.array, 2 ) );

	},

};

function MaterialParser( textureLoader ) {

	this.textureLoader = textureLoader;

}

MaterialParser.prototype = {

	constructor: MaterialParser,

	parse: function () {

		var materials = [];
		this.textures = {};

		for ( var name in lwoTree.materials ) {

			if ( lwoTree.format === 'LWO3' ) {

				materials.push( this.parseMaterial( lwoTree.materials[ name ], name, lwoTree.textures ) );

			} else if ( lwoTree.format === 'LWO2' ) {

				materials.push( this.parseMaterialLwo2( lwoTree.materials[ name ], name, lwoTree.textures ) );

			}

		}

		return materials;

	},

	parseMaterial( materialData, name, textures ) {

		var params = {
			name: name,
			side: this.getSide( materialData.attributes ),
			flatShading: this.getSmooth( materialData.attributes ),
		};

		var connections = this.parseConnections( materialData.connections, materialData.nodes );

		var maps = this.parseTextureNodes( connections.maps );

		this.parseAttributeImageMaps( connections.attributes, textures, maps, materialData.maps );

		var attributes = this.parseAttributes( connections.attributes, maps );

		this.parseEnvMap( connections, maps, attributes );

		params = Object.assign( maps, params );
		params = Object.assign( params, attributes );

		var materialType = this.getMaterialType( connections.attributes );

		return new materialType( params );

	},

	parseMaterialLwo2( materialData, name/*, textures*/ ) {

		var params = {
			name: name,
			side: this.getSide( materialData.attributes ),
			flatShading: this.getSmooth( materialData.attributes ),
		};

		var attributes = this.parseAttributes( materialData.attributes, {} );
		params = Object.assign( params, attributes );
		return new MeshPhongMaterial( params );

	},

	// Note: converting from left to right handed coords by switching x -> -x in vertices, and
	// then switching mat FrontSide -> BackSide
	// NB: this means that FrontSide and BackSide have been switched!
	getSide( attributes ) {

		if ( ! attributes.side ) return BackSide;

		switch ( attributes.side ) {

			case 0:
			case 1:
				return BackSide;
			case 2: return FrontSide;
			case 3: return DoubleSide;

		}

	},

	getSmooth( attributes ) {

		if ( ! attributes.smooth ) return true;
		return ! attributes.smooth;

	},

	parseConnections( connections, nodes ) {

		var materialConnections = {
			maps: {}
		};

		var inputName = connections.inputName;
		var inputNodeName = connections.inputNodeName;
		var nodeName = connections.nodeName;

		var self = this;
		inputName.forEach( function ( name, index ) {

			if ( name === 'Material' ) {

				var matNode = self.getNodeByRefName( inputNodeName[ index ], nodes );
				materialConnections.attributes = matNode.attributes;
				materialConnections.envMap = matNode.fileName;
				materialConnections.name = inputNodeName[ index ];

			}

		} );

		nodeName.forEach( function ( name, index ) {

			if ( name === materialConnections.name ) {

				materialConnections.maps[ inputName[ index ] ] = self.getNodeByRefName( inputNodeName[ index ], nodes );

			}

		} );

		return materialConnections;

	},

	getNodeByRefName( refName, nodes ) {

		for ( var name in nodes ) {

			if ( nodes[ name ].refName === refName ) return nodes[ name ];

		}

	},

	parseTextureNodes( textureNodes ) {

		var maps = {};

		for ( var name in textureNodes ) {

			var node = textureNodes[ name ];
			var path = node.fileName;

			if ( ! path ) return;

			var texture = this.loadTexture( path );

			if ( node.widthWrappingMode !== undefined ) texture.wrapS = this.getWrappingType( node.widthWrappingMode );
			if ( node.heightWrappingMode !== undefined ) texture.wrapT = this.getWrappingType( node.heightWrappingMode );

			switch ( name ) {

				case 'Color':
					maps.map = texture;
					break;
				case 'Roughness':
					maps.roughnessMap = texture;
					maps.roughness = 0.5;
					break;
				case 'Specular':
					maps.specularMap = texture;
					maps.specular = 0xffffff;
					break;
				case 'Luminous':
					maps.emissiveMap = texture;
					maps.emissive = 0x808080;
					break;
				case 'Luminous Color':
					maps.emissive = 0x808080;
					break;
				case 'Metallic':
					maps.metalnessMap = texture;
					maps.metalness = 0.5;
					break;
				case 'Transparency':
				case 'Alpha':
					maps.alphaMap = texture;
					maps.transparent = true;
					break;
				case 'Normal':
					maps.normalMap = texture;
					if ( node.amplitude !== undefined ) maps.normalScale = new Vector2( node.amplitude, node.amplitude );
					break;
				case 'Bump':
					maps.bumpMap = texture;
					break;

			}

		}

		// LWO BSDF materials can have both spec and rough, but this is not valid in three
		if ( maps.roughnessMap && maps.specularMap ) delete maps.specularMap;

		return maps;

	},

	// maps can also be defined on individual material attributes, parse those here
	// This occurs on Standard (Phong) surfaces
	parseAttributeImageMaps( attributes, textures, maps ) {

		for ( var name in attributes ) {

			var attribute = attributes[ name ];

			if ( attribute.maps ) {

				var mapData = attribute.maps[ 0 ];

				var path = this.getTexturePathByIndex( mapData.imageIndex, textures );
				if ( ! path ) return;

				var texture = this.loadTexture( path );

				if ( mapData.wrap !== undefined ) texture.wrapS = this.getWrappingType( mapData.wrap.w );
				if ( mapData.wrap !== undefined ) texture.wrapT = this.getWrappingType( mapData.wrap.h );

				switch ( name ) {

					case 'Color':
						maps.map = texture;
						break;
					case 'Diffuse':
						maps.aoMap = texture;
						break;
					case 'Roughness':
						maps.roughnessMap = texture;
						maps.roughness = 1;
						break;
					case 'Specular':
						maps.specularMap = texture;
						maps.specular = 0xffffff;
						break;
					case 'Luminosity':
						maps.emissiveMap = texture;
						maps.emissive = 0x808080;
						break;
					case 'Metallic':
						maps.metalnessMap = texture;
						maps.metalness = 1;
						break;
					case 'Transparency':
					case 'Alpha':
						maps.alphaMap = texture;
						maps.transparent = true;
						break;
					case 'Normal':
						maps.normalMap = texture;
						break;
					case 'Bump':
						maps.bumpMap = texture;
						break;

				}

			}

		}

	},

	parseAttributes( attributes, maps ) {

		var params = {};

		// don't use color data if color map is present
		if ( attributes.Color && ! maps.map ) {

			params.color = new Color().fromArray( attributes.Color.value );

		} else params.color = new Color();


		if ( attributes.Transparency && attributes.Transparency.value !== 0 ) {

			params.opacity = 1 - attributes.Transparency.value;
			params.transparent = true;

		}

		if ( attributes[ 'Bump Height' ] ) params.bumpScale = attributes[ 'Bump Height' ].value * 0.1;

		if ( attributes[ 'Refraction Index' ] ) params.refractionRatio = 1 / attributes[ 'Refraction Index' ].value;

		this.parsePhysicalAttributes( params, attributes, maps );
		this.parseStandardAttributes( params, attributes, maps );
		this.parsePhongAttributes( params, attributes, maps );

		return params;

	},

	parsePhysicalAttributes( params, attributes/*, maps*/ ) {

		if ( attributes.Clearcoat && attributes.Clearcoat.value > 0 ) {

			params.clearCoat = attributes.Clearcoat.value;

			if ( attributes[ 'Clearcoat Gloss' ] ) {

				params.clearCoatRoughness = 0.5 * ( 1 - attributes[ 'Clearcoat Gloss' ].value );

			}

		}

	},

	parseStandardAttributes( params, attributes, maps ) {


		if ( attributes.Luminous ) {

			params.emissiveIntensity = attributes.Luminous.value;

			if ( attributes[ 'Luminous Color' ] && ! maps.emissive ) {

				params.emissive = new Color().fromArray( attributes[ 'Luminous Color' ].value );

			} else {

				params.emissive = new Color( 0x808080 );

			}

		}

		if ( attributes.Roughness && ! maps.roughnessMap ) params.roughness = attributes.Roughness.value;
		if ( attributes.Metallic && ! maps.metalnessMap ) params.metalness = attributes.Metallic.value;

	},

	parsePhongAttributes( params, attributes, maps ) {

		if ( attributes.Diffuse ) params.color.multiplyScalar( attributes.Diffuse.value );

		if ( attributes.Reflection ) {

			params.reflectivity = attributes.Reflection.value;
			params.combine = AddOperation;

		}

		if ( attributes.Luminosity ) {

			params.emissiveIntensity = attributes.Luminosity.value;

			if ( ! maps.emissiveMap && ! maps.map ) {

				params.emissive = params.color;

			} else {

				params.emissive = new Color( 0x808080 );

			}

		}

		// parse specular if there is no roughness - we will interpret the material as 'Phong' in this case
		if ( ! attributes.Roughness && attributes.Specular && ! maps.specularMap ) {

			if ( attributes[ 'Color Highlight' ] ) {

				params.specular = new Color().setScalar( attributes.Specular.value ).lerp( params.color.clone().multiplyScalar( attributes.Specular.value ), attributes[ 'Color Highlight' ].value );

			} else {

				params.specular = new Color().setScalar( attributes.Specular.value );

			}

		}

		if ( params.specular && attributes.Glossiness ) params.shininess = 7 + Math.pow( 2, attributes.Glossiness.value * 12 + 2 );

	},

	parseEnvMap( connections, maps, attributes ) {

		if ( connections.envMap ) {

			var envMap = this.loadTexture( connections.envMap );

			if ( attributes.transparent && attributes.opacity < 0.999 ) {

				envMap.mapping = EquirectangularRefractionMapping;

				// Reflectivity and refraction mapping don't work well together in Phong materials
				if ( attributes.reflectivity !== undefined ) {

					delete attributes.reflectivity;
					delete attributes.combine;

				}

				if ( attributes.metalness !== undefined ) {

					delete attributes.metalness;

				}

			} else envMap.mapping = EquirectangularReflectionMapping;

			maps.envMap = envMap;

		}

	},

	// get texture defined at top level by its index
	getTexturePathByIndex( index ) {

		var fileName = '';

		if ( ! lwoTree.textures ) return fileName;

		lwoTree.textures.forEach( function ( texture ) {

			if ( texture.index === index ) fileName = texture.fileName;

		} );

		return fileName;

	},

	loadTexture( path ) {

		if ( ! path ) return null;

		var texture;

		texture = this.textureLoader.load(
			path,
			undefined,
			undefined,
			function () {

				console.warn( 'LWOLoader: non-standard resource hierarchy. Use \`resourcePath\` parameter to specify root content directory.' );

			}
		);

		return texture;

	},

	// 0 = Reset, 1 = Repeat, 2 = Mirror, 3 = Edge
	getWrappingType( num ) {

		switch ( num ) {

			case 0:
				console.warn( 'LWOLoader: "Reset" texture wrapping type is not supported in three.js' );
				return ClampToEdgeWrapping;
			case 1: return RepeatWrapping;
			case 2: return MirroredRepeatWrapping;
			case 3: return ClampToEdgeWrapping;

		}

	},

	getMaterialType( nodeData ) {

		if ( nodeData.Clearcoat && nodeData.Clearcoat.value > 0 ) return MeshPhysicalMaterial;
		if ( nodeData.Roughness ) return MeshStandardMaterial;
		return MeshPhongMaterial;

	}

};

function GeometryParser() {}

GeometryParser.prototype = {

	constructor: GeometryParser,

	parse( geoData, layer ) {

		var geometry = new BufferGeometry();

		geometry.addAttribute( 'position', new Float32BufferAttribute( geoData.points, 3 ) );

		var indices = this.splitIndices( geoData.vertexIndices, geoData.polygonDimensions );
		geometry.setIndex( indices );

		this.parseGroups( geometry, geoData );

		geometry.computeVertexNormals();

		this.parseUVs( geometry, layer, indices );
		this.parseMorphTargets( geometry, layer, indices );

		// TODO: z may need to be reversed to account for coordinate system change
		geometry.translate( - layer.pivot[ 0 ], - layer.pivot[ 1 ], - layer.pivot[ 2 ] );

		// var userData = geometry.userData;
		// geometry = geometry.toNonIndexed()
		// geometry.userData = userData;

		return geometry;

	},

	// split quads into tris
	splitIndices( indices, polygonDimensions ) {

		var remappedIndices = [];

		var i = 0;
		polygonDimensions.forEach( function ( dim ) {

			if ( dim < 4 ) {

				for ( var k = 0; k < dim; k ++ ) remappedIndices.push( indices[ i + k ] );

			} else if ( dim === 4 ) {

				remappedIndices.push(
					indices[ i ],
					indices[ i + 1 ],
					indices[ i + 2 ],

					indices[ i ],
					indices[ i + 2 ],
					indices[ i + 3 ]

				);

			} else if ( dim > 4 ) {

				for ( var k = 1; k < dim - 1; k ++ ) {

					remappedIndices.push( indices[ i ], indices[ i + k ], indices[ i + k + 1 ] );

				}

				console.warn( 'LWOLoader: polygons with greater than 4 sides are not supported' );

			}

			i += dim;

		} );

		return remappedIndices;

	},

	// NOTE: currently ignoring poly indices and assuming that they are intelligently ordered
	parseGroups( geometry, geoData ) {

		var tags = lwoTree.tags;
		var matNames = [];

		var elemSize = 3;
		if ( geoData.type === 'lines' ) elemSize = 2;
		if ( geoData.type === 'points' ) elemSize = 1;

		var remappedIndices = this.splitMaterialIndices( geoData.polygonDimensions, geoData.materialIndices );

		var indexNum = 0; // create new indices in numerical order
		var indexPairs = {}; // original indices mapped to numerical indices

		var prevMaterialIndex;

		var prevStart = 0;
		var currentCount = 0;

		for ( var i = 0; i < remappedIndices.length; i += 2 ) {

			var materialIndex = remappedIndices[ i + 1 ];

			if ( i === 0 ) matNames[ indexNum ] = tags[ materialIndex ];

			if ( prevMaterialIndex === undefined ) prevMaterialIndex = materialIndex;

			if ( materialIndex !== prevMaterialIndex ) {

				var currentIndex;
				if ( indexPairs[ tags[ prevMaterialIndex ] ] ) {

					currentIndex = indexPairs[ tags[ prevMaterialIndex ] ];

				} else {

					currentIndex = indexNum;
					indexPairs[ tags[ prevMaterialIndex ] ] = indexNum;
					matNames[ indexNum ] = tags[ prevMaterialIndex ];
					indexNum ++;

				}

				geometry.addGroup( prevStart, currentCount, currentIndex );

				prevStart += currentCount;

				prevMaterialIndex = materialIndex;
				currentCount = 0;

			}

			currentCount += elemSize;

		}

		// the loop above doesn't add the last group, do that here.
		if ( geometry.groups.length > 0 ) {

			var currentIndex;
			if ( indexPairs[ tags[ materialIndex ] ] ) {

				currentIndex = indexPairs[ tags[ materialIndex ] ];

			} else {

				currentIndex = indexNum;
				indexPairs[ tags[ materialIndex ] ] = indexNum;
				matNames[ indexNum ] = tags[ materialIndex ];

			}

			geometry.addGroup( prevStart, currentCount, currentIndex );

		}

		// Mat names from TAGS chunk, used to build up an array of materials for this geometry
		geometry.userData.matNames = matNames;

	},

	splitMaterialIndices( polygonDimensions, indices ) {

		var remappedIndices = [];

		polygonDimensions.forEach( function ( dim, i ) {

			if ( dim <= 3 ) {

				remappedIndices.push( indices[ i * 2 ], indices[ i * 2 + 1 ] );

			} else if ( dim === 4 ) {

				remappedIndices.push( indices[ i * 2 ], indices[ i * 2 + 1 ], indices[ i * 2 ], indices[ i * 2 + 1 ] );

			} else {

				 // ignore > 4 for now
				for ( var k = 0; k < dim - 2; k ++ ) {

					remappedIndices.push( indices[ i * 2 ], indices[ i * 2 + 1 ] );

				}

			}

		} );

		return remappedIndices;

	},

	// UV maps:
	// 1: are defined via index into an array of points, not into a geometry
	// - the geometry is also defined by an index into this array, but the indexes may not match
	// 2: there can be any number of UV maps for a single geometry. Here these are combined,
	// 	with preference given to the first map encountered
	// 3: UV maps can be partial - that is, defined for only a part of the geometry
	// 4: UV maps can be VMAP or VMAD (discontinuous, to allow for seams). In practice, most
	// UV maps are defined as partially VMAP and partially VMAD
	// VMADs are currently not supported
	parseUVs( geometry, layer ) {

		// start by creating a UV map set to zero for the whole geometry
		var remappedUVs = Array.from( Array( geometry.attributes.position.count * 2 ), function () {

			return 0;

		} );

		for ( var name in layer.uvs ) {

			var uvs = layer.uvs[ name ].uvs;
			var uvIndices = layer.uvs[ name ].uvIndices;

			uvIndices.forEach( function ( i, j ) {

				remappedUVs[ i * 2 ] = uvs[ j * 2 ];
				remappedUVs[ i * 2 + 1 ] = uvs[ j * 2 + 1 ];

			} );

		}

		geometry.addAttribute( 'uv', new Float32BufferAttribute( remappedUVs, 2 ) );

	},

	parseMorphTargets( geometry, layer ) {

		var num = 0;
		for ( var name in layer.morphTargets ) {

			var remappedPoints = geometry.attributes.position.array.slice();

			if ( ! geometry.morphAttributes.position ) geometry.morphAttributes.position = [];

			var morphPoints = layer.morphTargets[ name ].points;
			var morphIndices = layer.morphTargets[ name ].indices;
			var type = layer.morphTargets[ name ].type;

			morphIndices.forEach( function ( i, j ) {

				if ( type === 'relative' ) {

					remappedPoints[ i * 3 ] += morphPoints[ j * 3 ];
					remappedPoints[ i * 3 + 1 ] += morphPoints[ j * 3 + 1 ];
					remappedPoints[ i * 3 + 2 ] += morphPoints[ j * 3 + 2 ];

				} else {

					remappedPoints[ i * 3 ] = morphPoints[ j * 3 ];
					remappedPoints[ i * 3 + 1 ] = morphPoints[ j * 3 + 1 ];
					remappedPoints[ i * 3 + 2 ] = morphPoints[ j * 3 + 2 ];

				}

			} );

			geometry.morphAttributes.position[ num ] = new Float32BufferAttribute( remappedPoints, 3 );
			geometry.morphAttributes.position[ num ].name = name;

			num ++;

		}

	},

};


// ************** UTILITY FUNCTIONS **************

function extractParentUrl( url, dir ) {

	var index = url.indexOf( dir );

	if ( index === - 1 ) return './';

	return url.substr( 0, index );

}

export { LWOLoader };
