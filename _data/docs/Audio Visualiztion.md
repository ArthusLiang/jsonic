Title: Audio Visualiztion
Desc: Jsonic can show the data of analyzer node. You can attach multiple analyzer nodes to multiple canvases. Jsonic has optimized processing threads. 
SortIndex: 4
---
# Audio Visualiztion

Jsonic can show the data of analyzer node. You can attach multiple analyzer nodes to multiple canvases. Jsonic has optimized processing threads. 

## Painter

Create an instance of painter at fisrt.

```
var paint = new Jsonic.Painter().
```

Use the function 'attach' to match the analyser node and canvas.

```
paint.attach(canvas,analyzerNode1,{'BF':{func:'cricle'}});
```

Of course, you can use 'stop' and 'start' to control Paint.

```
paint.start();
//...
paint.stop();
```

