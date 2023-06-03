import {CoCreateMap} from './map.js';

var CoCreateMapSearch = function() {
    // variables
    // this.depth = 1;
    
    // functions
    this.init();
    
    this.init = function() {
        var _this = this;
        document.querySelectorAll(".search").forEach(element => {
            element.addEventListener("click", function(){
                let map_id = this.dataset.map_id;
                _this.search(_this, map_id);
            });
        });
    };
    
    this.search = function(_this, map_id) {
        let searchType = document.querySelector(`[data-map_id='${map_id}'][name='searchType']:checked`).value;
        let locationBias = document.querySelector(`[data-map_id='${map_id}'][name='locationBias']:checked`).value;
        let input = this.attToObj("option_attribute", `[data-map_id='${map_id}']`);
        let object = {};
        if (searchType == "searchFromQuery" || searchType == "searchFromPhoneNumber") {
            object = {
                fields:['All']
            };
            if (locationBias == "LatLng" && input.latitude && input.longitude) // only one location, maybe nearest.
                object.locationBias = {
                    lat:parseFloat(input.latitude),
                    lng:parseFloat(input.longitude)
                };
            else if (locationBias == "LatLngBounds")
                object.locationBias = _this.maps[map_id].getBounds();
            else if (locationBias == "Radius")
                object.locationBias = {
                    radius:parseInt(input.radius, 10),
                    center:{
                        lat:parseFloat(input.latitude),
                        lng:parseFloat(input.longitude)
                    }
                };
            if (searchType == "searchFromQuery"){
                object.query = input.query;
                _this.searchFromQuery(object, map_id);
            }
            else {
                object.phoneNumber = input.query;
                _this.searchFromPhoneNumber(object, map_id);
            }
            console.log(object);
        }
        else if (searchType == "searchNearBy") {
            object = {
                keyword:input.query
            };
            if (locationBias == "LatLngBounds")
                object.bounds = _this.maps[map_id].getBounds();
            else if (locationBias == "Radius") {
                object.location = {
                    lat:parseFloat(input.latitude),
                    lng:parseFloat(input.longitude)
                };
                object.radius = parseInt(input.radius, 10);
            }
            if (input.keyword) object.keyword = input.keyword;
            if (input.minPriceLevel) object.minPriceLevel = input.minPriceLevel;
            if (input.maxPriceLevel) object.maxPriceLevel = input.maxPriceLevel;
            if (input.name) object.name = input.name;
            if (input.openNow) object.openNow = input.openNow;
            if (input.rankBy) object.rankBy = google.maps.places.RankBy.DISTANCE;
            console.log(object);
            _this.searchNearBy(object, map_id);
        }
        else if (searchType == "searchText") {
            object = {
                query:input.query
            };
            if (locationBias == "LatLngBounds")
                object.bounds = _this.maps[map_id].getBounds();
            else if (locationBias == "Radius") {
                object.location = new google.maps.LatLng(
                    {
                        lat:parseFloat(input.latitude),
                        lng:parseFloat(input.longitude)
                    });
                object.radius = parseInt(input.radius);
            }
            if (input.openNow) object.openNow = input.openNow;
            if (input.minPriceLevel) object.minPriceLevel = input.minPriceLevel;
            if (input.maxPriceLevel) object.maxPriceLevel = input.maxPriceLevel;
            _this.searchText(object, map_id);
        }
    };
    /*
    object = {
            query*: "",
            fields*: ['All'],
            locationBias: {lat: 37.402105, lng: -122.081974}, || {north: 37.41, south: 37.40, east: -122.08, west: -122.09} || {radius: 100, center: {lat: 37.402105, lng: -122.081974}}
            
        }
    */
    this.searchFromQuery = function(object, map_id) {
        let _this = this;
        this.services[map_id].findPlaceFromQuery(object, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let request = {
                    placeId: results[0].place_id
                }
                _this.findDetails(request, map_id);
            }
        });
    };
    /*
    object = {
            query*: "",
            fields*: ['All'],
            locationBias: {lat: 37.402105, lng: -122.081974}, || {north: 37.41, south: 37.40, east: -122.08, west: -122.09} || {radius: 100, center: {lat: 37.402105, lng: -122.081974}}
        }
    */
    this.searchFromPhoneNumber = function(object, map_id) {
        let _this = this;
        this.services[map_id].findPlaceFromPhoneNumber(object, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let request = {
                    placeId: results[0].place_id
                };
                _this.findDetails(request, map_id);
            }
        });
    };
    /*
    object = {
            (bounds*: google.maps.LatLngBounds(), ||
            (location*: google.maps.LatLng(),
            radius*: "500", // at most 50000))
            keyword: "",
            minPriceLevel: "",
            maxPriceLevel: "",
            name: "",
            openNow: true || false,
            rankBy: google.maps.places.RankBy.PROMINENCE (default) || google.maps.places.RankBy.DISTANCE,
            type: [] // all types following the first entry are ignored
        }
    */
    this.searchNearBy = function(object, map_id) {
        let _this = this;
        this.services[map_id].nearbySearch(object, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                for (let result of results) {
                    let request = {
                        placeId: result.place_id
                    };
                    _this.findDetails(request, map_id);
                }
            }
        });
    };
    /*
    object = {
            query*: "",
            openNow: true || false,
            minPriceLevel: "",
            maxPriceLevel: "",
            (bounds*: google.maps.LatLngBounds(), ||
            (location*: google.maps.LatLng(),
            radius*: "500", // at most 50000))
            type: [] // all types following the first entry are ignored
        }
    */
    this.searchText = function(object, map_id) {
        let _this = this;
        this.services[map_id].textSearch(object, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                for (let result of results) {
                    let request = {
                        placeId: result.place_id
                    };
                    _this.findDetails(request, map_id);
                }
            }
        });
    };
    /*
    object = {
        placeId: "",
        fields: []
    }
    */
    this.findDetails = function(object, map_id) {
        let _this = this;
        console.log(object);
        this.services[map_id].getDetails(object, function(place, status){
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let position = place.geometry.location;
                _this.createMarker(position, map_id);
            }
        });
    };
    
    CoCreateMap.call(this);
};

CoCreateMapSearch.prototype = Object.create(CoCreateMap.prototype);
CoCreateMapSearch.prototype.constructor = CoCreateMapSearch;

export {CoCreateMapSearch}
