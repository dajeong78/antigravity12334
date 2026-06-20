# 🎓 대학 전공 추천 서비스 (University Major Recommendation Service)

> 사용자의 관심 학문 계열, 선호 고등학교 과목, 그리고 10개의 다차원 성향 검사 결과를 정밀하게 매칭하여 가장 적합한 대학 전공을 추천하고 상세 진로 분석 보고서를 제공하는 반응형 웹 서비스입니다.

이 서비스는 프레임워크나 빌드 도구 없이 브라우저 자체에서 직접 실행되는 **정적 웹 페이지(Static Site)**로 설계되었습니다. 따라서 **GitHub Pages**를 통해 추가 비용이나 빌드 환경설정 없이 단 1분 만에 무료로 웹에 배포할 수 있습니다.

---

## 🚀 GitHub Pages 배포 방법 (1분 완성)

이 프로젝트는 모든 파일 경로(HTML, CSS, JS)가 **상대 경로**로 작성되어 있어, 특별한 설정 없이 저장소(Repository)에 푸시하는 것만으로 배포가 완료됩니다.

### 단계 1: GitHub 저장소 생성 및 코드 업로드
1. 본인의 GitHub 계정에 로그인한 뒤 새로운 저장소(New Repository)를 생성합니다. (예: `major-recommender`)
2. 로컬 컴퓨터의 프로젝트 파일을 Git을 통해 해당 저장소에 푸시합니다:
   ```bash
   git init
   git add .
   git commit -m "Initialize project"
   git branch -M main
   git remote add origin https://github.com/사용자이름/저장소이름.git
   git push -u origin main
   ```

### 단계 2: GitHub Pages 설정 활성화
1. 업로드된 GitHub 저장소 페이지 상단의 **Settings** 탭을 클릭합니다.
2. 좌측 메뉴에서 **Pages**를 선택합니다.
3. **Build and deployment** 섹션 아래의 **Source** 설정을 `Deploy from a branch`로 선택합니다.
4. **Branch** 설정에서 `main` (또는 `master`) 분기를 고르고, 폴더는 `/ (root)`를 선택한 뒤 **Save** 버튼을 누릅니다.

### 단계 3: 배포 완료 및 접속
1. 약 30초~1분 후 페이지 상단에 배포 완료 알림과 함께 주소가 생성됩니다.
   - 예: `https://사용자이름.github.io/저장소이름/`
2. 생성된 URL로 접속하여 웹에 퍼블리싱된 서비스를 즉시 이용할 수 있습니다.

---

## 🛠️ 주요 기능 및 아키텍처

- **기능 A: 기본 정보 매칭**
  - 이름, 관심 학문 계열(인문/사회/공학/자연과학/예체능), 좋아하는 고교 과목을 입력받아 사용자 프로필 데이터 구축 및 가중치 반영.
- **기능 B: 10대 적성 진단 테스트**
  - 각 선택지마다 다른 계열별 점수(0~2점)가 할당되어 사용자의 잠재적 학업 성향을 수집.
  - 뒤로가기(이전 질문) 버튼을 통한 유연한 풀이 수정 가능 (점수 연산 감산 처리 연동).
- **기능 C: 정밀 추천 알고리즘**
  - `(성향 누적 점수) + (관심 계열 보너스 +5) + (선호 과목 매칭 보너스)`를 통합 합산하여 최적의 1위 전공 및 2~4위 대안 전공 도출.
- **기능 D: 학과 상세 정보 팝업 모달**
  - 각 전공의 개요, 대학에서 배우는 실제 전공과목 목록, 졸업 후 추천 진로 및 직업 정보, 고교 연계 과목들을 오버레이 팝업으로 상세 제공.

---

## 📂 파일 구조

```text
major-recommender/
├── index.html        # 단일 페이지 애플리케이션(SPA) 마크업
├── style.css         # 글래스모피즘 및 백드롭 글로우 등 비주얼 테마 정의
├── app.js            # 상태 관리, 매칭 알고리즘 및 DOM 제어
├── data.js           # 전공 상세 프로필 데이터베이스 및 질문 데이터셋
├── run-server.ps1    # 로컬 브라우저 구동용 Windows PowerShell 서버 스크립트
├── package.json      # Node.js 개발용 메타데이터 (http-server 포함)
└── .gitignore        # Git 버전 관리 제외 설정
```

---

## 💻 로컬에서 실행하기

브라우저의 보안 정책(CORS)으로 인해, HTML 파일을 더블클릭해서 실행(`file:///` 경로)하면 ES 모듈(`import/export`) 호출이 차단될 수 있습니다. 로컬에서 실행 시 반드시 아래의 서버 구동 방식을 사용해 주세요.

### 방법 A: PowerShell 서버 구동 (추천 - 프로그램 설치 불필요)
Windows 환경이라면 프로젝트 폴더 내에서 터미널을 열고 아래 스크립트를 즉시 실행할 수 있습니다:
```powershell
powershell -ExecutionPolicy Bypass -File .\run-server.ps1
```

### 방법 B: Node.js 개발 서버 구동 (Node.js 설치 환경)
```bash
npm install
npm run dev
```
이후 브라우저에서 `http://localhost:3000`에 접속합니다.
