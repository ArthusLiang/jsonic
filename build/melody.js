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
            this.IsRunning=false;
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