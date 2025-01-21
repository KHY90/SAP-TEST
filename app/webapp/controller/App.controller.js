sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.App", {

        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("hanaModel");  // hanaModel 가져오기
            this.getView().setModel(oModel);  // View에 모델 설정
        }
    });
});
