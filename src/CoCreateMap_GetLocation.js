/*Class Custom*/

var CoCreateMapGetLocation = function() {
    //init custom
    /*query mongo
    > use mydb
    > db.getCollection("users").find({"_id": ObjectId("5de03b9cc745412976891133")})*/
    this.attr = 'data-geolocation';
    this.geolocation_html = null;
    
    this.init = ()=>{
        if(!this.ccMapAnimate){
            this.ccMapAnimate = new CoCreateMapAnimate();
        }
        this.geolocation_html = document.querySelector("["+this.attr+"]");
        if(this.geolocation_html && this.geolocation_html.getAttribute(this.attr)=='true'){
            console.log("initialite map");
            this.showPosition();
        }
        socket.on('updateDocument', (data) =>{
            this.createAnimator(data.data.currentLocation);
        });
    }
    
    this.createAnimator = (position)=>{
        this.ccMapAnimate.addAnimator('me',{'lat':position.coords.latitude,'lng':position.coords.longitude}) // sending data
    }

    this.saveData =(position)=>{
        try {
            CoCreate.validateKeysJson(this.geolocation_html.dataset,['collection','document_id']);
            let collection = this.geolocation_html.dataset['collection'] || '';
            let document_id = this.geolocation_html.dataset['document_id'] || '';
            if(collection != '' && document_id != ''){
                console.log("Saved location in db")
                CoCreate.updateDocument({
                    collection: collection,
                    document_id: document_id,
                    data:{
                    	currentLocation: this.getPositionAsJSon(position),
                    }
                });
            }
        }
        catch (e) {
            console.error(e); 
        }
    }
    
    this.getPositionAsJSon=(position)=>{
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
        };
    }
    
    this.showLocation=(position) =>{
        // Check position has been changed or not before doing anything
        if(this.prevLat != position.coords.latitude || this.prevLong != position.coords.longitude){
            // Set previous location
            this.prevLat = position.coords.latitude;
            this.prevLong = position.coords.longitude;
            this.saveData(position);
            var positionInfo = "Your position is (" + "Latitude: " + position.coords.latitude + ", " + "Longitude: " + position.coords.longitude + ")";
            document.getElementById("result").innerHTML = positionInfo;
            
        }
    }
    
    CoCreateMapAnimate.call(this);
};

CoCreateMapGetLocation.prototype = Object.create(CoCreateMapAnimate.prototype);
CoCreateMapGetLocation.prototype.constructor = CoCreateMapGetLocation;
// var CoCreateMapGetLocation = new CoCreateMapGetLocation();
