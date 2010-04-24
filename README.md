(Very early stage) javascript 3D engine which can use &lt;canvas&gt; and/org &lt;svg&gt; as renderer.

### How to use

	var container;
	var camera, scene, renderer;

	init();
	setInterval(loop, 1000 / 60);

	function init()
	{
		camera = new Camera(0, 0, 1000);

		scene = new Scene();
	
		renderer = new CanvasRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);

		for (var i = 0; i < 1000; i++)
		{
			var particle = new Particle( new ColorMaterial(Math.random() * 0x808008 + 0x808080, 1) );
			particle.size = Math.random() * 10 + 5;
			particle.position.x = Math.random() * 2000 - 1000;
			particle.position.y = Math.random() * 2000 - 1000;
			particle.position.z = Math.random() * 2000 - 1000;
			particle.updateMatrix();
			scene.add( particle );
		}

		container = document.createElement('div');
		document.body.appendChild(container);

		container.appendChild(renderer.viewport);
	}

	function loop()
	{
		renderer.render(scene, camera);
	}
	
### Examples

[![random.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/random.png)](http://mrdoob.com/lab/javascript/three/particles/random.html)
[![waves.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/waves.png)](http://mrdoob.com/lab/javascript/three/particles/waves.html)
[![floor.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/floor.png)](http://mrdoob.com/lab/javascript/three/particles/floor.html)

### Change Log

2010 04 24 - **r001**

* First alpha release
