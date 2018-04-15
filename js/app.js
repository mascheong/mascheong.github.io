var spots = [
  {name: '678 KBBQ', location: {lat: 33.95335, lng: -84.142241}, id: '4fdbd032e4b09d541722a07d'},
  {name: 'Jinya Ramen Bar', location: {lat: 33.856549, lng: -84.382636}, id: '597b6aaeb2958f7e5242c4dd'},
  {name: 'So Kong Dong Tofu House', location: {lat: 33.896915, lng: -84.2825}, id: '4abd6a08f964a5202a8a20e3'},
  {name: 'Northern China Eatery', location: {lat: 33.892617, lng: -84.283784}, id: '4ac8b0d8f964a52049bc20e3'},
  {name: 'Hankook Taqueria', location: {lat: 33.811493, lng: -84.431626}, id: '4addeb35f964a5203c6621e3'},
  {name: 'Iron Age', location: {lat: 33.954224, lng: -84.133836}, id: '4bc11508920eb7137e361a2c'},
  {name: 'MF Sushi', location: {lat: 33.762317, lng: -84.358759}, id: '556bba85498e7c378339e597'},
  {name: 'Pho Dai Loi #2', location: {lat: 33.865177, lng: -84.305005}, id: '4a400f71f964a52044a41fe3'},
  {name: 'Takorea', location: {lat: 33.776895, lng: -84.383159}, id: '4e67d2c92271517970584bc2'},
  {name: 'Jia', location: {lat: 33.771946, lng: -84.366527}, id: '5601f1f1498ed96330d3d34a'}
];


var Spot = function(data) {
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
  this.id = ko.observable(data.id);
  this.marker = ko.observable();
  this.filter = ko.observable(true);
  this.contentstring = ko.observable('');
}


var viewModel = function(){
  // Intializations
  var self = this;
  var infowindow = new google.maps.InfoWindow();
  this.spotList = ko.observableArray([]);
  this.markers = ko.observableArray([]);

  // Put all spots in an observable array
  spots.forEach(function (spotItem){
    self.spotList.push(new Spot(spotItem));
  });

  // URL constructors for Foursquare API
  var client_id = 'CNO4BBZXFKVWTKML2JBAY2B01F4WIV1OJ0YPI344SOV3PGUG';
  var client_secret = '00GN5FKE4VL3D3QQIT530NMLFQF2LSPMKYX1S5VUHWUV5UW4';
  var foursquare = 'https://api.foursquare.com/v2/venues/';
  var token = '?&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20180411';

  // Populating markers using observable array
  this.spotList().forEach(function(spotItem){
    //Intializing marker
    var marker = new google.maps.Marker({
      map: map,
      position: spotItem.location(),
      title: spotItem.name(),
      id: spotItem.id(),
      animation: google.maps.Animation.DROP,
    });

    // Creating URL for AJAX request
    var url2 = foursquare + spotItem.id() + token;
    // Initializing windowcontent Variable
    var windowcontent = '';
    $.ajax({
      url: url2,
      method: "GET",
      // Success function creates infowindow HTML
      // Leaves blanks where there is no returned data for specific fields
      success: function(data){
        if (data){
          if (data.response.venue.name){
            windowcontent += '<h4>' + data.response.venue.name + '</h4>'
            spotItem.name(data.response.venue.name);
          }
          windowcontent += '<div class="container"><img id= "windowpic" ';
          if (data.response.venue.photos){
            windowcontent += 'src="' + data.response.venue.photos.groups[0].items[0].prefix + '200x200'
              + data.response.venue.photos.groups[0].items[0].suffix + '"</img>';
          }
          windowcontent += '</img><div id="windowinfo">';
          if (data.response.venue.categories){
            windowcontent += data.response.venue.categories[0].name + " ";
          }
          if (data.response.venue.rating){
            windowcontent += " (" + data.response.venue.rating + "/10)";
          }
          windowcontent += '</br></br>';
          if (data.response.venue.location.address){
            windowcontent += data.response.venue.location.address + '</br>';
          }
          if (data.response.venue.location.city){
            windowcontent += data.response.venue.location.city + ', ';
          }
          if (data.response.venue.location.state){
            windowcontent += data.response.venue.location.state + ' ';
          }
          if (data.response.venue.location.postalCode){
            windowcontent += data.response.venue.location.postalCode;
          }
          windowcontent += '</br>';
          if (data.response.venue.contact.formattedPhone){
            windowcontent += data.response.venue.contact.formattedPhone;
          }
          windowcontent += '</br></br>';
          if (data.response.venue.hours){
            for (var h = 0; h < data.response.venue.hours.timeframes.length; h++){
              windowcontent += data.response.venue.hours.timeframes[h].days + ' '
                + data.response.venue.hours.timeframes[h].open[0].renderedTime + '</br>';
            }          }
          windowcontent += "</div></br></div>"
        }
      },
      // Set infowindow to string if there is an error connecting to the API
      error: function(e){
        windowcontent = "Could not retrieve information from Foursquare. Try again later."
      }
    });
    // Push marker into this.markers
    self.markers.push(marker);
    // Push marker into spots observable array
    spotItem.marker = marker;
    // Listner for marker
    google.maps.event.addListener(marker, 'click', function(){
      infowindow.open(map, marker);
      infowindow.setContent(windowcontent);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        marker.setAnimation(null);
      }, 750);
    });
  });

  // Event trigger for list element
  this.showInfo = function(spotItem){
    //window.alert(spotItem.marker);
    google.maps.event.trigger(spotItem.marker, 'click');
  };

  // Function for showing all markers
  this.showAllMarkers = function(){
    self.markers().forEach(function(marker){
      marker.setMap(map);
    });
  }

  // Function for clearing all markers
  this.clearMarkers = function(){
    self.markers().forEach(function(marker){
      marker.setMap(null);
    });
  };

  // Function for showing all locations on the main list
  this.showAllList = function(){
    self.spotList().forEach(function(spot){
      spot.filter(true);
    });
  };

  // Function for hiding all locations on the main list
  this.clearList = function(){
    self.spotList().forEach(function(spot){
      spot.filter(false);
    });
  };

  // Filter function for the filter box
  this.textfilter = ko.observable('');
  this.filterFunction = function(){
    // Normalize user input text
    var normalizedInput = self.textfilter().toUpperCase();
    // Initially clear map
    self.clearMarkers();
    self.clearList();
    // If no input, show all markers
    if (normalizedInput == '') {
      self.showAllMarkers();
      self.showAllList();
    }
    // Else use input as substring to check name then show the marker on the map
    else{
      self.spotList().forEach(function (spot){
        if (spot.name().toUpperCase().includes(normalizedInput)) {
          spot.marker.setMap(map);
          spot.filter(true);
        }
      });
    }
  };

  // Variable to track which elements to hide for desktop/mobile views
  this.mobile = ko.observable(false);

  // Assigned to main list
  this.toggleList = ko.pureComputed(function(){
    return self.mobile() ? "showList" : "hidden";
  }, this);

  // Assigned to icon nested within the List div
  this.toggleListIcon = ko.pureComputed(function(){
    return self.mobile() ? "listicon" : "hidden";
  }, this);

  // Assigned to the main button in mobile view
  this.toggleIcon = ko.pureComputed(function(){
    return self.mobile() ? "hidden" : "icon";
  }, this);

  // Toggle function assigned to hamburger icons
  this.toggleMenu = function(){
    self.mobile(!self.mobile());
  };
}


//Initialize map then apply bindings so Google Maps API is loaded
var map;
function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.887618, lng: -84.289389},
    zoom: 11,
    mapTypeControl: false
  });
  ko.applyBindings(new viewModel());
}

//Error function on Google Maps error
function mapError(){
  document.getElementById('error').innerHTML = "<h1>Google Maps is not loading. Try again later.</h1>";
}
