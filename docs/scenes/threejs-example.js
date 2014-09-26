var ExampleScene = function() {
	
	//The current selected material saved to the hash
	var selectedMaterial = window.location.hash.substring(1) || "MeshPhongMaterial";
	
	this.renderer = undefined;
	this.controls = undefined;
	this.div = document.getElementById( 'clean' );
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000); //(fov, aspect ratio, near, far frustrum)
	this.camera.position.z = 50;

	this.addRenderer();
	this.addControls();
	this.addLights();
	//this.addSpheresBasic();
	this.addSpheresWithMaterial( selectedMaterial );
	//this.addGeometry();
	this.addGrid();
	this.addEventListeners();
	
	this.loop();
};
		
ExampleScene.prototype = {
	
	addLights : function() {
		this.lights = [];
		this.lights[0] = new THREE.AmbientLight( 0xffffff );
		this.lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
		this.lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
		this.lights[3] = new THREE.PointLight( 0xffffff, 1, 0 );
		
		this.lights[1].position.set(0, 200, 0);
		this.lights[2].position.set(100, 200, 100);
		this.lights[3].position.set(-100, -200, -100);
		
		//this.scene.add( this.lights[0] );
		this.scene.add( this.lights[1] );
		this.scene.add( this.lights[2] );
		this.scene.add( this.lights[3] );
	},
			
	addGeometry : function() {
		
		//-------------------------------------------------------------------------------
		// Various types of geometry to play with, only un-comment 1 geometry at a time
		
		//var geometry = new THREE.CircleGeometry(10, 20, 0, 2 * Math.PI);
		//var geometry = new THREE.CubeGeometry(15, 10, 10, 1, 1, 1);			//(width, height, depth, widthSegments, heightSegments, depthSegments)
		var geometry = new THREE.CylinderGeometry(10, 12, 20, 32, 2, false);	//(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
		//var geometry = new THREE.CircleGeometry();
		
		/*
			// Extruded Geometry
		
			var extrudeSettings = {
				bevelEnabled: true,
				bevelSegments: 2,
				steps: 100,
				extrudePath : new THREE.SplineCurve3([
					new THREE.Vector3( 0, -8, 0),
					new THREE.Vector3( 3, -1.66, 0),
					new THREE.Vector3( -3, 1.66, 0),
					new THREE.Vector3( 0, 8, 0)
				])
			};
			var extrudeBend = new THREE.Shape([ //Closed
		
				new THREE.Vector3( 0.05, 0.00, 0.00),
				new THREE.Vector3( 0.85, 0.00, 0.00),
				new THREE.Vector3( 1.00, 0.05, 0.00),
				new THREE.Vector3( 1.00, 0.85, 0.00),
				new THREE.Vector3( 0.85, 1.00, 0.00),
				new THREE.Vector3( 0.05, 1.00, 0.00),
				new THREE.Vector3( 0.00, 0.85, 0.00),
				new THREE.Vector3( 0.00, 0.05, 0.00)

			]);
			var geometry = new THREE.ExtrudeGeometry(extrudeBend, extrudeSettings);
		*/
		
		
		var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
			new THREE.MeshNormalMaterial( {} ),
			new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: 2,  opacity: 0.1, transparent: true } ) ]
		);
		
		this.scene.add(mesh);
	},
	
	addRenderer : function() {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.div.appendChild( this.renderer.domElement );
	},
	
	addControls : function() {
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
	},
	
	addSpheresBasic : function() {

		var sphere = new THREE.SphereGeometry( 5, 16, 8 ); // (radius, widthSegments, heightSegments)
		
		this.spheres = [];
		
		this.spheres[0] = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) );
		this.spheres[1] = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) );
		this.spheres[2] = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) );
		this.spheres[3] = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
		
		this.spheres[0].position.set(10,  0,  0);
		this.spheres[1].position.set( 0, 10,  0);
		this.spheres[2].position.set( 0,  0, 10);
		this.spheres[3].position.set(10, 10,  0);
		
		this.scene.add(this.spheres[0]);
		this.scene.add(this.spheres[1]);
		this.scene.add(this.spheres[2]);
		this.scene.add(this.spheres[3]);
		
	},
	
	addSpheresWithMaterial : function(material) {

		var sphere = new THREE.SphereGeometry( 5, 64 / 2, 32 / 2 ); // (radius, widthSegments, heightSegments)
		
		this.spheres = [];
		
		var colors = [
			0x9f0040,
			0x00409f,
			0x809f80,
			0x9faa00
		];
		
		for(var i=0; i < 4; ++i) {
			
			
			//Non-shiny material
			if(material === "MeshLambertMaterial") {
				
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshLambertMaterial( {
						color: colors[i],
						emissive : new THREE.Color( 0x000510 ),
						wireframe : false,
						wireframeLinewidth : 3
					}))
				);
					
			} else if(material === "MeshPhongMaterial") {
				
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshPhongMaterial( {
						color: colors[i],
						specular : new THREE.Color( 0xffffff ),
						shininess : Math.pow(10, i),
						emissive : new THREE.Color( 0x000510 ),
						shading : THREE.NoShading,
						wireframe : false,
						wireframeLinewidth : 3
					}))
				);
					
			} else if(material === "MeshNormalMaterial") {	
				
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshNormalMaterial( {
						
					}))
				);
					
			} else if(material === "MeshDepthMaterial") {	
				
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshDepthMaterial( {
						shading: THREE.FlatShading,
						wireframe: true
					}))
				);
					
				this.camera.near = 20;
				this.camera.far = 100;
					
			} else if(material === "MeshFaceMaterial") {
				
				/* Can't get to work
				var materials = [],
					colorIterator;

				//Create 6 materials
				for (var j=0; j<6; j++) {
					
					var img = new Image();
					img.src = "textures/cube/clean/" + i + '.jpg';
					var tex = new THREE.Texture(img);
					img.tex = tex;

					img.onload = function() {
						this.tex.needsUpdate = true;
					};
					colorIterator = Math.floor(Math.random() * colors.length);
					
					materials[j] = new THREE.MeshBasicMaterial({
						color: 0xffffff,
						transparent: true,
						blending: THREE.AdditiveBlending,
						map: tex
					});
					
				}
				
				
				console.log(materials);
				
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshFaceMaterial( materials ))
				);
				*/
				
			} else {	
				if(material !== "MeshBasicMaterial") {
					console.log(material + " material not implemented by this script. Using MeshBasicMaterial");
				}
				this.spheres.push(
					new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color : colors[i] } ) )
				);
			}
			
		}
		
		//Set the position
		
		this.spheres[0].position.set( 0,   0,  0);
		this.spheres[1].position.set( 10,  0,  0);
		this.spheres[2].position.set(-10,  0,  0);
		this.spheres[3].position.set(  0,  10,  0);
		
		this.scene.add(this.spheres[0]);
		this.scene.add(this.spheres[1]);
		this.scene.add(this.spheres[2]);
		this.scene.add(this.spheres[3]);
		
	},
	
	addGrid : function() {

		var lineMaterial = new THREE.LineBasicMaterial( { color: 0x303030 } ),
			geometry = new THREE.Geometry(),
			floor = -75, step = 25;

		for ( var i = 0; i <= 40; i ++ ) {

			geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
			geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

			geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
			geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

		}

		this.grid = new THREE.Line( geometry, lineMaterial, THREE.LinePieces );
		this.scene.add( this.grid );

	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeHandler.bind(this));
	},
	
	resizeHandler : function() {
		
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	},
			
	loop : function() {

		requestAnimationFrame( this.loop.bind(this) );
		this.render();

	},
			
	render : function() {
		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	}
	
};

var MaterialSelector = function() {

	this.setSelectedChoiceFromHash();
	this.addEventListeners();
	
}

MaterialSelector.prototype = {
	
	addEventListeners : function() {
		$('#material').change(this.loadNewMaterial.bind(this));
	},
	
	loadNewMaterial : function() {

		window.location.hash = $('#material').val();
		window.location.reload()
		
	},
	
	setSelectedChoiceFromHash : function() {
		$('#material > option').each(function() {
			
			var $this = $(this),
				hash = window.location.hash.substring(1);
				
			if( $this.text() == hash ) {
				$this.attr('selected', 'selected');
			}
		})
	},
}


var exampleScene, materialSelector;

$(function() {
	materialSelector = new MaterialSelector();
	exampleScene = new ExampleScene();
});