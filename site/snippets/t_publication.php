
<?php

/*
Template for rendering the 1976+ page

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="publication" class="publication span1">
	<div class="wrapper">

		<header>
			<h3><?= $page->title() ?></h3>
		</header>

		<?php
		$galleryItems = $page->gallery()->toStructure();
		foreach($galleryItems as $galleryItem):

		  // try to get an image object from the filename
		  $image = $galleryItem->image()->toFile();
		  // check if the image object exists
		  if($image): ?>
				<section class="gallery">
					<?php snippet( 'b_figure' ,[
						'image' => $image,
						'width' => 2
					]); ?>
				</section>
		  <?php endif ?>
		<?php endforeach ?>

		<?php if($page->website()->isNotEmpty()): ?>
			<section>
				<div class="official-page-link">
					<a target="_blank" href="<?= $page->website() ?>">Erschienen bei Spector Books</a>
				</div>
			</section>
		<?php endif ?>


		<section class="text">
			<?php if($page->text()->isNotEmpty()): ?>
				<div>
					<?= $page->text()->kirbytext() ?>
				</div>
			<?php endif ?>
		</section>

		<section class="text en">
			<?php if($page->text_en()->isNotEmpty()): ?>
				<div>
					<?= $page->text_en()->kirbytext() ?>
				</div>
			<?php endif ?>
		</section>

		<section class="text box mono small">
			<?php if($page->info()->isNotEmpty()): ?>
				<div>
					<?= $page->info()->kirbytext() ?>
				</div>
			<?php endif ?>
		</section>

	</div>
</article>
