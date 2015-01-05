(function(window,Jsonic){
    Jsonic.Browser.attrPrefix(window,'SpeechRecognition');
    //build relationship
    var SmartDic=function(){
        this.Dic={};
    };
    SmartDic.prototype={
        //take data from database
        init:function(data,keyList){
            //look up some keys from data
            if(Jsonic.isArray(keyList)){
                for(var i=0,l=keyList.length;i<l;i++){
                    var _name =keyList[i];
                        _cmd = data[_name];
                    if(_cmd!=null){
                        for(var name in _cmd){
                            this.Dic[name] =_name;
                        }
                    }
                }
            //take all
            }else{
                for(var _i in data){
                    var _cmd = data[_i];
                    for(var name in _cmd){
                        this.Dic[name] = _i;
                    }
                }
            }
        },
        get:function(key){
            return this.Dic[key];
        },
        set:function(key,value){
            this.Dic[key]= value;
        },
        remove:function(key,value){
            if(value != null && this.Dic[key] == value){
                delete this.Dic[key];
            }
        }
    };
    var Learning =function(sessionKey){
        this.SessionKey = sessionKey;
        this.load();
    };
    Learning.prototype={
        load:function(){
            this.Database ={} || localStorage.getItem(this.SessionKey);
        },
        save:function(){
            localStorage.setItem(sessionKey,this.Database);
        },
        learn:function(key,match,dic){
             !this.Database[key] && (this.Database[key]={});
             if(this.Database[key][match] === undefined){
                this.Database[key][match]=0;
             }else{
                this.Database[key][match]++;
             }
             dic.add(match,key);
             save();//not sure
        },
        forget:function(key,match,dic){
            var _obj = this.Database[key];
            if(_obj !== undefined){
                delete _obj[match];
                if(Jsonic.isEmptyObject(_obj)){
                    delete _obj;
                }
                dic.remove(key,match);
            }
        }
    };

    var _sessionKey='VoixData';

    var Voix=function(config,keyList,isLoop){
        this.SmartLearning = new Learning(_sessionKey);
        this.Dic= new SmartDic(this.SmartLearning,keyList);
        this.Dic.init();
        this.createRecognition(config);
        this.IsLoop = isLoop;
        //this.CurrentLearning=undefined;
        this.Recognition.start();
        //can be override
        this.onLearning=function(key){};
        this.onLog=function(msg){};
    };

    //inherit class message
    Voix.prototype = new Jsonic.Message();
    Voix.prototype.constructor=Voix;

    //add its own functions here
    Jsonic.extend(Voix.prototype,{
        createRecognition:function(config){
            this.Recognition = new SpeechRecognition();
            var _default={
                continuous:true,
                interimResults:false,
                lang:'en-US',
                maxAlternatives:1
            };
            Jsonic.extend(_default,config,true);
            Jsonic.extend(this.Recognition,_default,true);
            /*
            Recognition has the following functions to be override
            onstart,onresult,onerror,onend
            */
        },
        start:function(){
            var me = this;
            me.Recognition.onresult=function(e){
                me._result.call(me,e);
            };
            return me;
        },
        stop:function(){
            this.Recognition.onresult = undefined;
            return this;
        },
        startLearning:function(word){
            this.CurrentLearning=word;
        },
        stopLearning:function(){
            this.CurrentLearning=undefined;
        },
        _result:function(e){
            var me =this,
            reg=/^\s+|\s+$/g,
            len = e.results.length,
            i=e.resultIndex,
            j=0,
            listeners,//funcs
            msg;
            me.stop();
            for(;i<len;i++){
                if(e.results[i].isFinal){
                    //get word
                    msg = e.results[i][0].transcript.replace(reg,'').toLowerCase();
                    console.log(msg);
                    me.onLog(msg);
                }
                if(me.CurrentLearning){
                    this.SmartLearning.learn(me.CurrentLearning,msg,me.Dic);
                }else{
                    me.on(msg);
                }
            }
            me.IsLoop && me.start();
        }
    });

    Jsonic.Voix =Voix;

})(window,Jsonic);