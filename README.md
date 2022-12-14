<!--
# ✨목차

1. [소개](#Plants-Image-Classification-Project)
2. [제작기간 및 참여인원](#제작기간-및-참여인원)
3. [사용기술 & 개발환경](#사용기술-&-개발환경)
4. [식물 데이터셋](#식물-데이터셋)
5. [모델 트레이닝](#모델-트레이닝)

<br><br>

# Plants Image Classification Project
### 입력 받은 식물 이미지를 분류한다
Yolov5와 Tensorflow를 기반으로 제작한 식물 분류 인공지능<br>

<br>

[목차🔺](#목차)

<br><br>

# 제작기간 및 참여인원
### 데이터 수집, 가공 및 라벨링
2022-09-4 ~ 2022-9-20
### 데이터 학습 및 오류 수정
2022-09-20 ~ 2022-9-30
### 참여인원
팀 프로젝트 (총 6명)<br>

<br>

[목차🔺](#목차)

<br><br>

# 사용기술 & 개발환경
### 
- Google colaboratory
- Yolov5
- Tesnsorflow
<br>

[목차🔺](#목차)

<br><br>

# 식물 데이터셋
### 1. Class : 17
  - Golden_pothos, Muehlenbeckia_complexa, Happy_plant, Bunnyearscactus, Rosmarinus, Dracaena, Chlorophytum
  - Monstera, Chamaedorea_elegans, Bengal_Fig, Stuckyi, Pachira, Ardisia_crenata, Zamia, Staghorn
  - Birkin, Wilma

2. Images : 6800
3. Train/Vaild (100%)
  - Train : 5440(80%)
  - Valid : 1360(20%)

<img src="https://github.com/SungwonDev/Plants_Image_Classification-Project/blob/main/Projcet/tensorboard.JPG" width="500" height="500">

Dataset Download : https://drive.google.com/file/d/18gkiKTJwl_FO99dnqbxyCCDyFQdo6hpY/view?usp=sharing

[목차🔺](#목차)

<br><br>

# 모델 트레이닝

1. yolov5 설치
```bash
!git clone https://github.com/ultralytics/yolov5.git
```

<br>

2. requirements.txt 설치
```bash
%cd /content/yolov5/
pip install -r requirements.txt
```

<br>

3. Model 학습
```bash
!python train.py --img 416 --batch 16 --epochs 20 --data /content/dataset/data.yaml --cfg ./models/yolov5s.yaml --weights yolov5s.pt --name yolov5s_result
```

<br>

4. Model 테스트
``` bash
!python detect.py --weights /content/yolov5/runs/train/yolov5s_result/weights/best.pt --img 416 --conf 0.5 --source /content/dataset/export/testimg/테스트할 이미지.jpg
```

<br>

5. 학습 결과

- 학습된 가중치 파일 중 가장 성능이 좋은 Weight 파일 (best.pt)을 얻습니다.
- 얻은 best.pt는 위의 dataset Download에서 함께 받을 수 있습니다.

학습 결과 확인<br>

<img src="https://github.com/SungwonDev/Plants_Image_Classification-Project/blob/main/Projcet/result.JPG" width="500" height="500">

<br>

[목차🔺](#목차)
