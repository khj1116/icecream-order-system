from flask import Flask, request, jsonify
from deepface import DeepFace
import numpy as np
import os
import cv2
import json
import base64

app = Flask(__name__)

DATABASE_PATH = "face_database.json"

def load_database():
    if os.path.exists(DATABASE_PATH):
        with open(DATABASE_PATH, "r") as f:
            return json.load(f)
    return {}

def save_database(database):
    with open(DATABASE_PATH, "w") as f:
        json.dump(database, f, indent=4)

def calculate_threshold(embeddings):
    embeddings = np.array(embeddings)
    distances = []
    for i in range(len(embeddings)):
        for j in range(i + 1, len(embeddings)):
            distances.append(np.linalg.norm(embeddings[i] - embeddings[j]))
    if distances:
        return np.mean(distances) + np.std(distances)
    return 10  # 임계값의 기본값


@app.route('/register', methods=['POST'])
def register_member():
    try:
        data = request.json
        name = data.get('name')
        user_id = data.get('user_id')
        password = data.get('password')
        images = data.get('images', [])
        current_face = data.get('current_face')

        #데이터 검증
        if not isinstance(images, list):  # images가 리스트인지 확인
                return jsonify({"error": "'images'는 리스트 타입이어야 합니다."}), 400

        if not name or not user_id or len(images) < 5 or not current_face:
            return jsonify({"error": "등록 데이터가 부족합니다."}), 400

        #얼굴 임베딩 생성 및 학습
        embeddings = []
        for idx, img_base64 in enumerate(images):
            
                img_data = np.frombuffer(base64.b64decode(img_base64.split(",")[1]), np.uint8)
                img = cv2.imdecode(img_data, cv2.IMREAD_COLOR)
                embedding = DeepFace.represent(img_path=img, model_name="Facenet")[0]["embedding"]
                embeddings.append(embedding)

         # 현재 얼굴 임베딩 생성
        current_img_data = np.frombuffer(base64.b64decode(current_face.split(",")[1]), np.uint8)
        current_img = cv2.imdecode(current_img_data, cv2.IMREAD_COLOR)
        current_embedding = DeepFace.represent(img_path=current_img, model_name="Facenet")[0]["embedding"]
          
        #데이터베이스에서 일치하는 데이터 확인
        database = load_database()
        for existing_id, user_data in database.items():
            mean_embedding = np.array(user_data["embeddings_mean"])
            distance = np.linalg.norm(current_embedding - mean_embedding)
            if distance < user_data.get("threshold", 10):  # 기본 임계값: 10
                return jsonify({"error": "이미 등록된 얼굴입니다."}), 400
         # 임계값 계산
        threshold = np.mean([np.linalg.norm(e - np.mean(embeddings, axis=0)) for e in embeddings]) + np.std(embeddings)

        #데이터 저장
        database[user_id] = {
            "name": name,
            "password": password,  #비밀번호 저장
            "embeddings_mean": np.mean(embeddings, axis=0).tolist(),
            "threshold": calculate_threshold(embeddings) #동적 임계값 계산
        }
        save_database(database)
        return jsonify({"message": f"{name}님! 회원 등록이 완료되었습니다."}), 200
    except Exception as e:
        print(f"오류 발생: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)
