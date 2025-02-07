# 커밋
import cv2 as cv
import os
import time
from deepface import DeepFace
from model import detection_models, metrics, find_models

# os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# OpenCV의 Haar Cascade 모델 경로 설정
HAAR_CASCADE_PATH = "/home/addinedu/icecream-order/face_recognition/haarcascade_frontalface.xml"

# 회원 얼굴 이미지가 저장된 디렉토리 (Node.js에서 업로드된 경로)
DB_PATH = os.path.join(os.getcwd(), "public", "uploads")

class Detectface:
    def __init__(self):
        self.cap = cv.VideoCapture(0) #웹캠 활성화
        self.face_cascade = cv.CascadeClassifier(
            HAAR_CASCADE_PATH  #얼굴 감지 모델 로드
        )
        self.output_dir = os.path.join(os.getcwd(), "face_recognition", "output")
        os.makedirs(self.output_dir, exist_ok=True)  # 저장 디렉토리 생성

        self.compare_img_path = os.path.join(self.output_dir, "compare_img.jpg")
        self.face_detected_time = None
        self.is_saved = False
        self.user = None

    def detect_face(self):
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

            if len(faces) > 0:
                if self.face_detected_time is None:
                    self.face_detected_time = time.time()

                elapsed_time = time.time() - self.face_detected_time

                if elapsed_time >= 1 and not self.is_saved:
                    for (x, y, w, h) in faces:
                        face_bgr = frame[y: y + h, x: x + w]
                        cv.imwrite(self.compare_img_path, face_bgr)  #얼굴 이미지 저장
                        print(f"얼굴 이미지 저장 완료: {self.compare_img_path}")
                        self.is_saved = True
                        self.cap.release()
                        cv.destroyAllWindows()

                        
                        
                        # 🔥 DeepFace를 사용하여 DB의 얼굴과 비교
                        try:
                            result = DeepFace.find(
                                img_path=self.compare_img_path,  
                                db_path=DB_PATH,  # 저장된 회원 얼굴 이미지와 비교
                                detector_backend=detection_models[4], 
                                distance_metric=metrics[2],
                                model_name=find_models[2], 
                                normalization='Facenet',
                                threshold=0.9
                            )
                            # 얼굴 매칭 시
                            if len(result) > 0 and not result[0].empty:
                                identity = result[0]['identity']

                                for compare_path in identity[:2]:  #매칭된 상위 2개 결과
                                    user_id = os.path.basename(compare_path).split("_")[0] #파일명에서 user_id추출
                                    self.user = user_id

                                    if os.path.exists(compare_path):
                                        print(f"로그인 성공! 사용자: {self.user}")
                                        return self.user
                            print("매칭되는 얼굴을 찾을 수 없습니다.")
                            return None
                        except Exception as e:
                            print(f"DeepFace 오류 발생: {str(e)}")
                            return None
                        


            else:
                self.face_detected_time = None
                self.is_saved = False

            for (x, y, w, h) in faces:
                cv.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                cv.putText(frame, "Detecting face...", (x, y - 10),
                          cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            cv.imshow('frame', frame)
            if cv.waitKey(1) == ord('q'):
                break

        self.cap.release()
        cv.destroyAllWindows()

if __name__ == "__main__":
    detect_face = Detectface()
    face_user = detect_face.detect_face()
    print(face_user if face_user else "얼굴 인식 실패")