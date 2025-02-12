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

    def listener_callback(self, msg):
        try:
            order_data = json.loads(msg.data)  # JSON 변환
            self.get_logger().info(f'주문 수신 - 맛: {order_data["flavor"]}, 동작: {order_data["perform"]}, 토핑: {order_data["topping"]}, 타입: {order_data["finalOrderType"]}, 순서: {order_data["order_sequence"]}')
        except Exception as e:
            self.get_logger().error(f'주문 데이터 처리 오류: {e}')

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
