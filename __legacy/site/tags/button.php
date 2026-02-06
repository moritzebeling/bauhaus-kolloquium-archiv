<?php

// button tag
kirbytext::$tags['button'] = array(
  'attr' => array(
    'text'
  ),
  'html' => function($tag) {

    $link = $tag->attr('button');
    $text = $tag->attr('text');

    if(empty($text)) {
      $text = $link;
    }

    if(str::isURL($text)) {
      $text = url::short($text);
    }

    return html::a($link, $text, array(
      'class'  => 'button',
    ));

  }
);
