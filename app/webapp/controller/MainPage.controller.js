sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast'
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.MainPage", {
        onInit: function () {
            // 라우터 설정
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("MainPage").attachPatternMatched(this._onRouteMatched, this);

            var oI18nModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "ui5.walkthrough.i18n.i18n"
            });
            this.getView().setModel(oI18nModel, "i18n");

            // OData 모델 설정 (manifest.json에 정의된 hanaModel 사용)
            var oModel = this.getOwnerComponent().getModel("hanaModel");
            this.getView().setModel(oModel, "RequestModel");

            // MainPage 헤더 확장 상태 모델 설정
            var oViewModel = new JSONModel({
                headerExpanded: true
            });
            this.getView().setModel(oViewModel);

            // 타이틀 클릭 가능 여부 설정
            var oViewModel2 = new JSONModel({
                titleClickable: true
            });
            this.getView().setModel(oViewModel2, "ViewModel");
        },

        onNavigateToDetail: function (oEvent) {
            var oSelectedItem = oEvent.getSource(); // 클릭된 아이템
            var sRequestNumber = oSelectedItem.getBindingContext("RequestModel").getProperty("request_number");

            // 라우터를 통해 디테일 페이지로 이동
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DetailPage", {
                requestNumber: sRequestNumber // 디테일 페이지로 넘길 파라미터
            });
        },

        onToggleFooter: function () {
            // MainPage의 Footer 토글
            var oMainPage = this.getView().byId("mainPageId");
            var bShowFooter = !oMainPage.getShowFooter();
            oMainPage.setShowFooter(bShowFooter);
        }
    });
});
