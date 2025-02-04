document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById("orderForm");
    const message = document.getElementById("message");


    //orderForm이 존재하는지 확인
    if (!orderForm){
        console.error("'orderForm' 요소를 찾을 수 없습니다. HTML 파일을 확인하세요.");
        return; // 코드 실행 중단
    }

    
    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const order = {
                flavor: document.getElementById("flavor").value,
                perform: document.getElementById("perform").value,
                topping: document.getElementById("topping").value,
                orderType: "packed",
                username: "비회원", // 비회원 주문
                user_id: null
        };

        try {
            const response = await fetch("http://localhost:5000/order", { // 서버 주소 맞춰 변경
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = "주문이 성공적으로 접수되었습니다!";
                orderForm.reset();
            } else {
                message.textContent = "주문 접수에 실패했습니다.";
            }
        } catch (error) {
            message.textContent = "서버와 연결할 수 없습니다.";
        }
    });
});