import { CoCreateMap } from './map.js';
import { CoCreateMapAnimate } from './animate.js';

/*Class Custom*/

var CoCreateMapGetLocation = function () {
    //init custom
    /*query mongo
    > use mydb
    > db.getCollection("users").find({"_id": ObjectId("5de03b9cc745412976891133")})*/
    this.attr = 'data-geolocation';
    this.geolocation_html = null;

    this.init = () => {
        if (!this.ccMapAnimate) {
            this.ccMapAnimate = new CoCreateMapAnimate();
        }
        this.geolocation_html = object.querySelector("[" + this.attr + "]");
        if (this.geolocation_html && this.geolocation_html.getAttribute(this.attr) == 'true') {
            console.log("initialite map");
            this.showPosition();
        }
        // CoCreateSocket.listen('update.object', (data) =>{
        //     console.log(data);
        //     if (data)
        //         this.createAnimator(data.data.currentLocation, data.object, data.data.icon);
        // });
    }

    this.createAnimator = (position, object, icon) => {
        this.ccMapAnimate.addAnimator(object, { 'lat': position.coords.latitude, 'lng': position.coords.longitude }, icon) // sending data
    }

    this.saveData = (position) => {
        try {
            CoCreate.validateKeysJson(this.geolocation_html.dataset, ['array', 'object']);
            let array = this.geolocation_html.dataset['array'] || '';
            let object = this.geolocation_html.dataset['object'] || '';
            // textinput to object
            let icon = document.querySelector("input[data-animator='icon']").value;
            console.log(icon);
            if (icon) {
                icon = JSON.parse(icon);
            } else {
                icon = this.icon;
            }
            if (array != '')
                if (object != '') {
                    console.log("Saved location in db", object);
                    let obj = {
                        method: 'update.object',
                        array: array,
                        object: {
                            _id: object,
                            currentLocation: this.getPositionAsJSon(position),
                            icon: icon
                        }
                    };
                    console.log(obj);
                    CoCreate.crud.send(obj);
                } else {
                    object = CoCreate.crud.send({
                        method: 'create.object',
                        array: array,
                        object: {
                            currentLocation: this.getPositionAsJSon(position),
                            icon: icon
                        }
                    });
                    console.log(object);
                    this.geolocation_html.setAttribute("object", object);
                }
        }
        catch (e) {
            console.error(e);
        }
    }

    this.getPositionAsJSon = (position) => {
        return {
            coords: {
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                speed: position.coords.speed,
            },
            timestamp: position.timestamp,
            geoLocation: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }
        };
    }

    this.showLocation = (position) => {
        // console.log(this);
        // Check position has been changed or not before doing anything
        if (this.prevLat != position.coords.latitude || this.prevLong != position.coords.longitude) {
            // Set previous location
            this.prevLat = position.coords.latitude;
            this.prevLong = position.coords.longitude;
            // console.log(position);
            this.saveData(position);
            var positionInfo = "Your position is (" + "Latitude: " + position.coords.latitude + ", " + "Longitude: " + position.coords.longitude + ")";
            // document.getElementById("result").innerHTML = positionInfo;

        }
    }

    CoCreateMapAnimate.call(this);
};

CoCreateMapGetLocation.prototype = Object.create(CoCreateMapAnimate.prototype);
CoCreateMapGetLocation.prototype.constructor = CoCreateMapGetLocation;
// var CoCreateMapGetLocation = new CoCreateMapGetLocation();

export { CoCreateMapGetLocation }