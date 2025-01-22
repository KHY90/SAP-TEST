namespace demo.cafe;

using {
    cuid,
    managed,
    Currency,
    Country
} from '@sap/cds/common';

entity MenuItem {
    key menu_code           : Integer        @title: '등록번호'; 
        menu_name_kor       : String         @title: '상품 한글 이름'; // 상품 이름 (한글)
        menu_name_eng       : String         @title: '상품 영어 이름'; // 상품 이름 (영어)
        menu_category       : String         @title: '상품 카테고리'; // 카테고리
        menu_small_category : String         @title: '소분류'; // 소분류
        menu_price          : Decimal(10, 2) @title: '상품 가격'; // 가격
        registered_by       : String         @title: '등록자'; // 등록자 이름
        registration_status : String         @title: '등록 상태'; // 상태 (예: 활성, 비활성)
        menu_description    : String         @title: '상품 설명'; // 상세 설명
        menu_nutrition_info : String         @title: '제품 영양 정보'; // 영양 정보
        menu_image          : LargeBinary    @title: '이미지'; // 제품 이미지
        registration_date   : DateTime       @title: '등록 날짜'; // 등록 일시
        modify_date         : DateTime       @title: '수정 날짜'; // 수정 일시
};

entity MenuCategory {
    key category_id   : String @title: '카테고리 ID';
        category_name : String @title: '카테고리 이름';
};
