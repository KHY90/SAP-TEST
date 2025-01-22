sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.RegisterPage", {
        onInit: function () {
            const oViewModel = new JSONModel({
                editMode: true
            });

            const oDataModel = new JSONModel({
                menu_code: null,
                menu_name_kor: "",
                menu_name_eng: "",
                menu_category: "",
                menu_small_category: "",
                menu_price: null,
                registration_status: "active",
                menu_description: "",
                menu_nutrition_info: "",
                menu_image: "" // 이미지 경로 저장
            });

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
        },

        onCategoryChange: function (oEvent) {
            const sSelectedCategory = oEvent.getParameter("selectedItem").getKey();
            const oCategories = this.getView().getModel("categories").getData();
            const aSmallCategories = oCategories.smallCategories[sSelectedCategory] || [];

            const oSmallCategorySelect = this.byId("F-MenuSmallCategory");
            oSmallCategorySelect.removeAllItems();

            aSmallCategories.forEach((category) => {
                oSmallCategorySelect.addItem(new sap.ui.core.Item({
                    key: category.key,
                    text: category.text
                }));
            });

            // 소분류 초기화
            this.getView().getModel("data").setProperty("/menu_small_category", "");
        },
        
        onFileUpload: function () {
            const oFileUploader = this.byId("imageUploader");
            const oFile = oFileUploader.getFocusDomRef().files[0]; // 선택된 파일 가져오기
        
            if (!oFile) {
                sap.m.MessageToast.show("파일을 선택해주세요.");
                return;
            }
        
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result.split(",")[1]; // Base64 데이터 추출
                const fileName = `menu_${new Date().getTime()}.png`; // 파일 이름 생성
                const filePath = `images/${fileName}`; // 저장할 경로
        
                // Base64 데이터와 경로를 모델에 저장
                this.getView().getModel("data").setProperty("/menu_image", filePath); // 경로 저장
                this.getView().getModel("data").setProperty("/menu_image_base64", base64String); // Base64 저장
        
                sap.m.MessageToast.show("이미지가 업로드되었습니다.");
            };
            reader.readAsDataURL(oFile); // 파일 읽기
        },

        onSave: function () {
            const oData = this.getView().getModel("data").getData();

            // 필수값 검증
            if (!oData.menu_code || !oData.menu_name_kor || !oData.menu_price) {
                MessageToast.show("등록번호, 상품 한글 이름, 상품 가격은 필수 입력 사항입니다.");
                return;
            }

            // 등록 날짜 형식을 ISO 8601의 `yyyy-MM-ddTHH:mm:ss`로 변환
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

            // 등록 날짜와 수정 날짜를 변환
            oData.registration_date = formatDateTime(new Date());

            oData.modify_date = formatDateTime(new Date());
            $.ajax({
                url: "/odata/v4/cafe-menu/MenuItems", // OData POST 엔드포인트
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: () => {
                    MessageToast.show("등록이 완료되었습니다!");

                    // 폼 초기화
                    this._clearForm();

                    // 메인 페이지로 이동
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("MainPage", {}, true);
                },
                error: (err) => {
                    console.error("등록 실패:", err);
                    MessageToast.show("등록 중 오류가 발생했습니다.");
                }
            });
        },
        
        onNavBack: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MainPage");
        },

        _clearForm: function () {
            const oDataModel = this.getView().getModel("data");
            oDataModel.setData({
                menu_code: null,
                menu_name_kor: "",
                menu_name_eng: "",
                menu_category: "",
                menu_small_category: "",
                menu_price: null,
                registration_status: "active",
                menu_description: "",
                menu_nutrition_info: "",
                menu_image: ""
            });

            // 소분류 초기화
            const oSmallCategorySelect = this.byId("F-MenuSmallCategory");
            oSmallCategorySelect.removeAllItems();
        }
    });
});
