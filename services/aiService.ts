
import { requestAI } from "./openaiClient";
import { Student, DataSource, DataSourceType } from '../types';
import { MOCK_PEER_RELATIONSHIP_RESULTS, MOCK_STUDENTS } from '../constants';


export interface DataFilter {
    startDate?: string;
    endDate?: string;
    selectedTypes?: DataSourceType[];
}

const getDateFromContent = (content: string): Date | null => {
    // Try to find standard date patterns in content (e.g., 상담일::2024-05-20, 관찰일::2024-04-15, 제출일::2024-06-12)
    const dateMatch = content.match(/(상담일|관찰일|제출일|실시일)::\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        return new Date(dateMatch[2]);
    }
    return null;
};

const filterDataSources = (student: Student, filter?: DataFilter): DataSource[] => {
    if (!filter) return student.dataSources;

    let filtered = student.dataSources;

    // 1. Filter by Type
    if (filter.selectedTypes && filter.selectedTypes.length > 0) {
        const typeSet = new Set(filter.selectedTypes);
        filtered = filtered.filter(ds => typeSet.has(ds.type));
    }

    // 2. Filter by Date Range
    if (filter.startDate || filter.endDate) {
        const start = filter.startDate ? new Date(filter.startDate) : new Date('1900-01-01');
        const end = filter.endDate ? new Date(filter.endDate) : new Date('2100-12-31');
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);

        filtered = filtered.filter(ds => {
            const date = getDateFromContent(ds.content);
            // If content has a date, check range. If no date (e.g. survey profile), keep it unless strict logic needed.
            // Here we keep items without dates (like Surveys often are) to ensure context isn't lost,
            // unless we want strict filtering. Let's assume if it has a date key, filter it.
            if (date) {
                return date >= start && date <= end;
            }
            return true; // Keep data without explicit dates (like basic surveys)
        });
    }

    return filtered;
};

const formatDataSource = (ds: DataSource): string => {
  let content = ds.content;
  // For Teacher Observation records, filter out the base64 data to reduce prompt size.
  // The AI-generated text description is already part of the content.
  if (ds.type === DataSourceType.TeacherObservation && content.includes('첨부파일데이터::')) {
      content = content.split('\n').filter(line => !line.startsWith('첨부파일데이터::')).join('\n');
  }
  return `--- ${ds.type} ---\n${content}\n\n`;
};

const formatPeerRelationshipData = (student: Student): string => {
    const studentName = student.name;
    const results = MOCK_PEER_RELATIONSHIP_RESULTS;
    const allStudentNames = MOCK_STUDENTS.map(s => s.name);

    // 1. Student's own ratings
    const ownRatingsData = results.closenessRatings[studentName as keyof typeof results.closenessRatings];
    let ownRatingsSummary = '응답 없음';
    if (ownRatingsData) {
        const ratingsArray = Object.values(ownRatingsData);
        if (ratingsArray.length > 0) {
            const avgRating = ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length;
            ownRatingsSummary = `평균 ${avgRating.toFixed(1)}점`;
        }
    }

    // 2. Ratings received from others
    let receivedScore = 0;
    allStudentNames.forEach(otherStudentName => {
        if (otherStudentName === studentName) return;
        const otherStudentRatings = results.closenessRatings[otherStudentName as keyof typeof results.closenessRatings];
        if (otherStudentRatings && otherStudentRatings[studentName as keyof typeof otherStudentRatings]) {
            receivedScore += otherStudentRatings[studentName as keyof typeof otherStudentRatings];
        }
    });

    // 3. Custom question responses by the student
    const customResponses: string[] = [];
    results.customQuestionResponses.forEach(q => {
        const answer = q.answers[studentName as keyof typeof q.answers];
        const answerText = Array.isArray(answer) ? answer.join(', ') : (answer || '응답 없음');
        customResponses.push(`- "${q.question}": ${answerText}`);
    });

    // 4. Nominations from others in custom questions
    const nominations: string[] = [];
    results.customQuestionResponses.forEach(q => {
        let count = 0;
        Object.values(q.answers).forEach(nominated => {
            if (Array.isArray(nominated)) {
                if (nominated.includes(studentName)) {
                    count++;
                }
            } else {
                if (nominated === studentName) {
                    count++;
                }
            }
        });
        nominations.push(`- "${q.question}": ${count}회 지목됨`);
    });

    return `
--- 교우 관계 설문 결과 (2024년 5월) ---
[친밀도 점수 요약]
- 본인이 다른 친구들에게 매긴 평균 점수: ${ownRatingsSummary}
- 다른 친구들에게 받은 총 친밀도 점수: ${receivedScore}점

[추가 질문 답변]
${customResponses.join('\n')}

[추가 질문에서 지목된 횟수]
${nominations.join('\n')}

`;
};


export const generateDataSummary = async (student: Student, filter?: DataFilter): Promise<string> => {
    const filteredSources = filterDataSources(student, filter);
    
    const regularData = filteredSources
      .filter(ds => ds.content && ds.content.trim() !== '')
      .map(formatDataSource)
      .join('');
    
    // Include peer data only if not specifically filtered out or if type filter isn't used
    // However, peer data is special. Let's include it unless types are selected and PeerRelationshipSurvey isn't one of them.
    let peerData = '';
    if (!filter?.selectedTypes || filter.selectedTypes.includes(DataSourceType.PeerRelationshipSurvey)) {
        peerData = formatPeerRelationshipData(student);
    }

    const allData = regularData + peerData;

    if (!allData.trim()) {
        return "선택한 조건에 해당하는 데이터가 없습니다.";
    }

    const prompt = `
# [AI 역할 정의]
너는 '학생 데이터 관리 서비스'에 탑재된 전문 AI 어시스턴트이다. 너의 임무는 교사가 학생에 대한 모든 데이터를 한눈에 파악할 수 있도록, 흩어진 기록들을 객관적으로 요약하고 정리하는 것이다.

# [분석 대상 학생]
${student.name}

# [사용 가능한 데이터 소스]
${allData}

# [미션]
**어떠한 분석, 추론, 제언도 하지 마시오.**
오직 [사용 가능한 데이터 소스]에 있는 내용을 기반으로, 각 데이터 소스별 핵심 내용을 객관적으로 요약하여 Markdown 형식으로 정리하라.
- 각 데이터 소스(예: 학부모 기초조사서, 학생 상담 기록)별로 섹션을 구분하라.
- 각 섹션에는 해당 기록의 핵심 내용만 간결하게 불렛 포인트(bullet points)로 요약한다.
- 날짜나 주요 안건 등 핵심 정보는 반드시 포함한다.
- 모든 내용은 원본 데이터에 있는 사실만을 전달해야 한다.

# [리포트 형식 (Markdown)]
### ${student.name} 학생 데이터 모아보기
- **생성 일시:** ${new Date().toLocaleString('ko-KR')}

---

#### 학부모 기초조사서
- (핵심 내용 요약)
- (핵심 내용 요약)

#### 학생 상담 기록
- **(상담일):** (주요 안건 및 내용 요약)
- **(상담일):** (주요 안건 및 내용 요약)

(이하 다른 데이터 소스들도 동일한 형식으로 반복)
    `;

    return requestAI<string>({ action: "summary", prompt });
};

export const generateFocusedReport = async (student: Student, topics: string[], filter?: DataFilter): Promise<string> => {
    const filteredSources = filterDataSources(student, filter);

    const regularData = filteredSources
      .filter(ds => ds.content && ds.content.trim() !== '')
      .map(formatDataSource)
      .join('');
      
    let peerData = '';
    if (!filter?.selectedTypes || filter.selectedTypes.includes(DataSourceType.PeerRelationshipSurvey)) {
        peerData = formatPeerRelationshipData(student);
    }

    const allData = regularData + peerData;

    if (!allData.trim()) {
         return "선택한 조건에 해당하는 데이터가 없습니다.";
    }

    const prompt = `
# [AI 역할 정의]
너는 '학생 데이터 관리 서비스'에 탑재된 전문 AI 어시스턴트이다. 너의 사용자는 초등학교 교사이며, 너의 임무는 교사가 학생에 대한 데이터를 기반으로 실천적인(actionable) 인사이트를 얻도록 돕는 것이다.

# [분석 대상 학생]
${student.name}

# [사용 가능한 데이터 소스]
${allData}

# [교사의 분석 요청 주제]
${topics.map(t => `- ${t}`).join('\n')}

# [미션]
위 [교사의 분석 요청 주제]들에 대해 [사용 가능한 데이터 소스]를 기반으로 심층 분석하라.
반드시 아래 [리포트 형식]을 준수하여 Markdown 형식으로 작성해야 한다.

- **분석 원칙:**
    - **주제별 섹션 구분:** 요청받은 각 주제마다 반드시 '#### [주제명]' 형식의 헤더를 사용하여 섹션을 명확히 구분해야 한다. 이렇게 해야 사용자가 그리드 형태로 내용을 볼 수 있다.
    - **데이터 기반:** 모든 분석 내용은 반드시 [사용 가능한 데이터 소스]에 근거해야 하며, 추측이 아닌 사실 기반으로 서술한다. 내용을 인용할 때는 어떤 기록에서 왔는지 간략히 언급한다.
    - **통합적 사고:** 각 주제 내에서는 다양한 데이터 소스를 연결하여 깊이 있는 내용을 도출한다.

# [리포트 형식 (Markdown)]
### ${student.name} 학생 AI 분석 리포트 (${topics.join(', ')})
- **생성 일시:** ${new Date().toLocaleString('ko-KR')}
- **분석 근거:** (분석에 주로 사용된 데이터 소스 명시. 예: 교사 관찰 기록 3건, 학부모 상담 기록 1건)

${topics.map(topic => `#### ${topic}\n(${topic}에 대한 상세 분석 내용 작성)`).join('\n\n')}

#### 교사 제언 (Actionable Insight)
(분석 내용을 종합하여 교사가 교실에서 즉시 시도해볼 수 있는 구체적이고 실천적인 제안 2가지 이상.)
    `;

    return requestAI<string>({ action: "report", prompt });
};


export const generateCounselingScenario = async (student: Student, type: '학생' | '학부모', filter?: DataFilter): Promise<string> => {
  const filteredSources = filterDataSources(student, filter);
  
  const allData = filteredSources
    .filter(ds => ds.content && ds.content.trim() !== '')
    .map(formatDataSource)
    .join('');

  if (!allData.trim()) {
      return "선택한 조건에 해당하는 데이터가 부족하여 시나리오를 생성할 수 없습니다.";
  }

  const prompt = `
    당신은 15년차 이상의 베테랑 초등학교 전문 상담 교사입니다. 학생(${student.name})에 대한 아래의 모든 데이터를 종합적으로 분석하되, 특히 '학부모 상담 신청' 내용을 핵심적으로 반영하여 ${type} 상담을 위한 가이드를 생성해주세요.

    결과는 복잡한 대화 형식이 아닌, 아래의 네 가지 핵심 항목으로 구성된 간결하고 명확한 분석 리포트 형식이어야 합니다. 각 항목은 전문적인 상담 지식에 기반하여 한 문단 정도로 요약해주세요. 빠르고 간결하게 생성해야 합니다.

    결과는 반드시 다음 Markdown 형식을 따라야 합니다:

    ### 학생의 현재 상태
    학생의 교우관계, 학업, 정서 등 전반적인 상태를 데이터에 근거하여 객관적으로 분석해주세요.

    ### 학부모가 언급한 고민
    학부모 상담 신청서에 나타난 핵심 고민이 무엇인지 요약하고, 그 원인을 데이터와 연결하여 추측해주세요. (만약 관련 신청서가 없다면, 기존 상담 기록이나 관찰 기록에서 드러난 주된 이슈를 언급해주세요.)

    ### 문제 상황 분석
    학생이 겪고 있는 핵심적인 어려움이 무엇인지 구체적인 데이터(상담, 관찰 기록 등)를 근거로 명확하게 정의해주세요.

    ### 학교와 가정에서의 지원 방안
    문제 상황을 해결하고 학생의 성장을 돕기 위해 학교(교사)와 가정이 각각 실천할 수 있는 구체적이고 실용적인 방안을 2~3가지 제안해주세요.

    --- 학생 데이터 ---
    학생 이름: ${student.name}
    ${allData}
    ---
  `;

  return requestAI<string>({ action: "scenario", prompt });
};


export const transcribeAndSummarizeAudio = async (base64Audio: string, mimeType: string): Promise<{ transcription: string; summary: string; visualDescription: string }> => {
    if (mimeType.startsWith('video/')) {
        throw new Error('영상 자동 분석은 현재 지원하지 않습니다. 음성 파일 또는 사진으로 등록해 주세요.');
    }
    return requestAI({ action: 'audio', data: base64Audio, mimeType });
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> =>
    requestAI({ action: 'image', data: base64Image, mimeType });

export const analyzeReflectionDocument = async (base64Image: string, mimeType: string): Promise<{ extractedText: string; summary: string; keywords: string[] }> =>
    requestAI({ action: 'reflection', data: base64Image, mimeType });
