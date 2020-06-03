var CoCreateMapDirection = function() {
    // variables
    // this.depth = 1;
    this.isDirectionShowing = false;
    
    // functions
    this.init();
    
    this.init = function() {
        let _this = this;
        
        let dstElements = document.querySelectorAll("[data-direction='destination'][data-map_id][data-place='longitude'], [data-direction='destination'][data-map_id][data-place='latitude']");
        dstElements.forEach(function(element, index){
            element.addEventListener("change", function(event){
                let map_id = element.dataset.map_id;
                _this.prepareDirection(map_id);
            });
        });
        
        let options = document.querySelectorAll(".direction_option:not([data-autodirection='false']) input[data-direction]");
        options.forEach(function(element, index){
            element.addEventListener("change", function(event){
                let map_id = element.dataset.map_id;
                _this.prepareDirection(map_id);
            });
        });
        
        let elementsForClear = document.querySelectorAll("input[data-direction='waypoint']");
        elementsForClear.forEach(function(element, index){
            element.addEventListener("change", function(event){
                let map_id = element.dataset.map_id;
                let place_id = element.dataset.place_id;
                if (_this.isDirectionShowing) {
                    _this.clearAll.clearAll(`input[data-direction='waypoint'][data-map_id='${map_id}']:not([data-place_id='${place_id}'])`);
                    _this.isDirectionShowing = false;
                }
            });
        });
    };
    
    this.attToObj = function(attributeName, addInfo, parentInfo) {
        let obj = this.__proto__.attToObj(attributeName, addInfo, parentInfo);
        let result = {};
        for (let key in obj) {
            if (key == "arrivalTime" || key == "routingPreference") {
                result["transitOptions"] = result["transitOptions"] || {};
                result["transitOptions"][key] = obj[key];
            }
            else if (key == "t_departureTime") {
                result["transitOptions"] = result["transitOptions"] || {};
                result["transitOptions"]["departureTime"] = obj[key];
            }
            else if (key == "transit_modes") {
                result["transitOptions"] = result["transitOptions"] || {};
                result["transitOptions"]["modes"] = obj[key];
            }
            else if (key == "d_departureTime") {
                result["drivingOptions"] = result["drivingOptions"] || {};
                result["drivingOptions"]["departureTime"] = obj[key];
            }
            else if (key == "trafficModel") {
                result["drivingOptions"] = result["drivingOptions"] || {};
                result["drivingOptions"][key] = obj[key];
            }
            else result[key] = obj[key];
        }
        return result;
    };
    
    this.prepareDirection = function(map_id) {
        const _this = this;
        const waypointElements = document.querySelectorAll(`[data-direction='waypoint'][data-map_id='${map_id}'][data-place='longitude'], [data-direction='waypoint'][data-map_id='${map_id}'][data-place='latitude']`);
        var latlngs = [];
        var points = [];
        for (var wpElement of waypointElements) {
            if (!wpElement.value) continue;
            var place_id = wpElement.dataset.place_id;
            if (latlngs[place_id]) {
                if (wpElement.dataset.place == "latitude") {
                    points.push({lat:wpElement.value, lng:latlngs[place_id]});
                }
                else
                    points.push({lat:latlngs[place_id], lng:wpElement.value});
                delete latlngs[place_id];
            }
            else {
                latlngs[place_id] = wpElement.value;
            }
        }
        console.log(waypointElements);
        var srcLng = document.querySelector(`[data-direction='origin'][data-place='longitude'][data-map_id='${map_id}']`).value;
        var srcLat = document.querySelector(`[data-direction='origin'][data-place='latitude'][data-map_id='${map_id}']`).value;
        var dstLng = document.querySelector(`[data-direction='destination'][data-place='longitude'][data-map_id='${map_id}']`).value;
        var dstLat = document.querySelector(`[data-direction='destination'][data-place='latitude'][data-map_id='${map_id}']`).value;
        if (srcLng && srcLat && dstLng && dstLat) {
            // Redraw Map
            const center = this.maps[map_id].getCenter();
            const zoom = this.maps[map_id].getZoom();
            this.maps[map_id] = new google.maps.Map(
                document.querySelector(`.google_map[data-map_id='${map_id}']`), {center: center, zoom: zoom});

            let object = this.attToObj("direction", `[data-map_id='${map_id}']`, ".direction_option");
            let request = {
                ...{
                    map_id: map_id,
                    origin: {lat:srcLat, lng:srcLng},
                    destination: {lat:dstLat, lng:dstLng},
                    waypoints: points,
                    travelMode: "DRIVING"
                },
                ...object
            };
            _this.renderDirection(request);
        }
    };
    /*
        directionInfo = {
            map_id: "0",
            origin:{lng:"", lat:""},
            destination:{lng:"", lat:""},
            waypoints:[
                {lng:"", lat:""},
                {lng:"", lat:""},
                ...
            ],
            travelMode:"DRIVING" | "BICYCLING" | "TRANSIT" | "WALKING",
            transitOptions:{
                arrivalTime: Date,
                departureTime: Date,
                modes:["BUS", "RAIL", "SUBWAY", "TRAIN", "TRAM"],
                routingPreference: "FEWER_TRANSFERS" | "LESS_WALKING"
            },
            drivingOptions:{
                departureTime: Date,
                trafficModel: "bestguess" | "pessimistic" | "optimistic"
            },
            unitSystem: "METRIC" | "IMPERIAL",
            optimizeWaypoints: true | false,
            provideRouteAlternatives: true | false,
            avoidFerries: true | false,
            avoidHighways: true | false,
            avoidTolls: true | false
        }
    */
    this.renderDirection = function(directionInfo) {
        let directionsService = new google.maps.DirectionsService();
        let directionsRenderer = new google.maps.DirectionsRenderer({draggable:true});
        let request = {};
        for (let key in directionInfo) {
            let element = directionInfo[key];
            if (key == "map_id") continue;
            else if (key == "origin" || key == "destination") {
                request[key] = {};
                request[key] = new google.maps.LatLng(element.lat, element.lng);
            }
            else if (key == "waypoints") {
                request[key] = [];
                for (let waypoint of element) request[key].push({location: new google.maps.LatLng(waypoint.lat, waypoint.lng)});
            }
            else if (key == "transitOptions") {
                let to = {};
                if (element.arrivalTime) to["arrivalTime"] = new Date(element.arrivalTime);
                if (element.departureTime) to["departureTime"] = new Date(element.departureTime);
                if (element.modes) to["modes"] = element.modes;
                if (element.routingPreference) to["routingPreference"] = element.routingPreference;
                request[key] = to;
            }
            else if (key == "drivingOptions") {
                let to = {};
                if (element.departureTime) to["departureTime"] = new Date(element.departureTime);
                to["trafficModel"] = element.trafficModel;
                request[key] = to;
            }
            else if (key == "unitSystem") request[key] = element.unitSystem == "METRIC" ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL;
            else request[key] = element;
        }
        directionsRenderer.setMap(this.maps[directionInfo.map_id]);
        console.log(request);
        directionsService.route(request, function(result, status) {
            if (status == 'OK') {
                directionsRenderer.setDirections(result);
                this.isDirectionShowing = true;
            }
            else {
                alert("No result!");
            }
        });
    };
    
    CoCreateMap.call(this);
};

CoCreateMapDirection.prototype = Object.create(CoCreateMap.prototype);
CoCreateMapDirection.prototype.constructor = CoCreateMapDirection;

// functions for prototype


// declaration