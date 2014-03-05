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

        // this.applyChanges();
    },

    applyChanges: function() {
        var clonedScene       = this.cloneScene(this.getBaseScene()),
            clonedHelperScene = this.cloneScene(this.getBaseHelperScene()),
            pointer           = this.transactionsPointer;

        // set scene for applying transactions
        this.editor.setScene(clonedScene, true);
        this.editor.setHelpersScene(clonedHelperScene, true);

        this.transactions.forEach(function(transaction, idx) {
            if(idx <= pointer) {
                transaction();
            }
        });

        // set secene with change signal dispatching
        this.editor.setScene(clonedScene);
        this.editor.setHelpersScene(clonedHelperScene);
    },

    undo: function () {
        console.log('UNDO', this.transactionsPointer);

        if(this.canUndo()) {
            --this.transactionsPointer;
        }

        this.applyChanges();

    },

    redo: function () {
        console.log('REDO', this.transactionsPointer);

        if(this.canRedo()) {
            ++this.transactionsPointer;
        }

        this.applyChanges();

    },

    canUndo: function () {

        return this.transactionsPointer > -1;

    },

    canRedo: function () {

        return this.transactionsPointer < (this.transactions.length - 1);

    },

    dump: function() {

        console.log('model   =>', this.getBaseScene());
        console.log('changes =>', this.transactions);
        console.log('pointer =>', this.transactionsPointer);

    }
}
