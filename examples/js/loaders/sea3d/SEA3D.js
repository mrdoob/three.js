/**
 * 	SEA3D.JS - SEA3D SDK
 * 	Copyright (C) 2015 Sunag Entertainment 
 * 
 * 	http://sea3d.poonya.com/
 */

var SEA3D = { VERSION : 17000 }

SEA3D.getVersion = function() {
	// Max = 16777215 - VVSSBB  | V = Version | S = Subversion | B = Buildversion
	var v = SEA3D.VERSION.toString(), l = v.length;			
	return v.substring(0, l-4) + "." + v.substring(l-4,l-3) + "." + v.substring(l-3,l-2) + "." + parseFloat(v.substring(l-2, l)).toString();			
}

console.log( 'SEA3D ' + SEA3D.getVersion() );

//
//	Timer
//

SEA3D.Timer = function() {
	this.time = this.start = this.getTime();
}

SEA3D.Timer.prototype.getDeltaTime = function() {
	return this.getTime() - this.time;
}

SEA3D.Timer.prototype.getTime = function() {
	return Date.now();
}

SEA3D.Timer.prototype.getElapsedTime = function() {
	return this.getTime() - this.start;
}

SEA3D.Timer.prototype.update = function() {
	this.time = this.getTime();
}

//
//	STREAM : STANDARD DATA-IO ( LITTLE-ENDIAN )
//

SEA3D.Stream = function(buffer) {	
	this.position = 0;
	this.set( buffer || new Uint8Array() );
}

SEA3D.Stream.bufferToBase64 = function(buffer) {
	var i = 0, 
		count = buffer.length,
		binary = "";
	
	while (i < count) 
		binary += String.fromCharCode( buffer[ i++ ] );
		
	return window.btoa(binary);
}

SEA3D.Stream.prototype.TWOeN23 = Math.pow(2, -23);
SEA3D.Stream.prototype.TWOeN52 = Math.pow(2, -52);
SEA3D.Stream.prototype.pow = Math.pow;

SEA3D.Stream.prototype.set = function(buffer) {
	this.buffer = buffer;
	this.length = buffer.length;	
}

SEA3D.Stream.prototype.readByte = function() {
	return this.buffer[this.position++] << 24 >> 24;
}

SEA3D.Stream.prototype.readUByte = function() {
	return this.buffer[this.position++];
}

SEA3D.Stream.prototype.readUBytes = function(len) {
	var bytes = new Uint8Array(len);
	for (var i=0;i<len;++i) bytes[i] = this.buffer[this.position++];
	return bytes;
}

SEA3D.Stream.prototype.readBool = function() {
	return this.readUByte() != 0;
}

SEA3D.Stream.prototype.readShort = function() {
	var v = this.readUShort();
	if (v > Math.pow(2, 15) - 1) {
		return v - Math.pow(2, 16);
	}
	return v;
}

SEA3D.Stream.prototype.readUShort = function() {	
	return this.readUByte() | (this.readUByte() << 8);
}

SEA3D.Stream.prototype.readUInt24 = function() {
	return this.readUByte() | (this.readUByte() << 8) | (this.readUByte() << 16);
}

SEA3D.Stream.prototype.readInt = function() {
	var v = this.readUInt();
	if (v > Math.pow(2, 31) - 1) {
		return v - Math.pow(2, 32);
	}
	return v;
}

SEA3D.Stream.prototype.readUInt = function() {
	return this.readUByte() | (this.readUByte() << 8) | (this.readUByte() << 16) | (this.readUByte() << 24);
}

SEA3D.Stream.prototype.readUInteger = function()
{
	var v = this.readUByte(),
		r = v & 0x7F;
	
	if ((v & 0x80) != 0)
	{
		v = this.readUByte();
		r |= (v & 0x7F) << 7;
		
		if ((v & 0x80) != 0)
		{
			v = this.readUByte();
			r |= (v & 0x7F) << 13;
		}
	}
	
	return r;
}

SEA3D.Stream.prototype.readFloat = function() {
	var b4 = this.readUByte(),
		b3 = this.readUByte(),
		b2 = this.readUByte(),
		b1 = this.readUByte();
	var sign = 1 - ((b1 >> 7) << 1);                   // sign = bit 0
	var exp = (((b1 << 1) & 0xFF) | (b2 >> 7)) - 127;  // exponent = bits 1..8
	var sig = ((b2 & 0x7F) << 16) | (b3 << 8) | b4;    // significand = bits 9..31
	if (sig == 0 && exp == -127)
		return 0.0;
	return sign*(1 + this.TWOeN23*sig)*this.pow(2, exp);
}

SEA3D.Stream.prototype.readVector2 = function() {
	return { x: this.readFloat(), y: this.readFloat() }
}

SEA3D.Stream.prototype.readVector3 = function() {
	return { x: this.readFloat(), y: this.readFloat(), z: this.readFloat() }
}

SEA3D.Stream.prototype.readVector4 = function() {
	return { x: this.readFloat(), y: this.readFloat(), z: this.readFloat(), w: this.readFloat() }
}

SEA3D.Stream.prototype.readMatrix = function() {	
	var mtx = new Float32Array(16);
	
	mtx[0] = this.readFloat();
	mtx[1] = this.readFloat();
	mtx[2] = this.readFloat();
	mtx[3] = 0.0;
	mtx[4] = this.readFloat();
	mtx[5] = this.readFloat();
	mtx[6] = this.readFloat();
	mtx[7] = 0.0;
	mtx[8] = this.readFloat();
	mtx[9] = this.readFloat();
	mtx[10] = this.readFloat();
	mtx[11] = 0.0;
	mtx[12] = this.readFloat();
	mtx[13] = this.readFloat();
	mtx[14] = this.readFloat();
	mtx[15] = 1.0;

	return mtx;
}

SEA3D.Stream.prototype.readUTF = function(len) {
	return String.fromCharCode.apply(null, new Uint16Array(this.readUBytes(len)));
}

SEA3D.Stream.prototype.readExt = function() {
	return this.readUTF(4).replace(/\0/g, "");
}

SEA3D.Stream.prototype.readUTF8 = function() {
	return this.readUTF(this.readUByte());
}

SEA3D.Stream.prototype.readUTF8Short = function() {
	return this.readUTF(this.readUShort());
}

SEA3D.Stream.prototype.readUTF8Long = function() {
	return this.readUTF(this.readUInt());
}

SEA3D.Stream.prototype.readBlendMode = function() {
	return SEA3D.DataTable.BLEND_MODE[this.readUByte()];
}

SEA3D.Stream.prototype.toBase64 = function() {
	return SEA3D.Stream.bufferToBase64( this.data );
}

SEA3D.Stream.prototype.append = function(data) {
	var tmp = new Uint8Array( this.data.byteLength + data.byteLength );
	tmp.set( new Uint8Array( this.data ), 0 );
	tmp.set( new Uint8Array( data ), this.data.byteLength );
	this.data = tmp;
}

SEA3D.Stream.prototype.concat = function(position, length) {	
	return new SEA3D.Stream(this.buffer.subarray( position, position + length ));	
}

SEA3D.Stream.prototype.bytesAvailable = function() {
	return this.length - this.position;
}

//
//	Data Table
//

SEA3D.DataTable = {
	NONE : 0,
	
	// 1D = 0 at 31
	BOOLEAN : 1,
	
	BYTE : 2,
	UBYTE : 3,
	
	SHORT : 4,
	USHORT : 5,
	
	INT24 : 6,
	UINT24 : 7,
	
	INT : 8,
	UINT : 9,
	
	FLOAT : 10,
	DOUBLE : 11,
	DECIMAL : 12,
	
	// 2D = 32 at 63
	
	// 3D = 64 at 95
	VECTOR3D : 74,
	
	// 4D = 96 at 127
	VECTOR4D : 106,
	
	// Undefined Size = 128 at 255
	STRING_TINY : 128,
	STRING_SHORT : 129,
	STRING_LONG : 130,
	
	ASSET : 200,
	GROUP : 255
}

SEA3D.DataTable.BLEND_MODE =	[
	"normal","add","subtract","multiply","dividing","alpha","screen","darken",
	"overlay","colorburn","linearburn","lighten","colordodge","lineardodge",
	"softlight","hardlight","pinlight","spotlight","spotlightblend","hardmix",
	"average","difference","exclusion","hue","saturation","color","value"
]

SEA3D.DataTable.INTERPOLATION_TABLE =	[
	"normal","linear",
	"sine.in","sine.out","sine.inout",
	"cubic.in","cubic.out","cubic.inout",
	"quint.in","quint.out","quint.inout",
	"circ.in","circ.out","circ.inout",
	"back.in","back.out","back.inout",
	"quad.in","quad.out","quad.inout",
	"quart.in","quart.out","quart.inout",
	"expo.in","expo.out","expo.inout",
	"elastic.in","elastic.out","elastic.inout",
	"bounce.in","bounce.out","bounce.inout"
]

SEA3D.DataTable.readObject = function(data, sea) {
	return SEA3D.DataTable.readToken(data.readUByte(), data, sea);
}

SEA3D.DataTable.readToken = function(type, data, sea) {
	switch(type)
	{
		// 1D
		case SEA3D.DataTable.BOOLEAN:
			return data.readBool();
			break;
		
		case SEA3D.DataTable.UBYTE:
			return data.readUByte();
			break;
		
		case SEA3D.DataTable.USHORT:
			return data.readUShort();
			break;
		
		case SEA3D.DataTable.UINT24:
			return data.readUInt24();
			break;	
		
		case SEA3D.DataTable.INT:
			return data.readInt();
			break;
		
		case SEA3D.DataTable.UINT:
			return data.readUInt();
			break;
		
		case SEA3D.DataTable.FLOAT:
			return data.readFloat();
			break;
		
		// 3D
		case SEA3D.DataTable.VECTOR3D:
			return data.readVector3();
			break;	
		
		// 4D
		case SEA3D.DataTable.VECTOR4D:
			return data.readVector4();						
			break;
		
		// Undefined Values
		case SEA3D.DataTable.STRING_TINY:
			return data.readUTF8();
			break;
			
		case SEA3D.DataTable.STRING_SHORT:
			return data.readUTF8Short();
			break;
			
		case SEA3D.DataTable.STRING_LONG:
			return data.readUTF8Long();
			break
			
		case SEA3D.DataTable.ASSET:
			var asset = data.readUInt();
			return asset > 0 ? sea.getObject( asset - 1 ).tag : null;
			break;
			
		default:
			console.error("DataType not found!");
			break;
	}
	
	return null;
}

SEA3D.DataTable.readVector = function(type, data, out, length, offset) {			
	var size = SEA3D.DataTable.sizeOf(type), 
		i = offset * size, 
		count = i + (length * size);
	
	switch(type)
	{
		// 1D
		case SEA3D.DataTable.BOOLEAN:
			while (i < count) out[i++] = data.readBool() ? 1 : 0;						
			break;
		
		case SEA3D.DataTable.UBYTE:
			while (i < count) out[i++] = data.readUByte();						
			break;
		
		case SEA3D.DataTable.USHORT:
			while (i < count) out[i++] = data.readUShort();							
			break;
		
		case SEA3D.DataTable.UINT24:
			while (i < count) out[i++] = data.readUInt24();						
			break;	
		
		case SEA3D.DataTable.UINT:
			while (i < count) out[i++] = data.readUInt();						
			break;
		
		case SEA3D.DataTable.FLOAT:
			while (i < count) out[i++] = data.readFloat();						
			break;
		
		// 3D
		case SEA3D.DataTable.VECTOR3D:
			while (i < count) 		
			{
				out[i++] = data.readFloat();
				out[i++] = data.readFloat();
				out[i++] = data.readFloat();							
			}
			break;	
		
		// 4D
		case SEA3D.DataTable.VECTOR4D:
			while (i < count) 	
			{
				out[i++] = data.readFloat();
				out[i++] = data.readFloat();
				out[i++] = data.readFloat();
				out[i++] = data.readFloat();
			}
			break;
	}
}		

SEA3D.DataTable.sizeOf = function(kind) {
	if (kind == 0) return 0;
	else if (kind >= 1 && kind <= 31) return 1;
	else if (kind >= 32 && kind <= 63) return 2;
	else if (kind >= 64 && kind <= 95) return 3;
	else if (kind >= 96 && kind <= 125) return 4;			
	return -1;
}

//
//	Math
//

SEA3D.Math = {
	DEGREES : 180 / Math.PI,
	RADIANS : Math.PI / 180
}

SEA3D.Math.angle = function(val) {
	var ang = 180,
		inv = val < 0;
	
	val = (inv ? -val : val) % 360;
	
	if (val > ang)			
	{
		val = -ang + (val - ang);
	}
	
	return (inv ? -val : val);			
}

SEA3D.Math.lerpAngle = function(val, tar, t) {				
	if (Math.abs(val - tar) > 180)
	{
		if (val > tar) 
		{		
			tar += 360;				
		}
		else 
		{
			tar -= 360;				
		}
	}
	
	val += (tar - val) * t;
	
	return SEA3D.Math.angle(val);
}	

SEA3D.Math.lerpColor = function(val, tar, t) {
	var a0 = val >> 24 & 0xff,
		r0 = val >> 16 & 0xff,
		g0 = val >> 8 & 0xff,
		b0 = val & 0xff;
	
	var a1 = tar >> 24 & 0xff,
		r1 = tar >> 16 & 0xff,
		g1 = tar >> 8 & 0xff,
		b1 = tar & 0xff;
	
	a0 += (a1 - a0) * t;
	r0 += (r1 - r0) * t;
	g0 += (g1 - g0) * t;
	b0 += (b1 - b0) * t;
	
	return a0 << 24 | r0 << 16 | g0 << 8 | b0;
}

SEA3D.Math.lerp = function(val, tar, t) {
	return val + ((tar - val) * t);
}

SEA3D.Math.lerp1x = function(val, tar, t) {
	val[0] += (tar[0] - val[0]) * t;
}

SEA3D.Math.lerp3x = function(val, tar, t) {
	val[0] += (tar[0] - val[0]) * t;
	val[1] += (tar[1] - val[1]) * t;
	val[2] += (tar[2] - val[2]) * t;
}

SEA3D.Math.lerpAng1x = function(val, tar, t) {
	val[0] = SEA3D.Math.lerpAngle(val[0], tar[0], t);
}

SEA3D.Math.lerpColor1x = function(val, tar, t) {
	val[0] = SEA3D.Math.lerpColor(val[0], tar[0], t);
}	

SEA3D.Math.lerpQuat4x = function(val, tar, t) {				
	var x1 = val[0], 
		y1 = val[1], 
		z1 = val[2],
		w1 = val[3];
	
	var x2 = tar[0], 
		y2 = tar[1], 
		z2 = tar[2],
		w2 = tar[3];
	
	var x, y, z, w, l;
	
	// shortest direction
	if (x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2 < 0) {				
		x2 = -x2;
		y2 = -y2;
		z2 = -z2;
		w2 = -w2;
	}
				
	x = x1 + t * (x2 - x1);
	y = y1 + t * (y2 - y1);
	z = z1 + t * (z2 - z1);
	w = w1 + t * (w2 - w1);
	
	l = 1.0 / Math.sqrt(w * w + x * x + y * y + z * z);			
	val[0] = x * l;
	val[1] = y * l;
	val[2] = z * l;
	val[3] = w * l;
}

//
//	BlendMethod
//

SEA3D.AnimationBlendMethod = {
	LINEAR : 'linear',
	EASING : 'easing'
}

//
//	AnimationFrame
//

SEA3D.AnimationFrame = function() {
	this.data = [0,0,0,0];	
}

SEA3D.AnimationFrame.prototype.toVector = function() {		
	return { x:this.data[0], y:this.data[1], z:this.data[2], w:this.data[3] };
}

SEA3D.AnimationFrame.prototype.toAngles = function(d) {
	var x = this.data[0], 
		y = this.data[1], 
		z = this.data[2], 
		w = this.data[3];
	
	var a = 2 * (w * y - z * x);
	
	if (a < -1) a = -1;
	else if (a > 1) a = 1; 
	
	return {
		x : Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)) * d,
		y : Math.asin(a) * d,
		z : Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)) * d
	}
}

SEA3D.AnimationFrame.prototype.toEuler = function() {
	return this.toAngles( SEA3D.Math.DEGREES );
}

SEA3D.AnimationFrame.prototype.toRadians = function() {
	return this.toAngles( 1 );
}

SEA3D.AnimationFrame.prototype.setX = function(val) {
	this.data[0] = val;
}

SEA3D.AnimationFrame.prototype.getX = function() {
	return this.data[0];
}

SEA3D.AnimationFrame.prototype.setY = function(val) {
	this.data[1] = val;
}

SEA3D.AnimationFrame.prototype.getY = function() {
	return this.data[1];
}

SEA3D.AnimationFrame.prototype.setZ = function(val) {
	this.data[2] = val;
}

SEA3D.AnimationFrame.prototype.getZ = function() {
	return this.data[2];
}

SEA3D.AnimationFrame.prototype.setW = function(val) {
	this.data[3] = val;
}

SEA3D.AnimationFrame.prototype.getW = function() {
	return this.data[3];
}

//
//	AnimationData
//

SEA3D.AnimationData = function(kind, dataType, data, offset) {
	this.kind = kind;
	this.type = dataType;
	this.blockLength = SEA3D.DataTable.sizeOf(dataType);
	this.data = data;
	this.offset = offset == undefined ? 0 : offset;
	
	switch(this.blockLength)
	{
		case 1: this.getData = this.getData1x; break;
		case 2: this.getData = this.getData2x; break;
		case 3: this.getData = this.getData3x; break;
		case 4: this.getData = this.getData4x; break;
	}
}

SEA3D.AnimationData.prototype.getData1x = function(frame, data) {
	frame = this.offset + frame * this.blockLength;	
			
	data[0] = this.data[frame];	
}

SEA3D.AnimationData.prototype.getData2x = function(frame, data) {
	frame = this.offset + frame * this.blockLength;	
			
	data[0] = this.data[frame];		
	data[1] = this.data[frame + 1];			
}

SEA3D.AnimationData.prototype.getData3x = function(frame, data) {
	frame = this.offset + frame * this.blockLength;	
			
	data[0] = this.data[frame];		
	data[1] = this.data[frame + 1];			
	data[2] = this.data[frame + 2];
}

SEA3D.AnimationData.prototype.getData4x = function(frame, data) {
	frame = this.offset + frame * this.blockLength;	
			
	data[0] = this.data[frame];		
	data[1] = this.data[frame + 1];			
	data[2] = this.data[frame + 2];
	data[3] = this.data[frame + 3];
}

//
//	AnimationNode
//

SEA3D.AnimationNode = function(name, frameRate, numFrames, repeat, intrpl) {
	this.name = name;
	this.frameRate = frameRate;
	this.frameMill = 1000 / frameRate;
	this.numFrames = numFrames;	
	this.length = numFrames - 1;
	this.time = 0;
	this.duration = this.length * this.frameMill;
	this.repeat = repeat;
	this.intrpl = intrpl;	
	this.invalidState = true;
	this.dataList = [];
	this.dataListId = {};
	this.buffer = new SEA3D.AnimationFrame();
	this.percent = 0;
	this.prevFrame = 0;
	this.nextFrame = 0;
	this.frame = 0;
}

SEA3D.AnimationNode.prototype.setTime = function(value) {
	this.frame = this.validFrame( value / this.frameMill );						
	this.time = this.frame * this.frameRate;			
	this.invalidState = true;
}

SEA3D.AnimationNode.prototype.getTime = function() {
	return this.time;
}

SEA3D.AnimationNode.prototype.setFrame = function(value) {
	this.setTime(value * this.frameMill);
}

SEA3D.AnimationNode.prototype.getRealFrame = function() {
	return Math.floor( this.frame );
}

SEA3D.AnimationNode.prototype.getFrame = function() {
	return this.frame;
}

SEA3D.AnimationNode.prototype.setPosition = function(value) {
	this.setFrame(value * (this.numFrames-1));
}

SEA3D.AnimationNode.prototype.getPosition = function() {
	return this.frame / (this.numFrames-1);
}

SEA3D.AnimationNode.prototype.validFrame = function(value) {
	var inverse = value < 0;
			
	if (inverse) value = -value;			
	
	if (value > this.length)
		value = this.repeat ? value % this.length : this.length;	
		
	if (inverse) value = this.length - value;
	
	return value;
}

SEA3D.AnimationNode.prototype.addData = function(animationData) {
	this.dataListId[animationData.kind] = animationData;
	this.dataList[this.dataList.length] = animationData;
}

SEA3D.AnimationNode.prototype.removeData = function(animationData) {			
	delete this.dataListId[animationData.kind];
	this.dataList.splice(this.dataList.indexOf(animationData), 1);			
}

SEA3D.AnimationNode.prototype.getDataByKind = function(kind) {			
	return this.dataListId[kind];
}

SEA3D.AnimationNode.prototype.getFrameAt = function(frame, id) {
	this.dataListId[id].getFrameData(frame, this.buffer.data);
	return this.buffer;
}

SEA3D.AnimationNode.prototype.getFrame = function(id) {
	this.dataListId[id].getFrameData(this.getRealFrame(), this.buffer.data);
	return this.buffer;
}

SEA3D.AnimationNode.prototype.getInterpolationFrame = function(animationData, iFunc) {		
	if (this.numFrames == 0) 
		return this.buffer;
	
	if (this.invalidState)
	{
		this.prevFrame = this.getRealFrame();								
		this.nextFrame = this.validFrame(this.prevFrame + 1);									
		this.percent = this.frame - this.prevFrame;				
		this.invalidState = false;
	}
	
	animationData.getData(this.prevFrame, this.buffer.data);
	
	if (this.percent > 0)
	{
		animationData.getData(this.nextFrame, SEA3D.AnimationNode.FRAME_BUFFER);	
		
		// interpolation function
		iFunc(this.buffer.data, SEA3D.AnimationNode.FRAME_BUFFER, this.percent);
	}
	
	return this.buffer;
}

SEA3D.AnimationNode.FRAME_BUFFER = [0,0,0,0];

//
//	AnimationSet
//

SEA3D.AnimationSet = function() {
	this.animations = [];	
	this.dataCount = -1;
}

SEA3D.AnimationSet.prototype.addAnimation = function(node) {
	if (this.dataCount == -1)
		this.dataCount = node.dataList.length;
	
	this.animations[node.name] = node;
	this.animations.push(node);	
}

SEA3D.AnimationSet.prototype.getAnimationByName = function(name) {
	return this.animations[name];
}

//
//	AnimationState
//

SEA3D.AnimationState = function(node) {
	this.node = node;
	this.offset = 0;
	this.weight = 0;
	this.time = 0;	
}

SEA3D.AnimationState.prototype.setTime = function(val) {
	this.node.time = this.time = val;	
}

SEA3D.AnimationState.prototype.getTime = function() {
	return this.time;
}

SEA3D.AnimationState.prototype.setFrame = function(val) {
	this.node.setFrame(val);
	this.time = this.node.time;
}

SEA3D.AnimationState.prototype.getFrame = function() {
	this.update();
	return this.node.getFrame();
}

SEA3D.AnimationState.prototype.setPosition = function(val) {
	this.node.setPosition(val);
	this.time = this.node.time;
}

SEA3D.AnimationState.prototype.getPosition = function() {
	this.update();
	return this.node.getPosition();
}

SEA3D.AnimationState.prototype.update = function() {
	if (this.node.time != this.time)		
		this.node.setTime( this.time );	
}

//
//	Animation Handler
//

SEA3D.AnimationHandler = function( animationSet ) {	
	this.animationSet = animationSet;
	this.states = SEA3D.AnimationHandler.stateFromAnimations( animationSet.animations );
	this.timeScale = 1;
	this.time = 0;
	this.numAnimation = animationSet.animations.length;
	this.relative = false;
	this.playing = false;
	this.delta = 0;
	this.easeSpeed = 2;
	this.crossfade = 0;
	this.updateAllStates = false;
	this.blendMethod = SEA3D.AnimationBlendMethod.LINEAR;
}

SEA3D.AnimationHandler.prototype.update = function(delta) {
	this.delta = delta;
	this.time += delta * this.timeScale;
	
	this.updateState();
	this.updateAnimation();
}

SEA3D.AnimationHandler.prototype.updateState = function() {
	var i, state;
	
	this.currentState.node.setTime( this.time - this.currentState.offset );
		
	if (this.currentState.weight < 1 && this.crossfade > 0)
	{
		var delta = Math.abs(this.delta) / (1000.0 * this.crossfade);				
		var weight = 1;
		
		if (this.blendMethod === SEA3D.AnimationBlendMethod.EASING)
			delta *= this.easeSpeed;
		
		for(i = 0; i < this.states.length; ++i) {
			state = this.states[i];
			
			if (state !== this.currentState) {
				if (this.blendMethod === SEA3D.AnimationBlendMethod.LINEAR)
					state.weight -= delta;
				else if (this.blendMethod === SEA3D.AnimationBlendMethod.EASING)
					state.weight -= state.weight * delta;
										
				if (state.weight < 0) 
					state.weight = 0;
				
				weight -= state.weight;
				
				if (this.updateAllStates) {
					state.node.setTime( this.time - state.offset );
				}
			}
		}
		
		if (weight < 0)				
			weight = 0;				
		
		this.currentState.weight = weight;
	} else {
		for(i = 0; i < this.states.length; ++i) {
			state = this.states[i];
			
			if (state === this.currentState)
				state.weight = 1;
			else {
				state.weight = 0;
				
				if (this.updateAllStates) {
					state.node.setTime( this.time );
				}
			}
		}
	}
}

SEA3D.AnimationHandler.prototype.updateAnimation = function() {
	var dataCount = this.animationSet.dataCount;		
	var nodes = this.animationSet.animations;
	var currentNode = this.currentState.node;
	
	for(var i = 0; i < dataCount; i++) {
		for(var n = 0; n < nodes.length; n++) {
			var node = nodes[n],
				state = this.states[n],
				data = node.dataList[i],				
				iFunc = SEA3D.Animation.DefaultLerpFuncs[data.kind],
				frame;
			
			if (n == 0) {
				frame = currentNode.getInterpolationFrame(currentNode.dataList[i], iFunc);
				
				if (!currentNode.repeat && currentNode.frame == currentNode.numFrames - 1) {
					if (this.onComplete)
						this.onComplete( this );
				}
			}
			
			if (node != currentNode) {
				if (state.weight > 0)
				{													
					iFunc(
						frame.data, 
						node.getInterpolationFrame(data, iFunc).data, 
						state.weight
					);	
				}
			}
						
			if (this.updateAnimationFrame)
				this.updateAnimationFrame(frame, data.kind);
		
		}
	}
}

SEA3D.AnimationHandler.prototype.getStateByName = function(name) {
	return this.states[name];
}

SEA3D.AnimationHandler.prototype.getStateNameByIndex = function(index) {
	return this.animationSet.animations[index].name;
}

SEA3D.AnimationHandler.prototype.play = function(name, crossfade, offset) {
	this.currentState = this.getStateByName(name);				
	
	if (!this.currentState)
		throw new Error('Animation "' + name + '" not found.');
	
	this.crossfade = crossfade;
	this.currentState.offset = this.time;
	
	if (offset !== undefined) 
		this.currentState.time = offset;
	
	if (!this.playing) {
		// add in animation collector			
		SEA3D.AnimationHandler.add( this );
		this.playing = true;
	}
}

SEA3D.AnimationHandler.prototype.resume = function() {
	if (!this.playing) {
		SEA3D.AnimationHandler.add( this );
		this.playing = true;
	}
}

SEA3D.AnimationHandler.prototype.pause = function() {
	if (this.playing) {
		SEA3D.AnimationHandler.remove( this );
		this.playing = false;
	}
}

SEA3D.AnimationHandler.prototype.stop = function() {
	this.time = 0;
	this.pause();
}

SEA3D.AnimationHandler.prototype.setRelative = function(val) {
	this.relative = val;
}

SEA3D.AnimationHandler.prototype.getRelative = function() {
	return this.relative;
}

//
//	Manager
//

SEA3D.AnimationHandler.add = function( animation ) {
	SEA3D.AnimationHandler.animations.push( animation );
}

SEA3D.AnimationHandler.remove = function( animation ) {
	SEA3D.AnimationHandler.animations.splice(SEA3D.AnimationHandler.animations.indexOf(animation), 1);
}

SEA3D.AnimationHandler.stateFromAnimations = function(anms) {
	var states = [];
	for (var i = 0; i < anms.length; i++) {
		states[anms[i].name] = states[i] = new SEA3D.AnimationState(anms[i]);			
	}	
	return states;
}

SEA3D.AnimationHandler.update = function( delta ) {	
	for(var i = 0, len = SEA3D.AnimationHandler.animations.length; i < len; i++) {		
		SEA3D.AnimationHandler.animations[i].update( delta * 1000 );
	}
}

SEA3D.AnimationHandler.setTime = function( time ) {
	for(var i = 0, len = SEA3D.AnimationHandler.animations.length; i < len; i++) {
		SEA3D.AnimationHandler.animations[i].time = time;
	}
}

SEA3D.AnimationHandler.stop = function() {
	while(SEA3D.AnimationHandler.animations.length) {
		SEA3D.AnimationHandler.animations[0].stop();
	}
}

SEA3D.AnimationHandler.animations = [];

//
//	Object
//

SEA3D.Object = function(name, data, type, sea) {
	this.name = name;
	this.data = data;
	this.type = type;
	this.sea = sea;
}

//
//	Geometry Base
//

SEA3D.GeometryBase = function(scope) {
	var data = scope.data;
	
	scope.attrib = data.readUShort();	
	
	scope.isBigMesh = (scope.attrib & 1) != 0;
	
	// variable uint
	data.readVInt = scope.isBigMesh ? data.readUInt : data.readUShort;
	
	scope.numVertex = data.readVInt();
	scope.length = scope.numVertex * 3;
}

//
//	Geometry
//

SEA3D.Geometry = function(name, data, sea) {
	var i, j, vec, len;

	this.name = name;
	this.data = data;	
	this.sea = sea;
	
	SEA3D.GeometryBase(this);
	
	// NORMAL
	if (this.attrib & 4) {
		this.normal = [];		
		
		i = 0;
		while (i < this.length)		
			this.normal[i++] = data.readFloat();	
	}
	
	// TANGENT
	if (this.attrib & 8) {
		this.tangent = [];
		
		i = 0;
		while (i < this.length)	
			this.tangent[i++] = data.readFloat();
	}
	
	// UV
	if (this.attrib & 32) {
		this.uv = [];
		this.uv.length = data.readUByte();
		
		len = this.numVertex * 2;
		
		i = 0;
		while (i < this.uv.length) {
			// UV VERTEX DATA
			this.uv[i++] = vec = [];									
			j = 0; 
			while(j < len) 
				vec[j++] = data.readFloat();		
		}
	}
	
	// JOINT-INDEXES / WEIGHTS
	if (this.attrib & 64) {
		this.jointPerVertex = data.readUByte();
		
		var jntLen = this.numVertex * this.jointPerVertex;
		
		this.joint = [];
		this.weight = [];
		
		i = 0;
		while (i < jntLen) {
			this.joint[i++] = data.readUShort();
		}
		
		i = 0;
		while (i < jntLen) {
			this.weight[i++] = data.readFloat(); 
		}
	}
	
	// VERTEX_COLOR
	if (this.attrib & 128) {
		var colorAttrib = data.readUByte(),
			numColor = (((colorAttrib & 64) >> 6) | ((colorAttrib & 128) >> 6)) + 1,
			colorCount = this.numVertex * 4;					
		
		this.color = [];
		this.color.length = colorAttrib & 15;
		
		for(i = 0; i < this.color.length; i++)
		{								
			var vColor = [];
			
			switch(numColor)
			{
				case 1:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 0;
						vColor[j++] = 0;
						vColor[j++] = 1;
					}
					break;
				
				case 2:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 0;
						vColor[j++] = 1;
					}
					break;
				
				case 3:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 1;
					}
					break;
				
				case 4:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
					}
					break;
			}										
			
			this.color[i] = vColor;
		}
	}
	
	// VERTEX
	this.vertex = [];
	i = 0; 
	while(i < this.length) 
		this.vertex[i++] = data.readFloat();
	
	// SUB-MESHES
	this.indexes = [];
	this.indexes.length = data.readUByte();			
	
	// INDEXES
	for (i=0;i<this.indexes.length;i++) {
		len = data.readVInt() * 3;
		this.indexes[i] = vec = [];
		j = 0; 
		while(j < len) 
			vec[j++] = data.readVInt();
	}
}

SEA3D.Geometry.prototype.type = "geo";

//
//	Geometry Delta
//

SEA3D.GeometryDelta = function(name, data, sea) {
	var i, j, delta, readNumber, numDiv, vecUint, vec;

	this.name = name;
	this.data = data;	
	this.sea = sea;
	
	this.attrib = data.readUShort();	
	this.numVertex = data.readUInteger();
	
	this.length = this.numVertex * 3;
	
	if (this.attrib & 1)
	{		
		readNumber = function() { return data.readByte(); }
		numDiv = 0xFF / 2;
	}
	else
	{
		readNumber = function() { return data.readShort(); }
		numDiv = 0xFFFF / 2;
	}
	
	// NORMAL
	if (this.attrib & 4)
	{
		delta = data.readFloat();		
		this.normal = [];
		
		i = 0;
		while (i < this.length) 			
			this.normal[i++] = (readNumber() / numDiv) * delta;	
	}
	
	// TANGENT
	if (this.attrib & 8)
	{
		delta = data.readFloat();		
		this.tangent = [];
		
		i = 0;
		while (i < this.length) 			
			this.tangent[i++] = (readNumber() / numDiv) * delta;	
	}
	
	// UV
	if (this.attrib & 32) {
		this.uv = [];
		this.uv.length = data.readUByte();
		
		var uvLen = this.numVertex * 2;
		
		i = 0;
		while (i < this.uv.length) {
			// UV VERTEX DATA
			delta = data.readFloat();
			this.uv[i++] = vec = [];	
			
			j = 0; 
			while(j < uvLen) 
				vec[j++] = (readNumber() / numDiv) * delta;
		}
	}
	
	// JOINT-INDEXES / WEIGHTS
	if (this.attrib & 64) {
		this.jointPerVertex = data.readUByte();
		
		var jntLen = this.numVertex * this.jointPerVertex;
		
		this.joint = [];
		this.weight = [];
		
		i = 0;
		while (i < jntLen) {
			this.joint[i++] = data.readUInteger();
		}
		
		i = 0;
		while (i < jntLen) {
			this.weight[i++] = (readNumber() / numDiv) * 1;
		}
	}
	
	// VERTEX_COLOR
	if (this.attrib & 128) {
		var colorAttrib = data.readUByte(),
			numColor = (((colorAttrib & 64) >> 6) | ((colorAttrib & 128) >> 6)) + 1,
			colorCount = this.numVertex * 4;					
		
		this.color = [];
		this.color.length = colorAttrib & 15;
		
		for(i = 0; i < this.color.length; i++)
		{								
			var vColor = [];
			
			switch(numColor)
			{
				case 1:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 0;
						vColor[j++] = 0;
						vColor[j++] = 1;
					}
					break;
				
				case 2:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 0;
						vColor[j++] = 1;
					}
					break;
				
				case 3:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = 1;
					}
					break;
				
				case 4:
					j = 0;					
					while (j < colorCount)
					{
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
						vColor[j++] = data.readUByte() / 0xFF;
					}
					break;
			}										
			
			this.color[i] = vColor;
		}
	}
	
	// VERTEX
	delta = data.readFloat();	
	
	this.vertex = [];	
	i = 0; 
	while(i < this.length) 
		this.vertex[i++] = (readNumber() / numDiv) * delta;
	
	// SUB-MESHES
	this.indexes = [];
	this.indexes.length = data.readUByte();			
	
	// INDEXES
	if (this.attrib & 2) {
		// POLYGON		
		for (i=0;i<this.indexes.length;i++) {
			var polyCount = data.readUInteger();
			
			this.indexes[i] = vecUint = [];
								
			for(j = 0; j < polyCount; j++) 
			{
				var a = data.readUInteger(),
					b = data.readUInteger(),
					c = data.readUInteger(),
					d = data.readUInteger();
				
				
				vecUint.push(a);
				vecUint.push(b);
				vecUint.push(c);
				
				if (d > 0)
				{
					vecUint.push(c);
					vecUint.push(d + 1);
					vecUint.push(a);																		
				}
				else continue;							
			}
		}	
	} else {
		var polyCount = data.readUInteger() * 3;
		
		// TRIANGLE		
		for (i=0;i<this.indexes.length;i++) {
			this.indexes[i] = vecUint = [];	
			
			j = 0; 
			while(j < polyCount) 
				vecUint[j++] = data.readUInteger();			
		}
	}
}

SEA3D.GeometryDelta.prototype.type = "geDL";

//
//	Object3D
//

SEA3D.Object3D = 
{
	read : function(scope) {
		var data = scope.data;
		
		scope.isStatic = false;
		
		scope.attrib = data.readUShort();	
		scope.tags = [];
		
		if (scope.attrib & 1)
			scope.parent = scope.sea.getObject(data.readUInt());
		
		if (scope.attrib & 2)
			scope.animations = SEA3D.Animation.readAnimationList(data, scope.sea);		
		
		if (scope.attrib & 4)
			scope.scripts = SEA3D.Script.readScriptList(data, scope.sea);		
			
		if (scope.attrib & 16)
			scope.properties = scope.sea.getObject(data.readUInt());	
		
		if (scope.attrib & 32) {
			var objectType = data.readUByte();
			scope.isStatic = objectType & 1;
		}
	}
	,readTags : function(scope, callback) {
		var data = scope.data,	
			numTag = data.readUByte();		
		
		for (var i=0;i<numTag;++i) {
			var kind = data.readUShort();
			var size = data.readUInt();				
			var pos = data.position;
			
			//not implemented
			//readTag(kind, size)
			
			data.position = pos += size; 
		}
	}
}

//
//	Entity3D
//

SEA3D.Entity3D = 
{
	read : function(scope) {
		SEA3D.Object3D.read(scope);
	
		var data = scope.data;				
		
		scope.castShadows = true;
		
		if (scope.attrib & 64) {
			var lightType = data.readUByte();			
			scope.castShadows = (lightType & 1) == 0;
		}
	}
	,readTags : function(scope, callback) {
		SEA3D.Object3D.readTags(scope, callback);
	}
}

//
//	Sound3D
//

SEA3D.Sound3D = 
{
	read : function(scope) {
		SEA3D.Object3D.read(scope);
	
		var data = scope.data,
			sea = scope.sea;
		
		scope.autoPlay = (scope.attrib & 64) != 0;
		
		if (scope.attrib & 128) 
			scope.mixer = sea.getObject(data.readUInt());
		
		scope.sound = sea.getObject(data.readUInt());
		scope.volume = data.readFloat();
	}
	,readTags : function(scope, callback) {
		SEA3D.Object3D.readTags(scope, callback);
	}
}

//
//	Sound Point
//

SEA3D.SoundPoint = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Sound3D.read(this);
	
	this.position = data.readVector3();	
	this.distance = data.readFloat();	
	
	SEA3D.Sound3D.readTags(this);
}

SEA3D.SoundPoint.prototype.type = "sp";

//
//	Container3D
//

SEA3D.Container3D = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Object3D.read(this);
	
	this.transform = data.readMatrix();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.Container3D.prototype.type = "c3d";

//
//	Texture URL
//

SEA3D.TextureURL = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.url = data.readUTF( data.length );
}

SEA3D.TextureURL.prototype.type = "urlT";

//
//	Actions
//

SEA3D.Actions = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.count = data.readUInt();
	this.action = [];
	
	for(var i = 0; i < this.count; i++) {
		var flag = data.readUByte();
		var kind = data.readUShort();
						
		var size = data.readUShort();
		
		var position = data.position;		
		var act = this.action[i] = {kind:kind};
		
		// range of animation
		if (flag & 1)
		{
			// start and count in frames
			act.range = [data.readUInt(), data.readUInt()];
		}
		
		// time
		if (flag & 2)
		{
			act.time = data.readUInt();
		}
		
		// easing
		if (flag & 4)
		{
			act.intrpl = SEA3D.DataTable.INTERPOLATION_TABLE[data.readUByte()];
													
			if (act.intrpl.indexOf('back.') == 0)
			{
				act.intrplParam0 = data.readFloat();					
			}
			else if (act.intrpl.indexOf('elastic.') == 0)					
			{
				act.intrplParam0 = data.readFloat();
				act.intrplParam1 = data.readFloat();
			}
		}
		
		switch (kind) {
			case SEA3D.Actions.RTT_TARGET:
				act.source = sea.getObject(data.readUInt());
				act.target = sea.getObject(data.readUInt());
				break;
			
			case SEA3D.Actions.LOOK_AT:
				act.source = sea.getObject(data.readUInt());
				act.target = sea.getObject(data.readUInt());
				break;
			
			case SEA3D.Actions.PLAY_SOUND:					
				act.sound = sea.getObject(data.readUInt());
				act.offset = data.readUInt();
				break;
			
			case SEA3D.Actions.PLAY_ANIMATION:
				act.object = sea.getObject(data.readUInt());
				act.name = data.readUTF8();
				break;
			
			case SEA3D.Actions.FOG:						
				act.color = data.readUInt24();
				act.min = data.readFloat();
				act.max = data.readFloat();						
				break;
			
			case SEA3D.Actions.ENVIRONMENT:										
				act.texture = sea.getObject(data.readUInt());
				break;
			
			case SEA3D.Actions.ENVIRONMENT_COLOR:
				act.color = data.readUInt24();
				break;	
			
			case SEA3D.Actions.CAMERA:
				act.camera = sea.getObject(data.readUInt());
				break;	
			
			default:
				console.log("Action \"" + kind + "\" not found.");
				break;
		}
		
		data.position = position + size;
	}			
}

SEA3D.Actions.SCENE = 0;
SEA3D.Actions.ENVIRONMENT_COLOR = 1;
SEA3D.Actions.ENVIRONMENT = 2;		
SEA3D.Actions.FOG = 3;
SEA3D.Actions.PLAY_ANIMATION = 4;
SEA3D.Actions.PLAY_SOUND = 5;
SEA3D.Actions.ANIMATION_AUDIO_SYNC = 6;
SEA3D.Actions.LOOK_AT = 7;		
SEA3D.Actions.RTT_TARGET = 8;		
SEA3D.Actions.CAMERA = 9;

SEA3D.Actions.prototype.type = "act";

//
//	Script
//

SEA3D.Script = 
{
	DETAILED : false
	
	,readScriptList : function(data, sea) {
		var list = [],					
			count = data.readUByte();
	
		var i = 0;
		while ( i < count )
		{				
			var attrib = data.readUByte(),	
				numParams,
				script = {};
			
			script.priority = (attrib & 1) | (attrib & 2);
			
			if (attrib & 4)
			{
				var j, name;
				
				numParams = data.readUByte();
				
				if (SEA3D.Script.DETAILED)
				{
					script.params = [];
					
					for(j = 0; j < numParams; j++)
					{
						name = data.readUTF8();
						var type = data.readUByte();
						
						script.params[j] = 
							{ 
								name : name, 
								type : type, 
								data : SEA3D.DataTable.readToken(type, data, sea)
							};
					}
				}
				else
				{
					script.params = {};
					
					for ( j = 0; j < numParams; j++ )
					{
						name = data.readUTF8();		
						script.params[name] = SEA3D.DataTable.readObject(data, sea);
					}
				}					
			}
			
			if (attrib & 8)
			{
				script.method = data.readUTF8();
			}
			
			script.tag = sea.getObject(data.readUInt());
			
			list[i++] = script;
		}
		
		return list;
	}
}

//
//	Properties
//

SEA3D.Properties = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.tag = SEA3D.Properties.readProperties(data, sea.objects, name);
}

SEA3D.Properties.readProperties = function(data, sea, pname) {
	var count, i, type, name, attribs;
	
	if (SEA3D.Properties.DETAILED)
	{								
		count = data.readUByte();
		
		props = [];
		
		for(i = 0; i < count; i++)
		{
			name = data.readUTF8();
			type = data.readUByte();
			
			props[i] = 
				{
					name : name,
					type : type,
					value : SEA3D.DataTable.readToken(type, data, sea)						
				};
		}
	}
	else
	{
		count = data.readUByte();
		
		props = {};
		
		if (pname)
			props.__name__ = pname;			
		
		for(i = 0; i < count; i++)
		{
			name = data.readUTF8();		
			props[name] = SEA3D.DataTable.readObject(data, sea);						
		}								
	}	
	
	return props;
}	

SEA3D.Properties.DETAILED = false;
SEA3D.Properties.prototype.type = "prop";

//
//	File Info
//

SEA3D.FileInfo = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	sea.info = this.tag = SEA3D.Properties.readProperties(data, sea.objects, name);
}

SEA3D.FileInfo.prototype.type = "info";

//
//	Java Script
//

SEA3D.JavaScript = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;	
	
	this.src = data.readUTF(data.length);
}

SEA3D.JavaScript.prototype.type = "js";

//
//	GLSL
//

SEA3D.GLSL = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;	
	
	this.src = data.readUTF(data.length);
}

SEA3D.GLSL.prototype.type = "glsl";

//
//	Dummy
//

SEA3D.Dummy = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Object3D.read(this);
	
	this.transform = data.readMatrix();
	
	this.width = data.readFloat();
	this.height = data.readFloat();
	this.depth = data.readFloat();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.Dummy.prototype.type = "dmy";

//
//	Line
//

SEA3D.Line = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Object3D.read(this);
	
	this.count = (this.attrib & 64 ? data.readUInt() : data.readUShort()) * 3;		
	this.closed = (this.attrib & 128) != 0;			
	this.transform = data.readMatrix();				
	
	this.vertex = [];
	
	var i = 0;
	while ( i < this.count )
		this.vertex[i++] = data.readFloat();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.Line.prototype.type = "line";

//
//	Planar Render
//

SEA3D.PlanarRender = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.attrib = data.readUByte();
	
	this.quality = (this.attrib & 1) | (this.attrib & 2);
	this.transform = data.readMatrix();
}

SEA3D.PlanarRender.prototype.type = "rttp";

//
//	Cube Render
//

SEA3D.CubeRender = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.attrib = data.readUByte();
	
	this.quality = (this.attrib & 1) | (this.attrib & 2);
	this.position = data.readVector3();
}

SEA3D.CubeRender.prototype.type = "rttc";

//
//	Mesh2D
//

SEA3D.Mesh2D = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Object3D.read(this);
	
	if (this.attrib & 256)			
		this.material = sea.getObject(data.readUInt());	
	
	this.position = data.readVector3();
	
	this.width = data.readFloat();
	this.height = data.readFloat();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.Mesh2D.prototype.type = "m2d";

//
//	Mesh
//

SEA3D.Mesh = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
		
	SEA3D.Entity3D.read(this);
	
	// MATERIAL
	if (this.attrib & 256) {				
		this.material = [];		
		
		var len = data.readUByte();
		
		if (len == 1) this.material[0] = sea.getObject(data.readUInt());
		else
		{
			var i = 0;
			while ( i < len )	
			{
				var matIndex = data.readUInt();
				if (matIndex > 0) this.material[i++] = sea.getObject(matIndex-1);
				else this.material[i++] = undefined;	
			}
		}
	}
	
	if (this.attrib & 512) {
		this.modifiers = [];	
		
		var len = data.readUByte();
		
		for ( var i = 0; i < len; i++ )
			this.modifiers[i] = sea.getObject(data.readUInt());
	}
	
	this.transform = data.readMatrix();
	
	this.geometry = sea.getObject(data.readUInt());
	
	SEA3D.Entity3D.readTags(this);
}

SEA3D.Mesh.prototype.type = "m3d";

//
//	Skeleton
//

SEA3D.Skeleton = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;	
		
	var length = data.readUShort();
	
	this.joint = [];		
	
	for(var i=0;i<length;i++) {
		this.joint[i] = {	
				name:data.readUTF8(),
				parentIndex:data.readUShort() - 1,
				inverseBindMatrix:data.readMatrix()							
			}
	}
}

SEA3D.Skeleton.prototype.type = "skl";

//
//	Skeleton Local
//

SEA3D.SkeletonLocal = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;	
		
	var length = data.readUShort();
	
	this.joint = [];		
	
	for(var i=0;i<length;i++) {
		this.joint[i] = {
				name:data.readUTF8(),
				parentIndex:data.readUShort() - 1,
				
				// POSITION XYZ
				x:data.readFloat(),
				y:data.readFloat(),
				z:data.readFloat(),
				// QUATERNION XYZW
				qx:data.readFloat(),
				qy:data.readFloat(),
				qz:data.readFloat(),
				qw:data.readFloat(),
				// SCALE
				sx:data.readFloat(),
				sy:data.readFloat(),
				sz:data.readFloat()						
			}
	}
}

SEA3D.SkeletonLocal.prototype.type = "sklq";

//
//	Animation Base
//

SEA3D.AnimationBase = 
{
	read : function(scope) {
		var data = scope.data, flag = data.readUByte();			
		
		scope.sequence = [];
		
		if (flag & 1) {
			var count = data.readUShort();
			
			for(var i=0;i<count;i++) {
				flag = data.readUByte();
		
				scope.sequence[i] = {
					name:data.readUTF8(), 
					start:data.readUInt(), 
					count:data.readUInt(),
					repeat:(flag & 1) != 0, 
					intrpl:(flag & 2) != 0
				}
			}
		}		
		
		scope.frameRate = data.readUByte();
		scope.numFrames = data.readUInt();
		
		// no contains sequence
		if (scope.sequence.length == 0)
			scope.sequence[0] = {name:"root",start:0,count:scope.numFrames,repeat:true,intrpl:true};
	}
}

//
//	Animation
//

SEA3D.Animation = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;

	SEA3D.AnimationBase.read(this);
	
	this.dataList = [];
	this.dataList.length = data.readUByte();
					
	for(var i=0;i<this.dataList.length;i++) {
	
		var kind = data.readUShort(),
			type = data.readUByte(),
			anmRaw = [];
		
		SEA3D.DataTable.readVector(type, data, anmRaw, this.numFrames, 0);
		
		this.dataList[i] = {
				kind:kind,
				type:type,	
				blockSize:SEA3D.DataTable.sizeOf(type),		
				data:anmRaw
			}
	}		
}

SEA3D.Animation.POSITION = 0;
SEA3D.Animation.ROTATION = 1;
SEA3D.Animation.SCALE = 2;
SEA3D.Animation.COLOR = 3;
SEA3D.Animation.MULTIPLIER = 4;
SEA3D.Animation.ATTENUATION_START = 5;
SEA3D.Animation.ATTENUATION_END = 6;
SEA3D.Animation.FOV = 7;
SEA3D.Animation.OFFSET_U = 8;
SEA3D.Animation.OFFSET_V = 9;
SEA3D.Animation.SCALE_U = 10;
SEA3D.Animation.SCALE_V = 11;
SEA3D.Animation.ANGLE = 12;
SEA3D.Animation.ALPHA = 13;
SEA3D.Animation.VOLUME = 14;

SEA3D.Animation.DefaultLerpFuncs = [
	SEA3D.Math.lerp3x, // POSITION
	SEA3D.Math.lerpQuat4x, // ROTATION
	SEA3D.Math.lerp3x, // SCALE
	SEA3D.Math.lerpColor1x, // COLOR
	SEA3D.Math.lerp1x, // MULTIPLIER
	SEA3D.Math.lerp1x, // ATTENUATION_START
	SEA3D.Math.lerp1x, // ATTENUATION_END
	SEA3D.Math.lerp1x, // FOV
	SEA3D.Math.lerp1x, // OFFSET_U
	SEA3D.Math.lerp1x, // OFFSET_V
	SEA3D.Math.lerp1x, // SCALE_U
	SEA3D.Math.lerp1x, // SCALE_V
	SEA3D.Math.lerpAng1x, // ANGLE
	SEA3D.Math.lerp1x, // ALPHA
	SEA3D.Math.lerp1x // VOLUME
]

SEA3D.Animation.readAnimationList = function(data, sea) {
	var list = [],					
		count = data.readUByte();				

	var i = 0;
	while ( i < count ) {				
		var attrib = data.readUByte(),				
			anm = {};
		
		anm.relative = (attrib & 1) != 0;
		
		if (attrib & 2)
			anm.timeScale = data.readFloat();
		
		anm.tag = sea.getObject(data.readUInt());
		
		list[i++] = anm;
	}
	
	return list;
}

SEA3D.Animation.prototype.type = "anm";

//
//	Skeleton Animation
//

SEA3D.SkeletonAnimation = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
		
	var i, j, count, joint;
	
	SEA3D.AnimationBase.read(this);
	
	count = data.readUShort()
	
	this.pose = [];		
	
	for(i=0;i<this.numFrames;i++) {
		joint = [];
		joint.length = count;
		
		for(j=0;j<count;j++) {
			joint[j] = {
				// POSITION XYZ
				x:data.readFloat(),
				y:data.readFloat(),
				z:data.readFloat(),
				// QUATERNION XYZW
				qx:data.readFloat(),
				qy:data.readFloat(),
				qz:data.readFloat(),
				qw:data.readFloat()
			}
		}
		
		this.pose[i] = joint;
	}
}

SEA3D.SkeletonAnimation.prototype.type = "skla";

//
//	Morph
//

SEA3D.Morph = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.GeometryBase(this);
	
	var useVertex = (this.attrib & 2) != 0;
	var useNormal = (this.attrib & 4) != 0;
	
	var nodeCount = data.readUShort();
	
	this.node = [];

	var i, j;
			
	for(i = 0; i < nodeCount; i++) {
		var nodeName = data.readUTF8();
		
		if (useVertex) {				
			var verts = [];
			
			j = 0;
			while(j < this.length)
				verts[j++] = data.readFloat();
		}
		
		if (useNormal) {
			var norms = [];
			
			j = 0;
			while(j < this.length)
				norms[j++] = data.readFloat();
		}
		
		this.node[i] = {vertex:verts, normal:norms, name:nodeName}
	}	
}

SEA3D.Morph.prototype.type = "mph";

//
//	Vertex Animation
//

SEA3D.VertexAnimation = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.AnimationBase.read(this);
	
	var flags = data.readUByte();
	
	this.isBigMesh = (flags & 1) != 0;	
	
	data.readVInt = this.isBigMesh ? data.readUInt : data.readUShort;

	this.numVertex = data.readVInt();
	this.length = this.numVertex * 3;
	
	var useVertex = (flags & 2) != 0;
	var useNormal = (flags & 4) != 0;
	
	this.frame = [];

	var i, j;
	
	for(i = 0; i < this.numFrames; i++) {
		if (useVertex) {				
			var verts = [];
			
			j = 0;
			while(j < this.length)
				verts[j++] = data.readFloat();
		}
		
		if (useNormal) {
			var norms = [];
			
			j = 0;
			while(j < this.length)
				norms[j++] = data.readFloat();
		}
		
		this.frame[i] = {vertex:verts, normal:norms}
	}	
}

SEA3D.VertexAnimation.prototype.type = "vtxa";

//
//	Camera
//

SEA3D.Camera = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
		
	SEA3D.Object3D.read(this);
		
	if (this.attrib & 64) {
		this.dof = {
				distance:data.readFloat(),
				range:data.readFloat()
			}
	}
	
	this.transform = data.readMatrix();
	
	this.fov = data.readFloat();	
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.Camera.prototype.type = "cam";

//
//	Joint Object
//

SEA3D.JointObject = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
		
	SEA3D.Object3D.read(this);
	
	this.target = sea.getObject(data.readUInt());
	this.joint = data.readUShort();
	
	this.transform = data.readMatrix();
	
	this.fov = data.readFloat();	
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.JointObject.prototype.type = "jnt";

//
//	Light
//

SEA3D.Light = {
	read : function(scope) {
		SEA3D.Object3D.read(scope);
		
		var data = scope.data;
		
		scope.attenStart = Number.MAX_VALUE;
		scope.attenEnd = Number.MAX_VALUE;
		
		if (scope.attrib & 64) {
			var shadowHeader = data.readUByte();
			
			scope.shadow = {}
			
			scope.shadow.opacity = shadowHeader & 1 ? data.readFloat() : 1;
			scope.shadow.color = shadowHeader & 2 ? data.readUInt24() : 0x000000;
		}
		
		if (scope.attrib & 512) {
			scope.attenStart = data.readFloat();
			scope.attenEnd = data.readFloat();
		}
					
		scope.color = data.readUInt24();
		scope.multiplier = data.readFloat();		
	}
}

//
//	Point Light
//

SEA3D.PointLight = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Light.read(this);
	
	if (this.attrib & 128) {
		this.attenuation = {
				start:data.readFloat(),
				end:data.readFloat()
			}
	}
	
	this.position = data.readVector3();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.PointLight.prototype.type = "plht";

//
//	Hemisphere Light
//

SEA3D.HemisphereLight = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Light.read(this);
	
	if (this.attrib & 128) {
		this.attenuation = {
				start:data.readFloat(),
				end:data.readFloat()
			}
	}
	
	this.secondColor = data.readUInt24();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.HemisphereLight.prototype.type = "hlht";

//
//	Directional Light
//

SEA3D.DirectionalLight = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	SEA3D.Light.read(this);
	
	this.transform = data.readMatrix();
	
	SEA3D.Object3D.readTags(this);
}

SEA3D.DirectionalLight.prototype.type = "dlht";

//
//	Material
//

SEA3D.Material = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.technique = [];
	
	this.attrib = data.readUShort();
	
	this.alpha = 1;
	this.blendMode = "normal";
	this.alphaThreshold = .5;
	
	this.bothSides = (this.attrib & 1) != 0;
		
	this.receiveLights = (this.attrib & 2) == 0;
	this.receiveShadows = (this.attrib & 4) == 0;
	this.receiveFog = (this.attrib & 8) == 0;
	
	this.smooth = (this.attrib & 16) == 0;
	
	if (this.attrib & 32)
		this.alpha = data.readFloat();
		
	if (this.attrib & 64)
		this.blendMode = data.readBlendMode();
	
	if (this.attrib & 128)
		this.animations = SEA3D.Animation.readAnimationList(data, sea);
	
	this.depthMask = (this.attrib & 256) == 0;
	
	var count = data.readUByte();
	
	for (var i = 0; i < count; ++i) {
		var kind = data.readUShort();
		var size = data.readUShort();				
		var pos = data.position;
		var tech, methodAttrib;
		
		switch(kind) {
			case SEA3D.Material.DEFAULT:				
				tech = {
						ambientColor:data.readUInt24(),
						diffuseColor:data.readUInt24(),
						specularColor:data.readUInt24(),
						
						specular:data.readFloat(),
						gloss:data.readFloat()
					}				
				break;			
			case SEA3D.Material.COMPOSITE_TEXTURE:				
				tech = {
						composite:sea.getObject(data.readUInt())
					}	
				break;				
			case SEA3D.Material.DIFFUSE_MAP:				
				tech = {
						texture:sea.getObject(data.readUInt())
					}
				break;			
			case SEA3D.Material.SPECULAR_MAP:				
				tech = {
						texture:sea.getObject(data.readUInt())
					}				
				break;			
			case SEA3D.Material.NORMAL_MAP:				
				tech = {
						texture:sea.getObject(data.readUInt())
					}				
				break;				
			case SEA3D.Material.REFLECTION:
			case SEA3D.Material.FRESNEL_REFLECTION:
				tech = {						
						texture:sea.getObject(data.readUInt()),
						alpha:data.readFloat()						
					}
											
				if (kind == SEA3D.Material.FRESNEL_REFLECTION) {
					tech.power = data.readFloat();
					tech.normal = data.readFloat();
				}	
				break;			
			case SEA3D.Material.REFRACTION:
				tech = {
						texture:sea.getObject(data.readUInt()),
						alpha:data.readFloat(),
						ior:data.readFloat()						
					}
				break;			
			case SEA3D.Material.RIM:
				tech = {
						color:data.readUInt24(),
						strength:data.readFloat(),								
						power:data.readFloat(),			
						blendMode:data.readBlendMode()
					}
				break;			
			case SEA3D.Material.LIGHT_MAP:
				tech = {
						texture:sea.getObject(data.readUInt()),
						channel:data.readUByte(),
						blendMode:data.readBlendMode()
					}
				break;			
			case SEA3D.Material.DETAIL_MAP:
				tech = {
						texture:sea.getObject(data.readUInt()),
						scale:data.readFloat(),
						blendMode:data.readBlendMode()
					}
				break;
			case SEA3D.Material.CEL:
				tech = {
						color:data.readUInt24(),
						levels:data.readUByte(),
						size:data.readFloat(),
						specularCutOff:data.readFloat(),
						smoothness:data.readFloat()						
					}
				break;
			case SEA3D.Material.TRANSLUCENT:
				tech = {
						color:data.readUInt24(),
						translucency:data.readFloat(),
						scattering:data.readFloat()			
					}
				break;
			case SEA3D.Material.BLEND_NORMAL_MAP:
				methodAttrib = data.readUByte();  
				
				tech = {						
						texture:sea.getObject(data.readUInt()),
						secondaryTexture:sea.getObject(data.readUInt())								
					}
				
				if (methodAttrib & 1)
				{
					tech.offsetX0 = data.readFloat();
					tech.offsetY0 = data.readFloat();
					
					tech.offsetX1 = data.readFloat();
					tech.offsetY1 = data.readFloat();
				}
				else
				{
					tech.offsetX0 = tech.offsetY0 = 							
					tech.offsetX1 = tech.offsetY1 = 0
				}
				
				tech.animate = methodAttrib & 2;	
				break;
			case SEA3D.Material.MIRROR_REFLECTION:
				tech = {
						texture:sea.getObject(data.readUInt()),
						alpha:data.readFloat()				
					}
				break;
				
			case SEA3D.Material.AMBIENT_MAP:
				tech = {
						texture:sea.getObject(data.readUInt())			
					}
				break;
				
			case SEA3D.Material.ALPHA_MAP:
				tech = {
						texture:sea.getObject(data.readUInt())			
					}
				break;
				
			case SEA3D.Material.EMISSIVE_MAP:
				tech = {
						texture:sea.getObject(data.readUInt())			
					}
				break;
			
			case SEA3D.Material.VERTEX_COLOR:
				tech = {
						blendMode:data.readBlendMode()		
					}
				break;
			
			case SEA3D.Material.WRAP_LIGHTING:
				tech = {
						color:data.readUInt24(),
						strength:data.readFloat()
					}
				break;
			
			case SEA3D.Material.COLOR_REPLACE:
				methodAttrib = data.readUByte();  
						
				tech = {
						red:data.readUInt24(),
						green:data.readUInt24(),
						blue:data.readUInt24()
					}
						
				if (methodAttrib & 1)										
					tech.mask = sea.getObject(data.readUInt());
					
				if (methodAttrib & 2)
					tech.alpha = data.readFloat();
				break;
			
			case SEA3D.Material.REFLECTION_SPHERICAL:
				tech = {
						texture:sea.getObject(data.readUInt()),
						alpha:data.readFloat()				
					}					
				break;
			
			default:						
				console.warn("SEA3D: MaterialTechnique not found:", kind.toString(16));
				data.position = pos += size;
				continue;
		}
		
		tech.kind = kind;
				
		this.technique.push(tech);								
		
		data.position = pos += size;
	}
}

SEA3D.Material.DEFAULT = 0;
SEA3D.Material.COMPOSITE_TEXTURE = 1;
SEA3D.Material.DIFFUSE_MAP = 2;
SEA3D.Material.SPECULAR_MAP = 3;
SEA3D.Material.REFLECTION = 4;
SEA3D.Material.REFRACTION = 5;
SEA3D.Material.NORMAL_MAP = 6;
SEA3D.Material.FRESNEL_REFLECTION = 7;
SEA3D.Material.RIM = 8;
SEA3D.Material.LIGHT_MAP = 9;
SEA3D.Material.DETAIL_MAP = 10;
SEA3D.Material.CEL = 11;
SEA3D.Material.TRANSLUCENT = 12;
SEA3D.Material.BLEND_NORMAL_MAP = 13;
SEA3D.Material.MIRROR_REFLECTION = 14;
SEA3D.Material.AMBIENT_MAP = 15;
SEA3D.Material.ALPHA_MAP = 16;
SEA3D.Material.EMISSIVE_MAP = 17;
SEA3D.Material.VERTEX_COLOR = 18;
SEA3D.Material.WRAP_LIGHTING = 19;
SEA3D.Material.COLOR_REPLACE = 20;
SEA3D.Material.REFLECTION_SPHERICAL = 21;

SEA3D.Material.prototype.type = "mat";

//
//	Composite
//

SEA3D.Composite = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	var layerCount = data.readUByte();
	
	this.layer = [];
	
	for(var i = 0; i < layerCount; i++)
		this.layer[i] = this.readLayer(data, this);	
}

SEA3D.Composite.prototype.getLayerByName = function(name) {
	for(var i = 0; i < this.layer.length; i++) {
		if (this.layer[i].name == name)
			return this.layer[i];
	}	
}

SEA3D.Composite.prototype.readLayer = function(data, scope) {
	this.scope = scope;
	
	var out = {
		blendMode:"normal",
		opacity:1
	}
	
	var attrib = data.readUShort();		
	
	if (attrib & 1) out.texture = this.readLayerBitmap(data, scope);
	else out.color = data.readUInt24();
			
	if (attrib & 2)
		out.mask = this.readLayerBitmap(data, scope);			
	
	if (attrib & 4)
		out.name = data.readUTF8();
	
	if (attrib & 8)
		out.blendMode = data.readBlendMode();
	
	if (attrib & 16)
		out.opacity = data.readFloat();
		
	return out;
}

SEA3D.Composite.prototype.readLayerBitmap = function(data, scope) {
	this.scope = scope;
	
	var out = {
		channel:0,
		repeat:true,
		offsetU:0,
		offsetV:0,
		scaleU:0,
		scaleV:0,
		rotation:0
	}
	
	out.map = scope.sea.getObject(data.readUInt());
	
	var attrib = data.readUShort();
	
	if (attrib > 0) {
		if (attrib & 1)							
			out.channel = data.readUByte();
		
		if (attrib & 2)							
			out.repeat = false;
		
		if (attrib & 4)							
			out.offsetU = data.readFloat();
		
		if (attrib & 8)							
			out.offsetV = data.readFloat();
		
		if (attrib & 16)							
			out.scaleU = data.readFloat();
		
		if (attrib & 32)							
			out.scaleV = data.readFloat();
		
		if (attrib & 64)							
			out.rotation = data.readFloat();
		
		if (attrib & 128)							
			out.animation = SEA3D.Animation.readAnimationList(data, scope.sea);		
	}
	
	return out;
}

SEA3D.Composite.prototype.type = "ctex";

//
//	Cube Maps
//

SEA3D.CubeMap = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.transparent = false;
	
	var ext = data.readExt();
	
	this.faces = [];
	
	for(var i = 0; i < 6; i++) {		
		var size = data.readUInt();
		this.faces[i] = data.concat(data.position, size);			
		data.position += size;
	}	
}

SEA3D.CubeMap.prototype.type = "cmap";

//
//	JPEG
//

SEA3D.JPEG = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.transparent = false;
}

SEA3D.JPEG.prototype.type = "jpg";

//
//	JPEG_XR
//

SEA3D.JPEG_XR = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.transparent = true;
}

SEA3D.JPEG_XR.prototype.type = "wdp";

//
//	PNG
//

SEA3D.PNG = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.transparent = data.buffer[25] == 0x06;		
}

SEA3D.PNG.prototype.type = "png";

//
//	GIF
//

SEA3D.GIF = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;
	
	this.transparent = data.buffer[11] > 0;	
}

SEA3D.GIF.prototype.type = "gif";

//
//	MP3
//

SEA3D.MP3 = function(name, data, sea) {
	this.name = name;
	this.data = data;
	this.sea = sea;		
}

SEA3D.MP3.prototype.type = "mp3";

//
//	FILE FORMAT
//

SEA3D.File = function(data) {
	this.stream = new SEA3D.Stream(data);	
	this.version = SEA3D.VERSION;
	this.objects = [];
	this.typeClass = {}
	this.typeRead = {}	
	this.position =
	this.dataPosition = 0;
	this.scope = this;		
	this.timeLimit = 60;
	
	// SEA3D
	this.addClass(SEA3D.Geometry);	
	this.addClass(SEA3D.GeometryDelta);	
	this.addClass(SEA3D.Mesh);
	this.addClass(SEA3D.Mesh2D);
	this.addClass(SEA3D.Material);
	this.addClass(SEA3D.Composite);
	this.addClass(SEA3D.PointLight);		
	this.addClass(SEA3D.DirectionalLight);	
	this.addClass(SEA3D.HemisphereLight);	
	this.addClass(SEA3D.Skeleton);
	this.addClass(SEA3D.SkeletonLocal);
	this.addClass(SEA3D.SkeletonAnimation);
	this.addClass(SEA3D.JointObject);
	this.addClass(SEA3D.Camera);
	this.addClass(SEA3D.Morph);
	this.addClass(SEA3D.VertexAnimation);
	this.addClass(SEA3D.CubeMap);
	this.addClass(SEA3D.Animation);	
	this.addClass(SEA3D.Dummy);
	this.addClass(SEA3D.Line);
	this.addClass(SEA3D.SoundPoint);
	this.addClass(SEA3D.PlanarRender);
	this.addClass(SEA3D.CubeRender);
	this.addClass(SEA3D.Actions);	
	this.addClass(SEA3D.TextureURL);
	this.addClass(SEA3D.Container3D);
	this.addClass(SEA3D.Properties);
	this.addClass(SEA3D.FileInfo);
	
	// UNIVERSAL
	this.addClass(SEA3D.JPEG);
	this.addClass(SEA3D.JPEG_XR);
	this.addClass(SEA3D.PNG);
	this.addClass(SEA3D.GIF);
	this.addClass(SEA3D.MP3);
	this.addClass(SEA3D.JavaScript);
	this.addClass(SEA3D.GLSL);
}

SEA3D.File.CompressionLibs = {};
SEA3D.File.DecompressionMethod = {}

SEA3D.File.setDecompressionEngine = function(id, name, method) {
	SEA3D.File.CompressionLibs[id] = name;
	SEA3D.File.DecompressionMethod[id] = method;
}

SEA3D.File.prototype.addClass = function(clazz) {
	this.typeClass[clazz.prototype.type] = clazz;
}

SEA3D.File.prototype.readHead = function() {	
	if (this.stream.bytesAvailable() < 16)
		return false;
		
	if (this.stream.readUTF(3) != "SEA")
		console.error("Invalid SEA3D format.");
		
	var sign = this.stream.readUTF(3);
		
	if (sign != "S3D")
		console.warn("Signature \"" + sign + "\" not recognized.");
		
	this.version = this.stream.readUInt24();
	
	if (this.stream.readUByte() != 0) {				
		throw new Error("Protection algorithm not is compatible.");
	}
	
	this.compressionID = this.stream.readUByte();
	
	this.compressionAlgorithm = SEA3D.File.CompressionLibs[this.compressionID];
	this.decompressionMethod = SEA3D.File.DecompressionMethod[this.compressionID];	
	
	if (this.compressionID > 0 && !this.decompressionMethod) {
		throw new Error("Compression algorithm not is compatible.");
	}
		
	this.length = this.stream.readUInt();
	
	this.dataPosition = this.stream.position;
	
	this.objects.length = 0;
	
	this.stage = this.readBody;
	
	return true;
}

SEA3D.File.prototype.getObject = function(index) {
	return this.objects[index];
}

SEA3D.File.prototype.readSEAObject = function() {
	if (this.stream.bytesAvailable() < 4)
		return null;
	
	var size = this.stream.readUInt();
	var position = this.stream.position;
	
	if (this.stream.bytesAvailable() < size)
		return null;
	
	var flag = this.stream.readUByte();
	var type = this.stream.readExt();
	var meta = null;
			
	var name = flag & 1 ? this.stream.readUTF8() : "",
		compressed = (flag & 2) != 0,
		streaming = (flag & 4) != 0;
	
	if (flag & 8)
	{				
		var metalen = this.stream.readUShort();		
		var metabytes = this.stream.concat(this.stream.position, metalen);			
		this.stream.position += metalen;
		
		if (compressed && this.decompressionMethod)
			metabytes.set(this.decompressionMethod(metabytes.buffer));
		
		meta = SEA3D.Properties.readProperties(metabytes, this.objects);
	}
	
	size -= this.stream.position - position;
	position = this.stream.position;
	
	var data = this.stream.concat(position, size),
		obj;		
	
	if (this.typeClass[type])
	{
		if (compressed && this.decompressionMethod)
			data.set(this.decompressionMethod(data.buffer));
	
		obj = new this.typeClass[type](name, data, this);
		
		if (streaming && this.typeRead[type])
			this.typeRead[type].call(this.scope, obj);
	}
	else
	{
		obj = new SEA3D.Object(name, data, type, this);		
		
		console.warn("SEA3D: Unknown format \"" + type + "\" of file \"" + name + "\". Add a module referring for this format.");
	}		
	
	obj.metadata = meta;
	
	this.objects.push(this.objects[obj.type + "/" + obj.name] = obj);
	
	this.dataPosition = position + size;
	
	++this.position;
	
	return obj;
}

SEA3D.File.prototype.readBody = function() {	
	this.timer.update();	
	
	while (this.position < this.length) {
		if (this.timer.getDeltaTime() < this.timeLimit) {	
			this.stream.position = this.dataPosition;
			
			var sea = this.readSEAObject();			
			
			if (sea) this.dispatchCompleteObject(sea);				
			else return false;
		}
		else return false;
	}
	
	this.stage = this.readComplete;
	
	return true;
}

SEA3D.File.prototype.readComplete = function() {
	this.stream.position = this.dataPosition;
	
	if (this.stream.readUInt24() != 0x5EA3D1)
		console.warn("SEA3D file is corrupted.");
	
	this.stage = null;
	
	this.dispatchComplete();
}

SEA3D.File.prototype.readStage = function(scope) {
	var t;
	while (scope.stage && scope.stage()) t=0;
	if (scope.stage) {
		window.setInterval(scope.readStage, 10, scope);
		scope.dispatchProgress();
	}
}

SEA3D.File.prototype.read = function() {	
	this.timer = new SEA3D.Timer();
	this.stage = this.readHead;
	
	this.readStage(this);
}

SEA3D.File.prototype.dispatchCompleteObject = function(obj) {
	if (!this.onCompleteObject) return;
	
	this.onCompleteObject({
			file:this,
			object:obj
		});
}

SEA3D.File.prototype.dispatchProgress = function() {
	if (!this.onProgress) return;
	
	this.onProgress({
			file:this,
			loaded:this.position,			
			total:this.length,
			progress:this.position / this.length
		});	
}

SEA3D.File.prototype.dispatchDownloadProgress = function(position, length) {
	if (!this.onDownloadProgress) return;
	
	this.onDownloadProgress({
			file:this,
			loaded:position,
			total:length,
			progress:position / length
		});	
}

SEA3D.File.prototype.dispatchComplete = function() {
	var elapsedTime = this.timer.getElapsedTime();
	var message = elapsedTime + "ms, " + this.objects.length + " objects";		

	if (this.onComplete) this.onComplete({
			file:this,
			timeTotal:elapsedTime,
			message:message
		});
	else console.log("SEA3D:", message);
}

SEA3D.File.prototype.dispatchError = function(id, message) {
	if (this.onError) this.onError({file:this,id:id,message:message});
	else console.error("SEA3D: #" + id, message);
}

SEA3D.File.prototype.load = function( url ) {	
	var scope = this,
		xhr = new XMLHttpRequest();
	
	xhr.open( "GET", url, true );
	xhr.responseType = 'arraybuffer';
	
	xhr.onprogress = function(e) {
		if (e.lengthComputable) 
			scope.dispatchDownloadProgress( e.loaded, e.total );
	}
	
	xhr.onreadystatechange = function() {
		if ( xhr.readyState === 2 ){		
			//xhr.getResponseHeader("Content-Length");
		} else if ( xhr.readyState === 3 ) {
			//	progress
		} else if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 || xhr.status === 0 ) {
				// complete
				scope.stream.set(new Uint8Array(this.response));				
				scope.read();				
			} else {
				this.dispatchError(1001, "Couldn't load [" + url + "] [" + xhr.status + "]");				
			}
		}		
	}	
	
	xhr.send();	
}