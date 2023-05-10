// import { Loader } from "@googlemaps/js-api-loader";

// const loader = new Loader({
//   key: "AIzaSyAQsud7vA9plHy7FGIicfQ5IiwtJFIreVg",
//   version: "weekly",
// });

// loader.load().then(() => {
  
// });



var CoCreateMap = function(object) {
    
    // variables
    // this.depth = 0;

    // selectors
    this.mapDivSelector = ".google_map";
    
    // functions
    this.init(object);

    this.requireLocationSelector = "data-geolocation";
};

/* global navigator, MutationObserver, google */
CoCreateMap.prototype = {
    mapDivs:[],
    maps:[],
    services:[],
    markers:[], // MultiMarker & control
    constructor: CoCreateMap,
    init: function(object){
        let _this = this;
        this.__proto__.mapDivs = document.querySelectorAll(this.mapDivSelector);
        if (object !== undefined) {
            this.renderMap(object.mapInfo, object.markerInfo);
        }
        else {
            let curLocation = document.querySelector(`[${this.requireLocationSelector}]`);
            let isCurLocation = curLocation ? curLocation.getAttribute(this.requireLocationSelector) : false;
            if (navigator.geolocation && isCurLocation == "true") {
                let options = {timeout:5000};
                navigator.geolocation.getCurrentPosition(this.showLocation, this.errHandler, options);
            }
            else this.errHandler({code:1});
        }
        
        let observer = new MutationObserver(
            function (mutationList, observer) {
                mutationList.forEach(mutation => {
                    if (mutation.type == "attributes" && (mutation.attributeName == "data-map_lng" || mutation.attributeName == "data-map_lat" || mutation.attributeName == "data-map_zoom") && mutation.target.matches(_this.mapDivSelector) && mutation.target.attributes["data-map_id"])
                        cbObserver(mutation, _this);
                });
            });
        let config = { attributes: true, subtree: true };
        observer.observe(document.body, config);

        function cbObserver(mutation, _this) {
            let lat = mutation.target.dataset.map_lat;
            let lng = mutation.target.dataset.map_lng;
            if (lat && lng) {
                let zoom = mutation.target.dataset.map_zoom;
                if (!zoom) zoom = undefined;
                let mapInfo = new MapInfo(mutation.target.dataset.map_id, lng, lat, zoom);
                _this.renderMap(mapInfo);
            }
        }
    },
    showLocation: function(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        for (let map of this.mapDivs) {
            let mapInfo = new MapInfo(map.dataset.map_id, longitude, latitude);
            this.renderMap(mapInfo);
        }
    },
    errHandler: function(err) {
        if (err.code == 1)
            for (let map of this.mapDivs) {
                let mapInfo = new MapInfo(map.dataset.map_id);
                this.renderMap(mapInfo);
            }
        else if (err.code == 2)
            alert("Error: Position is unavailable!");
    },
    renderMap: function(mapInfo, markerInfo) {
        let latitude = parseFloat(mapInfo.lat);
        let longitude = parseFloat(mapInfo.lng);
        let zoom = mapInfo.zoom;
        let map_id = mapInfo.map_id;
        let map_center = new google.maps.LatLng(latitude, longitude);
        this.__proto__.maps[map_id] = new google.maps.Map(
            document.querySelector(`.google_map[data-map_id='${map_id}']`), {center: map_center, zoom: zoom});
        // console.log(this.__proto__.maps[map_id].__proto__.getBounds());
        this.__proto__.maps[map_id].__proto__.bounds_changed = () => {
            console.log([this.maps[map_id].getCenter().lng(), this.maps[map_id].getCenter().lat()]);
            console.log([[this.maps[map_id].getBounds().Ua.i, this.maps[map_id].getBounds().Za.i], [this.maps[map_id].getBounds().Ua.j, this.maps[map_id].getBounds().Za.j]]);
        };
        this.__proto__.markers[map_id] = [];
        this.__proto__.services[map_id] = new google.maps.places.PlacesService(this.maps[map_id]);
        if (markerInfo === undefined) {
            // this.createMarker({lat:latitude, lng:longitude}, map_id, true);
            // this.setMarker(map_id, {draggable: true, position: {lat:latitude, lng:longitude}});
        }
        else {
            if (markerInfo.option.position == undefined) markerInfo.option.position = {lat:latitude, lng:longitude};
            this.setMarker(map_id, markerInfo.option, markerInfo.marker_id);
        }
    },
    /**
     * @param map_id : map_id
     * @param option : MarkerOptions => option.position : exist - add & update, undefined - delete
     * @param marker_id : marker_id : not exist - add,  exist - update & delete
     * @return marker_id : success - marker_id, failure - -1;
     */
    setMarker: function(map_id, option, marker_id) {
        option.map = this.maps[map_id];
        if (option.position !== undefined) { // add & update
            if (marker_id === undefined) { // add
                this.markers[map_id].push(new google.maps.Marker(option));
                return this.markers[map_id].length - 1;
            }
            else {
                this.markers[map_id][marker_id] = new google.maps.Marker(option);
                return marker_id;
            }
        }
        else // delete
            if (marker_id === undefined) return -1; // error
            else {
                delete this.markers[map_id][marker_id]; // delete
                return marker_id;
            }
    },
    // createMarker: function(place, map_id, draggable = false) {
    //     let _this = this;
    //     // this.__proto__.markers[map_id].push(
    //         new google.maps.Marker({
    //         map: _this.maps[map_id],
    //         draggable:draggable,
    //         position: place
    //     });
    //     // );
    // },
    /**
     * @param attributeName : data attribute name of input -> object key
     * @param addInfo : additional selector of input
     * @param parentInfo : parent selector of input
     * @return object from attributes
     */
    attToObj: function(attributeName, addInfo = "", parentInfo = "") {
        let inputs = document.querySelectorAll(`${parentInfo} input[data-${attributeName}]${addInfo}, ${parentInfo} input[name]${addInfo}, ${parentInfo} textarea[data-${attributeName}]${addInfo}, ${parentInfo} textarea[name]${addInfo}`);
        let result = {};
        for (let input of inputs) {
            let key;
            if (input.dataset) key = input.dataset[attributeName];
            if (!key) key = input.getAttribute("name");
            let value;
            let type = input.getAttribute("type");
            if (type == "button" || type == "submit" || type == "reset") continue;
            if (type == "radio") value = input.checked ? input.value : false;
            else if (type == "checkbox") value = input.checked ? (input.getAttribute("value") || true) : false; // checked value = on
            else if (input.value) value = input.value;
            if (!value) continue;
            if (key in result && type != "radio") {
                let temp = result[key];
                if (Array.isArray(temp)) result[key].push(value);
                else {
                    result[key] = [temp];
                    result[key].push(value);
                }
            }
            else if (value) result[key] = value;
        }
        return result;
    },
    /**
     * @param object : data object
     * @param attributeName : data attribute name of input <- object key
     * @param addInfo : additional selector of input
     * @param parentInfo : parent selector of input
     */
    objToAtt: function(object, attributeName, addInfo = "", parentInfo = "") {
        let inputs = document.querySelectorAll(`${parentInfo} input[data-${attributeName}]${addInfo}, ${parentInfo} input[name]${addInfo}, ${parentInfo} textarea[data-${attributeName}]${addInfo}, ${parentInfo} textarea[name]${addInfo}`);
        for (let input of inputs) {
            let key;
            key = input.dataset[attributeName];
            if (!key) key = input.getAttribute("name");
            let type = input.getAttribute("type");
            if (type == "button" || type == "submit" || type == "reset") continue;
            if (type == "radio" && key in object) input.checked = object[key] == input.getAttribute("value") ? true : false;
            else if (type == "checkbox" && key in object) input.checked = (object[key] == input.getAttribute("value")) || (Array.isArray(object[key]) && object[key].includes(input.getAttribute("value"))) ? true : false; // checked value = on
            else if (key in object) input.value = object[key];
        }
    }
};

function MapInfo(map_id, lng, lat, zoom) {
    this.lat;
    this.lng;
    this.zoom;
    this.map_id;
    this.init(map_id, lng, lat, zoom);
}

MapInfo.prototype = {
    constructor: MapInfo,
    init: function(map_id = 0, lng = -74.0060, lat = 40.7128, zoom = 15) {
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
        this.zoom = parseInt(zoom, 10);
        this.map_id = map_id;
    }
};

function stripHtml(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

export {CoCreateMap, onlyUnique, stripHtml};