var ColorMaterial = Class.extend
({
	color: null,

	init: function( hex, opacity )
	{
		this.color = new Color( (opacity ? (opacity * 0xff) << 24 : 0xff000000) | hex );
	}
});
