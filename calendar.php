<!DOCTYPE html>
<head>
<title>Calendar</title>
<meta charset="utf-8">
<style>

body {
  padding-left: 20px;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
}

#calendar, #key {
  font: 11px sans-serif;
  shape-rendering: crispEdges;
}

.day {
  fill: #fff;
  stroke: #ccc;
}

.day-data {
  cursor: pointer;
}

.month {
  fill: none;
  stroke: #000;
  stroke-width: 2px;
}

.q0-11{fill:rgb(165,0,38)}
.q1-11{fill:rgb(215,48,39)}
.q2-11{fill:rgb(244,109,67)}
.q3-11{fill:rgb(253,174,97)}
.q4-11{fill:rgb(254,224,139)}
.q5-11{fill:rgb(255,255,191)}
.q6-11{fill:rgb(217,239,139)}
.q7-11{fill:rgb(166,217,106)}
.q8-11{fill:rgb(102,189,99)}
.q9-11{fill:rgb(26,152,80)}
.q10-11{fill:rgb(0,104,55)}

</style>
</head>
<body>

<h1>Tracker Calendar</h1>

<p>Shows the total number of hits across all receivers.<p>
<p>Click on a day to see a detailed report for that day</p>
<p><a href="index.php">&lt;&lt; Back to Map</a></p>

<script src="//d3js.org/d3.v3.min.js"></script>




<?php include("datecounts.php"); ?>

<div id="key">
<svg height="350" width="200" style="position: fixed; left: 1000px;">
  <g transform="translate(29.5,16)">
    <text style="text-anchor: middle;" transform="translate(-16,12)">Key</text>

    <rect class="day" y="0" x="0" height="17" width="17"></rect>
    <text style="text-anchor: start;" transform="translate(20,12)">0</text>

<?php
  for ($i = 0; $i <= 10; ++ $i) {
?>
    <rect class="day q<?php echo $i; ?>-11" x="0" y="<?php echo ($i + 1) * 20; ?>" height="17" width="17"></rect>
    <text style="text-anchor: start;" transform="translate(20,<?php echo ($i + 1) * 20 + 12; ?>)"><?php echo ($i == 0 ? 1 : ($i) / 10 * 20000); ?></text>
<?php
  }
?>

  </g>
</svg>
</div>

<div id="calendar"></div>

<script>

var width = 960,
    height = 136,
    cellSize = 17; // cell size

var percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

var color = d3.scale.quantize()
    .domain([0, 20000])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

var svg = d3.select("#calendar").selectAll("svg")
    .data(d3.range(2010, 2017))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(format);

rect.append("title")
    .text(function(d) { return d; });

svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

var data = d3.nest()
  .key(function(d) { return d.Date; })
  .rollup(function(d) { return d[0].Count; })
  .map(dtinln);

rect.filter(function(d) { return d in data; })
    .attr("class", function(d) { return "day day-data " + color(data[d]); })
    .attr("onclick", function(d) { return "window.location = 'daydetails.php?d=" + d + "';" })
  .select("title")
    .text(function(d) { return d + ": " + data[d]; });

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
      d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

</script>
