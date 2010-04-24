var Plane = Geometry.extend
({
	init: function( width, height )
	{
		this._super();
		
		var width_half = width / 2;
		var height_half = height / 2;
		
		this.v( -width_half,  height_half, 0 );
		this.v(  width_half,  height_half, 0 );
		this.v(  width_half, -height_half, 0 );
		this.v( -width_half, -height_half, 0 );
		
		this.f4( 0, 1, 2, 3 );
	},
	
	v: function( x, y, z )
	{
		this.vertices.push( new Vertex( x, y, z ) );
	},

	f4: function( a, b, c, d )
	{
		this.faces.push( new Face4( this.vertices[a], this.vertices[b], this.vertices[c], this.vertices[d] ) );
	}	
});
