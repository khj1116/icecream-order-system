def order_listener_callback(self, msg):
        """주문을 수신하여 상태를 업데이트"""
        if self.state == "wait":
            self.order = msg.data
            self.state = "order_recieve"
            self.get_logger().info(f": 주문 수신: {self.order}")



            #맛 매핑
            flavor_map = {
                 "vanilla": 1,
                 "bluberry": 2,
                 "strawberry": 3
            }

            #토핑 매핑
            topping_map = {
                 "cocoball": 1,
                 "joripong": 2,
                 "sunflower_seed": 3
            }

            # #perform 매핑
            # perform_map = {
            #      "none": 1,
            #      "Hand Heart": 2,
            #      "Bear ear": 3,
            #      "ET": 4
            # }

            # #orderType 매핑
            # finalOrderType_map = {
            #      "hall": 1,
            #      "packed": 2
            # }

            # #order-sequence 매핑
            # order_sequence_map = {
            #      "icecream_first": 1,
            #      "topping_first": 2
            # }

            # 주문 데이터에서 가져오기
            flavor = self.order.get("flavor", "").lower()  
            topping = self.order.get("topping", "").lower()


            # 매핑된 값이 있으면 할당, 없으면 기본값(0) 설정
            self.cap_spot = flavor_map.get(flavor, 0)  # 아이스크림 위치
            self.topping = topping_map.get(topping, 0)  # 토핑 번호


            # 주문 데이터 출력 (디버깅용)
            self.get_logger().info(f"주문 내용: 아이스크림({flavor}) = {self.cap_spot}, 토핑({topping}) = {self.topping}")

            # 주문 상태를 "processing"으로 변경하여 다음 단계 진행 가능
            self.state = "processing"

