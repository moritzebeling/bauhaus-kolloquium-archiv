<?php

/*

One single template to create the one-page structure using a set of different snippets.

*/

snippet('p_header');

?>

<main id="main" class="main" role="main">

	<?php

	/*
	including one page after another and passing it
	- Kirby object of itself
	- its intended tempplate
	- a count
	*/

	$count = 1;
	foreach($site->children()->visible() as $page):


		snippet( 't_'.$page->intendedTemplate() ,[
			'page' => $page,
			'count' => $count
		]);

		$count++;
	endforeach; ?>

</main>

<div id="wall-container">
	<img id="wall" src="<?= $site->url() ?>/assets/images/wall.svg" height="100%" width="auto" />
</div>

<?php

snippet('p_footer');
