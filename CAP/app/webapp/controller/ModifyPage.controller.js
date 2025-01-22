sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (Controller, JSONModel, MessageToast, Dialog, Button, Text) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.ModifyPage", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ModifyPage").attachPatternMatched(this._onRouteMatched, this);

            const oCategoryModel = new JSONModel({
                smallCategories: {
                    음료: [
                        { key: "에스프레소", text: "에스프레소" },
                        { key: "에이드", text: "에이드" },
                        { key: "기타", text: "기타" }
                    ],
                    상품: [
                        { key: "상품", text: "상품" }
                    ],
                    푸드: [
                        { key: "브레드", text: "브레드" },
                        { key: "케이크", text: "케이크" },
                        { key: "샌드위치", text: "샌드위치" }
                    ]
                }
            });
            this.getView().setModel(oCategoryModel, "categories");
        },

        _onRouteMatched: function (oEvent) {
            const sMenuCode = oEvent.getParameter("arguments").menuCode;

            // 기존 데이터 로드
            const sUrl = `/odata/v4/cafe-menu/MenuItems(${sMenuCode})`;
            const oModel = new JSONModel();

            $.ajax({
                url: sUrl,
                method: "GET",
                success: (data) => {
                    oModel.setData(data);
                    this.getView().setModel(oModel, "ModifyModel");
                },
                error: (err) => {
                    console.error("Failed to load data:", err);
                    MessageToast.show("데이터를 로드하지 못했습니다.");
                }
            });
        },

        onCategoryChange: function (oEvent) {
            const sSelectedCategory = oEvent.getParameter("selectedItem").getKey();
            const oCategories = this.getView().getModel("categories").getData();
            const aSmallCategories = oCategories.smallCategories[sSelectedCategory] || [];

            const oSmallCategorySelect = this.byId("F-mMenuSmallCategory");
            oSmallCategorySelect.removeAllItems();

            aSmallCategories.forEach((category) => {
                oSmallCategorySelect.addItem(new sap.ui.core.Item({
                    key: category.key,
                    text: category.text
                }));
            });

            // 소분류 초기화
            this.getView().getModel("ModifyModel").setProperty("/menu_small_category", "");
        },

        onFileUpload: function () {
            const oFileUploader = this.byId("mimageUploader");
            const oFile = oFileUploader.getFocusDomRef().files[0];

            if (!oFile) {
                MessageToast.show("파일을 선택해주세요.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result.split(",")[1];
                const fileName = `menu_${new Date().getTime()}.png`;
                const filePath = `images/${fileName}`;

                this.getView().getModel("ModifyModel").setProperty("/menu_image", filePath);
                this.getView().getModel("ModifyModel").setProperty("/menu_image_base64", base64String);

                MessageToast.show("이미지가 업로드되었습니다.");
            };
            reader.readAsDataURL(oFile);
        },

        onSaveConfirm: function () {
            const oDialog = new Dialog({
                title: "확인",
                type: "Message",
                content: new Text({ text: "수정하시겠습니까?" }),
                beginButton: new Button({
                    text: "예",
                    press: () => {
                        oDialog.close();
                        this.onSave();
                    }
                }),
                endButton: new Button({
                    text: "아니오",
                    press: () => oDialog.close()
                })
            });
            oDialog.open();
        },

        onCancelConfirm: function () {
            const oDialog = new Dialog({
                title: "확인",
                type: "Message",
                content: new Text({ text: "수정을 취소하시겠습니까?" }),
                beginButton: new Button({
                    text: "예",
                    press: () => {
                        oDialog.close();
                        this.onNavBack();
                    }
                }),
                endButton: new Button({
                    text: "아니오",
                    press: () => oDialog.close()
                })
            });
            oDialog.open();
        },

        onSave: function () {
            const oData = this.getView().getModel("ModifyModel").getData();

            $.ajax({
                url: `/odata/v4/cafe-menu/MenuItems(${oData.menu_code})`, // PATCH 요청
                method: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: () => {
                    MessageToast.show("수정이 완료되었습니다!");
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("DetailPage", { menuCode: oData.menu_code });
                },
                error: (err) => {
                    console.error("수정 실패:", err);
                    MessageToast.show("수정 중 오류가 발생했습니다.");
                }
            });
        },

        onNavBack: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DetailPage");
        }
    });
});
