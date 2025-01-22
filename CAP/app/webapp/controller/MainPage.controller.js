sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/ViewSettingsDialog",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, ViewSettingsDialog, Fragment) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.MainPage", {
        onInit: function () {
            const oI18nModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "ui5.walkthrough.i18n.i18n"
            });
            this.getView().setModel(oI18nModel, "i18n");

            const oViewModel = new JSONModel({ headerExpanded: true });
            this.getView().setModel(oViewModel);

            // 라우터 이벤트 등록
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("MainPage").attachPatternMatched(this._onRouteMatched, this);

            this._loadData();
            
            this._loadHeader();
        },

        _onRouteMatched: function () {
            // 라우트가 매칭될 때마다 데이터를 새로 로드
            this._loadData();
        },

        _loadHeader: function () {
            const oPage = this.byId("mainPages");
            Fragment.load({
                name: "ui5.walkthrough.view.CommonHeader",
                controller: this
            }).then((oHeader) => {
                oPage.setCustomHeader(oHeader);
            });
        },

        _loadData: function () {
            const sUrl = "/odata/v4/cafe-menu/MenuItems";
            const oModel = new JSONModel();

            $.ajax({
                url: sUrl,
                method: "GET",
                success: (data) => {
                    console.log("Data Loaded:", data);
                    const formattedData = data.value.map((item) => ({
                        ...item,
                        menu_price: parseInt(item.menu_price, 10),
                        registration_date: this._formatDate(item.registration_date)
                    }));
                    oModel.setData(formattedData);
                    this.getView().setModel(oModel, "RequestModel");
                },
                error: (err) => {
                    console.error("Failed to load data:", err);
                    MessageToast.show("데이터 로드 실패!");
                }
            });
        },

        _formatDate: function (dateString) {
            if (!dateString) return "";
            const oDate = new Date(dateString);
            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, "0");
            const day = String(oDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        },
        _getCategories: function () {
            return [
                { key: "음료", name: "음료" },
                { key: "푸드", name: "푸드" },
                { key: "상품", name: "상품" }
            ];
        },

        _getSubGroups: function () {
            return [
                { key: "커피", name: "커피" },
                { key: "차", name: "차" },
                { key: "베이커리", name: "베이커리" }
            ];
        },

        onCategoryFilterChange: function (oEvent) {
            this._applyFilters();
        },

        onSubGroupFilterChange: function (oEvent) {
            this._applyFilters();
        },

        onMenuCodeFilterChange: function (oEvent) {
            this._applyFilters();
        },

        onPriceFilterChange: function () {
            const sMinPrice = this.byId("priceMinFilter").getValue();
            const sMaxPrice = this.byId("priceMaxFilter").getValue();
            const aFilters = [];

            if (sMinPrice) {
                aFilters.push(new sap.ui.model.Filter("menu_price", sap.ui.model.FilterOperator.GE, parseInt(sMinPrice, 10)));
            }

            if (sMaxPrice) {
                aFilters.push(new sap.ui.model.Filter("menu_price", sap.ui.model.FilterOperator.LE, parseInt(sMaxPrice, 10)));
            }

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            sap.m.MessageToast.show(`${aFilters.length}개의 가격 필터가 적용되었습니다.`);
        },

        _applyFilters: function () {
            const aFilters = [];

            // 카테고리 필터
            const aSelectedCategories = this.byId("categoryFilter").getSelectedKeys();
            if (aSelectedCategories.length > 0) {
                aFilters.push(new Filter("menu_category", FilterOperator.EQ, aSelectedCategories));
            }

            // 소그룹 필터
            const aSelectedSubGroups = this.byId("subGroupFilter").getSelectedKeys();
            if (aSelectedSubGroups.length > 0) {
                aFilters.push(new Filter("menu_small_category", FilterOperator.EQ, aSelectedSubGroups));
            }

            // 메뉴 코드 필터
            const sMenuCode = this.byId("menuCodeFilter").getValue();
            if (sMenuCode) {
                aFilters.push(new Filter("menu_code", FilterOperator.Contains, sMenuCode));
            }

            // 가격 필터
            const oPriceRange = this.byId("priceFilter").getRange();
            if (oPriceRange) {
                aFilters.push(new Filter("menu_price", FilterOperator.BT, oPriceRange[0], oPriceRange[1]));
            }

            // 테이블에 필터 적용
            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            MessageToast.show(`${aFilters.length}개의 필터가 적용되었습니다.`);
        },

        handleSortButtonPressed: function () {
            if (!this._oSortDialog) {
                Fragment.load({
                    name: "ui5.walkthrough.view.SortDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oSortDialog = oDialog;
                    this.getView().addDependent(this._oSortDialog);
                    this._oSortDialog.open();
                });
            } else {
                this._oSortDialog.open();
            }
        },

        handleSortDialogConfirm: function (oEvent) {
            const oSortItem = oEvent.getParameter("sortItem");
            const bDescending = oEvent.getParameter("sortDescending");
            const sKey = oSortItem.getKey();

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            const oSorter = new sap.ui.model.Sorter(sKey, bDescending);
            oBinding.sort(oSorter);

            MessageToast.show(`정렬 기준: ${sKey}, ${bDescending ? "내림차순" : "오름차순"}`);
        },

        handleFilterButtonPressed: function () {
            if (!this._oFilterDialog) {
                Fragment.load({
                    name: "ui5.walkthrough.view.FilterDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oFilterDialog = oDialog;
                    this.getView().addDependent(this._oFilterDialog);
                    this._oFilterDialog.open();
                });
            } else {
                this._oFilterDialog.open();
            }
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

                // 필터 조건 생성
                let oFilter;
                switch (sOperator) {
                    case "LE":
                        oFilter = new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.LE, sValue1);
                        break;
                    case "BT":
                        oFilter = new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.BT, sValue1, sValue2);
                        break;
                    case "GT":
                        oFilter = new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.GT, sValue1);
                        break;
                }
                if (oFilter) {
                    aFilters.push(oFilter);
                }
            });

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            MessageToast.show(`${aFilters.length}개의 필터가 적용되었습니다.`);
        },

        handleGroupButtonPressed: function () {
            if (!this._oGroupDialog) {
                Fragment.load({
                    name: "ui5.walkthrough.view.GroupDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oGroupDialog = oDialog;
                    this.getView().addDependent(this._oGroupDialog);
                    this._oGroupDialog.open();
                });
            } else {
                this._oGroupDialog.open();
            }
        },

        handleGroupDialogConfirm: function (oEvent) {
            const oGroupItem = oEvent.getParameter("groupItem");
            const bDescending = oEvent.getParameter("groupDescending");
            const sKey = oGroupItem.getKey();

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            const oSorter = new sap.ui.model.Sorter(sKey, bDescending, true);
            oBinding.sort(oSorter);

            MessageToast.show(`그룹 기준: ${sKey}, ${bDescending ? "내림차순" : "오름차순"}`);
        },

        resetGroupDialog: function () {
            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            console.log("Resetting group dialog...");

            if (oBinding) {
                oBinding.sort(null); // 그룹화 초기화
                console.log("Group reset applied to table.");
                MessageToast.show("그룹화가 초기화되었습니다.");
            } else {
                console.warn("Table binding not found.");
            }

            if (this._oGroupDialog) {
                this._oGroupDialog.destroy();
                this._oGroupDialog = null;
                console.log("Group dialog destroyed.");
            }
            this._refreshMainPage();
        },

        onDetailPress: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("RequestModel");
            const sMenuCode = oContext.getProperty("menu_code");

            if (!sMenuCode) {
                sap.m.MessageToast.show("잘못된 메뉴 코드입니다.");
                return;
            }

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DetailPage", { menuCode: sMenuCode });
        },

        onRegisterPress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RegisterPage");
        },

        onSelectionChange: function (oEvent) {
            const oSelectedItems = oEvent.getParameter("selectedItems");
            console.log("Selected Items: ", oSelectedItems);
        }
    });
});