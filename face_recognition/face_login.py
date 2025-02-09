# 커밋
import os
os.environ["QT_QPA_PLATFORM"] = "offscreen"
import cv2 as cv
import os
import sys
import time
import tensorflow as tf
from tensorflow import keras
from deepface import DeepFace
from model import detection_models, metrics, find_models


os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["TF_TRT_ENABLED"] = "0"  #tensorRT 비활성화
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'   
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_FORCE_GPU_ALLOW_GROWTH"] = "true"  # GPU 메모리 문제 해결
os.environ["LD_LIBRARY_PATH"] = "/usr/local/cuda/lib64:/usr/local/cuda/extras/CUPTI/lib64"
# OpenCV의 Haar Cascade 모델 경로 설정
HAAR_CASCADE_PATH = os.path.join(os.path.dirname(__file__), "haarcascade_frontalface.xml")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
COMPARE_IMG_PATH = os.path.join(OUTPUT_DIR, "compare_img.jpg")

# 회원 얼굴 이미지가 저장된 디렉토리 (Node.js에서 업로드된 경로)
DB_PATH = os.path.join(os.path.dirname(__file__), "uploads")

class Detectface:
    def __init__(self):
        self.cap = cv.VideoCapture(0) #웹캠 활성화
        if not self.cap.isOpened():  # 웹캠이 열리지 않는 경우 확인
            print("웹캠을 열 수 없습니다! 카메라가 연결되어 있는지 확인하세요.")
            sys.stdout.flush()
            exit(1)  # 오류 발생 시 즉시 종료
        self.cap.set(cv.CAP_PROP_BUFFERSIZE, 1)  # 프레임 버퍼 크기 제한
        self.cap.set(cv.CAP_PROP_FPS, 15)  # FPS 제한하여 CPU 부하 줄이기
        self.cap.set(cv.CAP_PROP_FRAME_WIDTH, 640)  # 해상도 낮추기
        self.cap.set(cv.CAP_PROP_FRAME_HEIGHT, 480)
        self.face_cascade = cv.CascadeClassifier(
            HAAR_CASCADE_PATH  #얼굴 감지 모델 로드
        )
        self.output_dir = os.path.join(os.path.dirname(__file__), "output")
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
                                threshold=0.8,
                                enforce_detection=False
                            )
                            
                            # # 얼굴 매칭 시
                            if result and len(result) > 0 and not result[0].empty:
                                identity = result[0]['identity'].iloc[0]  # 첫 번째 매칭된 얼굴 파일 경로 가져오기
                                
                                filename = os.path.basename(identity)
                                if filename.startswith("user_") and filename.endswith(".jpg"):
                                    user_id = filename.replace("user_", "").replace(".jpg","")
                                    # **불필요한 로그 제거**
                                    if "\n" in user_id:
                                        user_id = user_id.split("\n")[-1].strip()
                                    
                                    
                                    self.user = user_id
                                    print(f"얼굴 인식 성공! 사용자: {self.user}")
                                    return self.user

                                   
                                    
                            print("매칭되는 얼굴을 찾을 수 없습니다.")
                            return "No_MATCH"       
                                        
                                
                                
                
                            
                           
                        except Exception as e:
                            print(f"DeepFace 오류 발생: {str(e)}")
                            return "ERROR"
                        


            else:
                self.face_detected_time = None
                self.is_saved = False

            # for (x, y, w, h) in faces:
            #     cv.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            #     cv.putText(frame, "Detecting face...", (x, y - 10),
            #               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # cv.imshow('frame', frame)
            # if cv.waitKey(1) == ord('q'):
            #     break
            # if os.environ.get("DISPLAY"):  # DISPLAY 환경 변수가 설정된 경우에만 실행
            #     cv.imshow('frame', frame)
            #     if cv.waitKey(1) == ord('q'):
            #         break

        self.cap.release()
        cv.destroyAllWindows()
        return "NO_FACE"
        

if __name__ == "__main__":
    detect_face = Detectface()
    face_user = detect_face.detect_face()
    print(face_user)

    