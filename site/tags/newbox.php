<?php

// start new box with (newbox)
kirbytext::$tags['newbox'] = array(
	// allow 1 attribute
	'attr' => array(
		'newbox'
	),
	'html' => function($tag) {		
		return "</div><div>";
	}
);