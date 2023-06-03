import './map.js';
import {CoCreateMapAutocomplete} from './autocomplete.js';
import {CoCreateMapDirection} from './direction.js';
import {CoCreateMapSearch} from './search.js';
import {CoCreateMapGetLocation} from './location.js';
/*const CoCreateMapAutocomplete = require('./autocomplete');*/

// const loader = new Loader({
//   key: "AIzaSyAQsud7vA9plHy7FGIicfQ5IiwtJFIreVg",
//   version: "weekly",
// });

// loader.load().then(() => {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: -34.397, lng: 150.644 },
//     zoom: 8,
//   });
// });

function initMapSettings() {
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
    var CoCreateConfig = { attribute:false, childList: true, characterData: false, subtree: true };

    observer.observe(document.body, config);
}

window.initMapSettings = initMapSettings()

export {initMapSettings, initSortableSettings}
