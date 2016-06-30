Title: Compose music
Desc: You can find the related object in Jsonic.Melody
SortIndex: 2
---
# Compose music

You can find the related object in Jsonic.Melody

## Note

The instance of note stands for a music note. Note is the minimum part of melody. Create a note with the following code.

```
var note1 = new Jsonic.Melody.Note(7,1/4,0,false);
```

## MusicScore

The following code created a 4/4 e major music score.

```
var musicScore = new Jsonic.Melody.MusicScore('E','major','4/4');
```

You can use the function 'w' to append note to the music score.

```
musicScore.w(note1, note2, new Jsonic.Melody.Note(7,1/4,0,false));
```

It is easy to change the modal of the music score. You just need to change the music's proprety.

```
musicScore.Mode.Alphabet='C';
musicScore.Mode.Interval='minor';
```

## Track

You need to create an instance of Track, if you want to play the music score.

```
var track = new Jsonic.Melody.Track();
```

Use the function play to play a music score. The speed of the music score should be defined at this time.

```
track.play(musicScore,90);
```

Use the function stop tp stop playing the music score. 

```
track.stop();
```

## TrackGain

In the version above 1.1, TrackGain is added to Jsonic.Melody. Its usage is the same as Track. But the impliment of these two objects are different.

