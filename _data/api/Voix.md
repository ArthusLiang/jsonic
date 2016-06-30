Title: Voix
Desc: Voix is the model of speech recognition.
SortIndex: 4
---
# Voix

Voix is the model of speech recognition.

## Void

### Constructor

| Name      | Type     | Description                       |
|-----------|:---------|:----------------------------------|
|config     |Object    |config                             |
|keyList    |Object    |session data                       |
|isLoop	  |Boolean   |Whether to run after one detection |

```
var voix = new Jsonic.Voix();
```

### Property

| Name      | Type     | Description                                       |
|-----------|:---------|:--------------------------------------------------|
|onLearning |Function  |The event will be fired in learning mode           |                          
|onLog      |Function  |The event will be fired when voix call console.log |              

### Method

#### .start()

start to do voice recognition

```
voix.start();
```

#### .stop()

stop doing voice recognition

```
voix.stop();
```

#### .bind()

bind event

| Name      | Type         | Description                                       |
|-----------|:-------------|:--------------------------------------------------|
|msg        |string lowcase|message                                            |                          
|func       |Function,Null |event                                              |  

```
voix.bind('hello',event);
```

#### .unbind()

unbind event

| Name      | Type         | Description                                       |
|-----------|:-------------|:--------------------------------------------------|
|msg        |string lowcase|message                                            |                          
|func       |Function,Null |event                                              |

#### .one()

bind an event which will be fired only once

| Name      | Type         | Description                                       |
|-----------|:-------------|:--------------------------------------------------|
|msg        |string lowcase|message                                            |                          
|func       |Function,Null |event                                              |

```
voix.one('hello',event);
```

