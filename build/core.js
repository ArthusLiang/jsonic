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

})(window);