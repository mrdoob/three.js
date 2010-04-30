var SVGRenderer = Renderer.extend
({
	svgPathPool: null,
	svgCirclePool: null,

	init: function()
	{
		this._super();

		this.viewport = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.viewport.style.position = "absolute";

		this.svgPathPool = new Array();
		this.svgCirclePool = new Array();
	},

	setSize: function( width, height )
	{
		this.viewport.setAttribute('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height );
		this.viewport.setAttribute('width', width);
		this.viewport.setAttribute('height', height);
	},
	
	render: function( scene, camera )
	{
		this._super( scene, camera );

		while (this.viewport.childNodes.length > 0)
		{
			this.viewport.removeChild(this.viewport.childNodes[0]);
		}
		
		var pathCount = 0, circleCount = 0, svgNode;
		
		for (j = 0; j < this.renderList.length; j++)
		{
			element = this.renderList[j];

			if (element instanceof Face3)
			{
				svgNode = this.getPathNode(pathCount++);
				svgNode.setAttribute('d', 'M ' + element.a.screen.x + ' ' + element.a.screen.y + ' L ' + element.b.screen.x + ' ' + element.b.screen.y + ' L ' + element.c.screen.x + ',' + element.c.screen.y + 'z');					
			}
			else if (element instanceof Face4)
			{
				svgNode = this.getPathNode(pathCount++);
				svgNode.setAttribute('d', 'M ' + element.a.screen.x + ' ' + element.a.screen.y + ' L ' + element.b.screen.x + ' ' + element.b.screen.y + ' L ' + element.c.screen.x + ',' + element.c.screen.y + ' L ' + element.d.screen.x + ',' + element.d.screen.y + 'z');
			}
			else if (element instanceof Particle)
			{
				svgNode = this.getCircleNode(circleCount++);
				svgNode.setAttribute('cx', element.screen.x);
				svgNode.setAttribute('cy', element.screen.y);
				svgNode.setAttribute('r', element.zsize);
			}

			if (element.material instanceof ColorMaterial)
			{
				svgNode.setAttribute('style', 'fill: rgb(' + element.material.color.r + ',' + element.material.color.g + ',' + element.material.color.b + ')');
			}
			else if (element.material instanceof FaceColorMaterial)
			{
				svgNode.setAttribute('style', 'fill: rgb(' + element.color.r + ',' + element.color.g + ',' + element.color.b + ')');
			}

			this.viewport.appendChild(svgNode);
		}
	},
	
	getPathNode: function( id )
	{
		if (this.svgPathPool[id] == null)
		{
			this.svgPathPool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			// this.svgPathPool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			return this.svgPathPool[id];
		}
		
		return this.svgPathPool[id];
	},
	
	getCircleNode: function( id )
	{
		if (this.svgCirclePool[id] == null)
		{
			this.svgCirclePool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			// this.svgCirclePool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			this.svgCirclePool[id].setAttribute('fill', 'red');
			return this.svgCirclePool[id];
		}
		
		return this.svgCirclePool[id];
	}
});
