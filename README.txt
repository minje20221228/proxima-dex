현재 프로토타입은 외부 이미지 파일 없이 실행됩니다.

추후 실제 카드 이미지를 넣고 싶다면 예시:

assets/
└─ cards/
   ├─ laser_shot.webp
   ├─ shield_matrix.webp
   └─ ...

그 다음 js/cards.js 각 카드 데이터에 image 경로를 추가하고,
js/app.js의 카드 렌더링에서 <img>를 출력하도록 변경하면 됩니다.
