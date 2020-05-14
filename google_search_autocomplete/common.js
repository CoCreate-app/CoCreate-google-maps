var place;
var google_map;
var direction;
function initMapSettings() {
    place = new Place();
    google_map = new GoogleMap();
    direction = new Direction();
}

function clearAll() {
    for (var i = 0; i < document.querySelectorAll("input[data-place]").length; i++)
        document.querySelectorAll("input[data-place]").item(i).value = '';
}

function confirmDirection(param) {
    const map_id = param.dataset.map_id;
    direction.confirmDirection(map_id);
}

function stripHtml(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// function temp() {
//     const mapElements = document.querySelectorAll(".google_map[data-place_id]");
    
//     const observer = new MutationObserver(cbObserver);
    
//     for (const element of mapElements)
//         observer.observe(element, { attributes: true });
    
//     const directionElement = document.querySelectorAll("[data-place='direction_info']");
    
//     for (const element of directionElement)
//         observer.observe(element, { attributes:true });
    
//     var directionsService = new google.maps.DirectionsService();
//     var directionsRenderer = new google.maps.DirectionsRenderer();
//     directionsRenderer.setMap(google_map.map[0]);
//     var request = {
//         origin: "Los Angeles, CA",
//         destination: "Washington, D.C.",
//         travelMode: "DRIVING"
//     };
//     directionsService.route(request, function(result, status) {
//         if (status == 'OK') {
//             directionsRenderer.setDirections(result);
//         }
//     });
// }