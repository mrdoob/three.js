var Cube = Geometry.extend
({
	init: function( width, height, depth )
	{
		this._super();
		
		var width_half = width / 2;
		var height_half = height / 2;
		var depth_half = depth / 2;
		
		this.v(  width_half,  height_half, -depth_half );
		this.v(  width_half, -height_half, -depth_half );
		this.v( -width_half, -height_half, -depth_half );
		this.v( -width_half,  height_half, -depth_half );
		this.v(  width_half,  height_half,  depth_half );
		this.v(  width_half, -height_half,  depth_half );
		this.v( -width_half, -height_half,  depth_half );
		this.v( -width_half,  height_half,  depth_half );
		
		this.f4( 0, 1, 2, 3 );
		this.f4( 4, 7, 6, 5 );
		this.f4( 0, 4, 5, 1 );
		this.f4( 1, 5, 6, 2 );
		this.f4( 2, 6, 7, 3 );
		this.f4( 4, 0, 3, 7 );
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
