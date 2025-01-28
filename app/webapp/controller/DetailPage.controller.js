sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (Controller, JSONModel, MessageToast, Dialog, Button, Text) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.DetailPage", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailPage").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sMenuCode = oEvent.getParameter("arguments").menuCode;

            const sUrl = `/odata/v4/cafe-menu/MenuItems(${sMenuCode})`;
            const oModel = new JSONModel();

            $.ajax({
                url: sUrl,
                method: "GET",
                success: (data) => {
                    console.log("Detail Data Loaded:", data);

                    if (data.menu_image) {
                        // Base64 데이터를 Data URL로 변환
                        data.menu_image_src = `data:image/webp;base64,${data.menu_image}`;
                    } else {
                        // 이미지가 없을 경우 기본 이미지 사용
                        data.menu_image_src = "image/default.png";
                    }
                    oModel.setData(data);
                    this.getView().setModel(oModel, "DetailModel");
                },
                error: (err) => {
                    console.error("Failed to load detail data:", err);
                    MessageToast.show("디테일 데이터를 로드하지 못했습니다.");
                }
            });
        },

        formatStatus: function (status) {
            if (status === "active") {
                return "image/check.png";
            } else if (status === "deactive") {
                return "image/soldout.svg";
            }
            return "";
        },

        onDeletePress: function () {
            const oModel = this.getView().getModel("DetailModel");
            const sMenuCode = oModel.getProperty("/menu_code");

            if (!sMenuCode) {
                MessageToast.show("잘못된 메뉴 코드입니다.");
                return;
            }

            // 확인 다이얼로그 표시
            const oDialog = new Dialog({
                title: "삭제를 요청하셨습니다.",
                type: "Message",
                content: new Text({ text: "정말 삭제하시겠습니까?" }),
                beginButton: new Button({
                    text: "예",
                    press: () => {
                        // 삭제 요청
                        $.ajax({
                            url: `/odata/v4/cafe-menu/MenuItems(${sMenuCode})`, // DELETE 요청
                            method: "DELETE",
                            success: () => {
                                MessageToast.show("삭제가 완료되었습니다!");

                                // 메인 페이지로 이동
                                const oRouter = this.getOwnerComponent().getRouter();
                                oRouter.navTo("MainPage");

                                // 다이얼로그 닫기
                                oDialog.close();
                            },
                            error: (err) => {
                                console.error("삭제 실패:", err);
                                MessageToast.show("삭제 중 오류가 발생했습니다.");
                            }
                        });
                    }
                }),
                endButton: new Button({
                    text: "아니오",
                    press: () => {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oDialog.open();
        },

        onEditPress: function () {
            const oModel = this.getView().getModel("DetailModel");
            const sMenuCode = oModel.getProperty("/menu_code");

            if (!sMenuCode) {
                MessageToast.show("잘못된 메뉴 코드입니다.");
                return;
            }

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("ModifyPage", { menuCode: sMenuCode });
        },
        onNavBack: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MainPage");
        }
    });
});
