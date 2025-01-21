sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.App", {

        onInit: function () {
            // hanaModel을 가져와서 View에 모델 설정
            var oModel = this.getOwnerComponent().getModel("hanaModel");  // hanaModel 가져오기
            this.getView().setModel(oModel);  // View에 모델 설정

            // 라우터 초기화
            var oRouter = this.getRouter();
            oRouter.initialize(); // 라우터 초기화
        },

        // 라우팅에 따른 페이지 전환 처리
        _onRouteMatched: function (oEvent) {
            var oView = this.getView();
            var oApp = oView.byId("app");  // App 컨트롤러를 가져옵니다.
            var oRouteName = oEvent.getParameter("name");

            // 라우팅 경로가 'DetailPage'일 경우 DetailPage로 전환
            if (oRouteName === "DetailPage") {
                var oDetailPage = oView.byId("detailPage");  // detailPage 뷰를 가져옵니다.
                oApp.to(oDetailPage);  // DetailPage로 전환
            }
        }
    });
});
