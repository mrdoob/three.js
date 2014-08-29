var attachedL = false;
var attachedD = false;
var attachedB = false;

var attachedL_P = false;
var attachedD_P = false;
var attachedB_P = false;

//Event handlers for LDB:
function rotateL()
{
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateL");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if ((position.x >= (-111)) && (position.x <= (-109)))
                    active.push(cubies[i]);   
            }

            if (active.length != 9)
				alert("active num wrong");
           

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedL = true;
        }

        function rotateD()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateD");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.y >= (-111) && position.y <= (-109))
                    active.push(cubies[i]);
                
            }

            if (active.length != 9)
                alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedD = true;
        }

        function rotateB()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateB");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.z >= (-111) && position.z <= (-109))
                    active.push(cubies[i]);
                
            }

            if (active.length != 9)
                alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedB = true;
        }
		
//Event handlers for LDB_Prime:
        function rotateL_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateL_P");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if ((position.x >= (-111)) && (position.x <= (-109)))
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9)
            {
                alert("active num wrong");
            }

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedL_P = true;
        }

        function rotateD_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateD_P");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.y >= (-111) && position.y <= (-109))
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9)
                alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedD_P = true;
        }

        function rotateB_P()
        {
			
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateB_P");
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.z >= (-111) && position.z <= (-109))
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9)
                alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedB_P = true;
        }
		
		var attachedR = false;
var attachedU = false;
var attachedF = false;

var attachedR_P = false;
var attachedU_P = false;
var attachedF_P = false;

        //RUF Event Handlers:
        function rotateR()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateR");
            //Find cubies that lie in the right face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var x = pos(cubies[i]).x;
                if (x >= 109 && x <= 111)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedR = true;
        }

        function rotateU()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateU");
            //Find cubies that lie in the up face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.y >= 109 && position.y <= 111)
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9) alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedU = true;
        }

        function rotateF()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateF");
            //Find cubies that lie in the up face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.z >= 109 && position.z <= 111)
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9) alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedF = true;
        }
		
		

//RUF_Prime Event Handlers:
        function rotateR_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateR_P");
            //Find cubies that lie in the right face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var x = pos(cubies[i]).x;
                if (x >= 109 && x <= 111)
                    active.push(cubies[i]);
            }

            if (active.length != 9)
                alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedR_P = true;
        }

        function rotateU_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateU_P");
            //Find cubies that lie in the up face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.y >= 109 && position.y <= 111)
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9) alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedU_P = true;
        }

        function rotateF_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In RotateF_P");
            //Find cubies that lie in the up face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var position = pos(cubies[i]);
                if (position.z >= 109 && position.z <= 111)
                {
                    active.push(cubies[i]);
                }
            }

            if (active.length != 9)
                alert("active num wrong");

            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedF_P = true;
        }
	
	var attachedb = false;
var attachedl = false;
var attachedd = false;

var attachedb_P = false;
var attachedl_P = false;
var attachedd_P = false;

function rotateb()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var z = pos(cubies[i]).z;      
		if (z >= -111 && z <= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedb = true;
}

function rotateb_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var z = pos(cubies[i]).z;      
		if (z >= -111 && z <= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedb_P = true;
}

function rotatel()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -111 && x <= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedl = true;
}

function rotatel_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -111 && x <= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedl_P = true;
}

function rotated()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var y = pos(cubies[i]).y;      
		if (y >= -111 && y <= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedd = true;
}

function rotated_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var y = pos(cubies[i]).y;      
		if (y >= -111 && y<= 1)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedd_P = true;
}

var attachedr = false;
var attachedu = false;
var attachedf = false;

var attachedr_P = false;
var attachedu_P = false;
var attachedf_P = false;

function rotater()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -1 && x <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedr = true;
}

function rotater_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -1 && x <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedr_P = true;
}

function rotater()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -1 && x <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedr = true;
}

function rotater_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var x = pos(cubies[i]).x;      
		if (x >= -1 && x <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedr_P = true;
}

function rotateu()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var y = pos(cubies[i]).y;      
		if (y >= -1 && y <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedu = true;
}

function rotateu_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var y = pos(cubies[i]).y;      
		if (y >= -1 && y<= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedu_P = true;
}

function rotatef()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var z = pos(cubies[i]).z;      
		if (z >= -1 && z <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedf = true;
}

function rotatef_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for (var i = 0; i < cubies.length; i++)
    {
        var z = pos(cubies[i]).z;      
		if (z >= -1 && z <= 111)
            active.push(cubies[i]);
    }
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedf_P = true;
}

var attachedM = false;
var attachedM_P = false;

var attachedS = false;
var attachedS_P = false;

var attachedE = false;
var attachedE_P = false;

        //M and M prime Event Handlers:
        function rotateM()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("MM_Prime");
            
            for (var i = 0; i < cubies.length; i++)
            {
                var x = pos(cubies[i]).x;
                if (x >= (-1) && x <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedM = true;
        }
		
		function rotateM_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In M'");
            //Find cubies that lie in the right face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var x = pos(cubies[i]).x;
                if (x >= (-1) && x <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedM_P = true;
        }
		

        //S and S prime Event Handlers:
        function rotateS()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("S");
            
            for (var i = 0; i < cubies.length; i++)
            {
                var z = pos(cubies[i]).z;
                if (z >= (-1) && z <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedS = true;
        }
		
		function rotateS_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In M'");
            //Find cubies that lie in the right face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var z = pos(cubies[i]).z;
                if (z >= (-1) && z <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedS_P = true;
        }
		
//E and E prime Event Handlers:
        function rotateE()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("MM_Prime");
            
            for (var i = 0; i < cubies.length; i++)
            {
                var y = pos(cubies[i]).y;
                if (y >= (-1) && y <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedE = true;
        }
		
		function rotateE_P()
        {
			activeCount += 1;
			if(activeCount >= 2)
			{
				//console.log("Running...");
				return;
			}
			
            //console.log("In M'");
            //Find cubies that lie in the right face of cube and store them in active[i]
            for (var i = 0; i < cubies.length; i++)
            {
                var y = pos(cubies[i]).y;
                if (y >= (-1) && y <= 1)
                    active.push(cubies[i]);
            }

            if (active.length != 9) alert("active num wrong");
            //attach active[i] cubies to the pivot
            for (var i = 0; i < 9; i++)
                THREE.SceneUtils.attach(active[i], scene, pivot);
            attachedE_P = true;
        }
		
	var attachedX = false;
var attachedY = false;
var attachedZ = false;

var attachedX_P = false;
var attachedY_P = false;
var attachedZ_P = false;


function rotateX()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedX = true;
}

function rotateY()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedY = true;
}

function rotateZ()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedZ = true;
}

function rotateX_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedX_P = true;
}

function rotateY_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedY_P = true;
}

function rotateZ_P()
{
	activeCount += 1;
	if(activeCount >= 2)
	{
		//console.log("Running...");
		return;
	}
	
	for(var i = 0; i < cubies.length; i++)
		active.push(cubies[i]);
		
	for (var i = 0; i < active.length; i++)
		THREE.SceneUtils.attach(active[i], scene, pivot);
    attachedZ_P = true;
}