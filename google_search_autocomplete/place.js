"use strict";

function Place() {
    if (this) {
        this.establishment=[];
        this.address=[];
        this.city=[];
        this.region_country=[];
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
        this.initElements(document);
        this.initAutoComplete(document);
    }
}

Place.prototype = {
    constructor: Place(),
    _init : function() {
      
    },
    initElements: function(container) {
      for (var key in this.componentForm) {
        var input_item = container.querySelector("input[data-place=" + key + "]");
        if (input_item) this.componentForm[key] = input_item.dataset.place_value_type ? input_item.dataset.place_value_type : "long_name";
        else this.componentForm[key] = "long_name";
      }
    },
    initAutoComplete: function(container) {
        const places = container.querySelectorAll("[data-place]");
        var ids = [];
        for (const item of places) {
            ids.push(item.dataset.place_id);
        }
        ids = ids.filter(onlyUnique);
        // var address_search = container.querySelectorAll("[data-place='establishment']");
        var _this = this;
        
        for (var i = 0; i < ids.length; i++) {
            var place_id = ids[i];
            var search_item = container.querySelectorAll("input[type='search'][data-place_id='" + place_id + "']");
            var fieldSetting = ['address_components', 'geometry', 'icon', 'name'];
            for (var j = 0; j < search_item.length; j++) {
                var place_type = search_item.item(j).dataset.place;
                if (place_type == "establishment") _this.establishment.push(new google.maps.places.Autocomplete(search_item.item(j), {types:['establishment']}));
                if (place_type == "address") {
                    _this.address.push(new google.maps.places.Autocomplete(search_item.item(j), {types:['address']}));
                    _this.address[i].setFields(fieldSetting);
                }
                if (place_type == "administrative_area_level_2") {
                    _this.city.push(new google.maps.places.Autocomplete(search_item.item(j), {types:['(cities)']}));
                    _this.city[i].setFields(fieldSetting);
                }
                if (place_type == "region_country") {
                    _this.region_country.push(new google.maps.places.Autocomplete(search_item.item(j), {types:['(regions)']}));
                    _this.region_country[i].setFields(fieldSetting);                    
                }
            }
        }
        
        ids.forEach(function(element, index) {
            var place_id = element;
            var items = container.querySelectorAll("input.main-search[data-place_id='" + place_id + "']");
            for (var i = 0; i < items.length; i++) {
                var search_type = items.item(i).dataset.place;
                if (search_type == "establishment") _this.establishment[index].addListener('place_changed', function() { _this.fillInAddress(container, _this.establishment[index], place_id); });
                if (search_type == "address") _this.address[index].addListener('place_changed', function() { _this.fillInAddress(container, _this.address[index], place_id); });
                if (search_type == "administrative_area_level_2") _this.city[index].addListener('place_changed', function(){ _this.fillInAddress(container, _this.city[index], place_id);});
                if (search_type == "region_country") _this.region_country[index].addListener('place_changed', function(){ _this.fillInAddress(container, _this.region_country[index], place_id);});
            }
        });
    },
    fillInAddress: function(container, addressInfo, place_id) {
        var place = addressInfo.getPlace();
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (this.componentForm[addressType]) {
                var val = place.address_components[i][this.componentForm[addressType]];
                var fillItem = container.querySelector("[data-place='" + addressType + "'][data-place_id='" + place_id + "']");
                if (fillItem) fillItem.value = val;
                if (addressType == "country") {
                    const region_country = container.querySelector("[data-place='region_country'][data-place_id='" + place_id + "']");
                    if (region_country) region_country.value = place.address_components[i]["long_name"];
                    const country_code = container.querySelector("[data-place='country_code'][data-place_id='" + place_id + "']");
                    if (country_code) country_code.value = place.address_components[i]["short_name"];
                }
                const locality = container.querySelector("[data-place='administrative_area_level_2'][data-place_id='" + place_id + "']");
                if (addressType == "locality" && locality) locality.value = val;
                const adm_area_1 = container.querySelector("[data-place='administrative_area_level_1'][data-place_id='" + place_id + "']");
                if (addressType == "administrative_area_level_1" && adm_area_1) {
                    adm_area_1.value = val;
                    fillItem = container.querySelector("[data-place='administrative_area_level_2'][data-place_id='" + place_id + "']");
                    if (!fillItem.value) fillItem.value = val;
                }
            }
        }
        const address = container.querySelector("[data-place='address'][data-place_id='" + place_id + "']");
        if (place.adr_address && address)
            address.value = stripHtml(place.adr_address);
        const longitude = container.querySelector("[data-place='longitude'][data-place_id='" + place_id + "']");
        if (longitude) longitude.value = place.geometry.location.lng();
        const latitude = container.querySelector("[data-place='latitude'][data-place_id='" + place_id + "']");
        if (latitude) latitude.value = place.geometry.location.lat();
        var map_id = container.querySelector("[data-place_id='" + place_id + "']").dataset.map_id;
        var mapDiv = container.querySelector(".google_map[data-map_id='" + map_id + "']");
        if (mapDiv) {
            mapDiv.dataset.map_lng = place.geometry.location.lng();
            mapDiv.dataset.map_lat = place.geometry.location.lat();
        }
        
        /*temporary*/
        // if (place_id == 0) {
        //     document.querySelector("[data-place='direction_info'][data-place_id='0']").dataset.src_lng = place.geometry.location.lng();
        //     document.querySelector("[data-place='direction_info'][data-place_id='0']").dataset.src_lat = place.geometry.location.lat();
        // }
        // if (place_id == 1) {
        //     document.querySelector("[data-place='direction_info'][data-place_id='0']").dataset.dst_lng = place.geometry.location.lng();
        //     document.querySelector("[data-place='direction_info'][data-place_id='0']").dataset.dst_lat = place.geometry.location.lat();
        // }
    }
};
