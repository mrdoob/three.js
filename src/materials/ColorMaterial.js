var ColorMaterial = Class.extend
({
	color: null,
	opacity: null,
	
	colorString: null,	

	// Uses hex instead of rgb is for keeping the syntax similar to .as version
	
	init: function( color, opacity )
	{
		this.setColor( color ? color : 0xff0000 );
		this.setOpacity( opacity ? opacity : 1 );
	},
	
	setColor: function( color )
	{
		this.color = color;
		this.updateColorString();
	},
	
	setOpacity: function( opacity )
	{
		this.opacity = opacity;
		this.updateColorString();		
	},
	
	updateColorString: function()
	{
		this.colorString = 'rgba(' + (this.color >> 16 & 0xff) + ',' + (this.color >> 8 & 0xff) + ',' + (this.color & 0xff) + ',' + this.opacity + ')';
	}
});
