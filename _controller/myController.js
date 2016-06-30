'use strict';

var fs = require("fs");


var ControllerDetail = function(config,rule,data,view) {
	this.Config = config;
	this.Rule = rule;
	this.Data = data;
	this.View = view;
};
ControllerDetail.prototype={
	_createFolder:function(path){

	},

	_renderFile:function(rootPath,node,data,config){
		//build data

	},
	_renderNode:function(rootPath,node){

	},
	render:function(callback){

	}
};

exports = module.exports = ControllerDetail;
