var Face3 = Vector3.extend
({
	a: null, b: null, c: null,
	screen: null,
	uv: null,
	normal: null,
	color: null,

	init: function(a, b, c, uv, normal, color)
	{
		this._super((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3);	
	
		this.a = a;
		this.b = b;
		this.c = c;

		this.screen = new Vector3();
		
		this.uv = uv ? uv : [ [0, 0], [0, 0], [0, 0] ];
		this.normal = normal ? normal : new Vector3();

		this.color = color ? color : new Color();
	},

	toString: function()
	{
		return 'Face3 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';
	}
});
