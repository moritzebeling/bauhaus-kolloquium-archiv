<?php

/*
Template for rendering the 1976+ page

Recieving:
- $page Kirby object
- $count int

*/

?>
<article id="ibhk-19-videos" class="span2 video-gallery">
	<div class="wrapper">

		<header>
			<h3><?= $page->title() ?></h3>
		</header>

		<?php
		for ($s=1; $s < 5; $s++):

			$field_headline = 'panel'.$s.'_title';
			$field_lectures    = 'panel'.$s.'_videos';

			?>
			<div class="sektion sektion-<?= $s ?>">

				<header>
					<h4>Panel <?= $s; ?><br />
					<span class="regular"><?= $page->{$field_headline}() ?></span></h4>
				</header>

				<?php foreach( $page->{$field_lectures}()->toStructure() as $lecture ): ?>
					<section>

						<h5><?= $lecture->title()->html() ?></h5>

						<div class="video">
							<?php snippet('videoplayer',[
								'thumbnail' => $lecture->thumbnail()->toFile(),
								'min' => $lecture->duration_min(),
								'sec' => $lecture->duration_sec(),
								'sizes' => $lecture->sizes(),
								'directory' => c::get('cdn') . '2019/',
								'filename' => $lecture->filename()
							]); ?>
						</div>

					</section>
				<?php endforeach; ?>

				<section class="black grid small mono">
					<div class="g-element">
						<?= $page->production()->kirbytext() ?>
					</div>
					<div class="g-element en">
						<?= $page->production_en()->kirbytext() ?>
					</div>
					<div class="g-element">
						<p>Centre for Documentary Architecture</p>
					</div>
					<div class="g-element">
						<p>&copy; Weimar, 2019</p>
					</div>
				</section>

			</div>
		<?php endfor; ?>

	</div>
</article>
