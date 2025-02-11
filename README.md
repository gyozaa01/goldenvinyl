# Golden Vinyl(골든 바이닐) 🎧

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/ed5fb78d-65a9-4ebd-9804-8d24ea715e19" />

## 프로젝트 개요
🎵 GoldenVinyl - LP 감성의 현대적 음악 플레이어 🎵  
2025.02 (개인 프로젝트)

## 서비스 소개
![image](https://github.com/user-attachments/assets/e2a69cc6-0c3d-4c63-97a0-7eb2ef1040e7)  

GoldenVinyl은 음악을 단순히 듣는 것을 넘어, 감각적으로 즐길 수 있는 경험을 제공하는 음악 추천 및 플레이어입니다.  
LP 감성의 직관적인 UI와 Spotify API를 활용한 개인화된 음악 추천으로, 사용자에게 아날로그와 디지털이 조화를 이루는 새로운 음악 감상 방식을 제안합니다.

## 서비스 화면
### ➀ 시작 및 로그인
<table>
  <tr>
    <td align="center">
      <img width="450" alt="초기화면" src="https://github.com/user-attachments/assets/2ecc86ed-4198-4d45-8dec-ad7664e4905c">
      <br><b>초기화면</b>
    </td>
    <td align="center">
      <img width="450" alt="홈(로그인 전)" src="https://github.com/user-attachments/assets/458c0da8-d65f-40c2-83ff-b97d1a6e556f">
      <br><b>홈(로그인 전)</b>
    </td>
  </tr>
</table>

### Spotify API를 활용한 간편 로그인
1. Oauth 2.0 기반의 Spotify 로그인
   - 사용자는 별도의 회원가입 없이 Spotify 계정을 통해 간편하게 로그인 가능
   - Spotify 인증 서버를 활용하여 보안성 유지하며 사용자 인증 처리
2. 액세스 토큰 및 리프레시 토큰 관리
   - 로그인 시 발급되는 액세스토큰은 로컬스토리지에 저장되며, 토큰 만료시 리프레시 토큰을 활용하여 자동 갱신
   - 사용자는 별도의 재로그인 없이도 지속적으로 서비스 이용 가능
3. Supabase 연동을 통한 사용자 데이터 관리
   - 로그인한 사용자 정보를 Supabase에 저장하고 관리


### ➁ 홈
<table>
  <tr>
    <td align="center">
      <img width="450" alt="내가좋아하는음악" src="https://github.com/user-attachments/assets/104efc38-a9a8-4a14-ae75-f7e582167eef">
      <br><b>내가 좋아하는 음악</b>
    </td>
    <td align="center">
      <img width="450" alt="자주들은아티스트" src="https://github.com/user-attachments/assets/7138982b-6027-4b2b-bbe6-982c4f33dd6a">
      <br><b>자주 들은 아티스트</b>
    </td>
  </tr>
</table>

### LP(바이닐) 감성을 살린 직관적이고 몰입감있는 반응형 UI/UX 설계
1. 홈 구성
   - 내가 좋아하는 음악: 좋아요를 누른 음악 중 랜덤으로 4개 보여줌
   - 자주 들은 아티스트: 자주 들은 아티스트(3명)를 분석하여 인기곡 추천
2. 하단바
   - 플레이어
   - 하단바: 홈, 검색, 플레이리스트로 구성


### ➂ 재생
<table>
  <tr>
    <td align="center">
      <img width="450" alt="재생 전" src="https://github.com/user-attachments/assets/1cec320e-003b-4e20-b373-f79f51b96334">
      <br><b>재생 전</b>
    </td>
    <td align="center">
      <img width="450" alt="재생 후" src="https://github.com/user-attachments/assets/11695df0-3e45-4276-9cc6-8767fa274934">
      <br><b>재생 후</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="450" alt="멈춤" src="https://github.com/user-attachments/assets/05077d6d-04d1-440c-94d4-47569c393054">
      <br><b>멈춤</b>
    </td>
    <td align="center">
      <img width="450" alt="좋아요 및 기타" src="https://github.com/user-attachments/assets/25fa20fb-628c-44a9-8688-38e9d1d3e2cf">
      <br><b>좋아요 및 기타</b>
    </td>
  </tr>
</table>

### 생동감 넘치는 턴테이블 기반의 다이나믹 플레이어
1. LP 스타일 애니메이션
   - 음악 재생 시 앨범 표지가 LP 모양으로 회전
   - 일시정지 시 턴테이블 바늘이 자연스럽게 밖으로 이동
2. 다양한 플레이어 컨트롤
   - 이전트랙, 다음 트랙, 셔플, 반복재생, 볼륨조절
   - 좋아요, 트랙 삭제
3. 트랙 무한 스크롤
   - 사용자의 음악 감상 경험 확장을 위해 트랙 목록은 무한 스크롤로 로드


### ➃ 검색
<table>
  <tr>
    <td align="center">
      <img width="300" alt="검색 전" src="https://github.com/user-attachments/assets/4b1529af-5067-4cce-8c4e-d88475c11bba">
      <br><b>검색 전</b>
    </td>
    <td align="center">
      <img width="300" alt="검색결과1" src="https://github.com/user-attachments/assets/fa94b51e-fa33-4b91-b582-2f0fe5115d15">
      <br><b>검색결과1</b>
    </td>
        <td align="center">
      <img width="300" alt="검색결과2" src="https://github.com/user-attachments/assets/82fc4ca0-9be9-4628-a53a-f4dbe7a836a3">
      <br><b>검색결과2</b>
    </td>
  </tr>
</table>

### 빠르고 직관적인 검색
1. 검색
   - 상위 결과, 곡, 앨범으로 구분된 결과 제공
2. 재생
   - 곡은 개별 재생, 앨범은 전곡 일괄 재생


### ➄ 플레이리스트
<table>
  <tr>
    <td align="center">
      <img width="450" alt="플레이리스트" src="https://github.com/user-attachments/assets/b057ab96-8931-41f1-b8ad-273884157833">
      <br><b>플레이리스트</b>
    </td>
    <td align="center">
      <img width="450" alt="플레이리스트 생성" src="https://github.com/user-attachments/assets/247b12e6-459e-4e21-84f8-7ea57c5e7369">
      <br><b>플레이리스트 생성</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="300" alt="곡 추가" src="https://github.com/user-attachments/assets/c60f87fe-0514-4167-86ac-caa54874e2c7">
      <br><b>곡 추가</b>
    </td>
    <td align="center">
      <img width="300" alt="플레이리스트 상세" src="https://github.com/user-attachments/assets/d23816a0-8488-4f6b-b27d-c36875186b01">
      <br><b>플레이리스트 상세</b>
    </td>
        <td align="center">
      <img width="300" alt="플레이리스트 재생" src="https://github.com/user-attachments/assets/9fe4d749-6879-4ece-b965-b34ba879d74d">
      <br><b>플레이리스트 재생</b>
    </td>
  </tr>
</table>

### 나만의 플레이리스트 관리
1. 플레이리스트 생성, 삭제 및 곡 추가
2. 상세페이지에서 개별 재생, 전곡 재생 및 삭제


### ➅ 로그아웃
<table>
  <tr>
    <td align="center">
      <img width="300" alt="로그아웃" src="https://github.com/user-attachments/assets/43a391b7-5f7f-42e7-8680-57bb9cab6437">
      <br><b>로그아웃</b>
    </td>
  </tr>
</table>

### 간편한 드롭다운 기반의 로그아웃 기능
1. 홈 화면에서 프로필을 클릭하면 드롭다운 메뉴로 사용자 이름과 로그아웃 버튼이 표시


## 기술 스택

### **Frontend**
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### **Backend**
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

### **Open API**
![Spotify API](https://img.shields.io/badge/Spotify_API-1ED760?style=for-the-badge&logo=spotify&logoColor=white)

### **Deployment**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)


## Supabase
![Image](https://github.com/user-attachments/assets/84b535dd-aa76-4627-b1a6-9f2de2964c71)


## 시연 영상
[📽️ 시연 영상 보기 (Google Drive)](https://drive.google.com/file/d/1fy5EtcFYqMxAAKBsFGN_qwjvokLaBG-9/view?usp=sharing)  
**배포 사이트**: [https://goldenvinyl.vercel.app/](https://goldenvinyl.vercel.app/)


## ⚠️ 사용 시 주의사항!
GoldenVinyl은 Spotify Premium 계정이 필요하며, 사용 전 Spotify 사이트 또는 앱에서 한 번 재생 후 페이지를 새로고침해야 정상적으로 음악을 재생할 수 있습니다.
