Editor.ChangeHistory = function(editor) {
    this.editor              = editor;
    this.baseModel           = editor.data;

    this.baseScene           = editor.getScene();
    this.baseHelperScene     = editor.getHelpersScene();
    this.transactions        = [];
    this.transactionsPointer = this.transactions.length - 1;

    this.loader   = new THREE.ObjectLoader();
    this.exporter = new THREE.ObjectExporter();

    this.setBaseScene(editor.getScene());
}

Editor.ChangeHistory.prototype = {

    cloneScene: function(scene) {
        var config,
            clone;

        config = this.exporter.parse(scene);
        clone  = this.loader.parse(config);

        return clone;
    },

    setBaseScene: function(scene) {

        this.baseScene = this.cloneScene(scene);

    },

    getBaseScene: function(model) {

        return this.baseScene;

    },

    setBaseHelperScene: function(scene) {

        this.baseHelperScene = this.cloneScene(scene);
        
    },

    getBaseHelperScene: function(model) {

        return this.baseHelperScene;

    },

    addAndApplyChange: function(transaction) {

        // this creates an alternative future
        if(this.canRedo()) {
            // TODO: delete "future" elements
            // TODO: set pointer to new transactions length
        }

        if(typeof transaction === 'function') {
            this.transactions.push(transaction);
            this.transactionsPointer = this.transactions.length - 1;

            transaction();
        }

    },

    applyChanges: function() {
        var clonedScene       = this.cloneScene(this.getBaseScene()),
            pointer           = this.transactionsPointer;

        // set scene for applying transactions
        this.editor.setScene(clonedScene, true);

        this.transactions.forEach(function(transaction, idx) {
            if(idx <= pointer) {
                transaction();
            }
        });

        // set scene with change signal dispatching
        this.editor.setScene(clonedScene);
    },

    undo: function () {

        if(this.canUndo()) {
            --this.transactionsPointer;
        }

        this.applyChanges();
    },

    redo: function () {

        if(this.canRedo()) {
            ++this.transactionsPointer;
        }

        this.applyChanges();
    },

    canUndo: function () {

        return this.transactionsPointer > 0;

    },

    canRedo: function () {

        return this.transactionsPointer < (this.transactions.length - 1);

    },

    addTestCube: function() {
        var geometry,
            material,
            cube;

        // Erzeugt eine Geometry und ein Material.
        // Das Material soll die Farben der Geometry-Faces wiederspiegeln
        geometry = new THREE.CubeGeometry(200, 200, 200);
        material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors });

        // Verteile zufällige Farben auf den Geometry-Faces.
        for (var i = 0; i < geometry.faces.length; i++) {
            geometry.faces[i].color.setHex(Math.random() * 0xffffff);
        }

        // erzeugt eine konkrete Abbildung in Form
        // eines Mesh, durch Geometry und Material
        cube = new THREE.Mesh(geometry, material);
        cube.position.y =  250;
        cube.position.x = -550;

        return cube;
    }
}
