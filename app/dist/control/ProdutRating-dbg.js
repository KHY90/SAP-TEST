sap.ui.define([
    "sap/ui/core/Control",             // SAP UI5에서 커스텀 컨트롤을 생성하기 위한 기본 클래스
    "sap/m/RatingIndicator",          // 별점 평가를 위한 컨트롤
    "sap/m/Label",                    // 텍스트를 표시하는 라벨 컨트롤
    "sap/m/Button"                    // 버튼 컨트롤
], (Control, RatingIndicator, Label, Button) => {
    "use strict";

    return Control.extend("ui5.walkthrough.control.ProductRating", {
        metadata: {
            // 컨트롤의 메타데이터 정의
            properties: {
                value: { type: "float", defaultValue: 0 } // 'value' 속성: 기본값은 0이며, 별점 값 저장
            },
            aggregations: {
                // 커스텀 컨트롤이 내부적으로 포함할 자식 컨트롤 정의
                _rating: { type: "sap.m.RatingIndicator", multiple: false, visibility: "hidden" }, // 별점 컨트롤
                _label: { type: "sap.m.Label", multiple: false, visibility: "hidden" },          // 상태를 보여주는 라벨
                _button: { type: "sap.m.Button", multiple: false, visibility: "hidden" }         // 제출 버튼
            },
            events: {
                // 커스텀 이벤트 정의
                change: {
                    parameters: {
                        value: { type: "int" } // 'change' 이벤트가 발생했을 때 별점 값을 포함
                    }
                }
            }
        },

        // 초기화 메서드
        init() {
            // 별점 평가 컨트롤 초기화
            this.setAggregation("_rating", new RatingIndicator({
                value: this.getValue(), // 초기 별점 값
                iconSize: "2rem",       // 아이콘 크기 설정
                visualMode: "Half",     // 별점 반 개씩 선택 가능
                liveChange: this._onRate.bind(this) // 값 변경 시 호출될 메서드 바인딩
            }));

            // 상태를 표시할 라벨 초기화
            this.setAggregation("_label", new Label({
                text: "{i18n>productRatingLabelInitial}" // i18n에서 초기 텍스트 가져오기
            }).addStyleClass("sapUiSmallMargin"));

            // 별점 제출 버튼 초기화
            this.setAggregation("_button", new Button({
                text: "{i18n>productRatingButton}", // i18n에서 버튼 텍스트 가져오기
                press: this._onSubmit.bind(this)    // 버튼 클릭 시 호출될 메서드 바인딩
            }).addStyleClass("sapUiTinyMarginTopBottom"));
        },

        // 별점 값 설정 메서드
        setValue(fValue) {
            this.setProperty("value", fValue, true); // 'value' 속성 설정 및 데이터 바인딩 알림
            this.getAggregation("_rating").setValue(fValue); // RatingIndicator 컨트롤에도 값 설정

            return this; // 메서드 체이닝 지원
        },

        // 초기 상태로 리셋하는 메서드
        reset() {
            const oResourceBundle = this.getModel("i18n").getResourceBundle(); // i18n 리소스 번들 가져오기

            this.setValue(0); // 별점 값 초기화
            this.getAggregation("_label").setDesign("Standard"); // 라벨 디자인 초기화
            this.getAggregation("_rating").setEnabled(true);     // 별점 컨트롤 활성화
            this.getAggregation("_label").setText(oResourceBundle.getText("productRatingLabelInitial")); // 초기 텍스트 설정
            this.getAggregation("_button").setEnabled(true);     // 버튼 활성화
        },

        // 별점 값 변경 시 호출되는 메서드
        _onRate(oEvent) {
            const oResourceBundle = this.getModel("i18n").getResourceBundle(); // i18n 리소스 번들 가져오기
            const fValue = oEvent.getParameter("value"); // 변경된 별점 값 가져오기

            this.setProperty("value", fValue, true); // 별점 값 속성에 설정

            // 라벨에 현재 별점 값 표시
            this.getAggregation("_label").setText(
                oResourceBundle.getText("productRatingLabelIndicator", [fValue, oEvent.getSource().getMaxValue()])
            );
            this.getAggregation("_label").setDesign("Bold"); // 라벨 디자인 변경
        },

        // 별점 제출 버튼 클릭 시 호출되는 메서드
        _onSubmit(oEvent) {
            const oResourceBundle = this.getModel("i18n").getResourceBundle(); // i18n 리소스 번들 가져오기

            this.getAggregation("_rating").setEnabled(false); // 별점 컨트롤 비활성화
            this.getAggregation("_label").setText(oResourceBundle.getText("productRatingLabelFinal")); // 제출 완료 텍스트 설정
            this.getAggregation("_button").setEnabled(false); // 버튼 비활성화
            this.fireEvent("change", {
                value: this.getValue() // 'change' 이벤트 트리거와 함께 별점 값 전달
            });
        },

        // 커스텀 컨트롤의 렌더링을 담당하는 메서드
        renderer(oRm, oControl) {
            oRm.openStart("div", oControl); // `<div>` 태그 시작
            oRm.class("myAppDemoWTProductRating"); // CSS 클래스 추가
            oRm.openEnd(); // `<div>` 태그 닫음

            // 별점 컨트롤 렌더링
            oRm.renderControl(oControl.getAggregation("_rating"));
            // 라벨 컨트롤 렌더링
            oRm.renderControl(oControl.getAggregation("_label"));
            // 버튼 컨트롤 렌더링
            oRm.renderControl(oControl.getAggregation("_button"));

            oRm.close("div"); // `<div>` 태그 닫음
        }
    });
});
