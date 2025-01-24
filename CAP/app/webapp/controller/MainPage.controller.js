sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "ui5/walkthrough/controller/FilterController"
], function (Controller, JSONModel, MessageToast, Sorter, Filter, FilterOperator, Fragment, FilterController) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.MainPage", {
        onInit: function () {
            const oViewModel = new JSONModel({ headerExpanded: true });
            this.getView().setModel(oViewModel);

            // FilterController 초기화
            this._oFilterController = new FilterController(this.getView());
            // 라우터 이벤트 등록
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("MainPage").attachPatternMatched(this._onRouteMatched, this);

            this._loadData();
        },

        _onRouteMatched: function () {
            this._loadData();
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

                    // FilterController에 필터 데이터 전달
                    const uniqueCategories = [...new Set(formattedData.map((item) => item.menu_category))];
                    this._oFilterController.loadFilterData(uniqueCategories);
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
            return `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, "0")}-${String(oDate.getDate()).padStart(2, "0")}`;
        },

        // 필터 초기화 버튼 클릭
        onClearFilters: function () {
            this._oFilterController.onClearFilters();
        },

        // 검색 버튼 클릭
        onSearch: function () {
            this._oFilterController.onSearch();
        },
        handleSortButtonPressed: function () {
            if (!this._oSortDialog) {
                this._oSortDialog = sap.ui.xmlfragment(
                    "ui5.walkthrough.view.SortDialog",
                    this
                );
                this.getView().addDependent(this._oSortDialog);
            }
            this._oSortDialog.open();
        },

        handleSortDialogConfirm: function (oEvent) {
            const oSortItem = oEvent.getParameter("sortItem");
            const bDescending = oEvent.getParameter("sortDescending");
            const sKey = oSortItem.getKey();

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            const oSorter = new Sorter(sKey, bDescending);
            oBinding.sort(oSorter);

            MessageToast.show(`정렬 기준: ${sKey}, ${bDescending ? "내림차순" : "오름차순"}`);
        },

        handleFilterButtonPressed: function () {
            if (!this._oFilterDialog) {
                this._oFilterDialog = sap.ui.xmlfragment(
                    "ui5.walkthrough.view.FilterDialog",
                    this
                );
                this.getView().addDependent(this._oFilterDialog);
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

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            MessageToast.show(`${aFilters.length}개의 필터가 적용되었습니다.`);
        },

        handleGroupButtonPressed: function () {
            if (!this._oGroupDialog) {
                this._oGroupDialog = sap.ui.xmlfragment(
                    "ui5.walkthrough.view.GroupDialog",
                    this
                );
                this.getView().addDependent(this._oGroupDialog);
            }
            this._oGroupDialog.open();
        },

        handleGroupDialogConfirm: function (oEvent) {
            const oGroupItem = oEvent.getParameter("groupItem");
            const bDescending = oEvent.getParameter("groupDescending");
            const sKey = oGroupItem.getKey();

            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            const oSorter = new Sorter(sKey, bDescending, true);
            oBinding.sort(oSorter);

            MessageToast.show(`그룹 기준: ${sKey}, ${bDescending ? "내림차순" : "오름차순"}`);
        },

        resetGroupDialog: function () {
            const oTable = this.byId("idMenuTable");
            const oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.sort(null);
                MessageToast.show("그룹화가 초기화되었습니다.");
            }

            if (this._oGroupDialog) {
                this._oGroupDialog.destroy();
                this._oGroupDialog = null;
            }
        },

        formatStatus: function (status) {
            return status === "active" ? "image/check.png" : "image/soldout.png";
        },

        onToggleSoldOut: function () {
            const oTable = this.byId("idMenuTable");
            const aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length === 0) {
                MessageToast.show("항목을 선택해주세요.");
                return;
            }
        
            const oModel = this.getView().getModel("RequestModel");
        
            // 선택된 항목의 데이터 수집 및 상태 토글
            const updatedItems = aSelectedItems.map((oItem) => {
                const oContext = oItem.getBindingContext("RequestModel");
                const oData = oContext.getObject();
        
                // menu_code 검증
                if (!oData.menu_code) {
                    console.error("Invalid menu_code:", oData.menu_code);
                    return null;
                }
        
                // 상태 토글
                const newStatus = oData.registration_status === "active" ? "deactive" : "active";
        
                // 모델 업데이트
                oModel.setProperty(`${oContext.getPath()}/registration_status`, newStatus);
        
                // 서버로 전송할 데이터 구성
                return {
                    menu_code: oData.menu_code,
                    registration_status: newStatus,
                };
            }).filter(item => item !== null); // 유효하지 않은 항목 제거
        
            if (updatedItems.length === 0) {
                MessageToast.show("유효한 항목이 없습니다.");
                return;
            }
        
            console.log("Payload sent to server:", JSON.stringify(updatedItems));
        
            // 서버로 상태 업데이트 요청
            $.ajax({
                url: "/odata/v4/cafe-menu/bulkUpdate",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ updates: updatedItems }), // 데이터 래핑
                success: () => {
                    MessageToast.show("판매 상태가 변경되었습니다.");
                },
                error: (err) => {
                    console.error("판매 상태 변경 실패:", err);
                    MessageToast.show("판매 상태 변경 중 오류가 발생했습니다.");
                }
            });
        
            // 선택 초기화
            oTable.removeSelections(true);
        },        

        onDetailPress: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("RequestModel");
            const sMenuCode = oContext.getProperty("menu_code");

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DetailPage", { menuCode: sMenuCode });
        },

        onRegisterPress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RegisterPage");
        },

        onSelectionChange: function (oEvent) {
            const aSelectedItems = oEvent.getParameter("selectedItems");
            const count = aSelectedItems.length;
            MessageToast.show(`${count}개의 항목이 선택되었습니다.`);
        },

        handleFilterButtonPressed: function () {
            this._oFilterController.handleFilterButtonPressed();
        },

        handleFilterDialogConfirm: function (oEvent) {
            this._oFilterController.handleFilterDialogConfirm(oEvent);
        },

        handleGroupButtonPressed: function () {
            this._oFilterController.handleGroupButtonPressed();
        },

        handleGroupDialogConfirm: function (oEvent) {
            this._oFilterController.handleGroupDialogConfirm(oEvent);
        }
    });
});
