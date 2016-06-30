Title: Speech Recognition
Desc: Speech recognition seems to only work in Chrome.
SortIndex: 3
---
# Speech Recognition

Speech recognition seems to only work in Chrome.

## Voix

At first, you need to create an instance of Jsonic.Voix.

```
var voix = new Josnic.Voix(undefined,undefined,true);
```

Voix inherited Jsonic.Message. You can bind functions with voice command.

```
voix.bind('hello',function(){
    console.log('hello');
});
```

Of course, you can use 'stop' and 'start' to control Voix.

```
voix.start();
//...
voix.stop();
```

