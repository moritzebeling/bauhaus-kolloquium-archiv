<?php

/*
Template for rendering a colloquia page

Recieving:
- $page Kirby object
- $count int

*/

$i = 0;
$columns = [
	'left' => [],
	'right' => []
];
/*
$columns[left/right][position-i] = [
	template => program / gallery / quote,
	obj => obj
];
*/


if( $page->program()->isNotEmpty() ):
	$collection = $page->program()->yaml();
	foreach( $collection as $item ):
		if( !isset($item['column']) ){
			continue;
		}
		$column = select_column( $item['column'] );
		$position = select_position( $item['position'], 1 );

		$columns[$column][$position.'-'.$i] = [
			'template' => 'program',
			'position' => $position,
			'item' => $item
		];
		$i++;
	endforeach;
endif;

if($page->gallery()->isNotEmpty()):
	$collection = $page->gallery()->yaml();
	foreach($collection as $item):
		if( !isset($item['column']) ){
			continue;
		}
		$column = select_column($item['column']);
		$position = select_position($item['position'],2);

		$columns[$column][$position.'-'.$i] = [
			'template' => 'gallery',
			'position' => $position,
			'item' => $item
		];
		$i++;
	endforeach;
endif;

if($page->quotes()->isNotEmpty()):
	$collection = $page->quotes()->yaml();
	foreach($collection as $item):
		if( !isset($item['column']) ){
			continue;
		}
		$column = select_column($item['column']);
		$position = select_position($item['position'],3);

		$columns[$column][$position.'-'.$i] = [
			'template' => 'quote',
			'position' => $position,
			'item' => $item
		];
		$i++;
	endforeach;
endif;

ksort($columns['left']);
ksort($columns['right']);

?>
<article id="ibhk-<?= $page->edition() ?>" class="colloquia span2 add-nav" data-count="<?= $count ?>">
	<div class="wrapper">

		<header>
			<?php if($page->website()->isNotEmpty()): ?>
				<div class="official-page-link">
					<a target="_blank" href="<?= $page->website() ?>">Offizielle Webseite</a>
				</div>
			<?php endif ?>
			<h2><?= $page->title() ?></h2>
			<h3><?= $page->name() ?>
				<span class="date"><?= strftime( "%d.–", strtotime( $page->date('Y-m-d', 'date_start') ) ) ?><?= strftime( "%d. %B", strtotime( $page->date('Y-m-d', 'date_end') ) ) ?></span>
			</h3>
		</header>

		<div class="grid">
			<div class="g-element g-cleft column">

				<section class="text box">
					<?php if($page->text_intro()->isNotEmpty()): ?>
						<div>
							<?= $page->text_intro()->kirbytext() ?>
						</div>
					<?php endif ?>
					<?php if($page->text()->isNotEmpty()): ?>
						<div>
							<?= $page->text()->kirbytext() ?>
						</div>
					<?php endif ?>
				</section>

				<?php
				$image = $page->poster()->toFile();
				if($image): ?>
					<section class="poster">
						<?php snippet( 'b_figure' ,[
							'image' => $image,
							'width' => 1
						]); ?>
					</section>
				<?php endif;

				// Loop through column
				$column = 'left';

				foreach ($columns[$column] as $item) {
					snippet( 'b_'.$item['template'] ,[ 'page' => $page, 'item' => $item['item'] ]);
				}

				$album_cover = $page->album_cover()->toFile();
				$album = $page->album()->toFile();
				if($album): ?>
					<section class="text box album">
						<a class="album-download button" target="_blank" href="<?= $album->url() ?>">
							<?php
							if($album_cover):
								snippet( 'b_figure' ,[
									'image' => $album_cover
								]);
							endif; ?>
							<span>Fotoalbum Kolloquiums&nbsp;<?= $page->title() ?></span>
							<span class="detail small mono">Download PDF (<?= $album->niceSize() ?>)</span>
						</a>
					</section>
				<?php endif; ?>

			</div>
			<div class="g-element g-cright column">

				<section class="text box en">
					<?php if($page->text_intro_en()->isNotEmpty()): ?>
						<div>
							<?= $page->text_intro_en()->kirbytext() ?>
						</div>
					<?php endif ?>
					<?php if($page->text_en()->isNotEmpty()): ?>
						<div>
							<?= $page->text_en()->kirbytext() ?>
						</div>
					<?php endif ?>
				</section>

				<?php

				// Loop through column
				$column = 'right';

				foreach ($columns[$column] as $item) {
					snippet( 'b_'.$item['template'] ,[ 'page' => $page, 'item' => $item['item'] ]);
				}

				?>

			</div>
		</div>
	</div>
</article>
