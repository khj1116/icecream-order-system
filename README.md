# 에드인에듀 로봇 AI 개발자 부트캠프 심화과정 3기
## Overview
### 특별한 장소에서 만난 아이스크림 제조 로봇 'Aris'를 활용하여, 이용자들에게 즐거운 
### 경험을 선사할 수 있도록 하자는 취지에서 주제로 선정
---
## Development Goals
1. 원하는 시간에 Pick-Up : 'Aris'의 제조 과정을 감상하지 않고도 원하는 시간에 아이스크림을 Pick-Up 할 수 있도록 함
2. 인건비 절감 효과 기대 : 대부분의 공정을 'Aris'가 수행하도록 설계하여 직원의 개입을 최소화함
3. 제조 및 고객 친화적 기능 : 고객 만족을 위한 'Aris'와의 포토타임 및 주문 방식에 따른 제조 서비스 제공
---
## Skills
+ FRONT_END
  + HTML5
  + CSS3
  + JavaScript
+ BACK_END
  + Node.js(Express)
+ DB
  + MySQL
+ FACE_ID
  + Pytorch
  + Facenet
---
## System Architecture
### ![Image](https://github.com/user-attachments/assets/a802b279-f6e9-47c4-b387-2384f48a1b0e)
+ 매장이나 원격 주문 페이지에서 주문 시 주문 데이터가 로봇 팔 제어 코드로 송신됨
+ 포장 주문의 경우 Easy OCR로 Pick Up Zone의 Text를 인식하여 적재할 위치 좌표값 장소에 제조한 아이스크림을 플레이팅
+ 제조 과정 중 손이 난입할 시 yolov8로 Object Detecting 작업한 안전진단 기능이 구동되며 로봇 팔 정지
+ 로봇팔 동작 순서를 수정하여 제조 순서를 주문 시 선택 가능하도록 함(토핑 먼저 혹은 아이스크림 먼저) (xArm-Python-SDK 코드 수정)
+ 회원 주문 시 최근 주문한 3개의 메뉴를 추천메뉴로 창을 띄우는 추천 메뉴 기능을 추가(DB 주문 내역 테이블에서 조회)
---
## Results
+ FRONT_END
  + 다양한 인증 옵션 제공(ID/PW,FACE-ID)
  + 접근성 강화 : 다국어, 큰 글씨 모드, 다중 페이지 구현(매장/포장/회원/비회원)
  + 시각적 효과 : 물결 애니메이션으로 사용자 경험 개선
+ BACK_END
  + 실시간 주문 관리 : ROS2 및 Socket I.O로 로봇팔과 클라이언트 동기화
  + 사용자 인증 : 다양한 로그인 옵션과 보안 강화(비밀번호 해싱, 세션)
  + 주문 동기화 : 포장 주문 서버와 메인 서버 간 데이터 통합
    
---
## Improvements
+ FRONT_END
  + 다국어 지원 : 추가 언어 확장 검토
  + 보안 : HTTPS 적용 및 입력값 검증 강화 필요
+ BACK_END
  + 얼굴 인식 : Python 스크립트 실행 속도 및 안정성 개선 필요
  + 보안 : HTTPS 적용, SQL 인젝션 방지 강화
  + 성능 : 대용량 주문 데이터 처리 시 DB 성능 최적화 필요
  + ROS2 : 에러 처리 및 재연결 로직 추가 검토
+ FACE-ID
  + 웹캠 품질 및 조명 조건에 따른 인식률 개선
  + DeepFace 모델 성능 최적화(GPU 메모리 사용량, 임계값 조정)












