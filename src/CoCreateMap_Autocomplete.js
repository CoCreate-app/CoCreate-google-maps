/* global CoCreateMap onlyUnique, google, stripHtml */
var CoCreateMapAutocomplete = function() {
    // variables
    // this.depth = 1;
    this.componentForm = {
        location: '',
        street_number: '',
        route: '',
        locality: '',
        administrative_area_level_1: '',
        administrative_area_level_2: '',
        administrative_area_level_3: '',
        city: '',
        country: '',
        country_code: '',
        postal_code: '',
        new_param1: '',
        new_param2: ''
    };
    // selectors
    this.mapDivSelector = ".google_map";
    this.autocompleteSelector = '[data-map_autocomplete="true"]';
    this.searchSelector = ".main-search";
    
    // initialize
    // this.__proto__.init();
    this.init();

    // functions
    this.init = function() {
        this.initComponentForm();
        this.initAutoComplete();
    };
    this.initComponentForm = function() {
        for (var key in this.componentForm) {
            var input_item = document.querySelector("input[data-place=" + key + "]");
            if (input_item) this.componentForm[key] = input_item.dataset.place_value_type ? input_item.dataset.place_value_type : "long_name";
            else this.componentForm[key] = "long_name";
        }
    };
    this.initAutoComplete = function() {
        let _this = this;
        let places = document.querySelectorAll("[data-place]");
        let ids = [];
        for (let item of places) {
            ids.push(item.dataset.place_id);
        }
        let place_type_json = {'address':'address','administrative_area_level_2':'(cities)','region_country':'(regions)','establishment':'establishment'};
        ids = ids.filter(onlyUnique);
        ids.forEach(function(element, index){
            let place_id = element;
            let autocomplete_item = document.querySelectorAll(`${_this.autocompleteSelector}[data-place_id='${place_id}']`);
            // let fieldSetting = ['address_components', 'geometry', 'icon', 'name'];
            autocomplete_item.forEach(function(element, j){
                let autocomplete;
                let place_type = element.dataset.place;
                // if(Object.keys(place_type_json).indexOf(place_type)!=-1)
                if (place_type_json[place_type] !== undefined) autocomplete = new google.maps.places.Autocomplete(autocomplete_item.item(j), {types:[place_type_json[place_type]]});
                /*if (place_type == "address") autocomplete = new google.maps.places.Autocomplete(autocomplete_item.item(j), {types:['address']});
                if (place_type == "administrative_area_level_2") autocomplete = new google.maps.places.Autocomplete(autocomplete_item.item(j), {types:['(cities)']});
                if (place_type == "region_country") autocomplete = new google.maps.places.Autocomplete(autocomplete_item.item(j), {types:['(regions)']});
                if (place_type == "establishment") autocomplete = new google.maps.places.Autocomplete(autocomplete_item.item(j), {types:['establishment']});*/
                // else autocomplete.setFields(fieldSetting); // omit for all fields
                if (element.matches(_this.searchSelector))
                    autocomplete.addListener('place_changed', function() {
                        let place = autocomplete.getPlace();
                        let placeInfo = {};
                        placeInfo["place_id"] = element.dataset.place_id;
                        placeInfo["google_place_id"] = place.place_id;
                        placeInfo["address_components"] = place.address_components;
                        if (place.adr_address) placeInfo["adr_address"] = stripHtml(place.adr_address);
                        placeInfo["longitude"] = place.geometry.location.lng();
                        placeInfo["latitude"] = place.geometry.location.lat();
                        placeInfo["show_map"] = element.dataset.direction != "destination" || element.dataset.autodirection == "false";
                        _this.renderAutoComplete(placeInfo);
                    });
            });
        });
    };

    this.objToAtt = function(object, attributeName, addInfo = "", parentInfo = "") {
        let result = {};
        for (let key in object) {
            if (key == "address_components") {
                for (let data of object[key]) {
                    let type = data.types[0];
                    result[type] = data.long_name;
                    if (type == "country") {
                        result["country_code"] = data.short_name;
                        result["region_country"] = data.long_name;
                    }
                    if (type == "administrative_area_level_1" && !result["administrative_area_level_2"]) result["administrative_area_level_2"] = data.long_name;
                }
            }
            else if (key == "adr_address") result["address"] = object[key];
            else if (key == "place_id") continue;
            else if (key == "google_place_id") result["place_id"] = object[key];
            else result[key] = object[key];
        }
        this.__proto__.objToAtt(result, attributeName, addInfo, parentInfo);
    };
    
    this.renderAutoComplete = function(place) {
        let place_id = place.place_id;
        this.objToAtt(place, "place", `[data-place_id='${place_id}']`);
        let longitude = document.querySelector(`[data-place='longitude'][data-place_id='${place_id}']`);
        let latitude = document.querySelector(`[data-place='latitude'][data-place_id='${place_id}']`);
        if (longitude && latitude) {
            if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                longitude.dispatchEvent(evt);
                latitude.dispatchEvent(evt);
            }
            else {
                longitude.fireEvent("onchange");
                latitude.fireEvent("onchange");
            }
        }
        if (place.show_map) {
            var map_id = document.querySelector(`[data-place_id='${place_id}']`).dataset.map_id;
            var mapDiv = document.querySelector(`${this.mapDivSelector}[data-map_id='${map_id}']`);
            if (mapDiv) {
                mapDiv.dataset.map_lng = place.longitude;
                mapDiv.dataset.map_lat = place.latitude;
            }
        }
    };
    
    CoCreateMap.call(this);
};

CoCreateMapAutocomplete.prototype = Object.create(CoCreateMap.prototype);
CoCreateMapAutocomplete.prototype.constructor = CoCreateMapAutocomplete;

// functions for prototype

// declaration