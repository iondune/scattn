
var map;
// var clusterer;
var manager;
var taggingData = [];
var receiverData = {};
var path = {};
var stationNames = [];
var pathColors = ['#66FFFF',   '#66FFCC', '#66FF99', '#66FF66', '#66FF33', '#66FF00',
'#66CCFF', '#66CCCC', '#66CC99', '#66CC66', '#66CC33', '#66CC00',
'#6699FF', '#6699CC', '#669999', '#669966', '#669933', '#669900',
'#6666FF', '#6666CC', '#666699', '#666666', '#666633', '#666600',
'#6633FF', '#6633CC', '#663399', '#663366', '#663333', '#663300',
'#6600FF', '#6600CC', '#660099', '#660066', '#660033', '#660000',
'#33FFFF', '#33FFCC', '#33FF99', '#33FF66', '#33FF33', '#33FF00',
'#33CCFF', '#33CCCC', '#33CC99', '#33CC66', '#33CC33', '#33CC00',
'#3399FF', '#3399CC', '#339999', '#339966', '#339933', '#339900',
'#3366FF', '#3366CC', '#336699', '#336666', '#336633', '#336600',
'#3333FF', '#3333CC', '#333399', '#333366', '#333333', '#333300',
'#3300FF', '#3300CC', '#330099', '#330066', '#330033', '#330000',
'#00FFFF', '#00FFCC', '#00FF99', '#00FF66', '#00FF33', '#00FF00',
'#00CCFF', '#00CCCC', '#00CC99', '#00CC66', '#00CC33', '#00CC00',
'#0099FF', '#0099CC', '#009999', '#009966', '#009933', '#009900',
'#0066FF', '#0066CC', '#006699', '#006666', '#006633', '#006600',
'#0033FF', '#0033CC', '#003399', '#003366', '#003333', '#003300',
'#0000FF', '#0000CC', '#000099', '#000066','#000033'];

var overlayLeft = null;
var overlayRight = null;

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

  loadOverlays('20160621');
}

var currentOverlay = '';

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
    north: 34.8,
    south: 32.6,
    east: -117.0,
    west: -119.2
  });
}

// function readReceiverFile(file) {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, true);
//     rawFile.onreadystatechange = function ()
//     {

//         if(rawFile.readyState === 4)
//         {
//             if(rawFile.status === 200 || rawFile.status == 0)
//             {
//                 var allText = rawFile.responseText;
//                 parseReceiverData(allText);
//             }
//         }
//     }
//     rawFile.send(null);
// }

// function parseReceiverData(receivers) {
//     var allTextLines = receivers.split(/\r\n|\n/);
//     var headers = allTextLines[0].split(",");

//     for (var i = 1; i < allTextLines.length; i++) {

//         var data = allTextLines[i].split(",");

//         if (data.length == headers.length) {
//             stationNames.push(data[4]);
//             var latitude = data[5];
//             var longitude = data[6];
//             var point = latitude + "," + longitude;
//             receiverData[stationName] = point;
//         }
//     }

//     drawStations();
// }

function readTaggingFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                parseTaggingData(allText);
                readCSVFile('JWS_20160117_export.csv');
            }
        }
    }
    rawFile.send(null);
}

function parseTaggingData(taggedAnmls) {
    var record_num = 14;  // or however many elements there are in each row
    var allTextLines = taggedAnmls.split(/\r\n|\n/);
    var entries = allTextLines[0].split(',');

    var headings = entries.splice(0,record_num);
    var i = 0;
    while (i < entries.length) {
        for (var j=0; j<record_num; j++) {
            var shark = {tag: entries[i + 5], dateTagged: entries[i + 6], weight: entries[i + 7]};
            taggingData.push(shark);
            i += (record_num - 1);
        }
    }
}

function readCSVFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                parseData(allText);
            }
        }
    }
    rawFile.send(null);
}

function parseData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(",");
    var points = [];
    var prevLng = 0.0, prevLat = 0.0;
    var prevStation = "";

    for (var i = 1; i < allTextLines.length; i++) {

        var data = allTextLines[i].split(",");

        if (data.length == headers.length) {
            // var shark = taggingData[0];
           // if (data[2] == shark["tag"]) {
                var latitude = data[8];
                var longitude = data[9];
                var point = {lat: parseFloat(latitude), lng: parseFloat(longitude)};

                if (data[2] in path) {
                    var pts = path[data[2]];
                    pts.push(point);
                    path[data[2]] = pts;
                }
                else {
                    var pts = [];
                    pts.push(point);
                    path[data[2]] = pts;
                }
                // points.push(point);
            //}
        }
    }

    drawSharkPath();
}

// function drawStations() {

//     for (var i = 0; i < stationNames.length; i++) {
//         var stationName = stationNames[i];
//         var point = receiverData[stationName];
//         var latlng = point.split(",");
//         var center = new google.maps.LatLng(latlng[0], latlng[1]);
//         var marker = new google.maps.Marker({
//             position: center,
//             map: map,
//             title: latlng[2]
//         });
//     }

// }

function drawSharkPath() {
    //for (var i = 0; i < taggingData.length; i++) {
        var shark = taggingData[10];
        if (shark["tag"] in path) {
            var pts = path[shark["tag"]];
            var color = pathColors[25];
            var sharkPath = new google.maps.Polyline({
                path: pts,
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 1.0,
                strokeWeight: 5
            });

            sharkPath.setMap(map);
        }
//    }


    // for (var i = 0; i < points.length; i++) {
    //     // var stationName = stationNames[i];
    //     var point = points[i];
    //     // var latlng = point.split(",");
    //     var center = new google.maps.LatLng(point.lat, point.lng);
    //     var marker = new google.maps.Marker({
    //         position: center,
    //         map: map
    //     });
    // }
}

function mysqlSharkPath() {
  var sharkPath = new google.maps.Polyline({
      path: animal_track,
      geodesic: true,
      strokeColor: "purple",
      strokeOpacity: 1.0,
      strokeWeight: 5
  });

  sharkPath.setMap(map);
}

markers = [];

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

      console.log("lat: %O, lng: %O [%O]", rec.lat, rec.lng, rec)

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