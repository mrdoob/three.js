
THREE.RenderVault = (function(){
    
    var vault = {};
    var selectedVault; 
    var selectedFlagVault;
    
    var objectstorage = {};
    
    var renderVaultRendererIdCounter = 0;
    var renderVaultObjectIdCounter = 0;
    
    
    var useRenderer = function(renderer){
        
        if (renderer._renderVaultRendererId === undefined) {
            
            renderer._renderVaultRendererId = (renderVaultRendererIdCounter++) + "";
            vault[renderer._renderVaultRendererId] = {};
            vault[renderer._renderVaultRendererId + "Flag"] = {}
        }
        
        selectedVault = vault[renderer._renderVaultRendererId];
        selectedFlagVault = vault[renderer._renderVaultRendererId + "Flag"] 
        
    };
    
    var getRenderObject = function(object){
        
        if (object._renderVaultObjectId === undefined) {
            
            object._renderVaultObjectId = renderVaultObjectIdCounter++;
            selectedVault[object._renderVaultObjectId] = {};
            
        } else if (selectedVault[object._renderVaultObjectId] === undefined){
            
            selectedVault[object._renderVaultObjectId]= {};
            
        }
        
        return selectedVault[object._renderVaultObjectId];
        
    };
    
    var getRenderObjectFlags = function(object){
        
        if (object._renderVaultObjectId === undefined) {
            
            object._renderVaultObjectId = renderVaultObjectIdCounter++;
            selectedFlagVault[object._renderVaultObjectId] = {};
            
        } else if (selectedFlagVault[object._renderVaultObjectId] === undefined){
            
            selectedFlagVault[object._renderVaultObjectId]= {};
            
        }
        
        return selectedFlagVault[object._renderVaultObjectId];
        
    };
    
    var getObjectFlags = function(object) {
        
        if (object._renderVaultObjectId === undefined) {
            
            object._renderVaultObjectId = renderVaultObjectIdCounter++;
            objectstorage[object._renderVaultObjectId] = {};
            
        } else if (objectstorage[object._renderVaultObjectId] === undefined){
            
            objectstorage[object._renderVaultObjectId]= {};
            
        }
        
        return objectstorage[object._renderVaultObjectId];
        
    }
    
    var doesRenderObjectExist = function(object) {
        
        if (object._renderVaultObjectId === undefined) {
            
            return false;
            
        } else if (selectedVault[object._renderVaultObjectId] === undefined){
            
            return false;
            
        }
        
        return true;
        
    };
    
    var checkRenderFlagStatus = function(object, flagName){
        
        var renderobjectflags = getRenderObjectFlags(object);
        var objectflags = getObjectFlags(object);
        
        if (object[flagName] === true){
            
            if (objectflags[flagName] === undefined){
                
                objectflags[flagName] = 0;
                
            } else {
                
                objectflags[flagName] += 1;
                
            }
            
            renderobjectflags[flagName] = objectflags[flagName];
            object[flagName] = false;
            return true;
        }
        
        if (renderobjectflags[flagName] !== objectflags[flagName]){

            renderobjectflags[flagName] = objectflags[flagName];
            return true;
            
        }
        
        return false;
        
    };
    
    return {
        
        getRenderObject: getRenderObject,
        useRenderer: useRenderer,
        doesRenderObjectExist: doesRenderObjectExist,
        checkRenderFlagStatus: checkRenderFlagStatus
        
    };
    
    
}());