sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.FilterController", {
        constructor: function (oView) {
            this._oView = oView;
            this.oFilterBar = oView.byId("filterbar");
            this.oTable = oView.byId("idMenuTable");
        },

        loadFilterData: function (categories) {
            const oFilterModel = new JSONModel({
                categories: categories || []
            });
            this._oView.setModel(oFilterModel, "FilterModel");
        },

        onSearch: function () {
            const aFilters = [];
        
            // 카테고리 필터
            const sCategory = this._oView.byId("categoryFilter").getValue().trim();
            if (sCategory) {
                aFilters.push(new Filter("menu_category", FilterOperator.Contains, sCategory));
            }
        
            // 메뉴 코드 필터 (Integer 타입 처리)
            const sMenuCode = this._oView.byId("menuCodeFilter").getValue().trim();
            if (sMenuCode) {
                const iMenuCode = parseInt(sMenuCode, 10);
                if (!isNaN(iMenuCode)) {
                    aFilters.push(new Filter("menu_code", FilterOperator.EQ, iMenuCode));
                } else {
                    sap.m.MessageToast.show("유효한 메뉴 코드를 입력하세요.");
                    return;
                }
            }
        
            // 가격 필터
            const sMinPrice = this._oView.byId("priceMinFilter").getValue();
            const sMaxPrice = this._oView.byId("priceMaxFilter").getValue();
            if (sMinPrice && sMaxPrice) {
                aFilters.push(new Filter("menu_price", FilterOperator.BT, parseFloat(sMinPrice), parseFloat(sMaxPrice)));
            } else if (sMinPrice) {
                aFilters.push(new Filter("menu_price", FilterOperator.GE, parseFloat(sMinPrice)));
            } else if (sMaxPrice) {
                aFilters.push(new Filter("menu_price", FilterOperator.LE, parseFloat(sMaxPrice)));
            }
        
            // 테이블에 필터 적용
            this.oTable.getBinding("items").filter(aFilters);
        
            sap.m.MessageToast.show(`${aFilters.length}개의 필터가 적용되었습니다.`);
        },

        onClearFilters: function () {
            this._oView.byId("categoryFilter").setValue("");
            this._oView.byId("menuCodeFilter").setValue("");
            this._oView.byId("priceMinFilter").setValue("");
            this._oView.byId("priceMaxFilter").setValue("");

            this.oTable.getBinding("items").filter([]);

            sap.m.MessageToast.show("필터가 초기화되었습니다.");
        },

        handleFilterButtonPressed: function () {
            if (!this._oFilterDialog) {
                this._oFilterDialog = sap.ui.xmlfragment(
                    "ui5.walkthrough.view.FilterDialog",
                    this
                );
                this._oView.addDependent(this._oFilterDialog);
            }
            this._oFilterDialog.open();
        },

        handleFilterDialogConfirm: function (oEvent) {
            const aFilterItems = oEvent.getParameter("filterItems");
            const aFilters = [];

            aFilterItems.forEach((oItem) => {
                const sKey = oItem.getKey();
                const aKeyParts = sKey.split("___");
                const sProperty = aKeyParts[0];
                const sOperator = aKeyParts[1];
                const sValue1 = aKeyParts[2];
                const sValue2 = aKeyParts[3];

                let oFilter;
                switch (sOperator) {
                    case "LE":
                        oFilter = new Filter(sProperty, FilterOperator.LE, sValue1);
                        break;
                    case "BT":
                        oFilter = new Filter(sProperty, FilterOperator.BT, sValue1, sValue2);
                        break;
                    case "GT":
                        oFilter = new Filter(sProperty, FilterOperator.GT, sValue1);
                        break;
                }
                if (oFilter) {
                    aFilters.push(oFilter);
                }
            });

            this.oTable.getBinding("items").filter(aFilters);

            sap.m.MessageToast.show(`${aFilters.length}개의 필터가 적용되었습니다.`);
        },

        handleGroupButtonPressed: function () {
            if (!this._oGroupDialog) {
                this._oGroupDialog = sap.ui.xmlfragment(
                    "ui5.walkthrough.view.GroupDialog",
                    this
                );
                this._oView.addDependent(this._oGroupDialog);
            }
            this._oGroupDialog.open();
        },

        handleGroupDialogConfirm: function (oEvent) {
            const oGroupItem = oEvent.getParameter("groupItem");
            const bDescending = oEvent.getParameter("groupDescending");
            const sKey = oGroupItem.getKey();

            const oSorter = new sap.ui.model.Sorter(sKey, bDescending, true);
            this.oTable.getBinding("items").sort(oSorter);

            sap.m.MessageToast.show(`그룹 기준: ${sKey}, ${bDescending ? "내림차순" : "오름차순"}`);
        }
    });
});
