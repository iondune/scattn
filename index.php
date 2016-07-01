<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <title>SCATTN Animal Tracker</title>

  <!-- FONTS -->
  <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>

  <!-- CSS -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/dropdown.css">

  <!-- SCRIPTS -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js"></script>
  <script type="text/javascript" src="js/main.js"></script>
  <script async defer src="http://maps.googleapis.com/maps/api/js?key=AIzaSyCMIhlsl_XZkBvxLfNSXeOzRBOQ-WwjGXU&callback=initialize"></script>

  <!-- FAVICON -->
  <link rel="icon" type="image/png" href="img/favicon.png">
</head>

<body <?php if (isset($_GET["track"])) echo "onload=loadAnimalPath(" . $_GET["track"] . ");"; ?>>

  <div id="loading" style="display: none;">
    Loading ...
  </div>

  <div id="header">
    <img style="float: left; margin-top: 1.4em; margin-right: 20px; margin-left: 10px;" src="img/scattn.gif" />
    <h1>SCATTN Animal Tracker</h1>
  </div>

  <div id="page">

    <div id="sidebar">
      <div class="dropdown">
        <button class="dropbtn">Choose Animal</button>
        <div id="myDropdown" class="dropdown-content" onchange="myFunction()">
          <a href="javascript:void(0)" onclick="loadAnimalPath(9);">Shark 9</a>
          <a href="javascript:void(0)" onclick="loadAnimalPath(12);">Shark 12</a>
          <a href="javascript:void(0)" onclick="loadAnimalPath(53);">Sheephead 53</a>
        </div>
      </div>

      <div class="spacer"></div>

      <div>
        <a href="animals.php">Full Animal List</a>
      </div>
      <div>&nbsp;</div>
      <div>
        <button onclick="zoom()">Zoom Out</button>
      </div>
      <p>Receivers</p>
      <div>
        <button onclick="showReceivers()">Show Receivers</button>
      </div>
      <div>
        <button onclick="hideReceivers()">Hide Receivers</button>
      </div>
      <p>Sea Surface Temperature</p>
      <div>
        <button onclick="showOverlay()">Show SST Overlay</button>
      </div>
      <div>
        <button onclick="hideOverlay()">Hide SST Overlay</button>
      </div>
      <div>&nbsp;</div>
      <div>
        <button onclick="loadOverlays('20160616')">June 16, 2016</button>
      </div>
      <div>
        <button onclick="loadOverlays('20160617')">June 17, 2016</button>
      </div>
      <div>
        <button onclick="loadOverlays('20160618')">June 18, 2016</button>
      </div>
      <div>
        <button onclick="loadOverlays('20160619')">June 19, 2016</button>
      </div>
      <div>
        <button onclick="loadOverlays('20160620')">June 20, 2016</button>
      </div>
      <div>
        <button onclick="loadOverlays('20160621')">June 21, 2016</button>
      </div>
      <div>&nbsp;</div>
      <div>
        <a href="calendar.php">Calendar View</a>
      </div>
<?php if (isset($_GET["track"])) { ?>
      <div>
        <a href="index.php">Clear</a>
      </div>
<?php } ?>
    </div>

    <div id="googleMap" style="width:1024px;height:725px;"></div>
  </div>

</body>

</html>
