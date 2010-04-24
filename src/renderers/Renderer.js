var Renderer = Class.extend
({
	matrix: null,

	viewport: null,
	renderList: null,

	face3Pool: null,
	face4Pool: null,

	width: null,
	height: null,
	widthHalf: null,
	heightHalf: null,

	init: function()
	{
		this.matrix = new Matrix4();

		this.face3Pool = new Array();
		this.face4Pool = new Array();
	},

	setSize: function( width, height )
	{
		this.width = width;
		this.height = height;

		this.widthHalf = this.width / 2;
		this.heightHalf = this.height / 2;
	},

	sort: function(a, b)
	{
		return a.screen.z - b.screen.z;
	},

	render: function( scene, camera )
	{
		var vertex, face, object;
		var face3count = 0, face4count = 0;

		var focuszoom = camera.focus * camera.zoom;

		this.renderList = new Array();

		for (var i = 0; i < scene.objects.length; i++)
		{
			object = scene.objects[i];

			if (object instanceof Mesh)
			{
				this.matrix.multiply( camera.matrix, object.matrix );

				// vertices

				for (var j = 0; j < object.geometry.vertices.length; j++)
				{
					vertex = object.geometry.vertices[j];

					vertex.screen.copy( vertex );

					this.matrix.transform( vertex.screen );

					vertex.screen.z = focuszoom / (camera.focus + vertex.screen.z);

					vertex.visible = vertex.screen.z > 0;					

					vertex.screen.x *= vertex.screen.z;
					vertex.screen.y *= vertex.screen.z; 
				}

				// faces

				for (j = 0; j < object.geometry.faces.length; j++)
				{
					face = object.geometry.faces[j];
					
					// TODO: Use normals for culling

					if (face instanceof Face3)
					{
						if (face.a.visible && face.b.visible && face.c.visible && (object.doubleSided ||
						   (face.c.screen.x - face.a.screen.x) * (face.b.screen.y - face.a.screen.y) -
						   (face.c.screen.y - face.a.screen.y) * (face.b.screen.x - face.a.screen.x) > 0) )
						{
							face.screen.z = (face.a.screen.z + face.b.screen.z + face.c.screen.z) * 0.3;
							
							if (this.face3Pool[face3count] == null)
								this.face3Pool[face3count] = new Face3(new Vertex(), new Vertex(), new Vertex());

							this.face3Pool[face3count].a.screen.copy(face.a.screen);
							this.face3Pool[face3count].b.screen.copy(face.b.screen);
							this.face3Pool[face3count].c.screen.copy(face.c.screen);
							this.face3Pool[face3count].screen.z = face.screen.z;
							this.face3Pool[face3count].color = face.color;
							this.face3Pool[face3count].material = object.material;

							this.renderList.push( this.face3Pool[face3count] );

							face3count++;
						}
					}
					else if (face instanceof Face4)
					{
						if (face.a.visible && face.b.visible && face.c.visible && (object.doubleSided ||
						   ((face.d.screen.x - face.a.screen.x) * (face.b.screen.y - face.a.screen.y) -
						   (face.d.screen.y - face.a.screen.y) * (face.b.screen.x - face.a.screen.x) > 0 ||
						   (face.b.screen.x - face.c.screen.x) * (face.d.screen.y - face.c.screen.y) -
						   (face.b.screen.y - face.c.screen.y) * (face.d.screen.x - face.c.screen.x) > 0)) )
						{
							face.screen.z = (face.a.screen.z + face.b.screen.z + face.c.screen.z + face.d.screen.z) * 0.25;

							if (this.face4Pool[face4count] == null)
								this.face4Pool[face4count] = new Face4(new Vertex(), new Vertex(), new Vertex(), new Vertex());

							this.face4Pool[face4count].a.screen.copy(face.a.screen);
							this.face4Pool[face4count].b.screen.copy(face.b.screen);
							this.face4Pool[face4count].c.screen.copy(face.c.screen);
							this.face4Pool[face4count].d.screen.copy(face.d.screen);
							this.face4Pool[face4count].screen.z = face.screen.z;
							this.face4Pool[face4count].color = face.color;
							this.face4Pool[face4count].material = object.material;

							this.renderList.push( this.face4Pool[face4count] );

							face4count++;
						}						
					}
				}
			}
			else if (object instanceof Particle)
			{
				object.screen.copy(object.position);

				camera.matrix.transform( object.screen );

				object.screen.z = focuszoom / (camera.focus + object.screen.z);

				if (object.screen.z < 0)
					continue;					

				object.screen.x *= object.screen.z;
				object.screen.y *= object.screen.z;

				this.renderList.push( object );
			}
		}

		this.renderList.sort(this.sort);
	}
});
