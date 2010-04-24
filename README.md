Basic and modular javascript 3d engine.

Can use <canvas> and/org <svg> as renderer.

### How to use

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	var camera = new Camera(0, 0, 1000);

	var scene = new Scene();
	
	var renderer = new CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	var material = new ColorMaterial(0xffffff, 1);

	for (var i = 0; i < 1000; i++)
	{
		var particle = new Particle( material );
		particle.position.x = Math.random() * 1000 - 500;
		particle.position.y = Math.random() * 1000 - 500;
		particle.position.z = Math.random() * 1000 - 500;
		particle.updateMatrix();
		scene.add( particle );
	}

	dom_element.appendChild(renderer.viewport);

	setInterval(loop, 1000 / 60);

	function loop()
	{
		renderer.render(scene, camera);
	}
	
### Examples

[![waves.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/waves.png)](http://mrdoob.com/lab/javascript/three/particles/waves.html)
[![floor.png](http://github.com/mrdoob/three.js/raw/master/examples/particles/floor.png)](http://mrdoob.com/lab/javascript/three/particles/floor.html)

### Change Log

2010 04 24 - **r011.2**

* First alpha release
