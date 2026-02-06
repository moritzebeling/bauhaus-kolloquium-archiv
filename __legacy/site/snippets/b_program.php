<?php

/*
Block for displaying a colloquias program using b_image.php

Recieves:
- $page Kirby object
- $item array
*/

?>
<section class="program">
	<?php

	$image = $page->image($item['image']);
	snippet( 'b_figure' ,[
		'image' => $image,
		'width' => 1
	]);

	?>
</section>
