sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast'
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.MainPage", {
        onInit: function () {
            var oI18nModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "ui5.walkthrough.i18n.i18n"
            });
            this.getView().setModel(oI18nModel, "i18n");

            var sUrl = "/odata/v4/request/Request";

            // 데이터 호출
            $.ajax({
                url: sUrl,
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                success: function (oData) {
                    var oModel = new JSONModel(oData.value); // 데이터 모델 생성
                    this.getView().setModel(oModel, "RequestModel");
                }.bind(this),
                error: function () {
                    MessageToast.show("데이터를 불러오는 중 오류가 발생했습니다.");
                }
            });

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
        
        onRowPress: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("RequestModel");
            var sRequestNumber = oContext.getProperty("request_number");
        
            oRouter.navTo("DetailPage", {
                requestNumber: sRequestNumber
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
