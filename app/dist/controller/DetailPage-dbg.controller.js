sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.DetailPage", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailPage").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sRequestNumber = oEvent.getParameter("arguments").requestNumber;

            // 데이터 모델 바인딩
            var oModel = this.getView().getModel();
            var oDetailData = oModel.getProperty("/Requests").find(function (request) {
                return request.request_number === sRequestNumber;
            });

            // 디테일 모델 설정
            this.getView().setModel(new sap.ui.model.json.JSONModel(oDetailData), "DetailModel");
        }
    });
});
