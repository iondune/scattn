
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
var numDays = 0;

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

var interval = null;

function startPlayback() {
  if (interval !== null) {
    clearInterval(interval);
  }

  interval = setInterval(advanceDay, 750);
}

function stopPlayback() {
  if (interval !== null) {
    clearInterval(interval);
  }

  interval = null;
}

var lastDay = -1;

function advanceDay() {
  var newDay = lastDay + 1;
  if (newDay < numDays) {
    showDay(newDay);
    $("#slider").slider("option", "value", newDay);
    $("#date-display").text("Current date: " + addDays(currentStartDate, newDay).toString('d-MMM-yyyy'));
  }
  else {
    stopPlayback();
  }
}

function showDay(day) {

  var lineSymbolFull = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 2.75,
    fillColor: '#2ee',
    fillOpacity: 0.5,
    strokeOpacity: 0.85,
    strokeColor: "#3ff",
    strokeWeight: 1.25
  };

  var lineSymbolHalf = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 2.5,
    fillColor: '#2ee',
    fillOpacity: 0.2,
    strokeOpacity: 0.35,
    strokeColor: "#3ff",
    strokeWeight: 1.25
  };

  if (lastDay >= 0) {
    for (var i = 0; i < dayBuckets[lastDay].activeMarkers.length; ++ i) {
      var marker = dayBuckets[lastDay].activeMarkers[i];
      marker.getIcon().scale = 2;
      marker.setMap(map);
    }
    if (dayBuckets[lastDay].futurePath !== null) {
      dayBuckets[lastDay].futurePath.setOptions({
          icons: [{
            icon: lineSymbolHalf,
            offset: '20px',
            repeat: '20px'
          }]});
      var deleteMe = dayBuckets[lastDay].futurePath;
      setTimeout(function() {
        deleteMe.setMap(null);
      }, 400);
    }
  }

  for (var i = 0; i < dayBuckets[day].activeMarkers.length; ++ i) {
    var marker = dayBuckets[day].activeMarkers[i];
    marker.getIcon().scale = 12;
    marker.setMap(map);
  }
  if (dayBuckets[day].futurePath !== null) {
    dayBuckets[day].futurePath.setMap(map);
  }

  lastDay = day;
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

function makeLatLngSegment(prev, next, days, total) {
  var extent = { lat: next.lat - prev.lat, lng: next.lng - prev.lng };
  var oneDay = { lat: extent.lat / total, lng: extent.lng / total };

  return [
    { lat: prev.lat + oneDay.lat * days,       lng: prev.lng + oneDay.lng * days },
    { lat: prev.lat + oneDay.lat * (days + 1), lng: prev.lng + oneDay.lng * (days + 1) }
    ];
}

function loadAnimalPath(animal_id) {

  $("#loading").show();

  stopPlayback();
  hideAnimalPath();

  $.ajax({url: "animaltrack.php?id=" + animal_id, success: function(result) {

    var animal_track = result;

    ///
    // Calculate min/max date and figure out which is the next record
    //

    var minDate = null;
    var maxDate = null;

    var nextRec = null;

    for (var i = animal_track.length - 1; i >= 0; i--) {
      var rec = animal_track[i];

      // Calculate min/max date
      rec.date = stripTime(Date.parse(rec.report_dt));
      if (minDate === null || rec.date.compareTo(minDate) == -1) {
        minDate = rec.date;
      }
      if (maxDate === null || rec.date.compareTo(maxDate) == 1) {
        maxDate = rec.date;
      }

      rec.nextRec = nextRec;
      nextRec = rec;
    }

    ///
    // Figure out day indexes and days until next mark
    //

    for (var i = animal_track.length - 1; i >= 0; i--) {
      var rec = animal_track[i];

      // Set up day index
      rec.dayIndex = daysBetween(minDate, rec.date);

      rec.daysUntilNext = (rec.nextRec === null ? -1 : rec.nextRec.dayIndex - rec.dayIndex);
    }


    ///
    // Now that we know the length of the trip, set up the slider ...
    //

    // Setup slider
    $("#date-range").text("Data ranges from " + minDate.toString(dateFormat) + " to " + maxDate.toString(dateFormat));
    var days = daysBetween(minDate, maxDate);
    currentStartDate = minDate;
    $("#slider").slider("enable");
    $("#slider").slider("option", "value", 0);
    $("#slider").slider("option", "max", days);
    $("#date-display").text("Current date: " + currentStartDate.toString('d-MMM-yyyy'));
    console.log("There are %d days between", days);


    ///
    // ... And create the data structure that will be used to draw day-by-day
    //

    dayBuckets = [];
    numDays = days + 1;
    dayBuckets.length += days + 1;

    for (var i = 0; i < dayBuckets.length; ++ i) {
      dayBuckets[i] = {
        hitRecords: [],
        nextRecord: null,
        previousRecord: null,

        activeMarkers: [],
        futurePath: null
      };
    }


    ///
    // Add each day's records
    //

    for (var i = 0; i < animal_track.length; i++) {
      var rec = animal_track[i];

      dayBuckets[rec.dayIndex].hitRecords.push(rec);
    }


    ///
    // And figure out the next and previous records for each day that has no records
    //

    var previousRecord = null;
    for (var i = 0; i < dayBuckets.length; ++ i) {

      if (dayBuckets[i].hitRecords.length > 0) {
        previousRecord = dayBuckets[i].hitRecords.last();
      }
      else {
        dayBuckets[i].previousRecord = previousRecord;
      }

    }

    var nextRecord = null;
    for (var i = dayBuckets.length - 1; i >= 0 ; -- i) {
      if (dayBuckets[i].hitRecords.length > 0) {
        nextRecord = dayBuckets[i].hitRecords[0];
      }
      else {
        dayBuckets[i].nextRecord = nextRecord;
      }

    }


    ///
    // Add markers for days with hit records and line segments for days with no records
    //

    for (var i = 0; i < dayBuckets.length; ++ i) {

      if (dayBuckets[i].hitRecords.length > 0) {

        for (var j = 0; j < dayBuckets[i].hitRecords.length; ++ j) {
            var rec = dayBuckets[i].hitRecords[j];

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

            dayBuckets[i].activeMarkers.push(marker);
        }

      }
      else {

        var prevLatLng = { lat: dayBuckets[i].previousRecord.lat, lng: dayBuckets[i].previousRecord.lng };
        var nextLatLng = { lat: dayBuckets[i].nextRecord.lat, lng: dayBuckets[i].nextRecord.lng };
        var daysIn = i - dayBuckets[i].previousRecord.dayIndex - 1;
        var totalDays = dayBuckets[i].nextRecord.dayIndex - dayBuckets[i].previousRecord.dayIndex - 1;
        var currLatLng = makeLatLngSegment(prevLatLng, nextLatLng, daysIn, totalDays);

        var lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 2.75,
          fillColor: '#2ee',
          fillOpacity: 0.5,
          strokeOpacity: 0.85,
          strokeColor: "#3ff",
          strokeWeight: 1.25
        };

        var dottedPath = new google.maps.Polyline({
          path: currLatLng,
          geodesic: true,
          strokeOpacity: 0,
          icons: [{
            icon: lineSymbol,
            offset: '20px',
            repeat: '20px'
          }],
        });

        dayBuckets[i].futurePath = dottedPath;
      }

    }

    showDay(0);


    ///
    // Calculate bounds and zoom on map
    //

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


    ///
    // Done!
    //

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
