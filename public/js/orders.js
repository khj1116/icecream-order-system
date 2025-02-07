

// 웹소켓 연결 설정
const socket = io('http://localhost:5000');

//실시간 주문 내역 테이블을 저장할 전역 변수 선언
let liveTableBody = null;

// 기존 주문 아이디를 추적하여 중복 추가 방지
const existingOrderIds = new Set(JSON.parse(sessionStorage.getItem("existingOrderIds")) || []);

//뒤로가기 시 중복 로드 방지 위해 sessionStorage 활용
window.onload = function() {
    sessionStorage.removeItem("existingOrderIds"); // 기존 주문 ID 초기화
    existingOrderIds.clear(); //set 객체도 초기화
    liveTableBody = document.querySelector("#orders-table tbody");

    if (!liveTableBody) {
        console.error("주문 내역 테이블을 찾을 수 없습니다. ");
        return;
        
    } 
    

    // 뒤로 가기 시 중복 요청 방지
   
    sessionStorage.setItem("orderHistoryLoaded", "true");

    // 페이지가 처음 로드될 때, 기존 데이터 불러오기
    fetch('/api/live_orders')
        .then(response => response.json())
        .then(data => {
            console.log("📥 기존 주문 내역 로드 완료", data);

            // 기존 데이터를 유지하면서 새로 불러온 주문을 추가 (아래로 추가)
            data.forEach(order => {
                
                    addOrderToTable(order);
                   
                });
            //세션 스토리지에 저장하여 새로고침 후에도 데이터 유지
            sessionStorage.setItem("existingOrderIds", JSON.stringify([...existingOrderIds]));
        })
        .catch(error => console.error("주문 내역 로드 오류:", error));
};

// 뒤로 가기 시 `sessionStorage` 초기화
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        //sessionStorage.removeItem("orderHistoryLoaded");
        sessionStorage.removeItem("existingOrderIds");
    }
});


//실시간으로 새로운 주문이 업데이트 되었을 때 처리
socket.on('update_orders', function(data) {
    console.log("새로운 주문이 도착했습니다.", data);

    // 항상 테이블을 다시 가져오도록 설정
    liveTableBody = document.querySelector("#orders-table tbody");


    if (!liveTableBody) {
        console.error("❌ 테이블을 찾을 수 없습니다. orders.js를 확인하세요.");
        return;
    }


    data.forEach(order => {
        if (!existingOrderIds.has(order.id)) { // 중복 체크
            addOrderToTable(order);
            existingOrderIds.add(order.id);
            sessionStorage.setItem("existingOrderIds", JSON.stringify([...existingOrderIds]));
        } else {
            console.log("🚫 이미 존재하는 주문이므로 추가하지 않음:", order.id);
        }

        
    });

    
});

// 주문을 테이블에 추가하는 함수
function addOrderToTable(order) {
    liveTableBody = document.querySelector("#orders-table tbody"); //  항상 테이블을 다시 찾음

    if (!liveTableBody) {
        console.error("❌ 주문을 추가할 테이블을 찾을 수 없습니다.");
        return;
    }
    console.log("주문을 테이블에 추가:", order); // 디버깅용 로그 추가

    if (!existingOrderIds.has(order.id)) {
        existingOrderIds.add(order.id);
        sessionStorage.setItem("existingOrderIds", JSON.stringify([...existingOrderIds]));

        const customerType = order.customer_name ? order.customer_name : '비회원';
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.flavor}</td>
            <td>${order.perform}</td>
            <td>${order.topping}</td>
            <td>${order.orderType}</td>
            <td>${customerType}</td>
        `;
        liveTableBody.appendChild(row);
    } else {
        console.log("이미 존재하는 주문이므로 추가하지 않음:", order.id);

    }
}

/*커밋*/
