const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { MenuItem, MenuCategory } = this.entities;

    this.on('bootstrap', async () => {
        const db = await cds.connect.to('db');

        // MenuCategory 초기 데이터
        await db.run(
            INSERT.into(MenuCategory).entries([
                { category_id: 'beverages', category_name: '음료' },
                { category_id: 'foods', category_name: '푸드' }
            ])
        );

        // MenuItem 초기 데이터
        await db.run(
            INSERT.into(MenuItem).entries([
                {
                    menu_code: 1001,
                    menu_name_kor: '아메리카노',
                    menu_name_eng: 'Americano',
                    menu_category: '음료',
                    menu_small_category: '에스프레소',
                    menu_price: 4500.0,
                    registered_by: '관리자',
                    registration_status: 'active',
                    menu_description: '기본 아메리카노',
                    menu_nutrition_info: '칼로리: 10kcal',
                    menu_image: null,
                    registration_date: new Date().toISOString(),
                    modify_date: new Date().toISOString()
                }
            ])
        );
    });
});
