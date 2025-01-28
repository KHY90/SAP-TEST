sap.ui.define([
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Sorter, Fragment, MessageToast) {
    "use strict";

    return {
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
        }
    };
});
