<?php

/**
 * expects
 * - thumbnail (kirby file object)
 * - min
 * - sec
 * - sizes
 * - directory
 * - filename
 */

?>
<div class="video-player">
	<div class="video-screen">

		<video width="100%" height="auto" preload="none" poster="<?php if( $thumbnail ){ echo $thumbnail->thumb(['width' => 800])->url(); } ?>">
			<?php
			$sizes = array_reverse( $sizes->split() );
			$v = 1;
			$s = count( $sizes );
			foreach( $sizes as $size):

				if( $v < $s ){
					$width = ceil( $size / 9 * 16 );
					$med = 'media="all and (max-width:'.$width.')"';
				} else {
					$med = '';
				}

				$url = $directory . $filename .'/'. $filename .'-'. $size .'.mp4';

				?>

				<source width="100%" height="auto" src="<?php echo $url; ?>" type="video/mp4" <?= $med ?> />

				<?php
				$v++;
			endforeach; ?>
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
				<?php
				if( $min->isNotEmpty() ){
					echo $min;
				}
				echo ':';
				if( $sec->isNotEmpty() ){
					$sec = "00" . $sec->value();
					echo substr($sec, -2);
				}
				?>
			</span>
		</div>

	</div>
</div>
