<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html><head><meta http-equiv="Content-type" content="text/html;charset=UTF-8"><title>Senos java programėlės / Old java applets</title></head><body><h1>Senos java programėlės / Old java applets:</h1><p>Pastaba: Programėlės anglų kalba turės "en.html" ar panašius pavadinimus.<br/>Note: English applets will have "en.html" or similar ending in their names.</p><div><?php

$files=array();
if($handle=opendir('.')) {
    while(false!==($entry=readdir($handle))) {
        if($entry!="." && $entry!=".." && $entry!="index.php") {
			$files[]=$entry;
        }
    }
    closedir($handle);
}
sort($files);

foreach($files as $entry) echo '<a href="http://rf.mokslasplius.lt/uploads/models/old-java/'.rawurlencode($entry).'">'.$entry.'</a><br/>';
?></div></body></html>
