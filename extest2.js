(function(aGlobal) {
	"use strict";
	var TEXDATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFB'+
	              'MVEWcEFqcGGOlIWOlIWulKWutOXOtOXutQnu1SoS6Uo69Y5zMfrHWnMbepc7erdbntd6d+uwA'+
	              'AAAAo0lEQVR42mNgoAL4jwaIEQDp405gYOBKYLjvwIAssIBhLwM7ssABhtUMXECB3Q0M3nsTG'+
	              'Lr3fmTwYuABGbqAIf9/AsP6/z8YWBjskQV+A/X2IwTccv4CBfYjBBi4/6MLoKnIWotmxvr/v4'+
	              'C2+CMLfGPwYOBHFvjAUAUyGW5t5gao02G2sME8BxcoYDgvwAgS2LVqPxCvWr1rFZAiKggJClA'+
	              'BAAC+WuzCiXr+gwAAAABJRU5ErkJggg==';
	
	var renderer, camera, scene, mesh, mesh2;
	var angle = 0;

	function createMesh(g, texture) {
		var m = new THREE.Mesh(g, new THREE.MeshFaceMaterial());
		g.materials = 
				[
					new THREE.MeshBasicMaterial( { map: texture } ),
					new THREE.MeshBasicMaterial( { color: 0xcc4488 } )
				];
				
		return m;
	}
	
	function setupModel() {
		var img = new Image();
		img.onload = function() { texture.needsUpdate = true; }
		img.src = TEXDATA;
		var texture = new THREE.Texture(img);
		
		var s = new THREE.Shape();
		s.moveTo( 0,0 );
		s.lineTo( -4, -4 );
		s.lineTo(  4, -4 );
		s.lineTo(  5, 0 );
		s.lineTo(  4, 4 );
		s.lineTo( -4, 4 );
		
		var ho = new THREE.Shape();
		ho.moveTo( 0,0 );
		ho.lineTo( 0, 2 );
		ho.lineTo( 2, 0 );
		ho.lineTo( -2,-2 );
		
		s.holes.push(ho);

		var s2 = new THREE.Shape();
		s2.moveTo(8+ 0,0 );
		s2.lineTo(8+ -2, -2 );
		s2.lineTo(8+  2, -2 );
		s2.lineTo(8+  2.5, 0 );
		s2.lineTo(8+  2, 2 );
		s2.lineTo(8+ -2, 2 );
		
		var exoption = {
			bevelEnabled: false,
			bevelSize: 1,
			amount: 6,
			extrudeMaterial: 0,
			material: 1
		};
		
		var geom = s.extrude(exoption);
		mesh = createMesh(geom, texture);
		mesh.position.set(-7, 0, -45);
		scene.add(mesh);
		
		var geom2 = new THREE.ExtrudeGeometry( [s,s2], exoption );
		mesh2 = createMesh(geom2, texture);
		mesh2.position.set(7, 0, -45);
		scene.add(mesh2);
	}
	
	function tick() {
		var DPI = Math.PI*2;
		angle += 0.05;
		if (angle > DPI) {angle -= DPI;}
		mesh.rotation.set(-3.2, angle, 0);
		mesh2.rotation.set(-3.2, angle, 0);
		
		renderer.render(scene, camera);
		setTimeout(tick, 100);
	}
	
	aGlobal.launch = function() {
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer();
		camera = new THREE.PerspectiveCamera();
		scene.add(camera);

		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(0, 1, 2);
		light.position.normalize();
		scene.add(light);
		
		
		renderer.setSize(600, 600);
		document.body.appendChild(renderer.domElement);
		
		setupModel();
		
		setTimeout(tick, 300);
	};
})(window);