
THREE.TreeNode = function (options) {
    this.level = options.level;
    this.parent = options.parent;
    this.tree = options.tree;
    this.position = options.position;

    //console.log(this.position.x + " : " + this.position.y + " : " + this.position.z);

    this.width = this.tree.planet.radius * 2 / Math.pow(2, this.level);
    this.halfWidth = this.width / 2;
    //this.arcLength = (this.width / this.tree.planet.radius) / 1.43 //divided by fudge factor;
    this.arcLength = (this.width / this.tree.planet.radius)//divided by fudge factor;

    //This is the node's center location after the point is projected onto the sphere.
    this.center = this.FindCenter();
    this.name = this.center.x + ":" + this.center.y + ":" + this.center.z;

    this.isSplit = false;
    this.isDrawn = false;
    this.isOccluded = false;

};


THREE.TreeNode.prototype = {


    update: function () {
        if (this.OccludedByHorizon()) {
            if (this.isDrawn) {
                this.isOccluded = true;
                this.UnDraw();
            }
        } else {
            this.isOccluded = false;
            if (this.InCameraFrustum()) {
                this.GetDistanceFromCamera();
                if (this.isSplit) {
                    if (this.ShouldUnSplit()) {
                        this.UnSplit();
                        this.update();
                    } else {
                        this.updateChildren();
                    }
                } else if (this.ShouldSplit()) {
                    if (this.isDrawn) {
                        this.UnDraw();
                    }
                    this.Split();
                    this.updateChildren();
                }
                /*else if (!this.isDrawn) {
                    this.ShouldDraw();
                }*/
            }
        }
    },
	
	
    checkNeighbors: function(){

		// T;BL;BR; If the top neighbor is split and either the bottem left or bottom right child is split
        if(this.topNeighbor && this.topNeighbor.isSplit && (this.topNeighbor.bottomLeftChild.isSplit || this.topNeighbor.bottomRightChild.isSplit)){

            this.Split();

        }

		// R;TL;BL; If the right neighbor is split and either the top left or bottom left child is split
        if(this.rightNeighbor &&this.rightNeighbor.isSplit && (this.rightNeighbor.bottomLeftChild.isSplit || this.rightNeighbor.topLeftChild.isSplit)){

            this.Split();

        }

		// B;TL;TR If the bottom neighbor is split and either the top left or top right child is split
        if(this.bottomNeighbor && this.bottomNeighbor.isSplit && (this.bottomNeighbor.topLeftChild.isSplit || this.bottomNeighbor.topRightChild.isSplit)){

            this.Split();

        }

		// L;TR;BR If the top neighbor is split and either the top right or bottom right child is split
        if(this.leftNeighbor && this.leftNeighbor.isSplit && (this.leftNeighbor.topRightChild.isSplit || this.leftNeighbor.bottomRightChild.isSplit)){

            this.Split();

        }
		
		
        if(this.isSplit){
			
            if(this.topNeighbor && this.topNeighbor.isSplit){
				
				// -----------------     -----------------
				// |   | x |   |   |     |   |   |   |   |
				// -----------------     -----------------
				// |   | o | • |   |     |   | • | • |   |
				// -----------------  =  -----------------
				// |   | • | • |   |     |   | o | • |   |
				// -----------------     -----------------
				// |   |   |   |   |     |   | x |   |   |
				// -----------------     -----------------
			    this.topLeftChild.topNeighbor = this.topNeighbor.bottomLeftChild;
				
				// -----------------     -----------------
				// |   |   | x |   |     |   |   |   |   |
				// -----------------     -----------------
				// |   | • | o |   |     |   | • | • |   |
				// -----------------  =  -----------------
				// |   | • | • |   |     |   | • | o |   |
				// -----------------     -----------------
				// |   |   |   |   |     |   |   | x |   |
				// -----------------     -----------------
                this.topRightChild.topNeighbor = this.topNeighbor.bottomRightChild;
            
			}
			
            if(this.rightNeighbor && this.rightNeighbor.isSplit){
            
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
				// |   | • | o | x |     | x | o | • |   |
				// -----------------  =  -----------------
				// |   | • | • |   |     |   | • | • |   |
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
			    this.topRightChild.rightNeighbor = this.rightNeighbor.topLeftChild;

				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
				// |   | • | • |   |     |   | • | • |   |
				// -----------------  =  -----------------
				// |   | • | o | x |     | x | o | • |   |
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
                this.bottomRightChild.rightNeighbor = this.rightNeighbor.bottomLeftChild;
            
			}
			
            if(this.bottomNeighbor && this.bottomNeighbor.isSplit){
            
				// -----------------     -----------------
				// |   |   |   |   |     |   | x |   |   |
				// -----------------     -----------------
				// |   | • | • |   |     |   | o | • |   |
				// -----------------  =  -----------------
				// |   | o | • |   |     |   | • | • |   |
				// -----------------     -----------------
				// |   | x |   |   |     |   |   |   |   |
				// -----------------     -----------------
			    this.bottomLeftChild.bottomNeighbor = this.bottomNeighbor.topLeftChild;
				
				// -----------------     -----------------
				// |   |   |   |   |     |   |   | x |   |
				// -----------------     -----------------
				// |   | • | • |   |     |   | • | o |   |
				// -----------------  =  -----------------
				// |   | • | o |   |     |   | • | • |   |
				// -----------------     -----------------
				// |   |   | x |   |     |   |   |   |   |
				// -----------------     -----------------
                this.bottomRightChild.bottomNeighbor = this.bottomNeighbor.topRightChild;
            
			}
			
            if(this.leftNeighbor && this.leftNeighbor.isSplit){
            
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
				// | x | o | • |   |     |   | • | o | x |
				// -----------------  =  -----------------
				// |   | • | • |   |     |   | • | • |   |
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
			    this.topLeftChild.leftNeighbor = this.leftNeighbor.topRightChild;
				
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
				// |   | • | • |   |     |   | • | • |   |
				// -----------------  =  -----------------
				// | x | o | • |   |     |   | • | o | x |
				// -----------------     -----------------
				// |   |   |   |   |     |   |   |   |   |
				// -----------------     -----------------
                this.bottomLeftChild.leftNeighbor = this.leftNeighbor.bottomRightChild;
            
			}

			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | o | x |   |     |   | • | x |   |
			// -----------------  =  -----------------
			// |   | • | • |   |     |   | • | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.topLeftChild.rightNeighbor = this.topRightChild;
		
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | o | • |   |     |   | • | • |   |
			// -----------------  =  -----------------
			// |   | x | • |   |     |   | x | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.topLeftChild.bottomNeighbor = this.bottomLeftChild;

			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | • | o |   |     |   | • | • |   |
			// -----------------  =  -----------------
			// |   | • | x |   |     |   | • | x |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.topRightChild.bottomNeighbor = this.bottomRightChild;

			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | • | • |   |     |   | • | • |   |
			// -----------------  =  -----------------
			// |   | • | • |   |     |   | • | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.topRightChild.leftNeighbor = this.topLeftChild;

			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | x | • |   |     |   | x | • |   |
			// -----------------  =  -----------------
			// |   | o | • |   |     |   | • | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.bottomLeftChild.topNeighbor = this.topLeftChild;
		
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | • | • |   |     |   | • | • |   |
			// -----------------  =  -----------------
			// |   | o | x |   |     |   | • | x |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.bottomLeftChild.rightNeighbor = this.bottomRightChild;

			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | • | x |   |     |   | • | x |   |
			// -----------------  =  -----------------
			// |   | • | o |   |     |   | • | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.bottomRightChild.topNeighbor = this.topRightChild;
		
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
			// |   | • | • |   |     |   | • | • |   |
			// -----------------  =  -----------------
			// |   | x | o |   |     |   | x | • |   |
			// -----------------     -----------------
			// |   |   |   |   |     |   |   |   |   |
			// -----------------     -----------------
            this.bottomRightChild.leftNeighbor = this.bottomLeftChild;

            if(!this.leftNeighbor || this.leftNeighbor && !this.leftNeighbor.isSplit){
				// -----------------
				// |   |   |   |   |
				// -----------------
				// |   | x | • |   |
				// -----------------
				// |   | • | • |   |
				// -----------------
				// |   |   |   |   |
				// -----------------
	            this.topLeftChild.checkNeighbors();
			
				// -----------------
				// |   |   |   |   |
				// -----------------
				// |   | • | x |   |
				// -----------------
				// |   | • | • |   |
				// -----------------
				// |   |   |   |   |
				// -----------------
	            this.topRightChild.checkNeighbors();
			
				// -----------------
				// |   |   |   |   |
				// -----------------
				// |   | • | • |   |
				// -----------------
				// |   | x | • |   |
				// -----------------
				// |   |   |   |   |
				// -----------------
	            this.bottomLeftChild.checkNeighbors();
			
				// -----------------
				// |   |   |   |   |
				// -----------------
				// |   | • | • |   |
				// -----------------
				// |   | • | x |   |
				// -----------------
				// |   |   |   |   |
				// -----------------
	            this.bottomRightChild.checkNeighbors();				
			}

			
        }
		
    },


    /*ShouldDraw: function(){
        this.tree.planet.meshesMightAdd.push({name: this.name, draw: this.Draw.bind(this)});
    },*/

    Draw: function () {

        var position;

        return function () {
            "use strict";

            if(this.isSplit){
                this.topLeftChild.Draw();
                this.topRightChild.Draw();
                this.bottomLeftChild.Draw();
                this.bottomRightChild.Draw();
                return;
            }

            if(this.isDrawn || this.isOccluded){
                return;
            }

            this.tree.planet.RemoveFromDeletedMeshes(this.name);

            var positions = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 3);
            var normals = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 3);
            var uvs = new Float32Array(this.tree.planet.patchSize * this.tree.planet.patchSize * 6 * 2);

            var positionCount = 0;
            var uvsCount = 0;

            var patchSize = this.tree.planet.patchSize;

            for (var u = 0; u < patchSize; u++) {
                for (var v = 0; v < patchSize; v++) {
                    position = this.SolvePoint(u / patchSize, v / patchSize);
                    positions[positionCount++] = position.x;
                    normals[positionCount-1] = positions[positionCount-1];
                    positions[positionCount++] = position.y;
                    normals[positionCount-1] = positions[positionCount-1];
                    positions[positionCount++] = position.z;
                    normals[positionCount-1] = positions[positionCount-1];
                    uvs[uvsCount++] = u / patchSize;
                    uvs[uvsCount++] = v / patchSize;


                    position = this.SolvePoint((u + 1) / patchSize, (v) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = v / patchSize;

                    position = this.SolvePoint((u) / patchSize, (v + 1) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;

                    positions[positionCount++] = positions[positionCount - 4];
                    positions[positionCount++] = positions[positionCount - 4];
                    positions[positionCount++] = positions[positionCount - 4];
                    uvs[uvsCount++] = (u) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;

                    positions[positionCount++] = positions[positionCount - 10];
                    positions[positionCount++] = positions[positionCount - 10];
                    positions[positionCount++] = positions[positionCount - 10];
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = (v) / patchSize;

                    position = this.SolvePoint((u + 1) / patchSize, (v + 1) / patchSize);
                    positions[positionCount++] = position.x;
                    positions[positionCount++] = position.y;
                    positions[positionCount++] = position.z;
                    uvs[uvsCount++] = (u + 1) / patchSize;
                    uvs[uvsCount++] = (v + 1) / patchSize;
                }
            }

            this.tree.planet.meshesToAdd.push(positions.buffer);
            this.tree.planet.meshesToAdd.push(normals.buffer);
            this.tree.planet.meshesToAdd.push(uvs.buffer);
            //this.tree.planet.returnObject.newMeshes.push({name: this.name, center: this.center, positions: positions, uvs: uvs, normals: normals});
            this.tree.planet.returnObject.newMeshes.push({name: this.name, width: this.width, center: this.center, positions: positions, uvs: uvs});

            this.isDrawn = true;
        };

    }(),

    SolvePoint: function () {
        var x, y, z, length;
        return function (u, v) {
            "use strict";
            /*
            var temp = this.tree.widthDir.clone();
            temp.multiplyScalar(u);
            temp.add(this.tree.heightDir.clone().multiplyScalar(v));
            temp.multiplyScalar(this.width);
            temp.add(this.position);
            temp.normalize();
            temp.multiplyScalar(this.tree.planet.radius);
            return temp;
            */
            /*
            width = this.width;
            wx = this.tree.widthDir.x;
            wy = this.tree.widthDir.y;
            wz = this.tree.widthDir.z;
            hx = this.tree.heightDir.x;
            hy = this.tree.heightDir.y;
            hz = this.tree.heightDir.z;
*/
            x = ((this.tree.widthDir.x * u + this.tree.heightDir.x * v) * this.width) + this.position.x;
            y = ((this.tree.widthDir.y * u + this.tree.heightDir.y * v) * this.width) + this.position.y;
            z = ((this.tree.widthDir.z * u + this.tree.heightDir.z * v) * this.width) + this.position.z;

            length = Math.sqrt( x * x + y * y + z * z );

            x = (x / length) * this.tree.planet.radius - this.center.x;
            y = (y / length) * this.tree.planet.radius - this.center.y;
            z = (z / length) * this.tree.planet.radius - this.center.z;

            return {
				x: x,
				y: y,
				z: z
			};

        }
    }(),


    UnDraw: function () {

        this.tree.planet.returnObject.deletedMeshes.push(this.name);
        this.isDrawn = false;

    },


    GetDistanceFromCamera: function () {
        return function () {
            this.distance = this.tree.planet.localCameraPosition.distanceTo(this.center);
        };
    }(),


    ShouldSplit: function () {
        //console.log("\tShould " + this.level + " Split if: " + this.tree.sphere.splitTable[this.level] + " >= " + this.distance);
        this.tree.planet.log(this.level + " < " + this.tree.planet.maxLevel);
        return this.level < this.tree.planet.maxLevel && this.tree.planet.splitTable[this.level] >= this.distance;

    },


    ShouldUnSplit: function () {

        //console.log("\tShould " + this.level + " UnSplit if: " + this.tree.sphere.splitTable[this.level-1] + " < " + this.distance);
        return this.level >= 0 && this.tree.planet.splitTable[this.level] < this.distance;

    },


    InCameraFrustum: function () {

        return true;

    },

    OccludedByHorizon: function () {
        var angleToCamera = this.tree.planet.localCameraPlanetProjectionPosition.angleTo(this.center);

        angleToCamera -= this.arcLength;

        if (angleToCamera > this.tree.planet.localCameraMaxAngle) {
            return true;
        }
        return false;
    },


    Split: function () {

        var options;

        return function () {
            if(this.isSplit){
                return;
            }
            options = {
				level: this.level + 1,
				parent: this,
				tree: this.tree
			};

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            this.topLeftChild = new THREE.TreeNode(options);

            options.position = this.position.clone().add(this.tree.heightDir.clone().multiplyScalar(this.halfWidth));
            options.position.add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.topRightChild = new THREE.TreeNode(options);

            options.position = this.position.clone();
            this.bottomLeftChild = new THREE.TreeNode(options);

            options.position = this.position.clone().add(this.tree.widthDir.clone().multiplyScalar(this.halfWidth));
            this.bottomRightChild = new THREE.TreeNode(options);

            this.isSplit = true;

        };

    }(),


    Die: function () {
        if (this.isDrawn) {
            this.UnDraw();
        }
		else if (this.isSplit) {
            this.UnSplit();
        }

    },


    UnSplit: function () {

        if (this.isSplit) {
			
            this.topLeftChild.Die();
            this.topRightChild.Die();
            this.bottomLeftChild.Die();
            this.bottomRightChild.Die();
            delete this.topLeftChild;
            delete this.topRightChild;
            delete this.bottomLeftChild;
            delete this.bottomRightChild;
			
        }
		
        this.isSplit = false;
		
    },


    updateChildren: function () {

        this.topLeftChild.update();
        this.topRightChild.update();
        this.bottomLeftChild.update();
        this.bottomRightChild.update();

    },


    FindCenter: function () {

        var x, y, z, w, wd, hd;

        return function () {
            x = this.position.x;
            y = this.position.y;
            z = this.position.z;
            wd = this.tree.widthDir;
            hd = this.tree.heightDir;
            w = this.halfWidth;

            x = x + wd.x * w + hd.x * w;
            y = y + wd.y * w + hd.y * w;
            z = z + wd.z * w + hd.z * w;
            return new THREE.Vector3(x, y, z).normalize().multiplyScalar(this.tree.planet.radius);
        };
    }()


};

