# jsonic #


A javascript framework

For more information, please visit my website.

site: **[http://jsonic.net](http://jsonic.net "jsonic")**

## **link** ##

    <script type="text/javascript" src="Jsonic.js"></script>

## Compose Music ##

[http://jsonic.net/doc/melody.html](http://jsonic.net/doc/melody.html)

You can use javascripte to play a tune.

    var musicSocre = new Jsonic.Melody.MusicScore('E','major','4/4'),
		track = new Jsonic.Melody.Track();;

	musicSocre.w(new Jsonic.Melody.Note(3),new Jsonic.Melody.Note(4));
	//play music
	track.play(musicSocre,90);

## Ultrasound Channel ##

[http://jsonic.net/doc/ultrasound.html](http://jsonic.net/doc/ultrasound.html)

Use ultrasound to transfer data.(Something with a higher performance is coming...)

*create a sender*

    var ultrasound = new Jsonic.Ultrasound(),
    	sender = ultrasound.createSender();
    sender.send('123');

*create an accepter*

	var ultrasound = new Jsonic.Ultrasound(),
	accepter = ultrasound.createAccepter();
	
	accepter.bind('123',function(msg){
		alert(msg);
	});

	accepter.start();

## Audio Visualization ##

[http://jsonic.net/doc/painter.html](http://jsonic.net/doc/painter.html)

Render canvas with the data from audio.

    var painter = new Jsonic.Painter();
    painter.attach(canvas,analyserNode,{'FF':{func:'wave'}});
    painter.start();

## Speech Recognition ##

[http://jsonic.net/doc/voix.html](http://jsonic.net/doc/voix.html)

Do you know Siri?

    var voix = new Jsonic.Voix();
    
    voix.bind('hello',function(){
    	console.log('You said hello');
    });
    
    voix.start();
