# Kirby

Kirby is a file-based CMS.
Easy to setup. Easy to use. Flexible as hell.

## Trial

You can try Kirby on your local machine or on a test
server as long as you need to make sure it is the right
tool for your next project.

## Buy a license

You can purchase your Kirby license at
<https://getkirby.com/buy>

A Kirby license is valid for a single domain. You can find
Kirby's license agreement here: <https://getkirby.com/license>

## The Panel

You can find the login for Kirby's admin interface at
http://yourdomain.com/panel. You will be guided through the signup
process for your first user, when you visit the panel
for the first time.

## Installation

Kirby does not require a database, which makes it very easy to
install. Just copy Kirby's files to your server and visit the
URL for your website in the browser.

**Please check if the invisible .htaccess file has been
copied to your server correctly**

### Requirements

Kirby runs on PHP 5.4+, Apache or Nginx.
As of 2018, PHP 7 is recommended anyway.

## Documentation

<https://getkirby.com/docs>

## Issues and feedback

If you have a Github account, please report issues
directly on Github:

- <https://github.com/getkirby/kirby/issues>
- <https://github.com/getkirby/panel/issues>
- <https://github.com/getkirby/starterkit/issues>

Otherwise you can use Kirby's forum: https://forum.getkirby.com
or send us an email: <support@getkirby.com>

## Support

<https://getkirby.com/support>

## Copyright

© 2009-2016 Bastian Allgeier (Bastian Allgeier GmbH)
<http://getkirby.com>

----

## How to get around

`/assets` folder stores files like css or js that are relevant throughout the whole project.

`/content` folder stores the complete content and tree structure of the website

`/kirby` is the Kirby PHP framework and can replaced with a new version in order to update.

`/panel` is the admin panel to control the page content

`/site` containes all configuration of this web project like blueprints, plugins, templates, snippets
    `/blueprints` to configure the structure of the website and the fields of the subpages
    `/config` holds a configuration file
    `/snippets` contains all template snippets
    `/templates` containes all templetes

`/thumbs` folder stores all Kirby created downscaled images