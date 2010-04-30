var CanvasRenderer = Renderer.extend
({
	context: null,

	init: function()
	{
		this._super();

		this.viewport = document.createElement("canvas");
		this.viewport.style.position = "absolute";

		this.context = this.viewport.getContext("2d");
	},

	setSize: function( width, height )
	{
		this._super( width, height );

		this.viewport.width = this.width;
		this.viewport.height = this.height;
		
		this.context.setTransform(1, 0, 0, 1, this.widthHalf, this.heightHalf);
	},

	render: function( scene, camera )
	{
		this._super( scene, camera );

		var element , pi2 = Math.PI * 2;

		this.context.clearRect (-this.widthHalf, -this.heightHalf, this.width, this.height);
		
		for (j = 0; j < this.renderList.length; j++)
		{
			element = this.renderList[j];
			
			if (element.material instanceof ColorMaterial)
			{
				this.context.fillStyle = element.material.color.styleString;
			}
			else if (element.material instanceof FaceColorMaterial)
			{
				this.context.fillStyle = element.color.styleString;
			}
			
			if (element instanceof Face3)
			{
				this.context.beginPath();
				this.context.moveTo(element.a.screen.x, element.a.screen.y);
				this.context.lineTo(element.b.screen.x, element.b.screen.y);
				this.context.lineTo(element.c.screen.x, element.c.screen.y);
				this.context.fill();
				this.context.closePath();
			}
			else if (element instanceof Face4)
			{
				this.context.beginPath();
				this.context.moveTo(element.a.screen.x, element.a.screen.y);
				this.context.lineTo(element.b.screen.x, element.b.screen.y);
				this.context.lineTo(element.c.screen.x, element.c.screen.y);
				this.context.lineTo(element.d.screen.x, element.d.screen.y);
				this.context.fill();
				this.context.closePath();
			}
			else if (element instanceof Particle)
			{
				this.context.beginPath();
				this.context.arc(element.screen.x, element.screen.y, element.zsize, 0, pi2, true);
				this.context.fill();
				this.context.closePath();				
			}
			
		}
	}
});
