<?php

function select_column($c){
	if(!isset($c)){ return 'left'; }
	if(!$c){ return 'left'; }
	if($c == 'l'){ return 'left'; }
	if($c == 'left'){ return 'left'; }
	return 'right';
}
