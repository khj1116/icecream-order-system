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
        self.subscription  # 방지용 변수 (lint 에러 방지)

    def listener_callback(self, msg):
        try:
            order_data = json.loads(msg.data)  # JSON 변환
            flavor = order_data.get("flavor", "알 수 없음")
            topping = order_data.get("topping", "알 수 없음")

            self.get_logger().info(f"🍦 주문 수신: 맛={flavor}, 토핑={topping}")

            # 🦾 로봇 팔 제어 함수 호출 (아래 구현)
            self.control_robot_arm(flavor, topping)

        except json.JSONDecodeError:
            self.get_logger().error("JSON 디코딩 오류: 유효하지 않은 데이터 수신")

    def control_robot_arm(self, flavor, topping):
        """ ROS2 메시지를 받아 로봇 팔 제어 """
        self.get_logger().info(f"로봇 팔 작동: {flavor} 맛의 아이스크림 제조 중...")
        
        # 🛠 실제 로봇 제어 코드 (Python API 예제)
        # 예제 코드 (실제 로봇 제어 코드로 변경)
        import time
        time.sleep(2)  # 제조 대기 시간 (예제)
        self.get_logger().info(f"제조 완료: {flavor} 맛 + {topping} 토핑")

def main(args=None):
    rclpy.init(args=args)
    order_subscriber = OrderSubscriber()
    rclpy.spin(order_subscriber)
    order_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
