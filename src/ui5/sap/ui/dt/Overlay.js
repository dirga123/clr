/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/dt/ElementUtil','sap/ui/dt/OverlayUtil','sap/ui/dt/DOMUtil','jquery.sap.dom'],function(q,C,E,O,D){"use strict";var o="overlay-container";var a;var b=C.extend("sap.ui.dt.Overlay",{metadata:{library:"sap.ui.dt",properties:{visible:{type:"boolean",defaultValue:true},inHiddenTree:{type:"boolean",defaultValue:false},focusable:{type:"boolean",defaultValue:false}},associations:{element:{type:"sap.ui.core.Element"}},aggregations:{designTimeMetadata:{type:"sap.ui.dt.DesignTimeMetadata",multiple:false}},events:{focusableChange:{parameters:{focusable:{type:"boolean"}}},destroyed:{parameters:{}},visibleChanged:{parameters:{visible:"boolean"}}}}});b.getOverlayContainer=function(){if(!a){a=q.sap.byId(o);if(!a.length){a=q("<div id='"+o+"'></div>").css({"top":"0px","left":"0px"}).appendTo("body");}}return a.get(0);};b.removeOverlayContainer=function(){if(a){a.remove();}a=null;};b.prototype.init=function(){this._bVisible=null;this.attachBrowserEvent("scroll",this._onScroll,this);};b.prototype.exit=function(){delete this._oDomRef;delete this._bVisible;window.clearTimeout(this._iCloneDomTimeout);this.fireDestroyed();};b.prototype._onChildRerenderedEmpty=function(){return true;};b.prototype.onBeforeRendering=function(){if(this.hasFocus()){this._bRestoreFocus=true;}};b.prototype.onAfterRendering=function(){this._oDomRef=this.getDomRef();if(this._oDomRef){this._updateDom();}var f=this.isFocusable();if(f){this.$().attr("tabindex",0);if(this._bRestoreFocus){delete this._bRestoreFocus;this.focus();}}else{this.$().attr("tabindex",null);}};b.prototype.getDomRef=function(){return this._oDomRef||C.prototype.getDomRef.apply(this,arguments);};b.prototype.getAssociatedDomRef=function(){throw new Error("This method is abstract and needs to be implemented");};b.prototype.getElementInstance=function(){return sap.ui.getCore().byId(this.getElement());};b.prototype.hasFocus=function(){return document.activeElement===this.getFocusDomRef();};b.prototype.setFocusable=function(f){if(this.isFocusable()!==f){this.setProperty("focusable",f);this.toggleStyleClass("sapUiDtOverlayFocusable",f);this.fireFocusableChange({focusable:f});}return this;};b.prototype.isFocusable=function(){return this.getFocusable();};b.prototype.applyStyles=function(){if(!this.getDomRef()){return;}delete this._mGeometry;var g=this.getGeometry();if(g&&g.visible){var $=this.$();var c=this.getParent();var p=(c&&c instanceof b)?c.$().scrollTop():null;var P=(c&&c instanceof b)?c.$().scrollLeft():null;var m=(c&&c instanceof b)?c.$().offset():null;var d=D.getOffsetFromParent(g.position,m,p,P);var s=g.size;$.css("width",s.width+"px");$.css("height",s.height+"px");$.css("top",d.top+"px");$.css("left",d.left+"px");var z=D.getZIndex(g.domRef);if(z){$.css("z-index",z);}var e=D.getOverflows(g.domRef);if(e){if(e.overflowX){$.css("overflow-x",e.overflowX);}if(e.overflowY){$.css("overflow-y",e.overflowY);}var S=g.domRef.scrollHeight;var i=g.domRef.scrollWidth;if(S>s.height||i>s.width){if(!this._oDummyScrollContainer){this._oDummyScrollContainer=q("<div class='sapUiDtDummyScrollContainer' style='height: "+S+"px; width: "+i+"px;'></div>");this.$().append(this._oDummyScrollContainer);}else{this._oDummyScrollContainer.css({"height":S,"width":i});}}else if(this._oDummyScrollContainer){this._oDummyScrollContainer.remove();delete this._oDummyScrollContainer;}D.syncScroll(g.domRef,this.getDomRef());}this.getChildren().forEach(function(f){f.applyStyles();});if(!this.$().is(":visible")){this.$().css("display","block");}this._cloneDomRef(g.domRef);}else if(this.$().is(":visible")){this.$().css("display","none");}};b.prototype.getGeometry=function(f){if(f||!this._mGeometry){var d=this.getAssociatedDomRef();var g=D.getGeometry(d);if(!g){var c=[];this.getChildren().forEach(function(e){c.push(e.getGeometry(true));});g=O.getGeometry(c);}this._mGeometry=g;}return this._mGeometry;};b.prototype._cloneDomRef=function(d){var $=this.$();var c=$.find(">.sapUiDtClonedDom");var v=this.getDesignTimeMetadata().getCloneDomRef();if(v){if(d){var f=function(){if(v!==true){d=D.getDomRefForCSSSelector(d,v);}if(!c.length){c=q("<div class='sapUiDtClonedDom'></div>").prependTo($);}else{c.empty();}D.cloneDOMAndStyles(d,c);};if(!this._bClonedDom){this._bClonedDom=true;f();}else{window.clearTimeout(this._iCloneDomTimeout);this._iCloneDomTimeout=window.setTimeout(f,250);}}}else{c.remove();}};b.prototype._updateDom=function(){var $=this.$();var p=this.getParent();if(p){if(p.getDomRef){var P=p.getDomRef();if(P!==this.$().parent().get(0)){$.appendTo(P);}}else{var a=b.getOverlayContainer();var c=$.parent();var d=c.length?c.get(0):null;if(a!==d){$.appendTo(a);}this.applyStyles();}}};b.prototype._onScroll=function(){var g=this.getGeometry();var d=g?g.domRef:null;if(d){D.syncScroll(this.$(),d);}};b.prototype.setInHiddenTree=function(i){if(i!==this.isInHiddenTree()){this.toggleStyleClass("sapUiDtOverlayInHiddenTree",i);this.setProperty("inHiddenTree",i);}return this;};b.prototype.isInHiddenTree=function(){return this.getInHiddenTree();};b.prototype.setVisible=function(v){if(this.getVisible()!==v){this.setProperty("visible",v);this._bVisible=v;this.fireVisibleChanged({visible:v});}return this;};b.prototype.getVisible=function(){if(this._bVisible===null){return!this.getDesignTimeMetadata().isIgnored();}else{return this.getProperty("visible");}};b.prototype.isVisible=function(){return this.getVisible();};return b;},true);
