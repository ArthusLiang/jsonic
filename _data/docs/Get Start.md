Title: Get Start
Desc: Jsonic is a small and feature-rich javascript library. It helps to improve the interaction of sound in HTML5 website or apps. With Jsonic, you can compose music, transfer data with urltrasonic channel, make sound wave visualible, do some speech recognition and so on.
SortIndex: 1
---

### What's Jsonic

Jsonic is a small and feature-rich javascript library. It helps to improve the interaction of sound in HTML5 website or apps. With Jsonic, you can compose music, transfer data with urltrasonic channel, make sound wave visualible, do some speech recognition and so on.

### Glance

## Use Jsonic

```
<script type="text/javascript" src="Jsonic.js"></script>
```

## Compose music

```
var N = function(rollcall,duration,freqIndex,hasDot,isPart){
    return new Jsonic.Melody.Note(rollcall,duration,freqIndex,hasDot,isPart);
};
var musisSocre = new Jsonic.Melody.MusicScore('E','major','4/4');
musisSocre.w(N(3),N(3),N(4),N(5),N(5),N(4),N(3),N(2));
```

## Speech Recognition

```
var voix = new Jsonic.Voix(undefined,undefined,true);
voix.bind('hi',function(){
    alert('hi');
});
voix.start();
```