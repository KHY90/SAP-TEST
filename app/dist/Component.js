sap.ui.define(["sap/ui/core/UIComponent","sap/ui/model/json/JSONModel"],function(e,t){"use strict";return e.extend("ui5.walkthrough.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();var i=new t({headerExpanded:true});this.setModel(i)}})});