const videoPlayers = [];
class VideoPlayer {

  convertTime( d ) {
  	if( !d || d === 'NaN' ){
  		return "0:00";
  	}
  	d = Number( d );
  	let m = Math.floor( d % 3600 / 60 );
  	let s = Math.floor( d % 3600 % 60 );
  	return m + ":" + ('0' + s).slice( -2 );
  }

  constructor( _container, _id ){
		let _this = this;

    this.container = _container;
    this.video = _container.getElementsByTagName('video')[0];
    this.id = _id;
    this.hasBeenPlayed = false;

		// switch off controls
    this.video.controls = false;

		// listen to clicks
		this.container.addEventListener('click', function( event ){
			_this.click( event );
		}, true);

		this.video.addEventListener('loadedmetadata', function( event ){
			_this.setTimeTotal();
		});

		this.video.addEventListener('play', function( event ){
			_this.play();
		});
		this.video.addEventListener('timeupdate', function( event ){
			_this.playtime();
		});
		this.video.addEventListener('pause', function( event ){
			_this.pause();
		});
		this.video.addEventListener('ended', function( event ){
			_this.reset();
		});
		this.video.addEventListener('error', function( event ){
			_this.wait();
		});
		this.video.addEventListener('stalled', function( event ){
			_this.wait();
		});
		this.video.addEventListener('waiting', function( event ){
			_this.wait();
		});
		this.video.addEventListener('playing', function( event ){
			_this.playtime();
		});

		this.status = 'ready';
    this.container.classList.add('ready');

  }

  setTimeTotal(){

		this.duration = this.video.duration;
    this.updateText( 'time-total', this.convertTime( this.duration ) );

  }

  click( event ){

    let target = event.target;
    this.stopAllOthers();

    if( target.classList.contains('play') ){
				this.video.play();
        return 'play';
  	} else if( target.classList.contains('pause') ){
  		  this.video.pause();
        return 'pause';
  	} else {
  	    this.playPause( this );
  	}

  }

  reset(){

		this.video.pause();
    this.video.currentTime = 0;
    this.playtime();

  }

  wait(){

		this.status = 'wait';
    this.container.classList.add('please-wait');

  }

  playtime(){

		if( this.status != 'play' ){
			this.play();
		}

    this.updateText( 'time-now', this.convertTime( this.video.currentTime ) );

  }

	play(){

    this.status = 'play';
    this.hasBeenPlayed = true;

    this.container.classList.remove('pause');
		this.container.classList.remove('please-wait');
    this.container.classList.add('play');

  }

  pause(){

    this.status = 'pause';

    this.container.classList.remove('play');
		this.container.classList.remove('please-wait');
    this.container.classList.add('pause');

  }

  playPause(){

    if( this.status == 'play' ){
			this.video.pause();
    } else {
			this.video.play();
    }
  }

  updateText( _className, _txt ){
    let el = this.container.getElementsByClassName( _className );
    for( let e of el ){
      e.innerHTML = _txt;
    }
  }

  stopAllOthers(){

    for( let video of videoPlayers ){
      if( video.id == this.id ){
        continue;
      }

      if( video.container.classList.contains("play") || video.container.classList.contains("please-wait") ){
        video.video.pause();
      }
    }

  }

}

document.addEventListener('DOMContentLoaded',function(){

  // collection of all video players
  let videos = document.getElementsByClassName('video-player');
  let i = 0;
  for( let video of videos ){
    videoPlayers.push( new VideoPlayer( video, i ) );
    i++;
  }

});
