using demo.cafe as db from '../db/cafe';

service CafeMenuService {

    // 메뉴 아이템 CRUD 서비스
    entity MenuItems       as projection on db.MenuItem;
    // 카테고리 관리 서비스
    entity MenuCategories  as projection on db.MenuCategory;

    // 활성화된 메뉴 조회
    @readonly
    entity ActiveMenuItems as projection on db.MenuItem
                              where
                                  registration_status = 'Active';
}
