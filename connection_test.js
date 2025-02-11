const rclnodejs = require('rclnodejs');

async function main() {
  await rclnodejs.init();
  const node = rclnodejs.createNode('camera_publisher');

  const publisher = node.createPublisher('std_msgs/msg/String', '/target_position');
  
  setInterval(() => {
    const message = "Heloo";
    console.log(`Publishing${message}`);
    publisher.publish(message);
  }, 1000); 

  rclnodejs.spin(node); 
}

main();