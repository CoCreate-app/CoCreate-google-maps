"use strict";

function Direction() {
    if (this) {
        this.initDirection();
    }
}

Direction.prototype = {
    constructor: Direction(),
    initDirection: function() {
        var _this = this;
        const dstElements = document.querySelectorAll("[data-direction='destination'][data-map_id][data-place='longitude'], [data-direction='destination'][data-map_id][data-place='latitude']");
        dstElements.forEach(function(element, index){
            element.addEventListener("change", function(event){
                const map_id = element.dataset.map_id;
                _this.confirmDirection(map_id);
            });
        });
    },
    confirmDirection: function(map_id) {
        const waypointElements = document.querySelectorAll("[data-direction='waypoint'][data-map_id='" + map_id + "'][data-place='longitude'], [data-direction='waypoint'][data-map_id='" + map_id + "'][data-place='latitude']");
        var latlngs = [];
        var points = [];
        for (var wpElement of waypointElements) {
            if (!wpElement.value) continue;
            var place_id = wpElement.dataset.place_id;
            if (latlngs[place_id]) {
                if (wpElement.dataset.place == "latitude") {
                    points.push({location:new google.maps.LatLng(wpElement.value, latlngs[place_id])});
                }
                else
                    points.push({location:new google.maps.LatLng(latlngs[place_id], wpElement.value)});
                delete latlngs[place_id];
            }
            else {
                latlngs[place_id] = wpElement.value;
            }
        }
        var directionsService = new google.maps.DirectionsService();
        var directionsRenderer = new google.maps.DirectionsRenderer();
        var srcLng = document.querySelector("[data-direction='origin'][data-place='longitude'][data-map_id='" + map_id + "']").value;
        var srcLat = document.querySelector("[data-direction='origin'][data-place='latitude'][data-map_id='" + map_id + "']").value;
        var dstLng = document.querySelector("[data-direction='destination'][data-place='longitude'][data-map_id='" + map_id + "']").value;
        var dstLat = document.querySelector("[data-direction='destination'][data-place='latitude'][data-map_id='" + map_id + "']").value;
        if (srcLng && srcLat && dstLng && dstLat) {
            var src = new google.maps.LatLng(srcLat, srcLng);
            var dst = new google.maps.LatLng(dstLat, dstLng);
            directionsRenderer.setMap(google_map.map[map_id]);
            var request = {
                origin: src,
                destination: dst,
                travelMode: google.maps.TravelMode["DRIVING"]
            }
            var allOptions = document.querySelector(".direction_option[data-map_id='" + map_id + "']");
            if (allOptions) {
                if (allOptions.querySelector("[data-direction='travel_mode']:checked"))
                    request.travelMode = google.maps.TravelMode[allOptions.querySelector("[data-direction='travel_mode']:checked").value];
                request.transitOptions = {};
                const transit_arrivalTime = allOptions.querySelector("[data-direction='transit_option']>[data-direction='arrivalTime']");
                if (transit_arrivalTime && transit_arrivalTime.value)
                   request.transitOptions.arrivalTime = new Date(transit_arrivalTime.value);
                const transit_departureTime = allOptions.querySelector("[data-direction='transit_option']>[data-direction='departureTime']");
                if (transit_departureTime && transit_departureTime.value)
                    request.transitOptions.departureTime = new Date(transit_departureTime.value);
                const transit_modes = allOptions.querySelectorAll("[data-direction='transit_option']>[data-direction='modes']:checked");
                var modes = [];
                for (const mode of transit_modes) {
                    modes.push(mode.value);
                }
                request.transitOptions.modes = modes;
                const transit_routingPreference = allOptions.querySelector("[data-direction='transit_option']>[data-direction='routingPreference']:checked");
                if (transit_routingPreference) {
                    request.transitOptions.routingPreference = transit_routingPreference.value;
                }
                request.drivingOptions = {};
                const driving_departureTime = allOptions.querySelector("[data-direction='driving_option']>[data-direction='departureTime']");
                if (driving_departureTime && driving_departureTime.value)
                    request.drivingOptions.departureTime = new Date(driving_departureTime.value);
                const driving_traffic_model = allOptions.querySelector("[data-direction='driving_option']>[data-direction='trafficModel']:checked");
                if (driving_traffic_model)
                    request.drivingOptions.trafficModel = driving_traffic_model.value;
                if (Object.keys(request.drivingOptions).length === 0 && request.drivingOptions.constructor === Object)
                    delete request.drivingOptions;
                const unit_system = allOptions.querySelector("[data-direction='unit_system']:checked");
                if (unit_system)
                    if (unit_system.value == "METRIC")
                        request.unitSystem = google.maps.UnitSystem.METRIC;
                    else
                        request.unitSystem = google.maps.UnitSystem.IMPERIAL;
                const optimizeWaypoints = allOptions.querySelector("[data-direction='optimize_waypoint']:checked");
                if (optimizeWaypoints)
                    request.optimizeWaypoints = true;
                const provideRouteAlternatives = allOptions.querySelector("[data-direction='provide_route_alternatives']:checked");
                if (provideRouteAlternatives)
                    request.provideRouteAlternatives = true;
                const avoidFerries = allOptions.querySelector("[data-direction='avoid_ferries']:checked");
                if (avoidFerries)
                    request.avoidFerries = true;
                const avoidHighways = allOptions.querySelector("[data-direction='avoid_highways']:checked");
                if (avoidHighways)
                    request.avoidHighways = true;
                const avoidTolls = allOptions.querySelector("[data-direction='avoid_tolls']:checked");
                if (avoidTolls)
                    request.avoidTolls = true;
                if (points)
                    request.waypoints = points;
            }
            directionsService.route(request, function(result, status) {
                if (status == 'OK') {
                    directionsRenderer.setDirections(result);
                }
                else {
                    alert("No result!");
                }
            });
        }
    }
};