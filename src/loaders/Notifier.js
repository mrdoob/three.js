/**
 * @author gero3 / https://github.com/gero3
 */
 
THREE.Notifier = function(loaders,callback ){
	
	this.loaders = [].slice(loaders);
	this.onComplete = callback || function(){};
	THREE.Notifier._Notifiers.push(this);
	
};

THREE.Notifier.prototype.notify = function(loader,status){
		var notifiers = THREE.Notifier._Notifiers;
		var i = this.loaders.indexOf(loader);
		if (i > -1){
			this.loaders.splice(i,1);
			if (this.loaders.length === 0){
				this.onComplete();
				notifiers.splice(notifiers.indexOf(this),1);
			}
		}
}

THREE.Notifier._Notifiers = [];

THREE.Notifier.notify = function(loader,status){
	var notifiers = THREE.Notifier._Notifiers;
		
	for(var i = 0,il = notifiers;i<il;i++){
		notifiers[i].notify(loader);
	}
};