( function () {

	function LWO3Parser( IFFParser ) {

		this.IFF = IFFParser;

	}

	LWO3Parser.prototype = {
		constructor: LWO3Parser,
		parseBlock: function () {

			this.IFF.debugger.offset = this.IFF.reader.offset;
			this.IFF.debugger.closeForms();
			const blockID = this.IFF.reader.getIDTag();
			const length = this.IFF.reader.getUint32(); // size of data in bytes

			this.IFF.debugger.dataOffset = this.IFF.reader.offset;
			this.IFF.debugger.length = length; // Data types may be found in either LWO2 OR LWO3 spec

			switch ( blockID ) {

				case 'FORM':
					// form blocks may consist of sub -chunks or sub-forms
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

				case 'NORM': // ENVL FORM skipped

				case 'PRE ': // Pre-loop behavior for the keyframe

				case 'POST': // Post-loop behavior for the keyframe

				case 'KEY ':
				case 'SPAN': // CLIP FORM skipped

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
				case 'PFLT': // Image Map Layer skipped

				case 'PROJ':
				case 'AXIS':
				case 'AAST':
				case 'PIXB':
				case 'STCK': // Procedural Textures skipped

				case 'VALU': // Gradient Textures skipped

				case 'PNAM':
				case 'INAM':
				case 'GRST':
				case 'GREN':
				case 'GRPT':
				case 'FKEY':
				case 'IKEY': // Texture Mapping Form skipped

				case 'CSYS': // Surface CHUNKs skipped

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
				case 'TAG ': // Car Material CHUNKS

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
				case 'IREF':
					// possibly a VX for reused texture nodes
					if ( length === 4 ) this.IFF.currentNode[ blockID ] = this.IFF.reader.getInt32(); else this.IFF.reader.skip( length );
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

				case 'DESC':
					// Description Line
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
					this.IFF.currentForm.wrap = {
						w: this.IFF.reader.getUint16(),
						h: this.IFF.reader.getUint16()
					};
					break;

				case 'IMAG':
					const index = this.IFF.reader.getVariableLengthIndex();
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

				case 'CHAN':
					// NOTE: ENVL Forms may also have CHAN chunk, however ENVL is currently ignored
					if ( length === 4 ) this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag(); else this.IFF.reader.skip( length );
					break;
					// LWO2 Spec chunks: these are needed since the SURF FORMs are often in LWO2 format

				case 'SMAN':
					const maxSmoothingAngle = this.IFF.reader.getFloat32();
					this.IFF.currentSurface.attributes.smooth = maxSmoothingAngle < 0 ? false : true;
					break;
					// LWO2: Basic Surface Parameters

				case 'COLR':
					this.IFF.currentSurface.attributes.Color = {
						value: this.IFF.reader.getFloat32Array( 3 )
					};
					this.IFF.reader.skip( 2 ); // VX: envelope

					break;

				case 'LUMI':
					this.IFF.currentSurface.attributes.Luminosity = {
						value: this.IFF.reader.getFloat32()
					};
					this.IFF.reader.skip( 2 );
					break;

				case 'SPEC':
					this.IFF.currentSurface.attributes.Specular = {
						value: this.IFF.reader.getFloat32()
					};
					this.IFF.reader.skip( 2 );
					break;

				case 'DIFF':
					this.IFF.currentSurface.attributes.Diffuse = {
						value: this.IFF.reader.getFloat32()
					};
					this.IFF.reader.skip( 2 );
					break;

				case 'REFL':
					this.IFF.currentSurface.attributes.Reflection = {
						value: this.IFF.reader.getFloat32()
					};
					this.IFF.reader.skip( 2 );
					break;

				case 'GLOS':
					this.IFF.currentSurface.attributes.Glossiness = {
						value: this.IFF.reader.getFloat32()
					};
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

				case 'IUVI':
					// uv channel name
					this.IFF.currentNode.UVChannel = this.IFF.reader.getString( length );
					break;

				case 'IUTL':
					// widthWrappingMode: 0 = Reset, 1 = Repeat, 2 = Mirror, 3 = Edge
					this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
					break;

				case 'IVTL':
					// heightWrappingMode
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

	THREE.LWO3Parser = LWO3Parser;

} )();
