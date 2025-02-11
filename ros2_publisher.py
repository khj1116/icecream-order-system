import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MyPub(Node):
    def __init__(self):
        super().__init__('mysub_node')
        self.pub=self.create_publisher(
            String,
            'test',
            10
        )
        self.timer=self.create_timer(1.0,self.timecallback)
 

    def timecallback(self):
        msg=String()
        msg.data="Test"
        self.pub.publish(msg)



def main(args=None):
    rclpy.init(args=args)
    node = MyPub()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()