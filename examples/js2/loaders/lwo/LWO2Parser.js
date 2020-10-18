"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LWO2Parser = LWO2Parser;

function LWO2Parser(IFFParser) {
  this.IFF = IFFParser;
}

LWO2Parser.prototype = {
  constructor: LWO2Parser,
  parseBlock: function parseBlock() {
    this.IFF["debugger"].offset = this.IFF.reader.offset;
    this.IFF["debugger"].closeForms();
    var blockID = this.IFF.reader.getIDTag();
    var length = this.IFF.reader.getUint32();

    if (length > this.IFF.reader.dv.byteLength - this.IFF.reader.offset) {
      this.IFF.reader.offset -= 4;
      length = this.IFF.reader.getUint16();
    }

    this.IFF["debugger"].dataOffset = this.IFF.reader.offset;
    this.IFF["debugger"].length = length;

    switch (blockID) {
      case 'FORM':
        this.IFF.parseForm(length);
        break;

      case 'ICON':
      case 'VMPA':
      case 'BBOX':
      case 'NORM':
      case 'PRE ':
      case 'POST':
      case 'KEY ':
      case 'SPAN':
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
      case 'PROJ':
      case 'AXIS':
      case 'AAST':
      case 'PIXB':
      case 'AUVO':
      case 'STCK':
      case 'PROC':
      case 'VALU':
      case 'FUNC':
      case 'PNAM':
      case 'INAM':
      case 'GRST':
      case 'GREN':
      case 'GRPT':
      case 'FKEY':
      case 'IKEY':
      case 'CSYS':
      case 'OPAQ':
      case 'CMAP':
      case 'NLOC':
      case 'NZOM':
      case 'NVER':
      case 'NSRV':
      case 'NVSK':
      case 'NCRD':
      case 'WRPW':
      case 'WRPH':
      case 'NMOD':
      case 'NPRW':
      case 'NPLA':
      case 'NODS':
      case 'VERS':
      case 'ENUM':
      case 'TAG ':
      case 'OPAC':
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
      case 'GVAL':
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
        this.IFF["debugger"].skipped = true;
        this.IFF.reader.skip(length);
        break;

      case 'SURF':
        this.IFF.parseSurfaceLwo2(length);
        break;

      case 'CLIP':
        this.IFF.parseClipLwo2(length);
        break;

      case 'IPIX':
      case 'IMIP':
      case 'IMOD':
      case 'AMOD':
      case 'IINV':
      case 'INCR':
      case 'IAXS':
      case 'IFOT':
      case 'ITIM':
      case 'IWRL':
      case 'IUTI':
      case 'IINX':
      case 'IINY':
      case 'IINZ':
      case 'IREF':
        if (length === 4) this.IFF.currentNode[blockID] = this.IFF.reader.getInt32();else this.IFF.reader.skip(length);
        break;

      case 'OTAG':
        this.IFF.parseObjectTag();
        break;

      case 'LAYR':
        this.IFF.parseLayer(length);
        break;

      case 'PNTS':
        this.IFF.parsePoints(length);
        break;

      case 'VMAP':
        this.IFF.parseVertexMapping(length);
        break;

      case 'AUVU':
      case 'AUVN':
        this.IFF.reader.skip(length - 1);
        this.IFF.reader.getVariableLengthIndex();
        break;

      case 'POLS':
        this.IFF.parsePolygonList(length);
        break;

      case 'TAGS':
        this.IFF.parseTagStrings(length);
        break;

      case 'PTAG':
        this.IFF.parsePolygonTagMapping(length);
        break;

      case 'VMAD':
        this.IFF.parseVertexMapping(length, true);
        break;

      case 'DESC':
        this.IFF.currentForm.description = this.IFF.reader.getString();
        break;

      case 'TEXT':
      case 'CMNT':
      case 'NCOM':
        this.IFF.currentForm.comment = this.IFF.reader.getString();
        break;

      case 'NAME':
        this.IFF.currentForm.channelName = this.IFF.reader.getString();
        break;

      case 'WRAP':
        this.IFF.currentForm.wrap = {
          w: this.IFF.reader.getUint16(),
          h: this.IFF.reader.getUint16()
        };
        break;

      case 'IMAG':
        var index = this.IFF.reader.getVariableLengthIndex();
        this.IFF.currentForm.imageIndex = index;
        break;

      case 'OREF':
        this.IFF.currentForm.referenceObject = this.IFF.reader.getString();
        break;

      case 'ROID':
        this.IFF.currentForm.referenceObjectID = this.IFF.reader.getUint32();
        break;

      case 'SSHN':
        this.IFF.currentSurface.surfaceShaderName = this.IFF.reader.getString();
        break;

      case 'AOVN':
        this.IFF.currentSurface.surfaceCustomAOVName = this.IFF.reader.getString();
        break;

      case 'NSTA':
        this.IFF.currentForm.disabled = this.IFF.reader.getUint16();
        break;

      case 'NRNM':
        this.IFF.currentForm.realName = this.IFF.reader.getString();
        break;

      case 'NNME':
        this.IFF.currentForm.refName = this.IFF.reader.getString();
        this.IFF.currentSurface.nodes[this.IFF.currentForm.refName] = this.IFF.currentForm;
        break;

      case 'INME':
        if (!this.IFF.currentForm.nodeName) this.IFF.currentForm.nodeName = [];
        this.IFF.currentForm.nodeName.push(this.IFF.reader.getString());
        break;

      case 'IINN':
        if (!this.IFF.currentForm.inputNodeName) this.IFF.currentForm.inputNodeName = [];
        this.IFF.currentForm.inputNodeName.push(this.IFF.reader.getString());
        break;

      case 'IINM':
        if (!this.IFF.currentForm.inputName) this.IFF.currentForm.inputName = [];
        this.IFF.currentForm.inputName.push(this.IFF.reader.getString());
        break;

      case 'IONM':
        if (!this.IFF.currentForm.inputOutputName) this.IFF.currentForm.inputOutputName = [];
        this.IFF.currentForm.inputOutputName.push(this.IFF.reader.getString());
        break;

      case 'FNAM':
        this.IFF.currentForm.fileName = this.IFF.reader.getString();
        break;

      case 'CHAN':
        if (length === 4) this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag();else this.IFF.reader.skip(length);
        break;

      case 'SMAN':
        var maxSmoothingAngle = this.IFF.reader.getFloat32();
        this.IFF.currentSurface.attributes.smooth = maxSmoothingAngle < 0 ? false : true;
        break;

      case 'COLR':
        this.IFF.currentSurface.attributes.Color = {
          value: this.IFF.reader.getFloat32Array(3)
        };
        this.IFF.reader.skip(2);
        break;

      case 'LUMI':
        this.IFF.currentSurface.attributes.Luminosity = {
          value: this.IFF.reader.getFloat32()
        };
        this.IFF.reader.skip(2);
        break;

      case 'SPEC':
        this.IFF.currentSurface.attributes.Specular = {
          value: this.IFF.reader.getFloat32()
        };
        this.IFF.reader.skip(2);
        break;

      case 'DIFF':
        this.IFF.currentSurface.attributes.Diffuse = {
          value: this.IFF.reader.getFloat32()
        };
        this.IFF.reader.skip(2);
        break;

      case 'REFL':
        this.IFF.currentSurface.attributes.Reflection = {
          value: this.IFF.reader.getFloat32()
        };
        this.IFF.reader.skip(2);
        break;

      case 'GLOS':
        this.IFF.currentSurface.attributes.Glossiness = {
          value: this.IFF.reader.getFloat32()
        };
        this.IFF.reader.skip(2);
        break;

      case 'TRAN':
        this.IFF.currentSurface.attributes.opacity = this.IFF.reader.getFloat32();
        this.IFF.reader.skip(2);
        break;

      case 'BUMP':
        this.IFF.currentSurface.attributes.bumpStrength = this.IFF.reader.getFloat32();
        this.IFF.reader.skip(2);
        break;

      case 'SIDE':
        this.IFF.currentSurface.attributes.side = this.IFF.reader.getUint16();
        break;

      case 'RIMG':
        this.IFF.currentSurface.attributes.reflectionMap = this.IFF.reader.getVariableLengthIndex();
        break;

      case 'RIND':
        this.IFF.currentSurface.attributes.refractiveIndex = this.IFF.reader.getFloat32();
        this.IFF.reader.skip(2);
        break;

      case 'TIMG':
        this.IFF.currentSurface.attributes.refractionMap = this.IFF.reader.getVariableLengthIndex();
        break;

      case 'IMAP':
        this.IFF.reader.skip(2);
        break;

      case 'TMAP':
        this.IFF["debugger"].skipped = true;
        this.IFF.reader.skip(length);
        break;

      case 'IUVI':
        this.IFF.currentNode.UVChannel = this.IFF.reader.getString(length);
        break;

      case 'IUTL':
        this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
        break;

      case 'IVTL':
        this.IFF.currentNode.heightWrappingMode = this.IFF.reader.getUint32();
        break;

      case 'BLOK':
        break;

      default:
        this.IFF.parseUnknownCHUNK(blockID, length);
    }

    if (blockID != 'FORM') {
      this.IFF["debugger"].node = 1;
      this.IFF["debugger"].nodeID = blockID;
      this.IFF["debugger"].log();
    }

    if (this.IFF.reader.offset >= this.IFF.currentFormEnd) {
      this.IFF.currentForm = this.IFF.parentForm;
    }
  }
};