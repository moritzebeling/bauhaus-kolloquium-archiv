<?php

/*
Template for rendering the start page

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="start" class="page span2 add-nav" data-count="<?= $count ?>">
	<div class="wrapper start">

		<?php if( $page->title_en()->isEmpty() ): ?>

			<section>

				<header>
					<h3><?= $page->title() ?></h3>
					<?php if($page->subtitle()->isNotEmpty()): ?>
						<h3 class="regular"><?= $page->subtitle() ?></h3>
					<?php endif ?>
				</header>

				<?php if($page->text()->isNotEmpty()): ?>
					<div class="large">
						<?= $page->text()->kirbytext() ?>
					</div>
				<?php endif ?>

				<div class="center">
					<a href="#ibhk-16-gallery" class="button">Impressionen der Ausstellung</a>
				</div>

			</section>

		<?php else: ?>

			<section class="grid">

				<header class="g-element">
					<h3><?= $page->title() ?></h3>
					<?php if($page->subtitle()->isNotEmpty()): ?>
						<h3 class="regular"><?= $page->subtitle() ?></h3>
					<?php endif ?>
				</header>

				<?php if($page->text()->isNotEmpty()): ?>
					<div class="large g-element">
						<?= $page->text()->kirbytext() ?>
					</div>
				<?php endif ?>

				<header class="en g-element">
					<h3><?= $page->title_en() ?></h3>
					<?php if($page->subtitle_en()->isNotEmpty()): ?>
						<h3 class="regular"><?= $page->subtitle_en() ?></h3>
					<?php endif ?>
				</header>

				<?php if($page->text_en()->isNotEmpty()): ?>
					<div class="large en g-element">
						<?= $page->text_en()->kirbytext() ?>
					</div>
				<?php endif ?>

				<div class="center">
					<a href="#ibhk-16-gallery" class="button">Impressionen der Ausstellung</a>
				</div>

			</section>

		<?php endif; ?>

	</div>
	<div id="credits" class="wrapper credits">

		<section class="grid">
			<div class="g-element">

				<?php if($page->credits_title()->isNotEmpty()): ?>
					<header>
						<h3><?= $page->credits_title() ?></h3>
					</header>
				<?php endif ?>
				<?php if($page->credits()->isNotEmpty()): ?>
					<section class="credits small mono">
						<div>
							<?= $page->credits()->kirbytext() ?>
						</div>
					</section>
				<?php endif ?>

				<section class="logos">
					<?php
					$galleryItems = $page->logos()->toStructure();
					foreach($galleryItems as $galleryItem):
					  $image = $galleryItem->image()->toFile();
					  if($image): ?>
							<img width="auto" height="32px" src="<?= $image->url() ?>" />
					  <?php endif ?>
					<?php endforeach ?>
				</section>

			</div>
			<div class="g-element">

				<?php if($page->literature_title()->isNotEmpty()): ?>
					<header>
						<h3><?= $page->literature_title() ?></h3>
					</header>
				<?php endif ?>
				<?php if($page->literature()->isNotEmpty()): ?>
					<section class="literature small mono">
						<div>
							<?= $page->literature()->kirbytext() ?>
						</div>
					</section>
				<?php endif ?>

			</div>
		</section>

	</div>
	<footer>

		&copy; Weimar 2018
		<a target="_blank" href="<?= $site->imprint_url() ?>">Impressum</a>

	</footer>
</article>

<article class="empty"></article>
