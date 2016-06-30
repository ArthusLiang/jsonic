Title: Melody
Desc: Melody model in Jsonic enables you to compose music.
SortIndex: 3
---
# Melody

Melody model in Jsonic enables you to compose music.

## Note

### Constructor

| Name      | Type     | value                                 |
|-----------|:---------|:--------------------------------------|
|rollcall   |string    |[0,1,2,3,4,5,6,7]/1#.2b                |
|duration   |number    |1,1/2,1/4,1/8,1/12,1/16                |
|freqIndex  |number    |the index of the note array(Defalut 0) |
|hasDot     |string    |Whether has dot                        |
|isPart     |string    |only for complie                       |

```
var note = new Jsonic.Melody.Note(0,1/2,0,true);
```

### Property

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|Rollcall    |string    |[0,1,2,3,4,5,6,7]/1#.2b                |
|FreqIndex   |number    |the index of the note array(Defalut 0) |
|Duration    |number    |1,1/2,1/4,1/8,1/12,1/16                |
|HasDot      |string    |Whether has dot                        |
|_len        |string    |The real duration with the dot         |
|BaseRollCall|string    |[0,1,2,3,4,5,6,7]                      |
|HalfRollCall|0,-1,1    |#,stand,b                              |


### Method

#### .divid()

private method for complie

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|remain      |number    |Duration                               |
|sectionMax  |number    |The max length of a section            |

#### .setDot()

To set the _len of new Object

## MusicScore

### Constructor

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|alphabet    |string    |C,D,E,F,G,A,B                          |
|intervalName|string    |'major' , 'minor' , 'major5' , 'minor5'|
|beat        |string    |'4/4','3/4','6/8'                      |

```
var musicSocre = new Jsonic.Melody.MusicScore('E','major','4/4');
```

### Property

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|Mode        |Object    |Store base information                 |
|Data        |Array     |The Notes in the music score           |
|Sections    |Array     |The Notes which have been complied     |
|IsCompiled  |string    |Whether has been complied              |
|FreqChat    |Object    |The frequent of notes                  |

### Method

#### .w()

Append note to music score

```
musicSocre.w(new Jsonic.Melody.Note(3),new Jsonic.Melody.Note(4));
```

#### .d()

Delete note from music score

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|index       |number    |start position                         |
|num         |number    |the number of note                     |

```
musicSocre.d(0,1);
```

#### .u()

update note from music score

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|arguments[0]|number    |start position                         |
|arguments[1]|number    |how many                               |
|arguments[2]|Object    |New notes                              |

```
musicSocre.u(0,2,new Jsonic.Melody.Note(3),new Jsonic.Melody.Note(4));
```

#### .r()

Read note from music score

update note from music score

| Name       | Type     | value                                 |
|------------|:---------|:--------------------------------------|
|start       |number    |start position                         |
|end         |number    |end position                           |
|return      |Array     |Notes                                  |

```
musicSocre.r(0,1);
```

#### .reverse()

Reverse the data in music score

```
musicSocre.reverse();
```

#### .merge()

Append a music score to the current music score

```
musicSocre.merge(musicSocre2);
```

#### .compile()

Complie music score for track to play

```
musicSocre.compile();
```

## Track

### Constructor

| Name       | Type         | value                                 |
|------------|:-------------|:--------------------------------------|
|context     |Object | null |Audio Contect                          |

```
var track = new Jsonic.Melody.Track();
```
### Property

| Name         | Type     | value                                 |
|--------------|:---------|:--------------------------------------|
|Ctx           |Object    |The contect of the track               |
|IsRunning     |boolean   |Is Running                             |
|AnalyserNode  |Object    |web aduio analyserNode                 |
|WaveShaperNode|Object    |web aduio waveShaperNode               |

### Method

#### .play()

play a music score

| Name         | Type     | value                                 |
|--------------|:---------|:--------------------------------------|
|musicScore    |Object    |the instance of MusicScore             |
|speed         |number    |how many 1/4 note in a minute          |
|curve         |number    |the amount of curve                    |

```
track.play(musicSocre,90);
```

#### .stop()

Stop playing

```
track.stop();
```
