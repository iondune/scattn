
var map;

var overlayLeft = null;
var overlayRight = null;

var currentOverlay = '20160621';

var sharkPathMarkers = [];

var markers = [];


function initialize() {
  var mapProp = {
    center:new google.maps.LatLng(34.007552, -118.500061),
    zoom:3,
    mapTypeId:google.maps.MapTypeId.SATELLITE,
    panControl: true,
    zoomControl:true,
    mapTypeControl: false,
    streetViewControl: false,
    panControlOptions:{
        position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControlOptions:{
        style:google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.TOP_RIGHT
    }
  };

  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

function showOverlay() {
  loadOverlays(currentOverlay);
}

function loadOverlays(date) {

  currentOverlay = date;

  var lastOverlayLeft = overlayLeft;
  var lastOverlayRight = overlayRight;

  var imageBoundsLeft = {
      north: 90.000000,
      south: -90.000000,
      east: 179.999999,
      west: 0.000000
  };

  var imageBoundsRight = {
      north: 90.000000,
      south: -90.000000,
      east: 0.500000,
      west: -179.500000
  };

  var imgurl_base = 'http://topaz.iondune.net/coast/jpl-mursst/';
  var imgurl_suffix = '-JPL-L4UHfnd-GLOB-v01-fv04-MUR.nc.png';

  var imgurlLeft = imgurl_base + 'left_' + date + imgurl_suffix;
  var imgurlRight = imgurl_base + 'right_' + date + imgurl_suffix;

  overlayLeft = new google.maps.GroundOverlay(imgurlLeft,imageBoundsLeft);
  overlayLeft.setMap(map);

  overlayRight = new google.maps.GroundOverlay(imgurlRight,imageBoundsRight);
  overlayRight.setMap(map);

  if (lastOverlayLeft != null) {
    lastOverlayLeft.setMap(null);
  }

  if (lastOverlayRight != null) {
    lastOverlayRight.setMap(null);
  }
}

function hideOverlay() {

  if (overlayLeft != null) {
    overlayLeft.setMap(null);
  }

  if (overlayRight != null) {
    overlayRight.setMap(null);
  }
}

function zoom() {
  map.fitBounds({
    north: 37.0,
    south: 18.0,
    east: -115.0,
    west: -121.2
  });
}

function hideAnimalPath() {

  for (var i = 0; i < sharkPathMarkers.length; i++) {
    sharkPathMarkers[i].setMap(null);
  }

  sharkPathMarkers = [];

}

function loadAnimalPath(animal_id) {

  $("#loading").show();

  hideAnimalPath();

  $.ajax({url: "animaltrack.php?id=" + animal_id, success: function(result) {

    var animal_track = result;
    for (var i = 0; i < animal_track.length; i++) {
      var rec = animal_track[i];

      if (! rec.old) {
        var marker = new google.maps.Marker({
          position: { lat: rec.lat, lng: rec.lng },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f3f',
            fillOpacity: 0.15,
            strokeColor: '#f3f',
            strokeWeight: 1
          },
          draggable: false,
          map: map
        });

        sharkPathMarkers.push(marker);
      }
      else {
        // console.log("Skipped a duplicate receiver");
      }


    }

    if (animal_track.length > 0) {

      var north = animal_track[0].lat;
      var south = animal_track[0].lat;
      var east = animal_track[0].lng;
      var west = animal_track[0].lng;

      for (var i = 1; i < animal_track.length; i++) {
        north = Math.max(north, animal_track[i].lat);
        south = Math.min(south, animal_track[i].lat);
        east = Math.max(east, animal_track[i].lng);
        west = Math.min(west, animal_track[i].lng);
      }

      // console.log("bounds: %f %f %f %f", north, south, east, west);

      var lat_boundary_size = Math.min(0.15, (north - south));
      var lng_boundary_size = Math.min(0.15, (east - west));

      map.fitBounds({
        north: north + lat_boundary_size,
        south: south - lat_boundary_size,
        east: east + lng_boundary_size,
        west: west - lng_boundary_size
      });

    }

    $("#loading").hide();
  }});

}

function hideReceivers() {

  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }

  markers = [];

}

function showReceivers() {

  hideReceivers();

  $.ajax({url: "receivers.php", success: function(result) {

    var receivers_info = result;
    for (var i = 0; i < receivers_info.length; i++) {
      var rec = receivers_info[i];

      // console.log("lat: %O, lng: %O [%O]", rec.lat, rec.lng, rec);

      var marker = new google.maps.Marker({
        position: { lat: rec.lat, lng: rec.lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'white',
          fillOpacity: 0.25,
          strokeColor: 'white',
          strokeWeight: 1
        },
        draggable: false,
        map: map
      });

      markers.push(marker);

    }

  }});

}
