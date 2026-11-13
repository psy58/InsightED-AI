<div align="center">
  <a href="https://dddmprototype-292439921859.us-west1.run.app/" target="_blank">
    <img src="https://img.shields.io/badge/프로토타입-웹사이트_바로_실행하기-4285F4?style=for-the-badge" alt="의사결정 지원 시스템 프로토타입 웹사이트로 이동" />
  </a>
</div>

<br>

## 초등교사 생활지도 및 상담을 위한 비정형 데이터 기반 의사결정 지원 시스템
## Decision Support System for Teachers' Guidance & Counseling

### 📖 프로젝트 소개 (Introduction)
**[KR]** 
AI융합교육전공 석사 학위논문의 일환으로 설계 및 개발되었습니다. 학생 관찰 일지, 상담 기록 등 교실에서 파편화된 비정형 데이터를 디지털 기반으로 한 곳에 모으고 AI가 분석하여 교사의 교육적 의사결정을 돕는 시스템입니다. 교사가 AI와 원활하게 피드백을 주고받게 하여 최적의 학생 맞춤형 지도 방안을 도출할 수 있도록 설계되었습니다.

**[EN]** 
This system was designed and developed as part of a Master's thesis in AI Convergence Education. It digitally aggregates fragmented, unstructured data from the classroom—such as student observation logs and counseling records—into a single platform. AI then analyzes this data to support teachers in their educational decision-making. Furthermore, it is designed to enable teachers to smoothly exchange feedback with AI, ultimately helping them derive optimal, personalized student guidance strategies.

### ✨ 핵심 기능 (Key Features)
* **비정형 데이터 분석 (Unstructured Data Analysis):** 텍스트 기반의 상담 및 관찰 기록 핵심 요약
* **맞춤형 지도 가이드 (Tailored Guidance):** 누적 데이터 기반 학생별 맞춤형 생활지도 프롬프트 생성
* **업무 효율화 (Task Efficiency):** 교사의 행정 부담을 줄이고 본연의 교육 활동에 집중하도록 지원

### 🛠 기술 및 개발 방식 (Tech Stack & Methodology)
* **AI Tool:** OpenAI API (Vercel 서버 함수), Google AI Studio 기반 초기 프로토타입
* **Methodology:**
* 자연어 기반 바이브 코딩 (Vibe Coding via Prompt Engineering)
* 데이터 처리를 위한 프롬프트 파이프라인 구축 (Data-Driven Prompting)

### 🚀 Vercel 배포 및 API 설정

AI 요청은 브라우저 → `/api/ai` 서버 함수 → OpenAI 순서로 처리합니다.
OpenAI 키는 서버에서만 읽으며 브라우저 번들에는 포함하지 않습니다.
키가 없어도 앱의 첫 화면은 열립니다. AI 기능을 누를 때 설정 안내를 표시합니다.

Vercel 프로젝트의 **Settings → Environment Variables**에 다음을 등록하고 다시 배포하세요.

| 이름 | 값 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI 프로젝트에서 발급한 API 키 (필수) |
| `AI_ACCESS_PASSWORD` | 관리자가 정한 충분히 긴 별도 AI 이용 암호 (필수, API 키와 다르게 설정) |
| `OPENAI_MODEL` | 선택 사항. 기본 `gpt-4.1-mini` |
| `OPENAI_MAX_OUTPUT_TOKENS` | 선택 사항. 기본 2000, 최소 256, 최대 4096 |

- API 키를 GitHub, 프런트엔드 코드, `VITE_` 환경변수, Vite `define`에 넣지 마세요.
- AI 이용자는 첫 요청 때 별도 이용 암호를 입력합니다. 암호는 해당 탭의 세션 저장소에만 보관됩니다.
- 이용 암호는 승인한 이용자에게만 공유하세요. 공유 암호는 개별 사용자 인증이나 사용자별 할당량을 대체하지 않습니다.
- 현재 로그인·회원가입은 시연용입니다. 실제 공개 운영 전 서버 기반 사용자 인증과 영속 저장소 기반 요청 횟수·동시 요청·비용 제한을 추가해야 합니다. 출력 토큰 제한만으로 총비용이 제한되지는 않습니다.
- 분석 텍스트는 24,000자, 요청 본문은 3.5MB 이하입니다. 미디어 파일은 base64 변환 전 약 2.5MB 이하를 권장합니다.
- 텍스트 요약·분석, 사진 묘사·성찰 문서 OCR, 음성 전사·요약을 지원합니다. 음성 전사는 `gpt-4o-mini-transcribe`를 사용합니다.
- 영상 자동 분석은 지원하지 않습니다. 영상 대신 사진 또는 음성 파일을 사용하세요. 긴 녹음은 짧게 나누어 주세요.
- 출력 한도로 응답이 잘린 경우 완성된 보고서처럼 표시하지 않고 오류로 안내합니다. 출력 토큰 설정은 텍스트 생성에 적용되며 음성 전사 길이 제한과는 별개입니다.
- OpenAI Responses 요청은 `store: false`로 전송합니다. 이는 모든 제공자 로그의 미보관을 보장하는 설정은 아닙니다.

### 로컬 개발 및 검증

Node.js 22 이상을 사용하세요.

```sh
npm ci
npm run typecheck
npm test
npm run build
```

프런트엔드만 확인하려면 `npm run dev`를 실행합니다.
서버 API까지 실행하려면 `.env.example`을 `.env.local`로 복사하고 값을 입력한 후
공식 Vercel CLI의 `vercel dev`를 실행하세요. `vite` 단독 실행에는 `/api/ai` 서버가 포함되지 않습니다.
실제 키가 없어도 테스트는 가상 응답으로 동작하며 API 비용이 발생하지 않습니다.

### ⚠️ 유의 사항 (Notice)
**[KR]** 본 리포지토리는 시스템의 프롬프트 구조와 아키텍처 시연을 목적으로 하며, 실제 학생의 민감한 데이터는 포함되어 있지 않습니다. <br>
**[EN]** This repository is for demonstrating the prompt structure and architecture. It does NOT contain any sensitive actual student data.

---
*🏆 2026 이화여자대학교 교육대학원 우수학위논문상 수상* <br>
* Awarded the Outstanding Thesis Award, Ewha Womans University Graduate School of Education (2026)*

<br>

<div align="center">
  <a href="https://www.riss.kr/search/detail/DetailView.do?p_mat_type=be54d9b8bc7cdb09&control_no=0e60004a53e99ae8ffe0bdc3ef48d419&keyword=%EB%B0%95%EC%83%88%EC%97%B0%20%EC%9D%B4%ED%99%94%EC%97%AC%EB%8C%80" target="_blank">
    <img src="https://img.shields.io/badge/RISS-학위논문_원문_보기-00462A?style=for-the-badge&logo=read-the-docs&logoColor=white" alt="RISS 학위논문 원문 보기" />
  </a>
</div>
