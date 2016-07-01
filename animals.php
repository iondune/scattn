<html>
<head>
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

$sql = "select animal.id, species.common_name, gender, COUNT(report_history.id) AS count from animal inner join species on animal.species_id=species.id inner join report_history on animal.id = report_history.animal_id group by animal.id";
$result = $conn->query($sql);

if ($result->num_rows > 0)
{
?>
<table>
<tr><th>id</th><th>Common Name</th><th>Gender</th><th>Report Count</th></tr>
<?php
  while($row = $result->fetch_assoc())
  {
    echo "<tr><td>" . $row["id"]. "</td><td>" . $row["common_name"]. "</td><td>" . $row["gender"] . "</td><td>" . $row["count"]. "</td></tr>";
  }
?>
</table>
<?php
}
else
{
  echo "0 results";
}
?>

</body>
</html>
