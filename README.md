# Bauhaus Colloquia Archive

Design and development by [Moritz Ebeling](https://moritzebeling.com)
© 2018–2019

### Install

Get the code
```
$ git clone https://github.com/moritzebeling/bauhaus-kolloquium-archiv.git --recursive
```

Update modules
```
$ git submodule foreach git pull origin master
```

Install [Sass](https://sass-lang.com)
```
$ npm install -g sass
```

### Run

Run this website
```
$ php -S localhost:3000
```

Compile CSS
```
$ sass --watch assets/scss:assets/css
```

### Credits

This website is made using [Kirby CMS](https://getkirby.com) Version 2 and requires a license to run on a public server.
