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
        CoCreateSocket.listen('updateDocument', (data) =>{
            console.log(data);
            if (data)
                this.createAnimator(data.data.currentLocation, data.document_id, data.data.icon);
        });
    }
    
    this.createAnimator = (position, document_id, icon)=>{
        this.ccMapAnimate.addAnimator(document_id,{'lat':position.coords.latitude,'lng':position.coords.longitude}, icon) // sending data
    }

    this.saveData =(position)=>{
        try {
            CoCreate.validateKeysJson(this.geolocation_html.dataset,['collection','document_id']);
            let collection = this.geolocation_html.dataset['collection'] || '';
            let document_id = this.geolocation_html.dataset['document_id'] || '';
            // textinput to object
            let icon = document.querySelector("input[data-animator='icon']").value;
            console.log(icon);
            if (icon) {
                icon = JSON.parse(icon);
            } else {
                icon = this.icon;
            }
            if(collection != '')
                if (document_id != ''){
                    console.log("Saved location in db", document_id);
                    let obj = {
                        collection: collection,
                        document_id: document_id,
                        data:{
                        	currentLocation: this.getPositionAsJSon(position),
                        	icon:icon
                        }
                    };
                    console.log(obj);
                    CoCreate.updateDocument(obj);
                } else {
                    document_id = CoCreate.createDocument({
                        collection:collection,
                        data:{
                            currentLocation: this.getPositionAsJSon(position),
                            icon:icon
                        }
                    });
                    console.log(document_id);
                    this.geolocation_html.setAttribute("data-document_id", document_id);
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
            geoLocation:  {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,                
            }
        };
    }
    
    this.showLocation=(position) =>{
        // console.log(this);
        // Check position has been changed or not before doing anything
        if(this.prevLat != position.coords.latitude || this.prevLong != position.coords.longitude){
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
