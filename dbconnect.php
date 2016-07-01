 <?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include("creds.php");

// Create connection
$conn = new mysqli($servername, $username, $password, "csulbsha_tracker");

// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

?>
