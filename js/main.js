
//////////////////////
// Global Variables //
//////////////////////

// Holds the google map object
var map;

// Global SST overlay image
// It's split into two parts because of a problem with image overlays spanning the entire globe
var overlayLeft = null;
var overlayRight = null;

// Date of the current overlay image. Formatting is important, YYYYMMDD
var currentOverlay = '20160621';

// Date format used in the bottom control panel
var dateFormat = 'd-MMM-yyyy';

// When an animal track is loaded, this stores the start date of that track.
// Throw an initial dummy value in it now to prevent errors :)
var currentStartDate = new Date("2014-10-13 13:34:10");

// Each day bucket contains all the map elements needed to playback a single day
// This is either a reference to the marker which should flash, or the arrow we need
// to make visible.
var dayBuckets = [];

// Number of days in the current animal track
var numDays = 0;

// Cookie that we set if the user doesn't want to see the welcome popup anymore
var cookieName = 'dont-show-welcome';

// Store the javascript interval (timer) used to trigger playback
var interval = null;

// Playback speed in ms (so default 750 = every 3/4 of a second)
var playbackSpeed = 750;

// Keep track of the last day that we showed
// -1 indicates we haven't started playback yet
// This is used to set the previous days' elements to not visible
var lastDay = -1;

// These are used to show "all" receivers if the user selects that option
// We need to keep track of all of them so they can be turned off
var AllReceiverMarkers = [];


///////////////////////////
// jQuery Initialization //
///////////////////////////

// Standard jQuery init function, configures the UI elements and does some other page setup
$(document).ready(function() {

  // Show the welcome popup unless the user previously asked not to see it
  if (Cookies.get(cookieName)) {
    console.log("Cookie is set, skipping welcome popup.");
  }
  else {
    console.log("No cookie set, showing welcome popup.");
    showWelcome();
  }

  // Setup the slider UI
  $("#slider").slider({
    slide: function( event, ui ) {
      $("#date-display").text("Current date: " + addDays(currentStartDate, ui.value).toString('d-MMM-yyyy'));
      showDay(ui.value);
    },
    disabled: true
  });

  // Setup the checkbox UI
  $("input[type='radio']").checkboxradio();

  // Add event listener for the Show All Receivers button
  $("#show-receivers").on("change", function () {
    if ($(this).is(':checked')) {
      showReceivers();
    }
    else {
      hideReceivers();
    }
  });

  // Add event listener for the Show SST button
  $("#show-sst").on("change", function () {
    if ($(this).is(':checked')) {
      showOverlay();
    }
    else {
      hideOverlay();
    }
  });

  // Make both control panel widget/windows draggable
  $("#bottom-control").draggable();
  $("#sidebar").draggable();

  // Disable the play button until an animal track is loaded
  $("#play-button").button({
    disabled: true
  });

});


///////////////////////////////
// Google Map Initialization //
///////////////////////////////

// Constructor for the CustomMarker we use for both arrows and receivers
// The rest of the class is set up inside the initialize() function
// AFAIK that is how it has to be to make it work...
function CustomMarker(latlng, angle, css, showclass, hideclass) {
  this.latlng_ = new google.maps.LatLng(latlng);
  this.angle_ = angle;
  this.div_ = null;
  this.visible_ = false;

  this.css_ = css;
  this.showclass_ = showclass;
  this.hideclass_ = hideclass;
}

// Google map initialization
function initialize() {

  // Map settings
  var mapProp = {
    center:new google.maps.LatLng(34.007552, -118.500061),
    zoom: 3,
    mapTypeId:google.maps.MapTypeId.SATELLITE,
    panControl: true,
    zoomControl: true,
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

  // Create the map
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

  // Finish setting up the custom map marker class
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

    // Because of the dreadfully asynchronous nature of this app...
    // Sometimes show() has already been called on this object before the constructor is finished (!!!)
    // Or at least that's how it seemed in testing
    // So call it again now just in case
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


////////////////////
// Date Utilities //
////////////////////

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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

// This is just some sneaky javascript to make it so that
// all Array objects have a "last" method that returns the
// element at the end of the array
if (!Array.prototype.last){
    Array.prototype.last = function(){
      return this[this.length - 1];
    };
};


///////////////////////////////////
// Callbacks and Show/Hide Pairs //
///////////////////////////////////

function showWelcome() {
  $("#obscure").show();
  $("#welcome").show();
}

function closeWelcome() {
  $("#obscure").hide();
  $("#welcome").hide();

  if ($("#dont-show-again").is(':checked')) {
    console.log("Setting cookie");
    Cookies.set(cookieName, 'true');
  }
  else {
    console.log("Removing cookie");
    Cookies.remove(cookieName);
  }
}

function showLoading() {
  $("#obscure").show();
  $("#loading").show();
}

function closeLoading() {
  $("#obscure").hide();
  $("#loading").hide();
}

function zoom() {
  // Zooms the map out to a general view of the US/pacific area
  map.fitBounds({
    north: 37.0,
    south: 18.0,
    east: -115.0,
    west: -121.2
  });
}

/////////////////
// SST Overlay //
/////////////////

function showOverlay() {
  loadOverlays(currentOverlay);
}

function loadOverlays(date) {

  currentOverlay = date;

  var lastOverlayLeft = overlayLeft;
  var lastOverlayRight = overlayRight;

  // I fudged these numbers until they looked correct
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


////////////////////////
// Playback Functions //
////////////////////////

// Simple check to see if we're currently playing
function isPlaying() {
  if (interval !== null) {
    return true;
  }
  else {
    return false;
  }
}

// Play button callback
function playButtonClicked() {
  if (isPlaying()) {
    stopPlayback();
  }
  else {
    startPlayback();
  }
}

function startPlayback() {
  // Only start playback if a track is loaded
  if (dayBuckets.length > 0) {

    // If we somehow triggered playback twice... stop the existing playback
    if (interval !== null) {
      clearInterval(interval);
    }

    $("#play-icon").show();
    $("#play-button").html("Stop");

    interval = setInterval(advanceDay, playbackSpeed);
  }
  else {

    // Make the button not clickable if there is no animal track
    // It should already be... but if for some reason it's not this is
    // at least some sense of user feedback that the action failed
    $("#play-button").button("disable");
  }
}

function stopPlayback() {
  if (interval !== null) {
    clearInterval(interval);
  }

  $("#play-icon").hide();
  $("#play-button").html("Play");

  interval = null;
}

// Change the playback speed by deleting the current timer and starting a new one
// If we're not playing back right now, preemptively changes it
function setPlaybackSpeed(speed) {
  playbackSpeed = speed;

  // This creates the flashing playback icons
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

// Makes a day of the playback visible (And hides the previous day)
function showDay(day) {

  // If another day is visible, hide all of its elements
  if (lastDay >= 0) {

    // Hide all active markers
    for (var i = 0; i < dayBuckets[lastDay].activeMarkers.length; ++ i) {
      var marker = dayBuckets[lastDay].activeMarkers[i];
      marker.hide();
    }

    // Hide the visible arrows
    if (dayBuckets[lastDay].futurePath !== null) {
      dayBuckets[lastDay].futurePath.hide();
    }
  }

  // Make any active receivers flash
  for (var i = 0; i < dayBuckets[day].activeMarkers.length; ++ i) {
    var marker = dayBuckets[day].activeMarkers[i];
    marker.show();
  }

  // Show arrows pointing to the next path
  if (dayBuckets[day].futurePath !== null) {
    dayBuckets[day].futurePath.setMap(map);
    dayBuckets[day].futurePath.show();
  }

  lastDay = day;
}


////////////////////////////////////
// Animal Track Loading Functions //
////////////////////////////////////

// Take some records from an animal track and make a lat/lng line between their coordinates
function makeLatLngSegment(prev, next, days, total) {
  var extent = { lat: next.lat - prev.lat, lng: next.lng - prev.lng };
  var oneDay = { lat: extent.lat / total, lng: extent.lng / total };

  return [
    { lat: prev.lat + oneDay.lat * days,       lng: prev.lng + oneDay.lng * days },
    { lat: prev.lat + oneDay.lat * (days + 1), lng: prev.lng + oneDay.lng * (days + 1) }
    ];
}

// Get the angle between two lat/lng lines so that arrows can point in the right direction
function latLngAngle(pair) {
  var prev = pair[0];
  var next = pair[1];
  var extent = { lat: next.lat - prev.lat, lng: next.lng - prev.lng };
  return Math.atan2(extent.lng, extent.lat);
}

// This is where the magic happens!
function loadAnimalPath(animal_id) {

  // Indicate to the user that loading is happening
  showLoading();

  // Make sure playback is stopped
  stopPlayback();

  // Delete all existing track data
  hideAnimalPath();

  // Make an async call to the server to download a new track
  $.ajax({url: "animaltrack.php?id=" + animal_id, success: function(result) {

    var animal_track = result;

    ///
    // Calculate min/max date and figure out which is the next record for each record
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
    // E.g. this way we know for a particular record if it is day 6, 11, etc.
    //

    for (var i = animal_track.length - 1; i >= 0; i--) {
      var rec = animal_track[i];

      // Set up day index
      rec.dayIndex = daysBetween(minDate, rec.date);

      rec.daysUntilNext = (rec.nextRec === null ? -1 : rec.nextRec.dayIndex - rec.dayIndex);
    }


    ///
    // Now that we know the length of the trip, set up the slider ...
    // This is mostly some jQuery to configure the UI elements properly
    //

    // Setup slider
    $("#date-range").text("Data ranges from " + minDate.toString(dateFormat) + " to " + maxDate.toString(dateFormat));
    var days = daysBetween(minDate, maxDate);
    currentStartDate = minDate;
    $("#slider").slider("enable");
    $("#slider").slider("option", "value", 0);
    $("#slider").slider("option", "max", days);
    $("#date-display").text("Current date: " + currentStartDate.toString(dateFormat));
    $("#play-button").button("enable");
    console.log("There are %d days between", days);


    ///
    // ... And create the data structure that will be used to draw day-by-day
    //

    numDays = days + 1;

    dayBuckets = [];
    dayBuckets.length += numDays; // This is a sneaky javascript way to make an array larger

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
    // Calculate bounds of the current path and zoom on map
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

      // We add a bit to the top and bottom of the map so no markers are on the edge
      // This amount is just the visible area, but at a minimum of 0.15 degrees so we don't zoom in too close
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

    closeLoading();
  }});

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


///////////////////////////
// All Receivers Display //
///////////////////////////

function hideReceivers() {

  for (var i = 0; i < AllReceiverMarkers.length; i++) {
    AllReceiverMarkers[i].setMap(null);
  }

  AllReceiverMarkers = [];

}

function showReceivers() {

  hideReceivers();

  $.ajax({url: "receivers.php", success: function(result) {

    var receivers_info = result;
    for (var i = 0; i < receivers_info.length; i++) {
      var rec = receivers_info[i];

      var marker = new google.maps.Marker({
        position: { lat: rec.lat, lng: rec.lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: 'white',
          fillOpacity: 0.25,
          strokeColor: 'white',
          strokeWeight: 1
        },
        draggable: false,
        map: map
      });

      AllReceiverMarkers.push(marker);

    }

  }});

}
