/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/core/DeclarativeSupport','sap/ui/core/library','./DOMElement'],function(q,C,D,l,a){"use strict";var T=C.extend("sap.ui.core.tmpl.TemplateControl",{metadata:{library:"sap.ui.core",properties:{context:{type:"object",group:"Data",defaultValue:null}},aggregations:{controls:{type:"sap.ui.core.Control",multiple:true,singularName:"control",visibility:"hidden"}},associations:{template:{type:"sap.ui.core.tmpl.Template",multiple:false}},events:{afterRendering:{},beforeRendering:{}}}});T.prototype.init=function(){this._aBindingInfos=[];};T.prototype.isInline=function(){var i=false;if(this.getParent()instanceof sap.ui.core.UIArea&&q(this.getParent().getRootNode()).attr("id")===this.getId()){i=true;}return i;};T.prototype.placeAt=function(r,p){var i=this.isInline();var $=this.$(),u=this.getUIArea();C.prototype.placeAt.apply(this,arguments);if(i&&$.length===1){$.remove();u.destroyContent();}};T.prototype.getTemplateRenderer=function(){return this.fnRenderer;};T.prototype.setTemplateRenderer=function(r){this.fnRenderer=r;return this;};T.prototype._cleanup=function(){this.destroyAggregation("controls");if(this._aBindingInfos){var t=this;q.each(this._aBindingInfos,function(i,b){t.getModel(b.model).removeBinding(b.binding);});this._aBindingInfos=[];}};T.prototype._compile=function(){var t=sap.ui.getCore().byId(this.getTemplate()),d=t&&t.getDeclarativeSupport();if(d){var b=this;setTimeout(function(){D.compile(b.getDomRef());});}};T.prototype.exit=function(){this._cleanup();};T.prototype.onBeforeRendering=function(){this.fireBeforeRendering();this._cleanup();};T.prototype.onAfterRendering=function(){this.fireAfterRendering();};T.prototype.clone=function(){var c=C.prototype.clone.apply(this,arguments);c.fnRenderer=this.fnRenderer;return c;};T.prototype.updateBindings=function(u,m){C.prototype.updateBindings.apply(this,arguments);if(this.getDomRef()){this.invalidate();}};T.prototype.bind=function(p,t){var P=sap.ui.core.tmpl.Template.parsePath(p),m=this.getModel(P.model),p=P.path,M=t?"bind"+q.sap.charToUpperCase(t):"bindProperty",b=m&&m[M](p),c=this;if(b){b.attachChange(function(){q.sap.log.debug("TemplateControl#"+c.getId()+": "+t+" binding changed for path \""+p+"\"");c.invalidate();});}this._aBindingInfos.push({binding:b,path:P.path,model:P.model});return b;};T.prototype.calculatePath=function(p,t){var b=this.getBindingContext(),B=b&&b.getPath();if(p&&B&&!q.sap.startsWith(p,"/")){if(!q.sap.endsWith(B,"/")){B+="/";}p=B+p;}return p;};T.prototype.bindProp=function(p){var b=this.bind(this.calculatePath(p),"property");return b&&b.getExternalValue();};T.prototype.bindList=function(p){var b=this.bind(this.calculatePath(p),"list"),m=b&&b.getModel(),p=b&&b.getPath();return b&&m.getProperty(p);};T.prototype.createDOMElement=function(s,p,d){var e=new a(s);if(p){e.bindObject(p);}if(!d){this.addAggregation("controls",e);}return e;};T.prototype.createControl=function(s,p,d,v){var h={};q.each(s,function(k,V){h["data-"+q.sap.hyphen(k)]=V;});var $=q("<div/>",h);var c=D._createControl($.get(0),v);if(p){c.bindObject(p);}if(!d){this.addAggregation("controls",c);}return c;};return T;});
