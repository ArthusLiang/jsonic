Title: Transfer data with sonic
Desc: Sound is kind of wave. According to its physical property, we can do a lot of amazing thing. 
SortIndex: 5
---
# Transfer data with sonic

Sound is kind of wave. According to its physical property, we can do a lot of amazing thing.

## Band

Jsonic can convert a string to sound signal and transfer data with sound. Both the receiving end and sending end need an instance of Jsonic.Band.

```
var band = new Jsonic.Band();
```

You can define the Channel Pairs which are used to transfer data. Otherwise, you can use the function 'initDefaultChannel' to choose the default Channel Pairs.

```
band.initDefaultChannel();
```

## receiving end

```
navigator.webkitGetUserMedia({
    audio:{optional:[{echoCancellation:false}]}
    },function(stream){
        _input = band.AudioContext.createMediaStreamSource(stream);
        band.listenSource(_input);
        band.scanEnvironment();
},function(e){});
```

## sending end

```
band.send('Hello Jsonic',function(){
    //call back
});
```

