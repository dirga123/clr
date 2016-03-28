/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var M={};M.render=function(r,m){var a=m.getMonth();var b=m.getMonths();var s=0;var c=m.getColumns();var t=m.getTooltip_AsString();var l=m._getLocaleData();var I=m.getId();var w="";var d=[];var e=[];var C=m.getPrimaryCalendarType();if(m._bLongMonth||!m._bNamesLengthChecked){d=l.getMonthsStandAlone("wide",C);}else{d=l.getMonthsStandAlone("abbreviated",C);e=l.getMonthsStandAlone("wide",C);}r.write("<div");r.writeControlData(m);r.addClass("sapUiCalMonthPicker");r.writeClasses();if(t){r.writeAttributeEscaped('title',t);}r.writeAccessibilityState(m,{role:"grid",readonly:"true",multiselectable:"false"});r.write(">");var A;if(b>12){b=12;}else if(b<12){s=Math.floor(a/b)*b;if(s+b>12){s=12-b;}}if(c>0){w=(100/c)+"%";}else{w=(100/b)+"%";}for(var i=0;i<b;i++){A={role:"gridcell"};if(!m._bLongMonth&&m._bNamesLengthChecked){A["label"]=e[i+s];}if(c>0&&i%c==0){r.write("<div");r.writeAccessibilityState(null,{role:"row"});r.write(">");}r.write("<div");r.writeAttribute("id",I+"-m"+(i+s));r.addClass("sapUiCalItem");if(i+s==a){r.addClass("sapUiCalItemSel");}r.writeAttribute("tabindex","-1");r.addStyle("width",w);r.writeClasses();r.writeStyles();r.writeAccessibilityState(null,A);r.write(">");r.write(d[i+s]);r.write("</div>");if(c>0&&((i+1)%c==0)){r.write("</div>");}}r.write("</div>");};return M;},true);
