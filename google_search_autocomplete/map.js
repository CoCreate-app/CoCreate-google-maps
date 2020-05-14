"use strict";

function GoogleMap() {
    if (this) {
        this.gmap;
        this.map=[];
        this.initAllMaps();
    }
}

GoogleMap.prototype = {
    constructor: GoogleMap(),
    initMap: function(mapInfo, map_id) {
        var latitude = mapInfo.lat;
        var longitude = mapInfo.lng;
        var zoom = mapInfo.zoom;
        var map_center = new google.maps.LatLng(latitude, longitude);
        this.map[map_id] = new google.maps.Map(
            document.querySelector(".google_map[data-map_id='" + map_id + "']"), {center: map_center, zoom: zoom});
        this.createMarker(latitude, longitude, map_id);
    },
    createMarker: function(latitude, longitude, map_id) {
        var marker = new google.maps.Marker({
            map: this.map[map_id],
            position: {lat: latitude, lng: longitude}
        });
    },
    initAllMaps: function() {
        var _this = this;
        var showLocation = function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var mapInfo = new MapInfo(longitude, latitude);
            for (var i = 0; i < _this.gmap.length; i++)
                _this.initMap(mapInfo, _this.gmap[i].dataset.map_id);
        };
        var errHandler = function(err) {
            if(err.code == 1) {
                for (var i = 0; i < _this.gmap.length; i++) {
                    var mapInfo = new MapInfo();
                    _this.initMap(mapInfo, _this.gmap[i].dataset.map_id);
                }
            } else if( err.code == 2) {
                alert("Error: Position is unavailable!");
            }
        };
        this.gmap = document.getElementsByClassName("google_map");
        var isCurPosition = document.querySelector("[data-location_request]").dataset.location_request;
        if (navigator.geolocation && isCurPosition == "true") {
            var options = {timeout:6000};
            navigator.geolocation.getCurrentPosition(showLocation, errHandler, options);
        }
        else {
            errHandler({code:1});
        }

        const mapElements = document.querySelectorAll(".google_map[data-map_id]");
        const observer = new MutationObserver(function(mutationList, observer){_this.cbObserver(mutationList, observer, _this)});
        for (const element of mapElements)
            observer.observe(element, { attributes: true });
    },
    cbObserver: function(mutationList, observer, _this) {
        for (const mutation of mutationList) {
            if (mutation.type == "attributes" && mutation.attributeName != "style") {
                var lng = mutation.target.dataset.map_lng;
                var lat = mutation.target.dataset.map_lat;
                if (lng && lat) {
                    var zoom = mutation.target.dataset.map_zoom;
                    if (!zoom) zoom = undefined;
                    var map_id = mutation.target.dataset.map_id;
                    var mapInfo = new MapInfo(lng, lat, zoom);
                    _this.initMap(mapInfo, map_id);
                }
            }
        }
    }
};

function MapInfo(lng, lat, zoom) {
    if (this) {
        this.lat;
        this.lng;
        this.zoom;
        this.init(lng, lat, zoom);
    }
}

MapInfo.prototype = {
    constructor: MapInfo(),
    init: function(lng=-74.0060, lat=40.7128, zoom=15) {
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
        this.zoom = parseInt(zoom);
    }
}