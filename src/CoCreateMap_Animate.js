/* global CoCreateMap google */
var CoCreateMapAnimate = function() {
    // variables
    this.animators = [];
    this.icon = {'path':'M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805','color':'#e50202'};
    
    // selectors
    this.mapDivSelector = ".google_map";
    // initialize

    this.init();

    // functions
    this.init = function() {
        let maps = document.querySelectorAll(".google_map[data-map_id]");
        for (let map of maps) {
            this.animators[map.dataset.map_id] = {};
        }
    };
    
    // this.errHandler = function(err, _this) {
    //     _this.__proto__.errHandler(err);
    // };
    
    this.__proto__.showPosition = function(){
        let option = {timeout:5000};
        if (navigator.geolocation) this.watchID = navigator.geolocation.watchPosition(position=>{this.showLocation(position)},err=>{this.errHandler(err)}, option);
        else alert("Sorry, your browser does not support HTML5 geolocation.");
    };
    
    this.showLocation = function(position) {
        if (!this.checkAnimator('simon')) {
            this.__proto__.showLocation(position);
        }
        this.addAnimator('simon',{'lat':position.coords.latitude,'lng':position.coords.longitude})
    }

    
    this.errorCallback=function(error){
        if(error.code == 1) console.log("You've decided not to share your position, but it's OK. We won't ask you again.");
        else if(error.code == 2) console.log("The network is down or the positioning service can't be reached.");
        else if(error.code == 3) console.log("The attempt timed out before it could get the location data.");
        else console.log("Geolocation failed due to unknown error.");
    };
    
    this.checkAnimator = function(key, map_id = 0) {
        return this.animators[map_id][key] !== undefined;
    };
    
    this.removeAnimator = function(key, map_id = 0) {
        this.animators[map_id][key]['marker'].setMap(null);
    };
    
    this.addAnimator = function(key, location, icon_obj, map_id = 0) {
        icon_obj = icon_obj === undefined ? this.icon : icon_obj;
        let angle = 0;
        if (this.checkAnimator(key)) {
            this.animatedMove(key, location);
        }
        else {
            let icon = { // animator icon
                path: icon_obj.path,
                scale: 0.5,
                fillColor: icon_obj.color, //<-- Animator Color, you can change it 
                fillOpacity: 1,
                strokeWeight: 1,
                anchor: new google.maps.Point(0, 5),
                rotation:  angle//<-- Animator angle
            };
            // var curLocation = { lat: location.lat, lng: location.lng };

            let marker_id = this.setMarker(map_id, {
                    position: location,
                    icon: icon,
                    title : key
                });
            //if(key == getCookie('user_email')){
               this.maps[map_id].setCenter(this.markers[map_id][marker_id].getPosition());
            //}
            this.animators[map_id][key] = {};
            this.animators[map_id][key]['loc'] = location;
            this.animators[map_id][key]['angle'] = angle;
            this.animators[map_id][key]['timestamp'] = new Date();
            this.animators[map_id][key]['marker'] = this.markers[map_id][marker_id];
            this.animators[map_id][key]['icon'] = icon_obj;
        }
    };
    
    this.animatedMove = function(key, locMoveto, map_id = 0) {
        //this.removeAnimator(key);
        let animator = this.animators[map_id][key];
        let marker = animator['marker'];
        let icon = animator['icon'];
        let current = marker.position;
        let angle = this.bearingBetweenLocations(animator['loc'],locMoveto);
        if(!locMoveto.timestamp) locMoveto['timestamp'] = new Date();
        
        let deltalat = (locMoveto.lat - current.lat()) / 100;
        let deltalng = (locMoveto.lng - current.lng()) / 100;
        let deltaangle = this.deltaAngle(angle, animator.angle) / 100;
        let deltatime = (locMoveto["timestamp"].getSeconds() - animator.timestamp.getSeconds());
        let pangle = animator.angle;
        pangle = this.currentAngle(pangle, deltaangle);
        let delay = deltatime;
        // let d = new Date();
        // let p = d.getTime();
        for (let i = 0; i < 100; i++) {
            (function(ind) {
                setTimeout(
                    function() {
                    let latlng = null;
                    let myicon = null;
                    let lat = marker.position.lat();
                    let lng = marker.position.lng();
                    lat += deltalat;
                    lng += deltalng;
                    
                    // pangle += deltaangle;
                    myicon = { // animator icon
                        path: icon['path'],
                        scale: 0.5,
                        fillColor: icon['color'], //<-- Animator Color, you can change it 
                        fillOpacity: 1,
                        strokeWeight: 1,
                        anchor: new google.maps.Point(0, 5),
                        rotation:  pangle //<-- Animator angle
                    };
                    
                    latlng = new google.maps.LatLng(lat, lng);
                    marker.setPosition(latlng);
                    marker.setIcon(myicon);
                    // d = new Date();
                    }, ind*delay*10 );
            })(i);
        }

        this.animators[map_id][key]['loc'] = locMoveto;
        this.animators[map_id][key]['angle'] = angle;
        this.animators[map_id][key]['timestamp'] = locMoveto['timestamp'];
        this.animators[map_id][key]['marker'] = marker;
    };
    
    this.bearingBetweenLocations = function(loc1, loc2) {
        let RADTODEG = 180 / Math.PI;
        let lat1 = loc1.lat / RADTODEG;
        let long1 = loc1.lng / RADTODEG;
        let lat2 = loc2.lat / RADTODEG;
        let long2 = loc2.lng / RADTODEG;
        let dLon = (long2 - long1);
        let y = Math.sin(dLon) * Math.cos(lat2);
        let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = brng *  RADTODEG;
        brng = (brng + 360) % 360;
        return brng; 
    };
    
    this.deltaAngle = function(CurrentAngle, PreviousAngle){
        let delta = CurrentAngle - PreviousAngle;
        return delta;
    };

    this.currentAngle = function(current , delta){
        if (current+delta<0 ) {
            return 360+(current+delta);
        } else if (current+delta>360) {
            return (current+delta)%360;
        } else{
            return current+delta;
        }
    };
    
    // this.simulate = function(){
    //     cocreateLocation.addAnimator('jean',{'lat':20.9182675,'lng':-100.7446703})
    //     // entre 0 y 9
    //     for(var i=0;i<=100;i++){
    //         setTimeout(function(){ 
    //             var lat = parseFloat('20.918'+Math.floor(Math.random() * 10)+'675');
    //             var lng = parseFloat('-100.744'+Math.floor(Math.random() * 10)+'703');
    //             cocreateLocation.addAnimator('jean',{'lat':lat,'lng':lng})
    //          },5000);    
    //     }
    // };

    CoCreateMap.call(this);
};

CoCreateMapAnimate.prototype = Object.create(CoCreateMap.prototype);
CoCreateMapAnimate.prototype.constructor = CoCreateMapAnimate;

// functions for prototype

// declaration