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