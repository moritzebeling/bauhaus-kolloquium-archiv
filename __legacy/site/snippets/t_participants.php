<?php

/*
Template for rendering the participants achive

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="participants" class="participants page span2 add-nav" data-count="<?= $count ?>">

	<header>
		<h3><?= $page->title() ?> 1976–2013</h3>
	</header>

	<!-- <section class="filter">
		<input type="text" id="filter-participants" onkeyup="filterParticipants()" placeholder="Search for names...">
	</section> -->

	<section>
		<table style="width:100%" id="participants-table">
			<?= $page->file('list.html')->read() ?>
		</table>
	</section>

</article>
