sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.RegisterPage", {
        onInit: function () {
            const oViewModel = new JSONModel({
                editMode: true,
                menuCodeState: "None",
                menuCodeMessage: ""
            });

            const oDataModel = new JSONModel(this._getInitialData());

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

            this.getView().setModel(oViewModel, "view");
            this.getView().setModel(oDataModel, "data");
            this.getView().setModel(oCategoryModel, "categories");

            // 초기 소분류 설정
            this._initializeSmallCategory("음료");

            // 라우터를 통한 초기화
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RegisterPage").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // 페이지가 다시 로드될 때 데이터를 초기화
            this._clearForm();
        },

        _getInitialData: function () {
            return {
                menu_code: null,
                menu_name_kor: "",
                menu_name_eng: "",
                menu_category: "음료",
                menu_small_category: "에스프레소",
                menu_price: null,
                registration_status: "active",
                menu_description: "",
                menu_nutrition_info: "",
                menu_image: ""
            };
        },

        _initializeSmallCategory: function (sCategory) {
            const oCategories = this.getView().getModel("categories").getData();
            const aSmallCategories = oCategories.smallCategories[sCategory] || [];

            const oSmallCategorySelect = this.byId("F-MenuSmallCategory");
            oSmallCategorySelect.removeAllItems();

            aSmallCategories.forEach((category) => {
                oSmallCategorySelect.addItem(new sap.ui.core.Item({
                    key: category.key,
                    text: category.text
                }));
            });

            this.getView().getModel("data").setProperty("/menu_small_category", aSmallCategories[0]?.key || "");
        },

        onCategoryChange: function (oEvent) {
            const sSelectedCategory = oEvent.getParameter("selectedItem").getKey();
            this._initializeSmallCategory(sSelectedCategory);
        },

        onMenuCodeChange: function (oEvent) {
            const sValue = oEvent.getParameter("value").trim();
            const oViewModel = this.getView().getModel("view");

            if (!sValue) {
                oViewModel.setProperty("/menuCodeState", "Error");
                oViewModel.setProperty("/menuCodeMessage", "등록번호를 입력해주세요.");
                return;
            }

            $.ajax({
                url: `/odata/v4/cafe-menu/MenuItems(${sValue})`,
                method: "GET",
                success: () => {
                    oViewModel.setProperty("/menuCodeState", "Error");
                    oViewModel.setProperty("/menuCodeMessage", "중복되는 번호가 존재합니다.");
                },
                error: () => {
                    oViewModel.setProperty("/menuCodeState", "Success");
                    oViewModel.setProperty("/menuCodeMessage", "사용 가능한 번호입니다.");
                }
            });
        },

        onPriceChange: function (oEvent) {
            const sValue = oEvent.getParameter("value"); // 사용자 입력 값
            const fPrice = parseFloat(sValue);

            if (isNaN(fPrice) || fPrice <= 0) {
                MessageToast.show("가격은 0보다 큰 숫자여야 합니다.");
                this.getView().getModel("data").setProperty("/menu_price", null);
                return;
            }

            // 모델에 값 저장
            this.getView().getModel("data").setProperty("/menu_price", sValue);
        },

        onFileUpload: function () {
            const oFileUploader = this.byId("imageUploader");
            const oFileInput = oFileUploader.getDomRef("fu");

            if (!oFileInput || !oFileInput.files || oFileInput.files.length === 0) {
                sap.m.MessageToast.show("파일을 선택해주세요.");
                return;
            }

            const oFile = oFileInput.files[0];
            if (!oFile.type.startsWith("image/")) {
                sap.m.MessageToast.show("이미지 파일만 업로드 가능합니다.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    const webpDataUrl = canvas.toDataURL("image/webp", 0.8);
                    const base64String = webpDataUrl.split(",")[1];

                    if (!base64String) {
                        sap.m.MessageToast.show("파일을 처리할 수 없습니다.");
                        return;
                    }

                    this.getView().getModel("data").setProperty("/menu_image", base64String);
                    sap.m.MessageToast.show("이미지가 업로드되었습니다.");
                };

                img.onerror = () => {
                    sap.m.MessageToast.show("이미지 파일을 처리하는 중 오류가 발생했습니다.");
                };
            };

            reader.onerror = () => {
                sap.m.MessageToast.show("파일을 읽는 중 문제가 발생했습니다.");
            };

            reader.readAsDataURL(oFile);
        },

        onSave: function () {
            const oData = this.getView().getModel("data").getData();

            // 숫자 값 처리
            const fPrice = parseFloat(oData.menu_price);

            if (!oData.menu_code || !oData.menu_name_kor || isNaN(fPrice) || fPrice <= 0) {
                MessageToast.show("등록번호, 상품 한글 이름, 상품 가격은 필수 입력 사항입니다.");
                return;
            }

            // 가격 데이터를 올바르게 변환
            oData.menu_price = fPrice;

            const formatDateTime = (date) => {
                const oDate = new Date(date);
                const year = oDate.getFullYear();
                const month = String(oDate.getMonth() + 1).padStart(2, "0");
                const day = String(oDate.getDate()).padStart(2, "0");
                const hours = String(oDate.getHours()).padStart(2, "0");
                const minutes = String(oDate.getMinutes()).padStart(2, "0");
                const seconds = String(oDate.getSeconds()).padStart(2, "0");
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            oData.registration_date = formatDateTime(new Date());

            $.ajax({
                url: "/odata/v4/cafe-menu/MenuItems",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: () => {
                    MessageToast.show("등록이 완료되었습니다!");
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("MainPage", {}, true);
                },
                error: (err) => {
                    console.error("등록 실패:", err);
                    MessageToast.show("등록 중 오류가 발생했습니다.");
                }
            });
        },

        _clearForm: function () {
            const oDataModel = this.getView().getModel("data");
            oDataModel.setData(this._getInitialData());
            this._initializeSmallCategory("음료");
        },

        onNavBack: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MainPage");
      }

    });
});
