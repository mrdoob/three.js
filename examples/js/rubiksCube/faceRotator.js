var active = [];
var activeCount = 0;
var pivot = new THREE.Object3D();

var attached = 
{
	 "left": false,
	 "leftP": false,
	
	 "down": false,
	 "downP": false,
	
	 "back": false,
	 "backP": false,
	
	 "right": false,
	 "rightP": false,
	
	 "up": false,
	 "upP": false,
	
	 "front": false,
	 "frontP": false,
	
	 "middle": false,
	 "middleP": false,
	 
	 "X": false,
	 
	 "Y": false,
	
	 "Z": false, 
};

function getObjWorldPos(object)
{
	scene.updateMatrixWorld(true);
	var position = new THREE.Vector3();
	position.setFromMatrixPosition(object.matrixWorld);
	return position;
}

function rotateFace(axisOfRot, faceOdr, lim1, lim2)
{
	activeCount += 1;
	if(activeCount >= 2)
		return;
		
	for (var i = 0; i < cubies.length; i++)
    {
		var position = getObjWorldPos(cubies[i]);
		switch(axisOfRot)
		{
			case "x":
				if(faceOdr === "X")
				{
					active.push(cubies[i]);
					continue;
				}
					
				else if(position.x >= lim1 && position.x <= lim2)
					active.push(cubies[i]);
				break;
			
			case "y":
				if(faceOdr === "Y")
				{
					active.push(cubies[i]);
					continue;
				}
			
				else if(position.y >= lim1 && position.y <= lim2)
					active.push(cubies[i]);
				break;
			
			case "z":
				if(faceOdr === "Z")
				{
					active.push(cubies[i]);
					continue;
				}
			
				else if(position.z >= lim1 && position.z <= lim2)
					active.push(cubies[i]);
				break;
		}
	}
	
	for(var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
	
	for(var item in attached)
	{
		if(item === faceOdr)
			attached[item] = true;
	}	
}


