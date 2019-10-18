<?php

/*

---------------------------------------
License Setup
---------------------------------------

Please add your license key, which you've received
via email after purchasing Kirby on http://getkirby.com/buy

It is not permitted to run a public website without a
valid license key. Please read the End User License Agreement
for more information: http://getkirby.com/license

*/

// Lizenzschlüssel gekauft und Eigentum von Moritz Ebeling
c::set('license', 'K2-PERSONAL-2c8cddd342c953b735a3ecab8d4fc8c4');

/*

---------------------------------------
Kirby Configuration
---------------------------------------

By default you don't have to configure anything to
make Kirby work. For more fine-grained configuration
of the system, please check out http://getkirby.com/docs/advanced/options

*/

// c::set('language.detect', true);
c::set('languages', array(
  array(
    'code'    => 'de',
    'name'    => 'Deutsch',
    'default' => true,
    'locale'  => 'de_DE',
    'url'     => '/'
  ),
));
c::set('locale','de_DE.utf8');

c::set('timezone','Europe/Berlin');
c::set('locale','en_US.utf-8');

// page settings
c::set('error','error');
c::set('home','start');

c::set('ssl',true);

// live
c::set('debug',false);
c::set('whoops',true);

c::set('cache',true);
c::set('cache.autoupdate',true);

// content
c::set('kirbytext.video.width','100%');
c::set('kirbytext.video.height','auto');

// thumbs
c::set('thumbs.presets', [
  '480' => ['width' => 480, 'quality' => 80],
  '720' => ['width' => 720, 'quality' => 80],
  '920' => ['width' => 920, 'quality' => 80],
  '1280' => ['width' => 1280, 'quality' => 80],
  '1600' => ['width' => 1600, 'quality' => 80]
]);

// cdn
c::set('cdn', 'https://documentary-architecture.fra1.cdn.digitaloceanspaces.com/ibhk/');
