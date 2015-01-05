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
