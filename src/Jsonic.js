/*
* @namespace   Jsonic
* @Author:     yulianghuang
* @CreateDate  2015/1/4
*/
(function(window){
    //for no conflict
    var _Jsonic = window.Jsonic,
        _$=window.$;

    //The Core
    var Jsonic =new function(){
        //Info
        this.Version ='1.0.0';
        this.Author='yulianghuang';

        var _pkid=0;
        /*
        * Get the global pkid
        * @return {number}
        */
        this.getPkid=function(){
            return _pkid++;
        };
        this.extend=function(target,source){
            var args=[].slice.call(arguments),
                i=1,
                key,
                ride= typeof args[args.length-1] == 'boolean' ? args.pop() : true;
            if(args.length==1){
                target = !this.window ? this: {};
                i=0;
            }
            while((source=args[i++])){
                for(key in source){
                    if(ride || !(key in target)){
                        target[key] =source[key];
                    }
                }
            }
            return target;
        };
        this.isArray=function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
        this.isEmptyObject=function(obj){
            for(var name in obj){
                return false;
            }
            return true;
        };
        this.noConflict=function(deep){
            window.$ = _$;
            if(deep){
                window.Jsonic =_Jsonic
            }
        };
    };

    //compatibility
    Jsonic.Browser=new function(){
        var me=this,
            _regConfig = {
            Chrome:{
                Reg: /.*(chrome)\/([\w.]+).*/,
                Core: "webkit"
            },
            Safari:{
                Reg: /.*version\/([\w.]+).*(safari).*/,
                Core: "webkit"
            },
            IE:{
                Reg: /.*(msie) ([\w.]+).*/,
                Core: "ms"
            },
            Firefox:{
                Reg: /.*(firefox)\/([\w.]+).*/,
                Core: "moz"
            },
            Opera:{
                Reg: /(opera).+version\/([\w.]+)/,
                Core: "webkit"
            }
        },
        _result,
        _userAgent = navigator.userAgent.toLowerCase();

        me.Name='chrome';
        me.Prefix='webkit';
        me.Version='1';

        for(var _o in _regConfig){
            _result = _regConfig[_o].Reg.exec(_userAgent);
            if(_result !=null){
                me.Name= _result[1] || 'chrome';
                me.Version=_result[2] || 'webkit';
                me.Prefix=_regConfig[_o].Core || '1';
                break;
            }
        }
        //compatibility
        me.attrPrefix=function(obj,attr,func){
            obj[attr] = obj[attr] || obj[me.Prefix+attr] || func;
        };

        //init relatived property
        me.attrPrefix(window,'AudioContext');
        me.attrPrefix(window.navigator,'GetUserMedia');
        //me.attrPrefix(window,'VoiceRecognition');  //only used in voice recognition mode
        me.attrPrefix(window,'requestAnimationFrame',function(callback,el){
            return setTimeout(callback,1000/60);
        });
    };


    //Message Mode
    Jsonic.Message=function(){
        this.Lib={};//* store handles
        this.Dic={};//  store smart learning dictionary
    };
    Jsonic.Message.prototype={
        bind:function(msg,func) {
            if(!func.$pkid){
                func.$pkid = Jsonic.getPkid();
            }
            var _lib= this.Lib,
                _msg
                _msgs = Jsonic.isArray(msg) ? msg : [msg];
            for(var i=0,l=_msgs.length;i<l;i++){
                _msg = _msgs[i];
                if(_lib[_msg]===undefined){
                    _lib[_msg]={
                        handles:{}
                    };
                }
                _lib[_msg].handles[func.$pkid] = func;
            }
        },
        unbind:function(msg,func){
            var _msgs = Jsonic.isArray(msg) ? msg : [msg],
                handles;
            for(var i=0,l=_msgs.length;i<l;i++){
                handles = this.Lib[_msgs[i]];
                if(handles!=undefined && func.$$pkid !=null){
                    delete handles.listeners[func.$$pkid];
                }
            }
        },
        on:function(msg) {
            if(this.Lib[msg] === undefined && this.Dic && this.Dic.get){
                msg = this.Dic.get(msg);
            }
            if(msg && this.Lib[msg]){
                var handles = this.Lib[msg].handles;
                for(var name in handles){
                    handles[name]();
                }
            }
        },
        one:function(msg,func){
            var me =this,
                _func = function(){
                    func.call(me);
                    me.unbind(msg,_func);
                };
            me.bind(msg,_func);
        }
    };

    //
    Jsonic.Microphone=function(){

    };
    Jsonic.Microphone.prototype={

    };

    window.Jsonic = Jsonic;

    //AMD
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
            window.define('Jsonic', [], function () {
                return Jsonic;
            });
    // CommonJS suppport
    }else if(typeof module !== 'undefined' && module.exports !== undefined) {
            module.exports = Jsonic;
    // Default
    }

    /*
    * @namespace   Jsonic.Melody
    * @Author:     yulianghuang
    * @CreateDate  2015/1/4
    */
    (function(window,Jsonic){

        var MusicalAlphabet = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
            RollCallName=['do','re','mi','fa','sol','la','si'],
            TuneInterval={
                major:[0,2,4,5,7,9,11],//[2,2,1,2,2,2,1]
                minor:[0,2,3,5,7,8,10],//[2,1,2,2,1,2,2]
                major5:[0,2,4,7,9],//[2,2,3,2,3]
                minor5:[0,2,5,7,10]//[2,3,2,3,2]
            },
            RollCall= [1,2,3,4,5,6,7],//0 is special standard for no sound
            freqChat={},
            freqRange=5,
            regBeat=/^\d\/\d/,
            regBaseRollCall=/\d/,
            regHalfRollCall=/\#|b/,
            _oneBeat=96,// the length of one beat
            i,j,base;

        //init freq chat
        for(i=-4;i<freqRange;i++){
            freqChat[i]={};
            base = (i-1)*12;
            for(j=0;j<12;j++){
                //A1=440
                freqChat[i][MusicalAlphabet[j]]=440*Math.pow(2,(base+j-9)/12);
            }
        }

        /*
        * @param rollcall number in [0,1,2,3,4,5,6,7]/1#.2b
        * @param duration number 1,1/2,1/4,1/8,1/12,1/16
        * @param freIndex number the index of the note array
        * @param hasDot boolen
        * @param isPart for complie
        */
        var Note =function(rollcall,duration,freqIndex,hasDot,isPart){
            this.Rollcall = rollcall;
            this.FreqIndex = freqIndex || 0;
            this.Duration = duration || 1/4;
            this.HasDot = hasDot;
            this._len = this.Duration * _oneBeat * (hasDot ? 1.5 : 1);//duratuib * 4 * 24
            this.IsPart = isPart;
            this.setDot();
            this.BaseRollCall = +regBaseRollCall.exec(rollcall)[0];
            var _half = regHalfRollCall.exec(rollcall);
            if(_half){
                this.HalfRollCall = _half[0] == '#' ? 1:-1;
            }else{
                this.HalfRollCall=0;
            }
        };
        Note.prototype={
            divid:function(remain,sectionMax){
                var me= this,
                    _len = me._len,
                    _arr=[];
                if(_len<=remain){
                    _arr.push(me);
                }else{
                    var _r = _len - remain,
                        _i = (_r/sectionMax) >>0,
                        _j = _r%sectionMax,
                        _rollCall = me.Rollcall,
                        _freqIndex = me.FreqIndex;
                    remain!==0 && _arr.push(new Note(_rollCall,remain/_oneBeat,_freqIndex));
                    for(var i=0;i<_i;i++){
                        _arr.push(new Note(_rollCall,sectionMax/_oneBeat,_freqIndex,false,true));
                    }
                    _arr.push(new Note(_rollCall,_j/_oneBeat,_freqIndex,false,true));
                }
                return _arr;
            },
            setDot:function(){
                if(this._len % 9 == 0 && !this.HasDot){
                    this.Duration = this.Duration/3*2;
                    this.hasDot = true;
                }
            }
        };

        //var tune = new MusicScore('C','major','4/4');
        var MusicScore = function(alphabet,intervalName,beat){
            var me =this,
                _intervalName = Jsonic.isArray(TuneInterval[intervalName]) ? intervalName : 'major',
                _alphabet = MusicalAlphabet[alphabet]!=undefined ? alphabet : 'C';
                _beat = regBeat.test(beat) ? beat : '4/4',
                _beatArr = _beat.split('/');

            me.Mode={
                Alphabet:_alphabet,
                Interval:_intervalName,
                Name:_alphabet+_intervalName,
                Beat:_beat,
                Numerator:_beatArr[0],
                Denominator:_beatArr[1],
                SectionMax:_beatArr[0]/_beatArr[1]*_oneBeat
            };
            me.Data=[];
            me.Sections=[];
            me.IsCompiled=false;
            //
            me._baseArrIndex = 1;
            me._baseNameIndex= MusicalAlphabet.indexOf(_alphabet);
            //me._baseXindex = _alphabet.indexOf(me.FreqChat[me._baseArrIndex]);

        };
        MusicScore.prototype={
            FreqChat:freqChat,
            initFreq:function(note){
                if(note.BaseRollCall!==0){
                    var me=this,
                        _tuneInterval = TuneInterval[me.Mode.Interval],
                        _y= me._baseArrIndex+note.FreqIndex,
                        _x= me._baseNameIndex+_tuneInterval[note.BaseRollCall-1]+note.HalfRollCall;

                    _y+= parseInt(_x/12);
                    _x = _x%12;
                    note.frequency = freqChat[_y][MusicalAlphabet[_x]];
                }
            },
            //add new note to the muisc score
            w:function(){
                var arr = arguments;
                for(var i=0,l=arguments.length;i<l;i++){
                    if(arguments[i] instanceof Note){
                        this.Data.push(arguments[i]);
                    }
                }
                this.IsCompiled=false;
            },
            d:function(index,num){
                this.Data.splice(index,num);
                this.IsCompiled=false;
            },
            u:function(){
                this.Data.splice.apply(this,arguments);
                this.IsCompiled=false;
            },
            r:function(start,end){
                return this.Data.slice(start,end);
                this.IsCompiled=false;
            },
            reverse:function(){
                this.Data.reverse();
                this.IsCompiled=false;
            },
            merge:function(musicScore){
                this.Data = this.Data.concat(musicScore.Data);
                this.IsCompiled=false;
            },
            compile:function(){
                this.IsCompiled=false;
                var me = this,
                    _data= me.Data,
                    _n = me.Mode.Numerator,
                    _d = me.Mode.Denominator,
                    _sectionMax = me.Mode.SectionMax,
                    //init
                    _last=0,
                    _remain = _sectionMax,
                    _sections = [[]],
                    _sum=0,
                    j,k;

                for(var i=0,l=_data.length;i<l;i++){
                    var _note = _data[i];
                    _note.relativeTime = _sum;
                    _sum+=_note._len;
                    me.initFreq(_note);
                    if(_note._len<=_remain){
                        _sections[_last].push(_note);
                        _remain-=_note._len;
                    }else{
                        var _noteArr = _note.divid(_remain,_sectionMax);
                        if(_remain === 0){
                            _last++;
                           _sections[_last] = [_noteArr[0]];
                        }else{
                            _sections[_last].push(_noteArr[0]);
                        }
                        for(j=1,k=_noteArr.length;j<k;j++){
                            _last++;
                            _sections[_last]=[_noteArr[j]];
                        }
                        _remain = _sectionMax-_sections[_last][0]._len;
                    }
                }
                delete me.Sections;
                me.Sections = _sections;
                this.IsCompiled=true;
                return _sections;
            }
        };

        var Track=function(context){
            this.Ctx = context || new webkitAudioContext();

            //this.Oscillator =this.Ctx .createOscillator();
            this.IsRunning=false;
            //this.Oscillator.connect(this.Ctx.destination);
            this.AnalyserNode = this.Ctx.createAnalyser(),
            this.WaveShaperNode = this.Ctx.createWaveShaper();

            this.WaveShaperNode.connect(this.AnalyserNode);
            this.AnalyserNode.connect(this.Ctx.destination);
        };
        Track.prototype={
            makeDistortionCurve:function(amount){
                var k = typeof amount === 'number' ? amount : 50,
                    n_samples = 44100,
                    curve = new Float32Array(n_samples),
                    deg = Math.PI / 180,
                    i = 0,
                    x;
                for ( ; i < n_samples; ++i ) {
                    x = i * 2 / n_samples - 1;
                    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x));
                }
                this.WaveShaperNode.curve =curve;
            },
            play:function(musicScore,speed,curve){
                var me=this;
                me.IsRunning=true;
                me.MusicScore = musicScore;
                me.makeDistortionCurve(curve);
                var _index=0,
                    _ctx = this.Ctx,
                    _destination = me.WaveShaperNode,
                    _osc = me.Oscillator,
                    _cData,
                    _cTime = _ctx.currentTime,
                    _max=musicScore.Data.length,
                    _speed = speed || 60,
                    _speedRate = 60/_speed/_oneBeat*4,
                    i,l;
                for(i=0,l=musicScore.Data.length;i<l;i++){
                    _cData = musicScore.Data[i];
                    if(_cData.BaseRollCall!=0){
                         delete _cData.Osc;
                        _cData.Osc = _ctx.createOscillator();
                        _cData.Osc.OscillatorType ='sine';
                        _cData.Osc.connect(_destination);
                        _cData.Osc.frequency.value = _cData.frequency;
                        _cData.Osc.start(_cTime+_cData.relativeTime*_speedRate);
                        _cData.Osc.stop(_cTime+(_cData.relativeTime+_cData._len)*_speedRate);
                    }
                }
                for(var i=l-1;i>=0;i--){
                    _cData = musicScore.Data[i];
                    if(_cData.BaseRollCall!==0){
                        _cData.Osc.onended=function(){
                            me.onend();
                        };
                        break;
                    }
                }

                /*  can not call the start of the osc more than once
                _loop=function(){
                    if(me.IsRunning && _index < _max){
                        _cData = musicScore.Data[_index];
                        _osc.frequency.value = _cData.frequency;
                        _osc.start(_cTime+_cData.relativeTime*_speedRate);
                        _osc.stop(_cTime+(_cData.relativeTime+_cData._len)*_speedRate);
                        _osc.onended=function(){
                            _index++;
                            _loop();
                        }
                    }
                };
                _loop();
                */
            },
            stop:function(){
                var me = this,
                    musicScore = me.MusicScore,
                    _cData,i,l;
                me.IsRunning=false;
                for(i=0,l=musicScore.Data.length;i<l;i++){
                    _cData = musicScore.Data[i];
                    if(_cData.BaseRollCall!=0){
                        _cData.Osc.stop();
                        delete _cData.Osc;
                    }
                }
                me.onend();
            },
            onend:function(){

            }
        };

        Jsonic.Melody={
            Track:Track,
            Note:Note,
            MusicScore:MusicScore
        };

    })(window,Jsonic);

    /*
    * @namespace   SonicPainter
    * @Author:     yulianghuang
    * @CreateDate  2014/12/8
    * @Desciption  paint sound
    */
    (function(window,Jsonic){
        var painters=new function(){

            var _defaultColor='#00aff5';
            var hex2rgb=function(hex){
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function(m,r,g,b){ return r + r + g + g + b + b;});
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? parseInt(result[1],16).toString()+','+parseInt(result[2], 16).toString()+','+parseInt(result[3], 16).toString(): null;
            },
            mergeConfig=function(option,config,callback){
                if(!config.If1st){
                    Jsonic.extend(config,option,false);
                    config.If1st=true;
                    callback && callback();
                }
            },
            initConfig=function(canvas,option,name,config,callback){
                if(!config.If1st){
                    name && Jsonic.extend(config,option[name](canvas),false);
                    Jsonic.extend(config,option.Default(canvas),false);
                    config.If1st=true;
                    callback && callback();
                }
            },
            getAverage=function(arr,start,end){
                var sum=0,
                    start = start || 0,
                    end = end || arr.length;
                for(var i=start;i<end;i++){
                    sum+=arr[i];
                }
                return sum/(end-start);
            };

            this.DefaultConfig={};

            Jsonic.extend(this.DefaultConfig,{
                line:{
                    Default:function(canvas){
                        return {
                            X1:0,
                            X2:canvas.width,
                            XStep:2,
                            YMid:canvas.height/2,
                            Base:0,
                            Rate:1,
                            StrokeStyle:_defaultColor,
                            LineWidth :2
                        };
                    },
                    FT:function(canvas){
                        return {
                            Base:0,
                            Rate:200
                        };
                    },
                    BT:function(canvas){
                        return {
                            Base:canvas.height/3,
                            Rate:1
                        };
                    },
                    FF:function(canvas){
                        return {
                            Base:-canvas.height/4,
                            Rate:1
                        };
                    },
                    BF:function(canvas){
                        return {
                            Base:0,
                            Rate:1
                        };
                    }
                }
            });

            //public function
            this.line=function(canvas,data,config,keyname){
                initConfig(canvas,this.DefaultConfig.line,keyname,config,function(){
                    config._stepWidth = (config.X2-config.X1)/data.length;
                    config._base = config.Base+config.YMid;
                });

                var _ctx = canvas._context,
                    _step =config.XStep,
                    _base = config._base,
                    _stepWidth =  config._stepWidth,
                    _rate = config.Rate;
                _ctx.beginPath();
                _ctx.strokeStyle = config.StrokeStyle;
                _ctx.lineWidth =config.LineWidth;
                _ctx.moveTo(config.X1,_base-data[0]*_rate);
                for(var i=_step,l=data.length;i<l;i+=_step){
                    _ctx.lineTo(i*_stepWidth,_base-data[i]*_rate);
                }
                _ctx.stroke();
                _ctx.closePath();
            };

            Jsonic.extend(this.DefaultConfig,{
                rectangle:{
                    Default:function(canvas){
                        return {
                            X1:0,
                            X2:canvas.width,
                            XNum:64,
                            XGap:4,
                            YMid:canvas.height/2,
                            Base:0,
                            Rate:1,
                            FillStyle:_defaultColor
                        };
                    },
                    FT:function(canvas){
                        return {
                            Base:0,
                            Rate:200
                        };
                    },
                    BT:function(canvas){
                        return {
                            Base:canvas.height/3,
                            Rate:1
                        };
                    },
                    FF:function(canvas){
                        return {
                            Base:-canvas.height/4,
                            Rate:1
                        };
                    },
                    BF:function(canvas){
                        return {
                            Base:0,
                            Rate:1
                        };
                    }
                }
            });

            this.rectangle=function(canvas,data,config,keyname){
                initConfig(canvas,this.DefaultConfig.rectangle,keyname,config,function(){
                    config._dataWidth=data.length/config.XNum;
                    config._stepWidth=(config.X2-config.X1)/config.XNum;
                    config._rectWidth= Math.floor(config._stepWidth-config.XGap);
                    config._base = config.Base+config.YMid;
                });

                var _ctx = canvas._context,
                    _dataWidth = config._dataWidth,
                    _stepWidth = config._stepWidth,
                    _rectWidth = config._rectWidth,
                    _base =config._base,
                    _xNum = config.XNum,
                    _xGap = config.XGap/2,
                    _rate = config.Rate,
                    _y,
                    i,j,loc,sum;

                _ctx.beginPath();
                _ctx.fillStyle = config.FillStyle;
                for(i=0;i<_xNum;i+=1){
                    loc =i*_dataWidth;
                    sum=0;
                    for(j=0;j<_dataWidth;j++){
                        sum+=data[loc+j]*_rate;
                    }
                    _y=_base-sum/_dataWidth;
                    _ctx.fillRect(i*_stepWidth+_xGap,_y,_rectWidth,canvas.height-_y);
                }
                _ctx.closePath();
            };

            Jsonic.extend(this.DefaultConfig,{
                wave:{
                    Default:function(canvas){
                        return {
                            X1:0,
                            X2:canvas.width,
                            Attenuation:[[-2,0.2,1],[-6,0.3,1],[4,0.4,1],[2,0.6,1],[1,1,1.5]],
                            K:2,
                            Phase:0,
                            Noise:0.01,
                            Alpha:0.8,
                            Speed:0.2,
                            F:2,
                            Height:canvas.height,
                            YMid:canvas.height/2,
                            Rate:1,
                            StrokeStyle:hex2rgb(_defaultColor)
                        };
                    },
                    FT:function(canvas){
                        return {
                            Rate:1000
                        };
                    },
                    BT:function(canvas){
                        return {
                            Rate:0.5
                        };
                    },
                    FF:function(canvas){
                        return {
                            Rate:0.5
                        };
                    },
                    BF:function(canvas){
                        return {
                            Rate:1
                        };
                    }
                }
            });

            //siri wave line
            var _wave_cache_GATF={},
                _wave_drawline_GATF=function(x){
                    if(_wave_cache_GATF[x] == null){
                        _wave_cache_GATF[x] = Math.pow(4/(4+Math.pow(x,4)),2);
                    }
                    return _wave_cache_GATF[x];
                },
                _wave_drawline_x=function(config,i){
                    return config.X1+config._width*((i+config.K)/(config.K*2));
                },
                _wave_drawline_y=function(config,i,att){
                    return config.YMid+att*Math.sin(config.F*i+config.Phase)*_wave_drawline_GATF(i);
                },
                _wave_drawline=function(canvas,config,index){
                    var _ctx = canvas._context,
                        _attenuation =config.Attenuation[index],
                        _opacity = _attenuation[1],
                        _k= config.K,
                        _att=config.Rate*(config.Noise/_attenuation[0])*config._max,
                        x,y,i;

                    _ctx.beginPath();
                    _ctx.strokeStyle = ['rgba(', config.StrokeStyle,',',_opacity,')'].join('');
                    _ctx.lineWidth = _attenuation[2];

                    i=-_k;
                    _ctx.moveTo(_wave_drawline_x(config,i),_wave_drawline_y(config,i,_att));

                    for(i+=0.01;i<=_k;i+=0.01){
                        _ctx.lineTo(_wave_drawline_x(config,i),_wave_drawline_y(config,i,_att));
                    }
                    _ctx.stroke();
                    _ctx.closePath();
                };
            this.wave=function(canvas,data,config,keyname){
                initConfig(canvas,this.DefaultConfig.wave,keyname,config,function(){
                    config._width = config.X2-config.X1;
                    config._max = config.Height/2-4;
                });

                var _average = getAverage(data);

                config.Phase = (config.Phase + config.Speed)%(Math.PI *64)
                config.Noise = config.Alpha * config.Noise + (1-config.Alpha) * (_average/100);
                config.F = 2+(_average/100) * 3;

                for(var i=0,l=config.Attenuation.length;i<l;i++){
                    _wave_drawline(canvas,config,i);
                }
            };

            Jsonic.extend(this.DefaultConfig,{
                cricle:{
                    Default:function(canvas){
                        var _radius = Math.min(canvas.width,canvas.height)/8;
                        return {
                            XMid:canvas.width/2,
                            YMid:canvas.height/2,
                            Radius:_radius,
                            Rate:Math.round(_radius/30),
                            Base:0,
                            Arc:[[-0.2,0.2,1],[0.1,0.6,1],[0.4,0.8,1.2],[1,1,2],[1.6,0.8,1.2],[2.4,0.4,1]],
                            StrokeStyle:hex2rgb(_defaultColor)
                        };
                    },
                    FT:function(canvas){
                        return {
                            Rate:100,
                            Base:0
                        };
                    },
                    BT:function(canvas){
                        var _radius = Math.min(canvas.width,canvas.height)/8;
                        return {
                            Rate:Math.round(_radius/30),
                            Base:-100
                        };
                    },
                    FF:function(canvas){
                        var _radius = Math.min(canvas.width,canvas.height)/8;
                        return {
                            Rate:1,
                            Base:170
                        };
                    },
                    BF:function(canvas){
                        var _radius = Math.min(canvas.width,canvas.height)/8;
                        return {
                            Rate:Math.round(_radius/30),
                            Base:0
                        };
                    }
                }
            });

            this.cricle=function(canvas,data,config,keyname){
                initConfig(canvas,this.DefaultConfig.cricle,keyname,config,function(){});
                var _ctx = canvas._context,
                    _base = (config.Base+getAverage(data))*config.Rate,
                    _radius =config.Radius,
                    _x=config.XMid,
                    _y=config.YMid,
                    _arc;

                for(var i=0,l=config.Arc.length;i<l;i++){
                    var _arc = config.Arc[i];
                    _ctx.beginPath();
                    _ctx.arc(_x, _y, _radius+Math.max(-_radius,_base*_arc[0]), 0, Math.PI*2, true);
                    _ctx.lineWidth = _arc[2];
                    _ctx.strokeStyle = ['rgba(', config.StrokeStyle,',',_arc[1],')'].join('');
                    _ctx.stroke();
                    _ctx.closePath();
                }

            };

        };

        /*
        * Receiver to control the data
        */
        var SonicDataReceiver=function(analyser){
            this.Analyser = analyser;
            this.Data={};
            this.UEMelodyID = analyser.UEMelodyID;
        };
        SonicDataReceiver.prototype={
            reflashData:function(name){
                this._loopFunc('_get');
            },
            init:function(name){
                this._init[name](this.Data,this.Analyser);
            },
            implement:function(obj){
                var _prototype=SonicDataReceiver.prototype;
                _prototype._get[obj.Name] = obj._get;
                _prototype._init[obj.Name] = obj._init;
            },
            getNewData:function(){

            },
            _getNewData:function(){

            },
            _get:{
                FT:function(data,analyser){
                    analyser.getFloatTimeDomainData(data);
                },
                BT:function(data,analyser){
                    analyser.getByteTimeDomainData(data);
                },
                FF:function(data,analyser){
                    analyser.getFloatFrequencyData(data);
                },
                BF:function(data,analyser){
                    analyser.getByteFrequencyData(data);
                }
            },
            _init:{
                FT:function(data,analyser){
                    if(data.FT === undefined){
                        data.FT = new Float32Array(analyser.fftSize);
                    }
                },
                BT:function(data,analyser){
                    if(data.BT === undefined){
                        data.BT = new Uint8Array(analyser.fftSize);
                    }
                },
                FF:function(data,analyser){
                    if(data.FF === undefined){
                        data.FF = new Float32Array(analyser.frequencyBinCount);
                    }
                },
                BF:function(data,analyser){
                    if(data.BF === undefined){
                        data.BF = new Uint8Array(analyser.frequencyBinCount);
                    }
                }
            },
            _loopFunc:function(func){
                var me = this,
                    _data = me.Data,
                    _analyser = me.Analyser;
                for(var name in _data){
                    me[func][name].call(me,_data[name],_analyser);
                }
            }
        };

        var SonicPainter = function(){
            this.CanvasList = {};
            this.DataReceiverList={};
            this.IfRender = false;
        };

        SonicPainter.prototype={
            _initObj:function(obj,store,factory){
                var me = this,
                    _storeList = this[store],
                    _id,
                    sbj;
                //init id
                obj.UEMelodyID === undefined && (obj.UEMelodyID = Jsonic.getPkid());
                _id = obj.UEMelodyID;

                //store
                if(_storeList[_id] === undefined){
                    //new obj
                    if(typeof factory == 'function'){
                        sbj = new factory(obj);
                    }else{
                        sbj = obj;
                    }
                    sbj.UEMelodyArr ={};
                    sbj.IfRender =true;
                    _storeList[_id]=sbj;
                }else{
                   sbj = _storeList[_id];
                }

                return sbj;
            },
            _initRenderObj:function(renderObj){
                var _point;
                for(var name in renderObj){
                    _point = renderObj[name];
                    _point.config === undefined && (_point.config = {});
                    _point.IfRender = true;
                }
            },
            _matchObj:function(obj,sbj,renderObj){
                obj.UEMelodyArr[sbj.UEMelodyID]=renderObj;
                sbj.UEMelodyArr[obj.UEMelodyID]=renderObj;
            },
            dematchObj:function(obj,sbj){
                delete obj.UEMelodyArr[sbj.UEMelodyID];
                delete sbj.UEMelodyArr[obj.UEMelodyID];
            },
            /*
            @param renderObj {
                FF:{func:'rectangle',config:{},isRender:true},
                FB:{func:'line',config:{},isRender:true}
            }
            */
            attach:function(canvas,analyser,renderObj){
                var me = this,
                    _reveicer = me._initObj(analyser,'DataReceiverList',SonicDataReceiver);
                me._initObj(canvas,'CanvasList');
                me._initRenderObj(renderObj);
                //init the render way
                for(var name in renderObj){
                    _reveicer.init(name);
                }
                //store context
                canvas._context = canvas.getContext('2d');
                //build the relationship
                me._matchObj(canvas,_reveicer,renderObj);
            },
            clearCanvas:function(canvas){
                canvas._context.clearRect(0,0,canvas.width,canvas.height); //not work...oh my god
                canvas.width=canvas.width;
            },
            _drawCanvas:function(canvas){
                if(canvas.IfRender){
                    this.clearCanvas(canvas);
                    var _receiverList = this.DataReceiverList,
                        _idList=canvas.UEMelodyArr,
                        _receiver,
                        _objs,
                        _name,
                        _obj;
                    for(var _id in _idList){
                        _receiver=_receiverList[_id];
                        //if render this receiver
                        if(_receiver.IfRender){
                            _objs =_idList[_id];
                            for(_name in _objs){
                                _obj = _objs[_name];
                                //if render this config
                                if(_obj.IfRender){
                                    //render it ------------------------------- here to call the painter -----------------------------------
                                    painters[_obj.func](canvas,_receiver.Data[_name],_obj.config,_name);
                                }
                            }
                        }
                    }
                }
            },
            //start here
            _render:function(){
                if(this.IfRender){
                    //prepare data
                    var me=this,
                        _receiverList = me.DataReceiverList,
                        _analyserList = me.AnalyserList,
                        _canvasList = me.CanvasList,
                        _canvas;

                    //get data from analyser node
                    for(var id in _receiverList)
                    {
                        _receiverList[id].reflashData();
                    }

                    //drawCanvas
                    for(var id in _canvasList){
                        //rener canvas one by one
                        me._drawCanvas(_canvasList[id]);
                    }
                    requestAnimationFrame(function(){
                        me._render();
                    });
                }
            },
            start:function(objs){
                this._setIfRender(objs,true);
                this._render();
            },
            stop:function(objs){
                this._setIfRender(objs,false);
            },
            _setIfRender:function(objs,ifRender){
                if(objs){
                    if(Jsonic.isArray(objs)){
                        for(var id in objs){
                            objs[id].IfRender =ifRender
                        }
                    }else{
                        objs.IfRender =ifRender;
                    }
                }else{
                    this.IfRender=ifRender;
                }
            }
        };

        //export
        Jsonic.Painter=SonicPainter;
    })(window,Jsonic);

    /*
    * @namespace   voix
    * @Author:     yulianghuang
    * @CreateDate  2014/12/4
    * @Desciption  voice recognition
    */
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

    /*
    * @namespace   ultrasound
    * @Author:     yulianghuang
    * @CreateDate  2014/12/4
    * @Desciption  Use sound to transform data
    */
    (function(window,Jsonic){
        //Buff
        var SonicBuff = function(len){
            this.Data=[];
            this.MaxLen=len;
        };
        SonicBuff.prototype={
            get:function(index){
                return this.Data[index] || null;
            },
            last:function(){
                return this.Data[this.Data.length-1] || null;
            },
            add:function(val){
                this.Data.push(val);
                if(this.Data.length>this.MaxLen){
                    this.Data.shift();//this.Data.splice(0,1)
                }
            },
            length:function(){
                return this.Data.length;
            },
            clear:function(){
                this.Data=[];
            },
            copy:function(){
                var _copy = new SonicBuff(this.MaxLen);
                _copy.Data = this.Data.slice(0);
                return _copy; //instead for loop
            },
            remove:function(index,length){
                if(0<=index && index<this.MaxLen-1){
                    this.Data.splice(index,length);
                }
            }
        };

        //SonicCoder
        var SonicCoder=function(opt){
            opt = opt || {};
            //this.CharDic= opt.CharDic || '\n abcdefghijklmnopqrstuvwxyz0123456789,.!?@*';
            this.CharDic= opt.CharDic || '0123456789';
            this.CharStart = opt.CharStart || '^';
            this.CharEnd = opt.CharEnd || '$';
            this.Dic = this.CharStart +this.CharDic + this.CharEnd;
            this.DicLength = this.Dic.length;

            this.FreqMin = opt.FreqMin || 20000;
            this.FreqMax = opt.FreqMax || 22000;
            this.FreqError = opt.FreqError || 50;
            this.FreqStep =(this.FreqMax-this.FreqMin)/ this.DicLength;

        };
        SonicCoder.prototype={
            charToFreq:function(char){
                var _index= this.Dic.indexOf(char);
                if(_index == -1){
                    console.error(char,'is an invalid character.');
                    _index = this.DicLength-1;
                }
                return this.FreqMin + Math.round(this.FreqStep * _index);
            },
            freqToChar:function(freq){
                if(this.FreqMin>freq || this.FreqMax<freq){
                    if(this.FreqMin -freq < this.FreqError){
                        freq = this.FreqMin;
                    }
                    else if(freq-this.FreqMax >this.FreqError){
                        freq = this.FreqMax;
                    }else{
                        console.error(freq, 'is out of range.');
                        return null;
                    }
                }
                return this.Dic[Math.round((freq-this.FreqMin)/this.FreqStep)];
            }
        };


        var SonicSender=function(audioContext,coder,opt){
            opt = opt || {};
            this.AudioContext = audioContext;
            this.Coder = coder;
            this.charDuration =  opt.charDuration || 0.2;
            this.rampDuration = opt.rampDuration || 0.001;
        };
        SonicSender.prototype={
            send:function(msg,callback){
                var freq,time;
                msg  = this.Coder.CharStart + msg + this.Coder.CharEnd;
                for(var i=0;i<msg.length;i++){
                    freq =  this.Coder.charToFreq(msg[i]);
                    time = this.AudioContext.currentTime + this.charDuration*i;
                    this.scheduleToneAt(freq,time,this.charDuration);
                }
                if(callback){
                    setTimeout(callback,this.charDuration*msg.length*1000);
                }
            },
            scheduleToneAt:function(freq,startTime,duration){
                var gainNode = this.AudioContext.createGain(),
                    osc  = this.AudioContext.createOscillator();

                gainNode.gain.value=0;
                gainNode.gain.setValueAtTime(0,startTime);
                gainNode.gain.linearRampToValueAtTime(1,startTime+this.rampDuration);
                gainNode.gain.setValueAtTime(1,startTime+duration-this.rampDuration);
                gainNode.gain.linearRampToValueAtTime(0,startTime+duration);

                osc.frequency.value = freq;

                gainNode.connect(this.AudioContext.destination);
                osc.connect(gainNode);
                osc.start(startTime);
            }
        };

        var S_STATE={
            IDLE:1,
            RECV:2
        };

        var SonicAccepter=function(audioContext,coder,opt){
            opt = opt || {};
            this.AudioContext = audioContext;
            this.Coder = coder;


            this.PeakThreshold = opt.PeakThreshold || -65;
            this.MinRunLength = opt.MinRunLength || 2;
            this.Timeout = opt.Timeout || 300;
            this.DebugCanvas = opt.Canvas || 'SonicDebugCanvas';

            this.PeakHistory = new SonicBuff(16);
            this.PeakTimes = new SonicBuff(16);

            this.Callbacks= {};

            this.Buffer='';
            this.State =S_STATE.IDLE;
            this.Iteration =0;

            this.IfDebug = !!opt.IfDebug;
            this.IsRunning =false;

        };


        SonicAccepter.prototype = new Jsonic.Message();
        SonicAccepter.prototype.constructor=SonicAccepter;

        Jsonic.extend(SonicAccepter.prototype,{
            start:function(){
                var me =this;
                navigator.webkitGetUserMedia({
                    audio:{optional:[{echoCancellation:false}]}
                },function(stream){
                    me.onStream(stream);
                    me.onstart();
                },function(e){
                    me.onStreamError(e);
                });
            },
            stop:function(){
                this.IsRunning = false;
                this.Stream.stop();
            },
            onstart:function(){

            },
            /*
            on:function(event,callback){
                if(event == 'message'){
                    this.Callbacks.message = callback;
                }
            },
            fire:function(callback,arg){
                callback(arg);
            },
            */
            setDebug:function(value){
                this.debug = value;
                var canvas =document.getElementById(this.DebugCanvas);
                if(canvas){
                    canvas.parentNode.removeChild(canvas);
                }
            },
            onStream:function(stream){
                var me =this,
                    _input = me.AudioContext.createMediaStreamSource(stream),
                    _analyser = me.AudioContext.createAnalyser();

                _input.connect(_analyser);
                me.Freqs = new Float32Array(_analyser.frequencyBinCount);
                me.Analyser = _analyser;
                me.Stream = stream;
                me.IsRunning = true;
                me.raf(function(){
                    me.loop();
                });
            },
            onStreamError:function(e){
                console.error('Audio input error:',e);
            },
            loop:function(){
                var me =this;
                //get data
                me.Analyser.getFloatFrequencyData(me.Freqs);
                //do sanity check the peaks every 5 seconds
                if((me.Iteration+1)%(60*5)==0){
                    me.restartServerIfSanityCheckFails();
                }
                var peakFreq = me.getPeakFrequency();
                if(peakFreq){
                    var char = me.Coder.freqToChar(peakFreq);
                    //debug
                    if(me.IfDebug){
                        console.log('Transcribed char:'+ char);
                    }
                    me.PeakHistory.add(char);
                    me.PeakTimes.add(new Date());
                }else{
                    //no character was detected
                    var lastPeakTime = me.PeakTimes.last();
                    if(lastPeakTime && new Date() - lastPeakTime > me.Timeout){
                        me.State = S_STATE.IDLE;
                        if(me.IfDebug){
                            console.log('Token',me.buffer,'timed out');
                        }
                        me.PeakTimes.clear();
                    }
                }
                //
                me.analysePeaks();
                if(me.IsRunning){
                    me.raf(function(){
                        me.loop();
                    });
                }
                me.Iteration+=1;

            },
            getPeakFrequency:function(){ //get the max signal in the frequent brand
                var me=this,
                    _start = me.freToIndex(me.Coder.FreqMin),
                    _max = - Infinity,
                    _index=-1;
                for(var i=_start;i<me.Freqs.length;i++){
                    if(me.Freqs[i] > _max){
                        _max = me.Freqs[i];
                        _index=i;
                    }
                }
                //in case
                if(_max>me.PeakThreshold){
                    return me.indexToFreq(_index);
                }
                return null;
            },
            //to be analyized
            indexToFreq:function(index){ //频域信号
                //采样频率sampleRate，定义了每秒从连续信号中提取并组成离散信号的采样个数，它用赫兹（Hz）来表示。
                var nyquist = this.AudioContext.sampleRate/2;  // B=2W -> W=B/2 其中，W为理想低通信道的带宽，单位是赫兹（Hz） ;单位为"波特",常用符号"Baud"表示，简写为"B"。
                return nyquist/this.Freqs.length*index;

            },
            freToIndex:function(freq){
                var nyquist = this.AudioContext.sampleRate/2;
                return Math.round(freq/nyquist*this.Freqs.length);
            },
            analysePeaks:function(){
                var char = this.getLastRun();
                if(!char){
                    return;
                }
                if(this.State == S_STATE.IDLE){
                    if(char == this.Coder.CharStart){
                        this.buffer='';
                        this.State = S_STATE.RECV;
                    }
                }else if(this.State == S_STATE.RECV){
                    if(char != this.lastChar && char != this.Coder.CharStart && char != this.Coder.CharEnd){
                        this.buffer +=char;
                        this.lastChar = char;
                    }
                    if(char == this.Coder.CharEnd){
                        this.State = S_STATE.IDLE;
                        this.on(this.buffer);
                        //this.fire(this.Callbacks.message,this.buffer);
                        this.buffer='';
                    }
                }
            },
            getLastRun:function(){
                var me=this,
                             lastChar = this.PeakHistory.last(),
                    runLength=0;
                for(var i=this.PeakHistory.length()-2;i>=0;i--){
                    var char = this.PeakHistory.get(i);
                    if(char == lastChar){
                        runLength+=1;
                    }else{
                        break;
                    }
                }
                if(runLength > me.MinRunLength){
                    me.PeakHistory.remove(i+1,runLength+1);
                    return lastChar;
                }
                return null;

            },
            raf:function(callback){
                var isCrx = !!(window.chrome && chrome.extension);
                if(isCrx){
                    setTimeout(callback,1000/60);
                }else{
                    requestAnimationFrame(callback);
                }
            },
            restartServerIfSanityCheckFails:function(){
                var me =this;
                //strange state 1: peaks gradually get quieter and quieter until they stabilize around -800
                if(me.Freqs[0] < -300){
                    console.error('freqs[0] < -300. Restarting.');
                    me.restart();
                    return;
                }
                //strange state 2: all of the peaks are -100.Check just the first few.
                var _isValid = true;
                for(var i=0;i<10;i++){
                    if(me.Freqs[i] ==-100){
                        _isValid=false;
                    }
                }
                if(!_isValid){
                    console.error('fregs[0:10] == -100. Restarting');
                    me.restart();
                }
            },
            restart:function(){
                window.location.reload();
            }
        });

        var Ultrasound=function(opt){
            this.AudioContext = window.audioContext || new webkitAudioContext();
            this.Coder = new SonicCoder(opt);
        };
        Ultrasound.prototype={
            createSender:function(opt){
                var _sender=new SonicSender(this.AudioContext, this.Coder,opt);
                this.Sender = _sender;
                return _sender;
            },
            createAccepter:function(opt){
                var _accepter = new SonicAccepter(this.AudioContext, this.Coder,opt);
                this.Accepter = _accepter;
                return _accepter;
            }
        };

        Jsonic.Ultrasound = Ultrasound;

    })(window,Jsonic);


})(window);