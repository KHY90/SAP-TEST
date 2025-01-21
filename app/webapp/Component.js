sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
   "use strict";

   return UIComponent.extend("ui5.walkthrough.Component", {
       metadata: {
           manifest: "json"
       },

       init: function () {
           // 부모의 init 호출
            UIComponent.prototype.init.apply(this, arguments);

           // 라우터 초기화
            this.getRouter().initialize();

            // JSON 모델 설정
            var oViewModel = new JSONModel({
                headerExpanded: true
            });
            this.setModel(oViewModel);
       }
   });
});