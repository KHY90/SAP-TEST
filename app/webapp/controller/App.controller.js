sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.App", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            console.log("Route Matched:", oEvent.getParameter("name"));
        },

        onLogoPressed: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MainPage");
        },

        onAvatarPressed: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MainPage");
        }
    });
});
