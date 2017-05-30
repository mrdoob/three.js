		var cubies = [];

		function createCubies()
		{
			var cubieGeometry = new THREE.BoxGeometry(100, 100, 100, 15, 15, 15);
			var cubieMaterial = [];
			cubieMaterial = setCubieMaterial();
			
			for(var i = 0; i < 27; i++)
			{
				var cubieMesh = new THREE.Mesh(cubieGeometry, cubieMaterial[i]);
				cubies.push(cubieMesh);
			}
			
			positionCubies();
			return cubies;
		}
		
		function positionCubies()
		{
			//Front face
			cubies[0].position.set(0,110,110);
			cubies[1].position.set(-110,110,110);
			cubies[2].position.set(-110,0,110);
			cubies[3].position.set(-110,-110,110);
			cubies[4].position.set(0,-110, 110);
			cubies[5].position.set(110,-110,110);
			cubies[6].position.set(110,0,110);
			cubies[7].position.set(110,110,110);
			cubies[8].position.set(0,0,110);
			
			//Middle Face
			cubies[9].position.set(0,110,0);
			cubies[10].position.set(-110,110,0);
			cubies[11].position.set(-110,0,0);
			cubies[12].position.set(-110,-110,0);
			cubies[13].position.set(0,-110, 0);
			cubies[14].position.set(110,-110,0);
			cubies[15].position.set(110,0,0);
			cubies[16].position.set(110,110,0);
			cubies[17].position.set(0,0,0);
			
			//Back Face
			cubies[18].position.set(0,110,-110);
			cubies[19].position.set(-110,110,-110);
			cubies[20].position.set(-110,0,-110);
			cubies[21].position.set(-110,-110,-110);
			cubies[22].position.set(0,-110, -110);
			cubies[23].position.set(110,-110,-110);
			cubies[24].position.set(110,0,-110);
			cubies[25].position.set(110,110,-110);
			cubies[26].position.set(0,0,-110);
		}
		
		function setCubieMaterial()
		{
			var cubieMaterial = [];
			
			var redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF2F2F, shininess: 0.25  });
			var greenMaterial = new THREE.MeshPhongMaterial({ color: 0x24FF24, shininess: 0.25  });
			var blueMaterial = new THREE.MeshPhongMaterial({ color: 0x3E3EFF , shininess: 0.25 });
			var blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 0.25 });
			var yellowMaterial = new THREE.MeshPhongMaterial({ color: 0xF7FC12, shininess: 0.25  });
			var orangeMaterial = new THREE.MeshPhongMaterial({ color: 0xFA6721, shininess: 0.25  });
			var whiteMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, shininess: 0.205 });
			
			redMaterial.specular.setHex(0x010101);
			greenMaterial.specular.setHex(0x010101);
			blueMaterial.specular.setHex(0x010101);
			blackMaterial.specular.setHex(0x010101);
			yellowMaterial.specular.setHex(0x010101);
			orangeMaterial.specular.setHex(0x010101);
			whiteMaterial.specular.setHex(0x010101);
			
			var materialsCubie00 = [];
			materialsCubie00.push(blackMaterial);
			materialsCubie00.push(blackMaterial);
			materialsCubie00.push(yellowMaterial);
			materialsCubie00.push(blackMaterial);
			materialsCubie00.push(blueMaterial);
			materialsCubie00.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie00));
			
			var materialsCubie01 = [];
			materialsCubie01.push(blackMaterial);
			materialsCubie01.push(orangeMaterial);
			materialsCubie01.push(yellowMaterial);
			materialsCubie01.push(blackMaterial);
			materialsCubie01.push(blueMaterial);
			materialsCubie01.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie01));
			
			var materialsCubie02 = [];
			materialsCubie02.push(blackMaterial);
			materialsCubie02.push(orangeMaterial);
			materialsCubie02.push(blackMaterial);
			materialsCubie02.push(blackMaterial);
			materialsCubie02.push(blueMaterial);
			materialsCubie02.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie02));
			
			var materialsCubie03 = [];
			materialsCubie03.push(blackMaterial);
			materialsCubie03.push(orangeMaterial);
			materialsCubie03.push(blackMaterial);
			materialsCubie03.push(whiteMaterial);
			materialsCubie03.push(blueMaterial);
			materialsCubie03.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie03));
			
			var materialsCubie04 = [];
			materialsCubie04.push(blackMaterial);
			materialsCubie04.push(blackMaterial);
			materialsCubie04.push(blackMaterial);
			materialsCubie04.push(whiteMaterial);
			materialsCubie04.push(blueMaterial);
			materialsCubie04.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie04));
			
			var materialsCubie05 = [];
			materialsCubie05.push(redMaterial);
			materialsCubie05.push(blackMaterial);
			materialsCubie05.push(blackMaterial);
			materialsCubie05.push(whiteMaterial);
			materialsCubie05.push(blueMaterial);
			materialsCubie05.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie05));
			
			var materialsCubie06 = [];
			materialsCubie06.push(redMaterial);
			materialsCubie06.push(blackMaterial);
			materialsCubie06.push(blackMaterial);
			materialsCubie06.push(blackMaterial);
			materialsCubie06.push(blueMaterial);
			materialsCubie06.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie06));
			
			var materialsCubie07 = [];
			materialsCubie07.push(redMaterial);
			materialsCubie07.push(blackMaterial);
			materialsCubie07.push(yellowMaterial);
			materialsCubie07.push(blackMaterial);
			materialsCubie07.push(blueMaterial);
			materialsCubie07.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie07));
			
			var materialsCubie08 = [];
			materialsCubie08.push(blackMaterial);
			materialsCubie08.push(blackMaterial);
			materialsCubie08.push(blackMaterial);
			materialsCubie08.push(blackMaterial);
			materialsCubie08.push(blueMaterial);
			materialsCubie08.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie08));
			
			var materialsCubie09 = [];
			materialsCubie09.push(blackMaterial);
			materialsCubie09.push(blackMaterial);
			materialsCubie09.push(yellowMaterial);
			materialsCubie09.push(blackMaterial);
			materialsCubie09.push(blackMaterial);
			materialsCubie09.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie09));
			
			var materialsCubie10 = [];
			materialsCubie10.push(blackMaterial);
			materialsCubie10.push(orangeMaterial);
			materialsCubie10.push(yellowMaterial);
			materialsCubie10.push(blackMaterial);
			materialsCubie10.push(blackMaterial);
			materialsCubie10.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie10));
			
			var materialsCubie11 = [];
			materialsCubie11.push(blackMaterial);
			materialsCubie11.push(orangeMaterial);
			materialsCubie11.push(blackMaterial);
			materialsCubie11.push(blackMaterial);
			materialsCubie11.push(blackMaterial);
			materialsCubie11.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie11));
			
			var materialsCubie12 = [];
			materialsCubie12.push(blackMaterial);
			materialsCubie12.push(orangeMaterial);
			materialsCubie12.push(blackMaterial);
			materialsCubie12.push(whiteMaterial);
			materialsCubie12.push(blackMaterial);
			materialsCubie12.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie12));
			
			var materialsCubie13 = [];
			materialsCubie13.push(blackMaterial);
			materialsCubie13.push(blackMaterial);
			materialsCubie13.push(blackMaterial);
			materialsCubie13.push(whiteMaterial);
			materialsCubie13.push(blackMaterial);
			materialsCubie13.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie13));
			
			var materialsCubie14 = [];
			materialsCubie14.push(redMaterial);
			materialsCubie14.push(blackMaterial);
			materialsCubie14.push(blackMaterial);
			materialsCubie14.push(whiteMaterial);
			materialsCubie14.push(blackMaterial);
			materialsCubie14.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie14));
			
			var materialsCubie15 = [];
			materialsCubie15.push(redMaterial);
			materialsCubie15.push(blackMaterial);
			materialsCubie15.push(blackMaterial);
			materialsCubie15.push(blackMaterial);
			materialsCubie15.push(blackMaterial);
			materialsCubie15.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie15));
			
			var materialsCubie16 = [];
			materialsCubie16.push(redMaterial);
			materialsCubie16.push(blackMaterial);
			materialsCubie16.push(yellowMaterial);
			materialsCubie16.push(blackMaterial);
			materialsCubie16.push(blackMaterial);
			materialsCubie16.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie16));
			
			var materialsCubie17 = [];
			materialsCubie17.push(blackMaterial);
			materialsCubie17.push(blackMaterial);
			materialsCubie17.push(blackMaterial);
			materialsCubie17.push(blackMaterial);
			materialsCubie17.push(blackMaterial);
			materialsCubie17.push(blackMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie17));
			
			var materialsCubie18 = [];
			materialsCubie18.push(blackMaterial);
			materialsCubie18.push(blackMaterial);
			materialsCubie18.push(yellowMaterial);
			materialsCubie18.push(blackMaterial);
			materialsCubie18.push(blackMaterial);
			materialsCubie18.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie18));
			
			var materialsCubie19 = [];
			materialsCubie19.push(blackMaterial);
			materialsCubie19.push(orangeMaterial);
			materialsCubie19.push(yellowMaterial);
			materialsCubie19.push(blackMaterial);
			materialsCubie19.push(blackMaterial);
			materialsCubie19.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie19));
			
			var materialsCubie20 = [];
			materialsCubie20.push(blackMaterial);
			materialsCubie20.push(orangeMaterial);
			materialsCubie20.push(blackMaterial);
			materialsCubie20.push(blackMaterial);
			materialsCubie20.push(blackMaterial);
			materialsCubie20.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie20));
			
			var materialsCubie21 = [];
			materialsCubie21.push(blackMaterial);
			materialsCubie21.push(orangeMaterial);
			materialsCubie21.push(blackMaterial);
			materialsCubie21.push(whiteMaterial);
			materialsCubie21.push(blackMaterial);
			materialsCubie21.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie21));
			
			var materialsCubie22 = [];
			materialsCubie22.push(blackMaterial);
			materialsCubie22.push(blackMaterial);
			materialsCubie22.push(blackMaterial);
			materialsCubie22.push(whiteMaterial);
			materialsCubie22.push(blackMaterial);
			materialsCubie22.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie22));
			
			var materialsCubie23 = [];
			materialsCubie23.push(redMaterial);
			materialsCubie23.push(blackMaterial);
			materialsCubie23.push(blackMaterial);
			materialsCubie23.push(whiteMaterial);
			materialsCubie23.push(blackMaterial);
			materialsCubie23.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie23));
			
			var materialsCubie24 = [];
			materialsCubie24.push(redMaterial);
			materialsCubie24.push(blackMaterial);
			materialsCubie24.push(blackMaterial);
			materialsCubie24.push(blackMaterial);
			materialsCubie24.push(blackMaterial);
			materialsCubie24.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie24));
			
			var materialsCubie25 = [];
			materialsCubie25.push(redMaterial);
			materialsCubie25.push(blackMaterial);
			materialsCubie25.push(yellowMaterial);
			materialsCubie25.push(blackMaterial);
			materialsCubie25.push(blackMaterial);
			materialsCubie25.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie25));
			
			var materialsCubie26 = [];
			materialsCubie26.push(blackMaterial);
			materialsCubie26.push(blackMaterial);
			materialsCubie26.push(blackMaterial);
			materialsCubie26.push(blackMaterial);
			materialsCubie26.push(blackMaterial);
			materialsCubie26.push(greenMaterial);
			
			cubieMaterial.push(new THREE.MeshFaceMaterial(materialsCubie26));
			
			return cubieMaterial;
		}