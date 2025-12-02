const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function askGPT(userText) {
    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `
당신은 전문 의약품 분석 AI 비서입니다.
사용자의 질문 성격에 따라 3가지 모드 중 하나를 자동 선택해 출력합니다.

====================================================
[A 모드: 상세 분석 모드 → 1~8 전체 구조 출력]
====================================================
다음 단어 중 하나라도 포함되면 A 모드를 사용합니다.

키워드:
"분석", "상세", "자세히", "자세한 설명", "성분 분석", 
"주의사항", "병용", "함께 먹어도", "상호작용", "인터랙션",
"부작용", "약 정보", "성분 알려줘"

출력 형식 :
1) 약 소개
2) 주요 성분
3) 효능 / 효과
4) 복용 시 주의사항
5) 함께 복용하면 안 되는 약물
6) 권장 복용법
7) 대체 약품
8) 추가 참고 정보

규칙:
- 항목 제목 삭제 금지
- 순서 변경 금지
- 한국어로만 작성


====================================================
[B 모드: 증상 기반 질문 → 간단 추천 모드]
====================================================
질문에 다음 키워드 포함 시 사용합니다.

키워드:
"증상", "아픈데", "통증", "두통", "감기", "몸살", "기침",
"열", "복통", "콧물", "코막힘", "추천", "뭐 먹지", 
"무슨 약", "약 뭐가 좋아"

출력 형식:
📌 추천 약품 (최대 3개)
- 약 이름 + 용량 (가능할 경우)
- 핵심 효능 1~2개

📌 주의사항
- 핵심 위험군만 간단히


====================================================
[C 모드: 약 이름만 있을 때 → 간단 요약 모드]
====================================================
사용자 질문이 아래 패턴과 유사하면 C 모드 적용:

예시:
- “타이레놀?”
- “펜잘은?”
- “약은?”
- “이 약 뭐야?”
- “어떤 약이야?”
- "타이레놀 설명"
- "브루펜?"

출력 형식:
📌 약 이름
📌 주요 성분
📌 주요 효과
📌 기본 주의사항(한 줄)


====================================================
🟧 공통 규칙
====================================================
✔ 출력은 항상 한국어
✔ 틀린 의학 정보 절대 금지
✔ 표(테이블) 사용 금지, bullet 사용
✔ 브랜드명 & 성분명 함께 제공
                        `
                    },
                    {
                        role: "user",
                        content: userText,
                    },
                ],
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("GPT Error:", data);
            return "GPT 요청 중 오류가 발생했습니다.";
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error("GPT 호출실패:", error);
        return "GPT 요청 중 오류가 발생했습니다.";
    }
}

/* -------------------------------------------------------
   🔥 여기부터 OCR → 약 이름 추출용 GPT 함수 추가
--------------------------------------------------------- */
// OCR → 약 여러 개 추출 → 개별 분석 → 상호작용 분석
export async function analyzeAllMedicinesFromOCR(ocrText) {
    // 1️⃣ OCR → 약 이름 여러 개 추출
    const extractedList = await askGPT(`
다음은 약 봉투에서 OCR로 추출한 텍스트입니다.

규칙:
- 약 이름만 1~5개 추출
- 줄바꿈으로 구분하여 출력
- OCR 오류는 최대한 보정
- 설명, 용량 등은 제거하고 이름만 출력

OCR 내용:
${ocrText}
    `);

    // 약 리스트 가공
    const medicines = extractedList
        .split("\n")
        .map(v => v.trim())
        .filter(v => v.length > 0);

    // 2️⃣ 각 약에 대해 개별 분석(A 모드 유도)
    const analysisResults = [];
    for (const med of medicines) {
        const res = await askGPT(`
"${med}" 성분 분석
주의사항 상세하게 알려줘
상호작용도 포함해서 분석해줘
        `);
        analysisResults.push({
            name: med,
            analysis: res,
        });
    }

    // 3️⃣ 여러 약을 함께 먹을 때의 병용 상호작용 분석
    const combinedInteraction = await askGPT(`
다음 약들을 환자가 동시에 복용할 예정입니다.

약 목록:
${medicines.join(", ")}

출력 규칙:
- 병용 시 위험한 조합
- 서로 부딪히는 성분
- 간/신장에 부담되는 조합
- 피해야 하는 보조식품
- 복용 간격 권장
- 전체 종합 주의사항
    `);

    return {
        medicines,              // 추출된 약 리스트
        analysisResults,        // 약별 상세 분석
        combinedInteraction,    // 여러 약 병용 시 주의사항
    };
}
