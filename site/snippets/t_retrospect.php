<?php

/*
Template for rendering a retrospect video page

Recieving:
- $page Kirby object
- $count int

*/

$quotes = array();
// quote group can be 0, 1, 2, 9
if($page->quotes()->isNotEmpty()):
	$collection = $page->quotes()->yaml();
	foreach($collection as $item):
		$quotes[] = $item;
	endforeach;
endif;

?>
<article id="inter-<?= $page->id() ?>" class="retrospect add-nav span1" data-count="<?= $count ?>">
	<div class="wrapper">

		<h4><?= $page->title()->text() ?></h4>

		<?php if(isset($quotes)): foreach($quotes as $quote): if($quote['group'] == 0):
			snippet( 'b_quote' ,[ 'quote' => $quote ]);
		endif; endforeach; endif; ?>

		<?php if($page->hasVideos()):
			$videos = $page->videos();
			?>
			<section class="video">
				<div class="video-player">
					<div class="video-screen">
						<?php $thumbnail = $page->video_thumbnail()->toFile(); ?>
						<video width="100%" height="auto" preload="none" poster="<?php if( $thumbnail ){ echo $thumbnail->thumb(['width' => 800])->url(); } ?>">
							<?php foreach($videos as $video):
								if( strpos( $video, '.mobil.' ) !== false ){
									$med = 'media="all and (max-width:1280px)"';
								} else {
									$med = '';
								} ?>
								<source width="100%" height="auto" src="<?php echo $video->url(); ?>" type="<?php echo $video->mime(); ?>" <?= $med ?> />
							<?php endforeach ?>
							<?php if( $thumbnail ): ?>
								<img width="100%" height="auto" src="<?php echo $thumbnail->thumb(['width' => 800])->url() ?>" />
							<?php endif ?>
						</video>
					</div>
					<div class="video-controls">
						<div class="left">
							<span class="button play">Play</span>
							<span class="button pause">Pause</span>
							<span class="time-now">0:00</span>
						</div>
						<div class="flex time-progress">
							<div class="time-progress-bar"></div>
							<div class="time-progress-slider"></div>
						</div>
						<div class="right">
							<span class="time-total">
								<?php if($page->duration_min()->isNotEmpty() && $page->duration_sec()->isNotEmpty()):
									echo $page->duration_min();
									echo ":";
									$sec = "00".$page->duration_sec()->text();
									echo substr($sec, -2);
								endif ?>
							</span>
						</div>
					</div>
				</div>
			</section>
		<?php endif ?>

		<section class="black grid small mono">
			<?php if($page->is_retrospect()->bool()): ?>

				<div class="g-element">
					<h6>Rückblicke</h6>
					<p>Die internationalen Bauhaus-Kolloquien in Weimar 1976-2016</p>
				</div>
				<div class="g-element en">
					<h6>In Retrospect</h6>
					<p>The international Bauhaus-Colloquia in Weimar 1976-2016</p>
				</div>

			<?php endif ?>

			<div class="g-element">
				<h6><?= $page->title()->text() ?></h6>
				<?= $page->production()->kirbytext() ?>
			</div>
			<div class="g-element en">
				<h6><?= $page->title()->text() ?></h6>
				<?= $page->production_en()->kirbytext() ?>
			</div>

			<?php if($page->is_retrospect()->bool()): ?>
				<div class="g-element">
					<p>Centre for Documentary Architecture</p>
				</div>
				<div class="g-element">
					<p>&copy; Weimar, 2016</p>
				</div>
			<?php endif ?>
		</section>

		<?php if(isset($quotes)): foreach($quotes as $quote): if($quote['group'] == 1):
			snippet( 'b_quote' ,[ 'item' => $quote ]);
		endif; endforeach; endif; ?>

		<?php if($page->biography()->isNotEmpty()): ?>
			<section class="box">
				<?php
				$image = $page->portrait()->toFile();
				if($image):

					snippet( 'b_figure' ,[
						'image' => $image
					]);

				endif ?>
				<div>
					<?= $page->biography()->kirbytext() ?>
				</div>
			</section>
		<?php endif ?>

		<?php if($page->biography_en()->isNotEmpty()): ?>
			<section class="box en">
				<div>
					<?= $page->biography_en()->kirbytext() ?>
				</div>
			</section>
		<?php endif ?>

		<?php if(isset($quotes)): foreach($quotes as $quote): if($quote['group'] == 2):
			snippet( 'b_quote' ,[ 'item' => $quote ]);
		endif; endforeach; endif; ?>

		<?php if(isset($quotes)): foreach($quotes as $quote): if($quote['group'] > 2):
			snippet( 'b_quote' ,[ 'item' => $quote ]);
		endif; endforeach; endif; ?>

	</div>
</article>
