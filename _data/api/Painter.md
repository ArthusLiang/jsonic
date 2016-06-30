Title: Painter
Desc: Jsonic offers a model to draw the graph of sonic.
SortIndex: 2
---
# Painter

Jsonic offers a model to draw the graph of sonic.

## Painter

### Constructor

```
var painter = new Jsonic.Painter();
```
### Property

| Name           | Type     | Description                           |
|----------------|:---------|:--------------------------------------|
|CanvasList      |Object    |The canvases will be rendered          |
|DataReceiverList|Object    |The objects offer the data             |
|IfRender	       |Boolean   |Whether the painter is running         |

### Method

#### .attach()

Match canvas and source

| Name           | Type     | Description                           |
|----------------|:---------|:--------------------------------------|
|canvas          |Dom       |Canvas                                 |
|analyser        |Object    |web audio analyserNode                 |
|renderObj       |Object    |render config                          |

```
painter.attach(canvas,analyserNode,{'FF':{func:'wave'}});
```

#### .start()

start rendering canvases

| Name | Type       | Description                           |
|------|:-----------|:--------------------------------------|
|objs  |Object,null |If null, only the object will start.   |

```
painter.start();
```                       

#### .stop()

stop rendering canvases

| Name | Type       | Description                           |
|------|:-----------|:--------------------------------------|
|objs  |Object,null |If null, only the object will stop.    |

```
painter.stop();
```