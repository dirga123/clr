/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/message/MessageProcessor','./BindingMode','./Context'],function(q,M,B,C){"use strict";var a=M.extend("sap.ui.model.Model",{constructor:function(){M.apply(this,arguments);this.oData={};this.bDestroyed=false;this.aBindings=[];this.mContexts={};this.iSizeLimit=100;this.sDefaultBindingMode=B.TwoWay;this.mSupportedBindingModes={"OneWay":true,"TwoWay":true,"OneTime":true};this.bLegacySyntax=false;this.sUpdateTimer=null;},metadata:{"abstract":true,publicMethods:["bindProperty","bindList","bindTree","bindContext","createBindingContext","destroyBindingContext","getProperty","getDefaultBindingMode","setDefaultBindingMode","isBindingModeSupported","attachParseError","detachParseError","attachRequestCompleted","detachRequestCompleted","attachRequestFailed","detachRequestFailed","attachRequestSent","detachRequestSent","setSizeLimit","refresh","isList","getObject"]}});a.M_EVENTS={ParseError:"parseError",RequestFailed:"requestFailed",RequestSent:"requestSent",RequestCompleted:"requestCompleted"};a.prototype.attachRequestFailed=function(d,f,l){this.attachEvent("requestFailed",d,f,l);return this;};a.prototype.detachRequestFailed=function(f,l){this.detachEvent("requestFailed",f,l);return this;};a.prototype.fireRequestFailed=function(A){this.fireEvent("requestFailed",A);return this;};a.prototype.attachParseError=function(d,f,l){this.attachEvent("parseError",d,f,l);return this;};a.prototype.detachParseError=function(f,l){this.detachEvent("parseError",f,l);return this;};a.prototype.fireParseError=function(A){this.fireEvent("parseError",A);return this;};a.prototype.attachRequestSent=function(d,f,l){this.attachEvent("requestSent",d,f,l);return this;};a.prototype.detachRequestSent=function(f,l){this.detachEvent("requestSent",f,l);return this;};a.prototype.fireRequestSent=function(A){this.fireEvent("requestSent",A);return this;};a.prototype.attachRequestCompleted=function(d,f,l){this.attachEvent("requestCompleted",d,f,l);return this;};a.prototype.detachRequestCompleted=function(f,l){this.detachEvent("requestCompleted",f,l);return this;};a.prototype.fireRequestCompleted=function(A){this.fireEvent("requestCompleted",A);return this;};a.prototype.attachMessageChange=function(d,f,l){this.attachEvent("messageChange",d,f,l);return this;};a.prototype.detachMessageChange=function(f,l){this.detachEvent("messageChange",f,l);return this;};a.prototype.getObject=function(p,c){return this.getProperty(p,c);};a.prototype.getContext=function(p){if(!q.sap.startsWith(p,"/")){throw new Error("Path "+p+" must start with a / ");}var c=this.mContexts[p];if(!c){c=new C(this,p);this.mContexts[p]=c;}return c;};a.prototype.resolve=function(p,c){var i=typeof p=="string"&&!q.sap.startsWith(p,"/"),r=p,s;if(i){if(c){s=c.getPath();r=s+(q.sap.endsWith(s,"/")?"":"/")+p;}else{r=this.isLegacySyntax()?"/"+p:undefined;}}if(!p&&c){r=c.getPath();}if(r&&r!=="/"&&q.sap.endsWith(r,"/")){r=r.substr(0,r.length-1);}return r;};a.prototype.addBinding=function(b){this.aBindings.push(b);};a.prototype.removeBinding=function(b){for(var i=0;i<this.aBindings.length;i++){if(this.aBindings[i]==b){this.aBindings.splice(i,1);break;}}};a.prototype.getDefaultBindingMode=function(){return this.sDefaultBindingMode;};a.prototype.setDefaultBindingMode=function(m){if(this.isBindingModeSupported(m)){this.sDefaultBindingMode=m;return this;}throw new Error("Binding mode "+m+" is not supported by this model.",this);};a.prototype.isBindingModeSupported=function(m){return(m in this.mSupportedBindingModes);};a.prototype.setLegacySyntax=function(l){this.bLegacySyntax=l;};a.prototype.isLegacySyntax=function(){return this.bLegacySyntax;};a.prototype.setSizeLimit=function(s){this.iSizeLimit=s;};a.prototype.getInterface=function(){return this;};a.prototype.refresh=function(f){this.checkUpdate(f);if(f){this.fireMessageChange({oldMessages:this.mMessages});}};a.prototype.checkUpdate=function(f,A){if(A){if(!this.sUpdateTimer){this.sUpdateTimer=q.sap.delayedCall(0,this,function(){this.checkUpdate(f);});}return;}if(this.sUpdateTimer){q.sap.clearDelayedCall(this.sUpdateTimer);this.sUpdateTimer=null;}var b=this.aBindings.slice(0);q.each(b,function(i,o){o.checkUpdate(f);o.checkDataState(f);});};a.prototype.setMessages=function(m){this.mMessages=m||{};this.checkMessages();};a.prototype.getMessagesByPath=function(p){if(this.mMessages){return this.mMessages[p]||[];}return null;};a.prototype.checkMessages=function(){q.each(this.aBindings,function(i,b){b.checkDataState();});};a.prototype.destroy=function(){M.prototype.destroy.apply(this,arguments);this.oData={};this.aBindings=[];this.mContexts={};if(this.sUpdateTimer){q.sap.clearDelayedCall(this.sUpdateTimer);}this.bDestroyed=true;};a.prototype.getMetaModel=function(){return undefined;};a.prototype.getOriginalProperty=function(p,c){return this.getProperty(p,c);};a.prototype.isLaundering=function(p,c){return false;};return a;});
