<!DOCTYPE html>
<html lang="en">
<head>
  <title>Day Details</title>
  <link rel="icon" type="image/png" href="img/favicon.png">
<style>
body {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
}
table {
  border-collapse: collapse;
}
th {
  background-color: #4CAF50;
  color: white;
}
table, th, td {
  border: 1px solid #7c7;
  padding: 6px;
}
tr:nth-child(even) {background-color: #f2f2f2}
</style>
</head>
<body>

<?php
include("dbconnect.php");
?>

<table>
<tr><th>Receiver</th><th>Numer of Hits</th></tr>

<?php

echo "<h1>Day Report for " . $_GET["d"] . "</h1>";

?>
<p><a href="calendar.php">&lt;&lt; Back to Calendar</a></p>
<?php

if ($stmt = $conn->prepare("SELECT receiver_id, count(*) AS hitcount FROM report_history WHERE date(report_dt)=? GROUP BY receiver_id")) {
    $stmt->bind_param("s", $_GET["d"]);

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["receiver_id"]. "</td><td>" . $row["hitcount"]. "</td></tr>";
      }
    }
    else {
      echo "No results";
    }

    $stmt->close();
}
else {
  echo "Could not prepare statement";
}

?>

</table>
</body>
</html>
