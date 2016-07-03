
var map;

var overlayLeft = null;
var overlayRight = null;

var currentOverlay = '20160621';

var sharkPathMarkers = [];
var sharkPathLines = [];

var markers = [];
var dateFormat = 'd-MMM-yyyy';
var currentStartDate = new Date("2014-10-13 13:34:10");

var dayBuckets = [];

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

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

$(document).ready(function() {
  $("#slider").slider({
    slide: function( event, ui ) {
      $("#date-display").text("Current date: " + addDays(currentStartDate, ui.value).toString('d-MMM-yyyy'));
      showDay(ui.value);
    },
    disabled: true
  });
});

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

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

var lastDay = -1;

function showDay(day) {
  if (lastDay >= 0) {
    // console.log("unsetting the last day %d", lastDay);
    for (var i = 0; i < dayBuckets[lastDay].length; ++ i) {
      var thing = dayBuckets[lastDay][i];
      if (thing instanceof google.maps.Marker) {
        thing.getIcon().scale = 2;
        thing.setMap(map);
      }
      else if (thing instanceof google.maps.Polyline) {
        thing.setMap(null);
      }
    }
  }
  for (var i = 0; i < dayBuckets[day].length; ++ i) {
      var thing = dayBuckets[day][i];
      if (thing instanceof google.maps.Marker) {
        thing.getIcon().scale = 12;
        thing.setMap(map);
      }
      else if (thing instanceof google.maps.Polyline) {
        thing.setMap(map);
      }
  }
  lastDay = day;
}

function loadAnimalPath(animal_id) {

  $("#loading").show();

  hideAnimalPath();

  $.ajax({url: "animaltrack.php?id=" + animal_id, success: function(result) {

    var minDate = null;
    var maxDate = null;

    var animal_track = result;
    var lastNode = null;
    for (var i = 0; i < animal_track.length; i++) {
      var rec = animal_track[i];

      var d = stripTime(Date.parse(rec.report_dt));
      if (minDate === null || d.compareTo(minDate) == -1) {
        minDate = d;
      }
      if (maxDate === null || d.compareTo(maxDate) == 1) {
        maxDate = d;
      }
    }

    $("#date-range").text("Data ranges from " + minDate.toString(dateFormat) + " to " + maxDate.toString(dateFormat));
    var days = daysBetween(minDate, maxDate);
    currentStartDate = minDate;
    $("#slider").slider("enable");
    $("#slider").slider("option", "max", days);
    $("#date-display").text("Current date: " + currentStartDate.toString('d-MMM-yyyy'));
    console.log("There are %d days between", days);

    dayBuckets = [];
    dayBuckets.length += days + 1;

    for (var i = 0; i < dayBuckets.length; ++ i) {
      dayBuckets[i] = [];
    }

    for (var i = 0; i < animal_track.length; i++) {
      var rec = animal_track[i];
      var thisNode = { lat: rec.lat, lng: rec.lng };

      var day = daysBetween(minDate, stripTime(Date.parse(rec.report_dt)));

      var marker = new google.maps.Marker({
        position: { lat: rec.lat, lng: rec.lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 2,
          fillColor: '#f3f',
          fillOpacity: 0.15,
          strokeColor: '#f3f',
          strokeWeight: 1
        },
        draggable: false,
        map: map
      });

      sharkPathMarkers.push(marker);
      // console.log("add days at %O, %O", day, dayBuckets[day]);
      dayBuckets[day].push(marker);

      if (lastNode !== null && (lastNode.lng != thisNode.lng || lastNode.lat != thisNode.lat)) {
        sharkPath = new google.maps.Polyline({
          path: [lastNode, thisNode],
          geodesic: true,
          strokeColor: "#f3f",
          strokeOpacity: 1.0,
          strokeWeight: 5
        });
        // console.log("add days at %O, %O", day, dayBuckets[day]);
        dayBuckets[day].push(sharkPath);
      }

      lastNode = thisNode;
    }

    showDay(0);

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
