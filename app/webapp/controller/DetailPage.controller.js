sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.DetailPage", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sRequestNumber = oEvent.getParameter("arguments").requestNumber;

            // 데이터를 로드하여 View에 설정
            var oModel = this.getOwnerComponent().getModel("RequestModel");
            var aData = oModel.getData();
            var oRequest = aData.Request.find(function (item) {
                return item.request_number === parseInt(sRequestNumber, 10);
            });

            if (oRequest) {
                this.getView().setModel(new JSONModel(oRequest), "DetailModel");
            }
        }
    });
});
