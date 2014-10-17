function createText(text, s, h, f, w, st, vsID, fsID, u)
{
	var textParams = 
	{
		size: s,
		height: h,
		font: f,
		weight: w,
		style: st,
		bevelEnabled: false
	};
			
	var textGeo = new THREE.TextGeometry(text, textParams);
	var textMat = new THREE.MeshBasicMaterial({color: 0x005212});
	var txt = new THREE.Mesh(textGeo, textMat);
	
	return txt;
}

function createTextValues()
{
	var text = [];
	text[0] = createText("UP", 35, 20, "helvetiker", "normal", "normal");
	text[0].position.y = 250;
	
	text[1] = createText("DOWN", 35, 20, "helvetiker", "normal", "normal");
	text[1].position.y = -300;
	
	text[2] = createText("LEFT", 35, 20, "helvetiker", "normal", "normal");
	text[2].position.x = -350;
	
	text[3] = createText("RIGHT", 35, 20, "helvetiker", "normal", "normal");
	text[3].position.x = 250;
	
	text[4] = createText("BACK", 35, 20, "helvetiker", "normal", "normal");
	text[4].position.z = -300;
	
	text[5] = createText("FRONT", 35, 20, "helvetiker", "normal", "normal");
	text[5].position.z = 300;

	return text;
}
