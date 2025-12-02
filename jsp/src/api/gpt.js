const GEMINI_API_KEY = "AIzaSyBNIJAOAvCbw3tssR5uo5UyG1UCvGCmIFo";

export async function askGPT(userText) {
    try {
        const systemPrompt = `
당신은 전문 의약품 분석 AI 비서입니다.
모든 질문에 대해 다음의 8가지 형식으로만 출력합니다.

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
- 모든 질문에 대해 위 8가지 형식으로 답변
        `;

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `${systemPrompt}\n\n사용자 질문: ${userText}`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        const data = await res.json();
        if (!res.ok) {
            console.error("Gemini Error:", data);
            const errorMsg = data.error?.message || JSON.stringify(data);
            return `AI 요청 중 오류가 발생했습니다: ${errorMsg}`;
        }
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Gemini 응답 형식 오류:", data);
            return "AI 응답을 처리하는 중 오류가 발생했습니다.";
        }
    } catch (error) {
        console.error("Gemini 호출실패:", error);
        return `AI 요청 중 오류가 발생했습니다: ${error.message}`;
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
