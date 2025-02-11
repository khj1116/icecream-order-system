const rclnodejs = require('rclnodejs');

async function main() {
  await rclnodejs.init();
  const node = rclnodejs.createNode('test_publisher');

  const publisher = node.createPublisher('std_msgs/msg/String', '/test_topic');

  setInterval(() => {
    const message = { data: "테스트 메시지: 아이스크림 주문 테스트 🚀" };
    console.log(`📤 메시지 발행: ${message.data}`);
    publisher.publish(message);
  }, 2000); // 2초마다 메시지 발행

  rclnodejs.spin(node);
}

main();
