sap.ui.define(["sap/ui/core/library"],function(e){"use strict";const{ValueState:r}=e;const t={weightState(e){try{e=parseFloat(e);if(e<0){return r.None}else if(e<1e3){return r.Success}else if(e<2e3){return r.Warning}else{return r.Error}}catch(e){return r.None}}};return t});