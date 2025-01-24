const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { MenuItems } = this.entities;

    // 메인페이지에서 매진 상태 변경 처리
    this.on("bulkUpdate", async (req) => {
        const { updates } = req.data;
    
        if (!Array.isArray(updates) || updates.length === 0) {
            req.error(400, "Invalid payload: No updates provided.");
            return;
        }
    
        try {
            const tx = cds.transaction(req);
    
            for (const update of updates) {
                const menuCode = parseInt(update.menu_code, 10);
    
                if (isNaN(menuCode)) {
                    req.error(400, `Invalid menu_code: ${update.menu_code}`);
                    return;
                }
    
                // 상태 업데이트 처리
                const result = await tx.update(MenuItems)
                    .set({ registration_status: update.registration_status })
                    .where({ menu_code: menuCode });
    
                if (result === 0) {
                    req.error(404, `Menu item with code ${menuCode} not found.`);
                    return;
                }
            }
    
            await tx.commit();
            return { message: "판매 상태 변경 완료" };
        } catch (err) {
            console.error("Bulk update error:", err.message);
            req.error(400, `Bulk update failed: ${err.message}`);
        }
    });    
    
    // 등록 트렌젝션
    this.on('CREATE', MenuItems, async (req) => {
        const tx = cds.transaction(req);
        try {
            if (!req.data.menu_image) {
                req.data.menu_image = null; // 이미지가 없으면 null로 저장
            }

            const result = await tx.run(req.query); // 데이터 저장
            await tx.commit(); // 트랜잭션 커밋

            return result;
        } catch (err) {
            await tx.rollback(); // 트랜잭션 롤백
            console.error("CREATE Error:", err.message);
            req.error(400, `등록 중 오류가 발생했습니다: ${err.message}`);
        }
    });

    // 수정 트렌젝션
    this.on('PATCH', MenuItems, async (req) => {
        try {
            const data = req.data;

            // 데이터 유효성 검증 (필요에 따라 추가 가능)
            if (!data.menu_code) {
                req.error(400, 'menu_code is required for update.');
            }

            // 수정 처리
            const updatedItem = await cds.transaction(req).run(
                UPDATE(MenuItems)
                    .set(data)
                    .where({ menu_code: data.menu_code })
            );

            if (updatedItem === 0) {
                req.error(404, `Menu item with code ${data.menu_code} not found.`);
            }

            return { message: 'Update successful.' };
        } catch (err) {
            console.error('PATCH Error:', err);
            req.error(500, `An error occurred during update: ${err.message}`);
        }
    });

    // 삭제 트렌젝션
    this.on('DELETE', MenuItems, async (req) => {
        const tx = cds.transaction(req);
        try {
            const result = await tx.run(req.query); // 데이터 삭제
            await tx.commit(); // 트랜잭션 커밋

            return result;
        } catch (err) {
            await tx.rollback(); // 트랜잭션 롤백
            console.error("DELETE Error:", err.message);
            req.error(400, `삭제 중 오류가 발생했습니다: ${err.message}`);
        }
    });

     // 이미지 데이터를 Base64로 직렬화
    this.after('READ', MenuItems, (each) => {
        if (each.menu_image) {
            // LargeBinary 데이터를 Base64로 변환
            each.menu_image = each.menu_image.toString('base64');
        }
    });   
});
