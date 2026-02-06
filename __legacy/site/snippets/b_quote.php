<?php

/*
Block for displaying a quote

Recieving:
- $page Kirby object
- $item array

*/

?>
<section class="quotes">
	<div class="quote">
		<blockquote><?= $item['blockquote'] ?></blockquote>
		<p class="source"><?= $item['source'] ?></p>
	</div>
	<div class="quote en">
		<blockquote><?= $item['blockquote_en'] ?></blockquote>
		<p class="source"><?= $item['source_en'] ?></p>
	</div>
</section>
