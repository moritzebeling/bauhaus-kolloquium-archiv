<?php

/*
Template for rendering the 1976+ page

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="ibhk-13-gallery" class="colloquia span2 addon">
	<div class="wrapper">

		<header>
			<div class="official-page-link">
				<a onclick="navigation.goToChapter(event)" href="#start">Mehr Informationen</a>
			</div>
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

	</div>
</article>
