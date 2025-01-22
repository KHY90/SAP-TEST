const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Request } = this.entities;

    // CREATE 요청 전 데이터 검증
    this.before('CREATE', Request, (req) => {
        if (!Number.isInteger(req.data.request_number)) {
            req.reject(400, `"request_number" must be a valid Integer.`);
        }
    });

});
