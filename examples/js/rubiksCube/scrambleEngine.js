function loadScramble(scrambleVector)
{
	var rotationSet = [];

	var scramble = scrambleVector;
	for(var i = 0; i < scramble.length; i++)
	{
		var character = scramble[i];
		switch(character)
		{
			case "R2":
				console.log("R2");
				rotationSet.push(function() {rotateFace("x", "right", 109, 111)});
				rotationSet.push(function() {rotateFace("x", "right", 109, 111)});
				break;
			
			case "U2":
				console.log("U2");
				rotationSet.push(function(){rotateFace("y", "up", 109, 111)});
				rotationSet.push(function() {rotateFace("y", "up", 109, 111)});
				break;
				
			case "F2":
				console.log("F2");	
				rotationSet.push(function(){rotateFace("z", "front", 109, 111)});
				rotationSet.push(function(){rotateFace("z", "front", 109, 111)});
				break;
				
			case "B2":
				rotationSet.push(function(){rotateFace("z", "back", -111, -109)});
				rotationSet.push(function(){rotateFace("z", "back", -111, -109)});
				break;
				
			case "L2":
				rotationSet.push(function(){rotateFace("x", "left", -111, -109)});
				rotationSet.push(function(){rotateFace("x", "left", -111, -109)});
				break;
				
			case "D2":
				rotationSet.push(function(){rotateFace("y", "down", -111, -109)});
				rotationSet.push(function(){rotateFace("y", "down", -111, -109)});
				break;	
				
			case "M2":
				rotationSet.push(function(){rotateFace("x", "middle", -1, 1) });
				rotationSet.push(function(){rotateFace("x", "middle", -1, 1)});
				break;
				
			case "R'":
				console.log("R'");
				rotationSet.push(function(){rotateFace("x", "rightP", 109, 111)});
				break;
			
			case "U'":
				console.log("U'");
				rotationSet.push(function(){rotateFace("y", "upP", 109, 111)});
				break;
				
			case "F'":
				console.log("F'");	
				rotationSet.push(function(){rotateFace("z", "frontP", 109, 111)});
				break;
				
			case "B'":
				rotationSet.push(function(){rotateFace("z", "backP", -111, -109)});
				break;
				
			case "L'":
				rotationSet.push(function(){rotateFace("x", "leftP", -111, -109)});
				break;
				
			case "D'":
				rotationSet.push(function(){rotateFace("y", "downP", -111, -109)});
				break;	
				
			case "M'":
				rotationSet.push(function(){rotateFace("x", "middleP", -1, 1) });
				break;
			
			case "R":
				console.log("R");
				rotationSet.push(function() {rotateFace("x", "right", 109, 111)});
				break;
			
			case "U":
				console.log("U");
				rotationSet.push(function(){rotateFace("y", "up", 109, 111)});
				break;
				
			case "F":
				console.log("F");	
				rotationSet.push(function(){rotateFace("z", "front", 109, 111)});
				break;
				
			case "B":
				rotationSet.push(function(){rotateFace("z", "back", -111, -109)});
				break;
				
			case "L":
				rotationSet.push(function(){rotateFace("x", "left", -111, -109)});
				break;
				
			case "D":
				rotationSet.push(function(){rotateFace("y", "down", -111, -109)});
				break;	
				
			case "M":
				rotationSet.push(function(){rotateFace("x", "middle", -1, 1) });
				break;
		}
	}
	setCubeRotations(rotationSet);
}

function setCubeRotations(func)
{
	var count = 0;
	for(var i = 0; i < func.length; i++)
	{
		setTimeout(func[i], count);
		count += 700;
	}
}