var Face4 = Vector3.extend
({
	a: null, b: null, c: null, d: null,
	normal: null,
	screen: null,
	color: null,
	colorString: null,

	init: function(a, b, c, d, uv, normal, color)
	{
		this._super((a.x + b.x + c.x + d.x) / 4, (a.y + b.y + c.y + d.y) / 4, (a.z + b.z + c.z + d.z) / 4);
	
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		
		this.screen = new Vector3();

		this.color = color ? color : [0, 0, 0];
		this.colorString = 'rgb(' + this.color[0] + ', ' + this.color[1] + ', ' + this.color[2] + ')';		
	},

	toString: function()
	{
		return 'Face ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';
	}
});
