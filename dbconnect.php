 <?php
include("creds.php");

// Create connection
$conn = new mysqli($servername, $username, $password, "csulbsha_tracker");

// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

echo "<!-- Connected to database successfully -->\n";
?>
