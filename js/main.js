
var map;

var overlayLeft = null;
var overlayRight = null;

var currentOverlay = '20160621';

var markers = []; // For receivers
var dateFormat = 'd-MMM-yyyy';
var currentStartDate = new Date("2014-10-13 13:34:10");

var dayBuckets = [];
var numDays = 0;

function CustomMarker(latlng, angle, css, showclass, hideclass) {
  this.latlng_ = new google.maps.LatLng(latlng);
  this.angle_ = angle;
  this.div_ = null;
  this.visible_ = false;

  this.css_ = css;
  this.showclass_ = showclass;
  this.hideclass_ = hideclass;

  // this.setMap(map);
}


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

  CustomMarker.prototype = new google.maps.OverlayView();

  CustomMarker.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var point = overlayProjection.fromLatLngToDivPixel(this.latlng_);

    var div = this.div_;
    div.style.left = (point.x) + 'px';
    div.style.top = (point.y) + 'px';
  };

  CustomMarker.prototype.onAdd = function() {

    var div = document.createElement('div');
    div.style.border = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    var img = document.createElement('div');
    img.style.transform = "rotate(" + this.angle_ + "deg)";
    img.classList.add(this.css_);
    div.appendChild(img);


    this.div_ = div;
    this.img_ = img;

    var panes = this.getPanes();
    panes.overlayImage.appendChild(this.div_);

    if (this.visible_) {
      this.show();
    }
    else {
      this.hide();
    }
  };

  CustomMarker.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
  };

  CustomMarker.prototype.hide = function() {
    this.visible_ = false;

    if (this.div_) {
      this.img_.classList.remove(this.showclass_);
      this.img_.classList.add(this.hideclass_);
    }
  };

  CustomMarker.prototype.show = function() {
    this.visible_ = true;

    if (this.div_) {
      this.img_.classList.remove(this.hideclass_);
      this.img_.classList.add(this.showclass_);
    }
  };

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

    ///
    // Clear out existing markers and data
    //

    for (var i = 0; i < dayBuckets.length; ++ i) {
      for (var j = 0; j < dayBuckets[i].activeMarkers.length; ++ j) {
        dayBuckets[i].activeMarkers[j].setMap(null);
      }
      if (dayBuckets[i].futurePath !== null) {
        dayBuckets[i].futurePath.setMap(null);
      }
    }
    dayBuckets = [];

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
var playbackSpeed = 750;

function startPlayback() {
  if (interval !== null) {
    clearInterval(interval);
  }

  $("#play-icon").show();

  interval = setInterval(advanceDay, playbackSpeed);
}

function stopPlayback() {
  if (interval !== null) {
    clearInterval(interval);
  }

  $("#play-icon").hide();

  interval = null;
}

function setPlaybackSpeed(speed) {
  playbackSpeed = speed;

  var icon = "&#9658;";
  var text = icon;

  if (playbackSpeed <= 500) {
    text += icon;
  }
  if (playbackSpeed <= 1000) {
    text += icon;
  }

  $("#play-icon").html(text);

  if (interval !== null) {
    clearInterval(interval);
    interval = setInterval(advanceDay, playbackSpeed);
  }
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

  const fillOpacity = 0.5;
  const strokeOpacity = 0.85;

  if (lastDay >= 0) {
    for (var i = 0; i < dayBuckets[lastDay].activeMarkers.length; ++ i) {
      var marker = dayBuckets[lastDay].activeMarkers[i];
      // marker.getIcon().scale = 2;
      // marker.setMap(map);
      marker.hide();
    }
    if (dayBuckets[lastDay].futurePath !== null) {
      dayBuckets[lastDay].futurePath.hide();
    }
  }

  for (var i = 0; i < dayBuckets[day].activeMarkers.length; ++ i) {
    var marker = dayBuckets[day].activeMarkers[i];
    // marker.getIcon().scale = 12;
    // marker.setMap(map);
    marker.show();
  }
  if (dayBuckets[day].futurePath !== null) {
    dayBuckets[day].futurePath.setMap(map);
    dayBuckets[day].futurePath.show();
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

function latLngAngle(pair) {
  var prev = pair[0];
  var next = pair[1];
  var extent = { lat: next.lat - prev.lat, lng: next.lng - prev.lng };
  return Math.atan2(extent.lng, extent.lat);
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

    var existingMarkers = {};
    for (var i = 0; i < dayBuckets.length; ++ i) {

      if (dayBuckets[i].hitRecords.length > 0) {

        for (var j = 0; j < dayBuckets[i].hitRecords.length; ++ j) {
            var rec = dayBuckets[i].hitRecords[j];

            if (! rec.old) {
              var marker = new CustomMarker({ lat: rec.lat, lng: rec.lng }, 0, "circle", "circle-in", "circle-out");
              marker.setMap(map);

              existingMarkers[rec.receiver_id] = marker;
            }
            else {
              var marker = existingMarkers[rec.receiver_id];
            }

            dayBuckets[i].activeMarkers.push(marker);
        }

      }
      else {

        var prevLatLng = { lat: dayBuckets[i].previousRecord.lat, lng: dayBuckets[i].previousRecord.lng };
        var nextLatLng = { lat: dayBuckets[i].nextRecord.lat, lng: dayBuckets[i].nextRecord.lng };
        var daysIn = i - dayBuckets[i].previousRecord.dayIndex - 1;
        var totalDays = dayBuckets[i].nextRecord.dayIndex - dayBuckets[i].previousRecord.dayIndex - 1;
        var currLatLng = makeLatLngSegment(prevLatLng, nextLatLng, daysIn, totalDays);

        if (prevLatLng.lat != nextLatLng.lat || prevLatLng.lng != nextLatLng.lng) {
          var marker = new CustomMarker(currLatLng[0], latLngAngle(currLatLng) * 360.0 / (2.0 * 3.14159), "arrow-up", "in", "out");
          dayBuckets[i].futurePath = marker;
        }
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
