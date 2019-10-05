<?php

/*
A block for displaying an image within a <figure> tag

Recieving:
- $image Kirby object

*/

$class = '';
$copyright = '';
$archiveID = false;

if( !isset( $width ) ){
	$width = 1;
}

if($image):

	if($image->copyright()->isNotEmpty()){
		$class = 'protect';
		$copyright = '&copy; '.$image->copyright()->text();

		$check = $image->copyright();
		$check = strtolower($check);
		$check = preg_replace('[^a-z]','',$check);

		if( strpos($check, "archiv") !== false ){
			$archiveID = $image->name();
		}
	}

	if($archiveID !== false){
		$archiveID = strtoupper($archiveID);
		$archiveID = preg_replace('/[^A-Z0-9]/','/',$archiveID);
	}

	if($image->archiveID()->isNotEmpty()){
		$archiveID = $image->archiveID();
	}

	?>
	<figure class="<?= $class ?>" alt="<?= $copyright ?>">
		<?php if($image->copyright()->isNotEmpty()): ?>
			<div class="img protection">
				<div><?= $copyright ?><?php if($archiveID !== false){ echo " #".$archiveID; } ?></div>
		<?php endif; ?>
				<img alt="<?= $copyright ?>" width="100%" height="auto" class="lazyload"
					src="<?= $image->url() ?>"
					srcset="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
					data-srcset="<?= $image->thumb(['width' => 360, 'quality' => 80])->url() ?> 360w,
										 <?= $image->thumb(['width' => 480, 'quality' => 80])->url() ?> 480w,
										 <?= $image->thumb(['width' => 760, 'quality' => 80])->url() ?> 760w,
										 <?= $image->thumb(['width' => 920, 'quality' => 80])->url() ?> 920w,
										 <?= $image->thumb(['width' => 1280, 'quality' => 80])->url() ?> 1280w,
										 <?= $image->thumb(['width' => 1600, 'quality' => 80])->url() ?> 1600w"
					sizes="(max-width: 640px) 100vw,
								(max-width:	900px) 60vw<?php if( $width == 1 ): ?>, 30vw<?php endif; ?>"
					 />
		<?php if($image->copyright()->isNotEmpty()): ?>
			</div>
		<?php endif; ?>

		<?php if($image->caption()->isNotEmpty()): ?>
			<figcaption><?= $image->caption()->text(); ?></figcaption>
		<?php endif ?>
	</figure>
<?php endif;
