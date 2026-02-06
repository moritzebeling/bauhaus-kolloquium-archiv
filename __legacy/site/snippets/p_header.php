<!doctype html>
<html lang="<?= site()->language() ? site()->language()->code() : 'en' ?>">
<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">

  <title><?= $site->title()->html() ?> | <?= $page->title()->html() ?></title>
  <meta name="description" content="<?= $site->description()->html() ?>">

  <?= css('assets/css/index.css?v4') ?>
  <?= css('assets/css/index-grid.css?v4', 'only screen and (min-width: 650px)') ?>

  <?= js('https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.3.1.min.js', ['defer' => true]); ?>
  <?= js('assets/js/video.js', ['defer' => true]); ?>

  <?php $fav_dir = $site->url()."/assets/favicon/"; ?>
  <link rel="apple-touch-icon" sizes="64x64"   href="<?= $fav_dir; ?>favicon-64.png">
  <link rel="apple-touch-icon" sizes="128x128" href="<?= $fav_dir; ?>favicon-128.png">
  <link rel="apple-touch-icon" sizes="180x180" href="<?= $fav_dir; ?>favicon-180.png">
  <link rel="apple-touch-icon" sizes="256x256" href="<?= $fav_dir; ?>favicon-256.png">
  <link rel="apple-touch-icon" sizes="512x512" href="<?= $fav_dir; ?>favicon-512.png">

  <link rel="icon" type="image/png" sizes="32x32"   href="<?= $fav_dir; ?>favicon-32.png">
  <link rel="icon" type="image/png" sizes="64x64"   href="<?= $fav_dir; ?>favicon-64.png">
  <link rel="icon" type="image/png" sizes="128x128" href="<?= $fav_dir; ?>favicon-128.png">
  <link rel="icon" type="image/png" sizes="180x180" href="<?= $fav_dir; ?>favicon-180.png">
  <link rel="icon" type="image/png" sizes="256x256" href="<?= $fav_dir; ?>favicon-256.png">
  <link rel="icon" type="image/png" sizes="512x512" href="<?= $fav_dir; ?>favicon-512.png">

  <meta name="msapplication-TileImage" content="<?= $fav_dir; ?>favicon-144.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">

</head>
<!-- Original exhibition design by Robin Weißenborn + Moritz Ebeling. Website by Moritz Ebeling -->
<body id="body">

	<nav>
		<div id="navigation" class="index">
		<?php foreach($site->children()->visible() as $page):
			if($page->intendedTemplate() == 'start'): ?>
				<a onclick="navigation.goToChapter(event)" href="#start" class="first-chapter goto-chapter active">Start</a>
			<?php endif;
			if($page->intendedTemplate() == 'colloquia'): ?>
				<a onclick="navigation.goToChapter(event)" class="goto-chapter" href="#ibhk-<?= $page->edition() ?>"><?= $page->title() ?></a>
			<?php endif;
			if($page->intendedTemplate() == 'participants'): ?>
				<a onclick="navigation.goToChapter(event)" class="goto-chapter participants" href="#participants"><?= $page->title() ?></a>
			<?php endif;
		endforeach; ?>
		</div>
    <a onclick="navigation.prevChapter(event)" class="prev-chapter" rel="prev">&nbsp;</a>
    <a onclick="navigation.nextChapter(event)" class="next-chapter" rel="next">&nbsp;</a>
	</nav>
