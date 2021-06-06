import CoCreateMapAutocomplete from './autocomplete'
import CoCreateMapDirection from './direction'
import CoCreateMapSearch from './search'
import CoCreateMapGetLocation from './location'
/*const CoCreateMapAutocomplete = require('./autocomplete');*/

// const CoCreateMaps = {
//     ...CoCreateMapAutocomplete,
//     ...coCreateMapDirection,
//     ...coCreateMapGetserach,
//     ...coCreateMapGetLocation
// }


function initMapSettings() {
    
    console.log(" ...... ")
    var coCreateMapAutocomplete = new CoCreateMapAutocomplete();
    var coCreateMapDirection = new CoCreateMapDirection();
    var coCreateMapSearch = new CoCreateMapSearch();
    var coCreateMapGetLocation = new CoCreateMapGetLocation();
    initSortableSettings(coCreateMapGetLocation);
    

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

export {CoCreateMaps,initMapSettings,initSortableSettings}
