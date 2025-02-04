// 모든 주문 내역 테이블 업데이트
fetch('/api/all_orders')
    .then(response => response.json())
    .then(data => {
        console.log("📥 영구 주문 내역 로드 완료", data);

        let allTableBody = document.getElementById("all-orders-table");

        if (!allTableBody) {
            console.error("❌ 테이블을 찾을 수 없습니다.");
            return;
        }

        allTableBody.innerHTML = ''; // 기존 데이터 초기화

        data.forEach(order => {
            const customerType = order.customer_name ? order.customer_name : '비회원';
            let row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.flavor}</td>
                    <td>${order.perform}</td>
                    <td>${order.topping}</td>
                    <td>${order.orderType}</td>
                    <td>${customerType}</td>
                    <td>${order.created_at}</td>
                </tr>
            `;
            allTableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("❌ 영구 주문 내역 로드 오류:", error));
