import { CoCreateMap } from './map.js';
import { CoCreateMapAnimate } from './animate.js';

/*Class Custom*/

var CoCreateMapGetLocation = function () {
    this.attr = 'geolocation';
    this.element = null;

    this.init = async () => {
        if (!this.ccMapAnimate) {
            this.ccMapAnimate = new CoCreateMapAnimate();
        }
        this.element = object.querySelector("[" + this.attr + "]");
        if (this.element && this.element.getAttribute(this.attr) == 'true') {
            console.log("initialize map");
            this.showLocation();

            this.element.setValue = (data) => {
                this.createAnimator(data.object.currentLocation, data.object, data.object.icon);
            }

            if (this.element.getValue)
                this.element.setValue(await this.element.getValue())

            this.element.getValue = () => {
                let coordinates = this.getPositionAsJSon(position)
                coordinates.icon = ''
            }


        }
    }

    this.createAnimator = (position, object, icon) => {
        this.ccMapAnimate.addAnimator(object, { 'lat': position.coords.latitude, 'lng': position.coords.longitude }, icon) // sending data
    }

    this.save = () => {
        this.element.save()
    }

    this.getPositionAsJSon = (position) => {
        return {
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed,
            timestamp: position.timestamp,
        };
    }

    this.showLocation = (position) => {
        // Check if the postion changed
        if (this.prevLat != position.coords.latitude || this.prevLong != position.coords.longitude) {
            // Set previous location
            this.prevLat = position.coords.latitude;
            this.prevLong = position.coords.longitude;

            this.element.save();
            let positionInfo = "Your position is (" + "Latitude: " + position.coords.latitude + ", " + "Longitude: " + position.coords.longitude + ")";
            console.log(positionInfo);
        }
    }

    CoCreateMapAnimate.call(this);
};

CoCreateMapGetLocation.prototype = Object.create(CoCreateMapAnimate.prototype);
CoCreateMapGetLocation.prototype.constructor = CoCreateMapGetLocation;
// var CoCreateMapGetLocation = new CoCreateMapGetLocation();

export { CoCreateMapGetLocation }