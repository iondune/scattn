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

  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/datejs/1.0/date.min.js"></script>

  <!-- jQuery UI -->
  <link rel="stylesheet" href="//code.jquery.com/ui/1.12.0/themes/base/jquery-ui.css">
  <script src="https://code.jquery.com/ui/1.12.0/jquery-ui.js"></script>

  <!-- SCRIPTS -->
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

    <div id="googleMap"></div>

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

      <div>&nbsp;</div>

      <fieldset>
        <legend>Options: </legend>
        <label for="show-receivers">All Receivers</label>
        <input type="checkbox" name="show-receivers" id="show-receivers">

        <br />

        <label for="show-sst">SST Overlay</label>
        <input type="checkbox" name="show-sst" id="show-sst">
      </fieldset>

      <div>&nbsp;</div>

      <fieldset id="playback-speed">
        <legend>Playback Speed: </legend>
        <label for="playback-speed-slow">Slow</label>
        <input type="radio" name="playback-speed" id="playback-speed-slow" onclick="setPlaybackSpeed(1250)">
        <label for="playback-speed-normal">Normal</label>
        <input type="radio" name="playback-speed" id="playback-speed-normal" checked="true" onclick="setPlaybackSpeed(750)">
        <label for="playback-speed-fast">Fast</label>
        <input type="radio" name="playback-speed" id="playback-speed-fast" onclick="setPlaybackSpeed(300)">
      </fieldset>
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

    <div id="bottom-control">
      <div style="float: right;">
        <button id="play-button" onclick="playButtonClicked()" disabled="true">Play</button>
      </div>
      <div style="margin-bottom: 8px;"><span id="date-range">&nbsp;</span></div>
      <div style="margin-bottom: 16px;"><span id="date-display">&nbsp;</span> &nbsp;&nbsp;&nbsp; <span id="play-icon" class="blink" style="display: none;">&#9658;&#9658;</span></div>
      <div id="slider"></div>
    </div>
  </div>

</body>

</html>
