/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/m/semantic/SemanticButton','sap/ui/base/ManagedObject'],function(S,M){"use strict";var a=S.extend("sap.m.semantic.MessagesAction",{metadata:{library:"sap.m",properties:{count:{type:"int",group:"Appearance",defaultValue:0}}}});a.prototype.init=function(){if(S.prototype.init){S.prototype.init.call(this);}this._applyProperty("text","0");};a.prototype.setCount=function(v){M.prototype.setProperty.call(this,"count",v);this._applyProperty("text",v);return this;};return a;},true);
