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

            // 메인 페이지에서 설정한 RequestModel을 디테일 페이지에서도 사용
            var oModel = this.getView().getModel("RequestModel");

            // 요청 번호에 해당하는 데이터를 찾기
            var oDetailData = oModel.getData().find(function (request) {
                return request.request_number === parseInt(sRequestNumber, 10);
            });

            if (oDetailData) {
                // 디테일 모델로 데이터 바인딩
                this.getView().setModel(new sap.ui.model.json.JSONModel(oDetailData), "DetailModel");
            } else {
                // 데이터가 없을 경우 처리
                console.error("해당 요청 번호를 찾을 수 없습니다.");
            }
        }
    });
});
