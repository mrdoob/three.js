var Color = Class.extend
({
	r: null, g: null, b: null, a: null,
	hex: null,
	
	styleString: null,
	
	
	init: function( hex )
	{
		this.setHex( hex ? hex : 0xff000000 );
	},
	
	setHex: function( hex )
	{
		this.hex = hex;
		this.updateRGBA();
		this.updateStyleString();
	},
	
	setRGBA: function( r, g, b, a )
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		
		this.updateHex();
		this.updateStyleString();
	},
	
	updateHex: function()
	{
		this.hex = this.a << 24 | this.r << 16 | this.g << 8 | this.b;
	},
	
	updateRGBA: function()
	{
		this.r = this.hex >> 16 & 0xff;
		this.g = this.hex >> 8 & 0xff;
		this.b = this.hex & 0xff;
		this.a = this.hex >> 24 & 0xff;		
	},
	
	updateStyleString: function()
	{
		this.styleString = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255) + ')';		
	},
	
	toString: function()
	{
		return 'Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', a: ' + this.a + ', hex: ' + this.hex + ', style: ' + this.styleString + ' )';	
	}
	
});
