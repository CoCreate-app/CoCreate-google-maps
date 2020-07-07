function initMapSettings() {
    var coCreateMapAutocomplete = new CoCreateMapAutocomplete();
    var coCreateMapDirection = new CoCreateMapDirection();
    var coCreateMapSearch = new CoCreateMapSearch();
    var coCreateMapGetLocation = new CoCreateMapGetLocation();
    initSortableSettings(coCreateMapAutocomplete);
}
function initSortableSettings(coCreateMapAutocomplete) {
    var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
            if (mutation.type == "childList" && mutation.target.classList.contains("Sortable") && mutation.target.classList.contains("waypoints") && mutation.addedNodes.length == 1) {
                var addedNode = mutation.addedNodes.item(0);
                var place_ids = addedNode.querySelectorAll("[data-place_id]");
                for (var place_id of place_ids) {
                    place_id.setAttribute("data-place_id", addedNode.getAttribute("prefix"));
                }
                console.log(coCreateMapAutocomplete);
                coCreateMapAutocomplete.init();
            }
        });
    });
    var config = { attribute:false, childList: true, characterData: false, subtree: true };
    
    observer.observe(document.body, config);
}




// jin

// const CoCreateInit = {
// 	modules: {},
// 	newModules: {},
// 	observer: null,
	
// 	/**
// 	 * key: module name
// 	 * instance: module instance (ex, CoCreateInput or window)
// 	 * initFunc: function instance for init
// 	 */
// 	register : function (key, instance, initFunc) {
// 		if (this.modules[key]) {
// 			return;
// 		}
// 		this.modules[key] = {
// 			func: initFunc,
// 			instance: instance
// 		}
// 	},
	
// 	init: function() {
// 		if (this.observer) {
// 			return ;
// 		}
// 		try {
// 			const self = this;
// 			this.observer = new MutationObserver(function(mutations) {
// 				self.mutationLogic(mutations)
// 			});
// 			const config = { attribute:false, childList: true, characterData: false, subtree: true };
// 			this.observer.observe(document.body, config);
// 		} catch (error) {
			
// 		}
// 	},
	
// 	registerModules : function (key, instance, initFunc) {
// 		if (this.newModules[key]) {
// 			return;
// 		}
// 		this.newModules[key] = {
// 			func: initFunc,
// 			instance: instance
// 		}
// 	},
	
// 	runInit: function(container) {
// 		console.log(this.newModules, container)
// 		for (let [key, value] of Object.entries(this.newModules)) {
// 			value['func'].call(value['instance'], container);
// 		}
// 	},
	
// 	mutationLogic: function(mutations) {
// 		const self = this;
// 		console.log('mutations event.....');
// 		mutations.forEach(function(mutation){
// 			if (mutation.type == "childList" && mutation.addedNodes.length == 1) {
// 				const addedNode = mutation.addedNodes.item(0);
// 				if (!self.modules) {
// 					return;
// 				}
				
// 		    if (!addedNode.querySelectorAll || !addedNode.getAttribute) { 
// 		      return;
// 		    }
				
// 				for (let [key, value] of Object.entries(self.modules)) {
// 					value['func'].call(value['instance'], addedNode);
// 					// let items = addedNode.querySelectorAll(value['selector']);
// 					// items.forEach(el => {
// 					// 	console.log('init element with observer', key);
// 					// 	value['func'].call(value['instance'], el);
// 					// })
// 				}
// 			}
// 		});
// 	},
// }

// CoCreateInit.init();



// //jean
// const CoCreateInit = {
// 	register : function (selector = '',functionInit) {
// 		console.log("Observer")
// 		let observer = null;
// 		try{
// 			observer = new MutationObserver(function(mutations){
// 					mutations.forEach(function(mutation){
// 					if (mutation.type == "childList" 
// 						&& mutation.addedNodes.length == 1) {
// 						var addedNode = mutation.addedNodes.item(0);
// 							console.log(addedNode)
// 							var list = [];
// 							try{
// 								console.log(selector)
// 								list = addedNode.querySelectorAll(selector);
// 							}catch (error) {
// 								console.log(error);
// 							} 
// 							list.forEach(elem=>{
// 								console.log("Init Element with Observer ",elem)
// 								functionInit(elem);
// 							});
// 						}
// 					});
// 			});
// 			var config = { attribute:false, childList: true, characterData: false, subtree: true };
// 			observer.observe(document.body, config);
// 		}catch (error) {
// 			console.error('errObserver')
// 		}
// 		return observer;
// 	}
	
// }