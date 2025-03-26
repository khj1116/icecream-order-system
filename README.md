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
###
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
## 개선점, 확장
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












