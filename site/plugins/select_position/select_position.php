<?php

function select_position($p,$default){
	if($p == 0){ return 0; }
	if($p < 0){ return 0; }
	if(!isset($p)){ return $default; }
	if(!$p){ return $default; }
	$p = intval($p);
	$p = max($p, 1);
	return min($p, 9);
}
