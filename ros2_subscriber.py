import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json
class OrderSubscriber(Node):
    def __init__(self):
        super().__init__('order_subscriber')
        self.subscription = self.create_subscription(
            String,
            '/order_topic',
            self.listener_callback,
            10)
        self.subscription  # 방지: unused variable warning

        #주문 상태 및 초기 변수
        self.state = "wait"
        self.cap_spot = 0   #맛(1: 바닐라, 2: 블루베리, 3: 딸기)
        self.topping = 0    #토핑(1: 코코볼, 2: 조리퐁, 3: 해바라기씨)
        self.finalOrderType = 0  #주문형태(1: 매장, 2: 포장)
        self.order_sequence = 0  #제조순서(1: 아이스크림 위에 토핑, 2: 아이스크림 밑에 토핑)

        #아이스크림 맛 매핑
        self.flavor_map = {
            "vanilla": 1,
            "blueberry": 2,
            "strawberry": 3
        }
        
        #토핑 매핑
        self.topping_map = {
            "cocoball": 1,
            "joripong": 2,
            "sunflower_seed":3
        }

        #주문형태 매핑
        self.finalOrderType_map = {
            "hall": 1,
            "packed": 2
        }
        
        #제조순서 매핑
        self.order_sequence_map = {
            "icecream_first": 1,
            "topping_first": 2
        }

    def listener_callback(self, msg):
        """ROS 메시지를 받아 주문을 처리하는 함수"""
        try:
            # JSON 데이터 파싱
            order_data = json.loads(msg.data)

            if self.state == "wait":
                self.state = "order_receive"
                self.get_logger().info(f"주문 수신: {order_data}")

                # 주문에서 데이터 가져오기
                flavor = order_data.get("flavor", "").lower()  
                topping = order_data.get("topping", "").lower()
                finalOrderType = order_data.get("finalOrderType", "").lower()
                order_sequence = order_data.get("order_sequence", "").lower()

                # 매핑된 값이 있으면 할당, 없으면 기본값(0) 설정
                self.cap_spot = self.flavor_map.get(flavor, 0)  # 아이스크림 위치
                self.topping = self.topping_map.get(topping, 0)  # 토핑 번호
                self.finalOrderType = self.finalOrderType_map.get(finalOrderType, 0) #주문 형태 번호
                self.order_sequence = self.order_sequence_map.get(order_sequence, 0) #제조 순서 번호

                # 주문 정보 로그 출력
                self.get_logger().info(f"""
                주문 내용: 아이스크림({flavor}) = {self.cap_spot}, 
                토핑({topping}) = {self.topping}, 
                주문형태({finalOrderType}) = {self.finalOrderType},
                제조순서({order_sequence}) = {self.order_sequence}""")
                                       
                # 주문 상태를 "processing"으로 변경하여 다음 단계 진행 가능
                self.state = "wait"

        except json.JSONDecodeError as e:
            self.get_logger().error(f"주문 데이터 JSON 변환 오류: {e}")
        except KeyError as e:
            self.get_logger().error(f"주문 데이터에서 누락된 필드: {e}")
        except Exception as e:
            self.get_logger().error(f"주문 데이터 처리 중 오류 발생: {e}")



def main(args=None):
    rclpy.init(args=args)
    node = OrderSubscriber()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
