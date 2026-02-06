<?php

/*
Template for rendering the credits page

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="credits" class="page span1" data-count="<?= $count ?>">
	<div class="wrapper">

		<header>
			<h3><?= $page->title() ?></h3>
		</header>

		<?php if($page->credits()->isNotEmpty()): ?>
			<section class="credits small mono">
				<div>
					<?= $page->credits()->kirbytext() ?>
				</div>
			</section>
		<?php endif ?>

		<?php if($page->literature()->isNotEmpty()): ?>
			<section class="credits small mono">
				<div>
					<?= $page->literature()->kirbytext() ?>
				</div>
			</section>
		<?php endif ?>

	</div>
</article>
