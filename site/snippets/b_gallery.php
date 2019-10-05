<?php

/*
A block for displaying a row of images using b_figure.php

Recieving:
- $page Kirby object
- $item array
*/

?>
<section class="gallery">
	<?php

	$image = $page->image($item['image']);
	snippet( 'b_figure' ,[
		'image' => $image,
		'width' => 1
	]);

	?>
</section>
