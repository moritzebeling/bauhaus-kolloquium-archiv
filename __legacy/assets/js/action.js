/*
International Bauhaus Colloquia Archive Website
written by Moritz Ebeling
*/

console.log("Welcome to the online archive of the history of the Bauhaus Colloquia");
console.log("This website was made by Moritz Ebeling -> moritzebeling.com");

// Helpers

function getWindowSize(){
	windowWidth = document.documentElement.clientWidth;
	windowHeight = document.documentElement.clientHeight;
	if( windowWidth > breakpoint && grid === true ){
		windowSize = windowWidth;
		// grid layout
		scrollDirection = 'horizontal';
		document.body.classList.remove('no-grid');

		// document size
		var lastElement = document.getElementById('main').lastElementChild;
		documentSize = Math.floor( lastElement.offsetLeft + lastElement.offsetWidth );
		document.getElementById('body').style.width = documentSize+'px';
		document.getElementById('main').style.width = documentSize+'px';
	} else {
		windowSize = windowHeight;
		// phone layout
		scrollDirection = 'vertical';
		document.body.classList.add('no-grid');

		// document size
		var alls = document.getElementsByClassName('colloquia');
		var lastElement = alls[ alls.length - 1 ];
		documentSize = Math.floor( lastElement.offsetTop + lastElement.offsetHeight );
		document.getElementById('body').style.width = windowWidth+'px';
		document.getElementById('main').style.width = windowWidth+'px';
	}
	console.log( windowSize, documentSize );
}
function constrain( val, min, max ){
	min = min || 0;
	max = max || 1;
	return Math.max( Math.min( val, max ), min );
}
function getScrollPosition(){
	if( scrollDirection == 'vertical' ){
		if (self.pageYOffset){
			return self.pageYOffset;
		}
	  // IE
	  if (document.documentElement && document.documentElement.scrollTop){
	    return document.documentElement.scrollTop;
		}
	  if (document.body.scrollTop){
			return document.body.scrollTop;
		}
	} else {
		if (self.pageXOffset){
			return self.pageXOffset;
		}
	  // IE
	  if (document.documentElement && document.documentElement.scrollLeft){
	      return document.documentElement.scrollLeft;
		}
	  if (document.body.scrollLeft){
			return document.body.scrollLeft;
		}
	}
  return 0;
}
function cruiseObject(key, i) {
  var keys = Object.keys(items).sort( function(a,b){ return a-b; } );
  var index = keys.indexOf(key);
  if ((i==-1 && index>0) || (i==1 && index<keys.length-1)){
		index = index+i;
	}
  return items[keys[index]];
}

// Initial Values
var breakpoint = 650;
var breakpoint2 = 900;
var breakpoint3 = 1200;
var em3 = 48;
var windowWidth = document.documentElement.clientWidth;
var windowHeight = document.documentElement.clientHeight;
var scrollDirection = 'horizontal';
var windowSize = windowWidth;
var documentSize = windowSize * 2;
var listenToScroll = true;
var grid = false;

getWindowSize();

// Objects

var wall = {
	element: document.getElementById('wall'),
	width: windowWidth * 2,
	offset: 0,
	offsetLast: this.offset,
	offsetMax: windowWidth,
	getWidth: function(){
		this.width = this.element.offsetWidth;
		return this.width;
	},
	calcOffsetMax: function(){
		this.offsetMax = this.width - windowWidth;
	},
	move: function( progress ){
		progress = progress || scroll.progress;
		this.offset = constrain( Math.round( progress * this.offsetMax ), 0, this.offsetMax );
		if( this.offset == this.offsetLast ){
			return;
		}
		this.offsetLast = this.offset;
		this.element.style.left = '-' + this.offset + 'px';
		return this.offset;
	},
	reset: function(){
		this.getWidth();
		this.calcOffsetMax();
	}
};

var navslider = {
	element: document.getElementById('navigation'),
	width: windowWidth,
	offset: 0,
	offsetLast: this.offset,
	offsetMax: windowWidth,
	getWidth: function(){
		this.width = this.element.offsetWidth;
		if( this.width < windowWidth ){
			this.element.classList.add('spread');
		}
		return this.width;
	},
	calcOffsetMax: function(){
		this.offsetMax = this.width - windowWidth;
	},
	move: function( progress ){
		progress = progress || scroll.progress;
		this.offset = constrain( Math.round( progress * this.offsetMax ), 0, this.offsetMax );
		if( this.offset == this.offsetLast ){
			return;
		}
		this.offsetLast = this.offset;
		this.element.style.left = '-' + this.offset + 'px';
		return this.offset;
	},
	reset: function(){
		this.element.classList.remove('spread');
		this.getWidth();
		this.calcOffsetMax();
	}
};

var scroll = {
	position: 0,
	positionLast: this.position,
	positionMax: windowSize,
	progress: 0,
	updateNavigation: true,
	getScrollPosition: function(){
		this.position = Math.round( getScrollPosition() );
		if( this.position == this.positionLast ){
			return;
		}
		this.positionLast = this.position;
		this.progress = this.position / this.positionMax;
		wall.move( this.progress );
		navslider.move( this.progress );
		if( this.updateNavigation === true ){
			navigation.listen( this.position );
		}
	},
	calcPositionMax: function(){
		this.positionMax = documentSize - windowSize;
		console.log( this.positionMax );
	},
	reset: function(){
		this.updateNavigation = false;
		wall.reset();
		navslider.reset();
		this.calcPositionMax();
		this.getScrollPosition();
		this.updateNavigation = true;
		navigation.reset( this.position );
	}
};

var navigation = {
	element: document.getElementById('navigation'),
	index: {},
	chapter: 0,
	chapterId: 'start',
	chapterLast: this.chapter,
	chapterMax: 1,
	chapterElement: document.getElementById('navigation').querySelectorAll("a[href='#start']")[0],
	focusElement: document.getElementById('start'),
	goToChapter: function( e ){
		e.preventDefault();
		this.chapterId = e.target.hash.replace('#','');
		if( this.chapterId == this.chapterLast ){
			return;
		}
		this.chapterLast = this.chapterId;
		// correct
		this.moveTo();
	},
	moveTo: function(){
		this.focusElement = document.getElementById( this.chapterId );
		this.highlight();

		listenToScroll = false;

		if( scrollDirection == 'horizontal' ){

			var to = this.focusElement.offsetLeft;

			$('html, body').animate({
				scrollLeft: to
			}, 600, function() {
				listenToScroll = true;
			});
			$('#'+this.chapterId).animate({
				scrollTop: 0
			}, 600);

		} else {

			var to = this.focusElement.offsetTop - em3;

			$('html, body').animate({
				scrollTop: to
			}, 600, function() {
				listenToScroll = true;
			});

		}
	},
	nextChapter: function( e ){
		if( this.chapter >= this.chapterMax - 1 || listenToScroll !== true ){
			return;
		}

		for( var i in this.index ){
			if( scroll.position >= this.index[i].pos ){
				this.chapter = i;
			}
		}
		this.chapter = parseInt( this.chapter ) + 1;

		this.chapterId = this.index[ this.chapter ].id;
		this.chapterLast = this.chapterId;

		this.highlight();
		this.moveTo();

	},
	prevChapter: function( e ){
		if( this.chapter <= 0  || listenToScroll !== true ){
			return;
		}

		for( var i in this.index ){
			if( scroll.position > this.index[i].pos ){
				this.chapter = i;
			}
		}

		this.chapterId = this.index[ this.chapter ].id;
		this.chapterLast = this.chapterId;

		this.highlight();
		this.moveTo();

	},
	highlight: function(){
		var next = this.element.querySelectorAll("a[href='#" + this.chapterId + "']")[0];
		if( next ){
			this.chapterElement.classList.remove('active');
			// $('#navigation a').removeClass('active');
			this.chapterElement = next;
			this.chapterElement.classList.add('active');
		}
	},
	createIndex: function(){
		this.index = {};
		var items = document.getElementById('main').getElementsByClassName('add-nav');
		// var i = 0;
		var pos = 0;
		// for( var item of items ){
		for( var i = 0; i < items.length; i++ ){
			var id = items[i].id;
			if ( windowWidth < breakpoint && id == 'participants' ){
				continue;
			}
			if( scrollDirection == 'vertical' ){
				pos = items[i].offsetTop - em3;
			} else {
				pos = items[i].offsetLeft;
			}
			this.index[i] = {id: id, pos: pos};
		}
		this.chapterMax = i;

	},
	listen: function( scrollPosition ){
		if( listenToScroll !== true ){
			return;
		}
		scrollPosition += windowSize * 0.4;

		// convert with babel
		for ( let i in this.index ) {
			if( scrollPosition > this.index[i].pos ){
				this.chapter = i;
			}
		}

		this.chapterId = this.index[ this.chapter ].id;
		if( this.chapterId == this.chapterLast ){
			return;
		}
		this.chapterLast = this.chapterId;
		this.highlight();
	},
	reset: function( scrollPosition ){
		this.createIndex();
		this.listen( scrollPosition );
	}
};

allVideos = [];

function viewControl(){
	/*
	Run at beginning and after window risizing
	*/

	// re-read dimensions
	getWindowSize();

	if( windowWidth > breakpoint3 ){
		$('#colspan').attr( 'colspan', 2 );
	} else {
		$('#colspan').attr( 'colspan', 1 );
	}

	scroll.reset();

}

window.onload = function(){
	viewControl();
};

document.addEventListener("DOMContentLoaded", function(event) {
  viewControl();
});

// Document ready
$(document).ready(function() {

	grid = CSS.supports("display: grid");

	viewControl();

	// scroll control
	var scroll_waiting = false;
	var endScrollHandle;
	window.onscroll = function(){

		scroll.getScrollPosition();

		// waiting
		if( scroll_waiting || listenToScroll === false ){
			return;
		}
		// and waiting again
		scroll_waiting = true;
		clearTimeout( endScrollHandle );
		setTimeout( function () {
			scroll_waiting = false;
		}, 100);
		endScrollHandle = setTimeout(function () {
			// and doing once again
			scroll.getScrollPosition();
		}, 201);

	};

	// view control
	var resize_waiting = false;
	var endResizeHandle;
	$( window ).resize(function(){
		// waiting
		if( resize_waiting ){
			return;
		}
		// doing
		viewControl();
		// and waiting again
		resize_waiting = true;
		clearTimeout( endResizeHandle );
		setTimeout(function () {
			resize_waiting = false;
		}, 100);
		endResizeHandle = setTimeout(function () {
			// and doing once again
			viewControl();
		}, 201);
	});

});
