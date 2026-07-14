
import React, { useMemo } from 'react';
import { Student, DataSource, DataSourceType } from '../types';
import { BASIC_INFO_FIELDS, DEFAULT_PARENT_SURVEY_QUESTIONS, DEFAULT_STUDENT_SURVEY_QUESTIONS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, MicrophoneIcon } from './icons';

interface DataSourceContentModalProps {
    student: Student;
    dataSource: DataSource;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
}

const parseKeyValueContent = (content: string): Map<string, string> => {
    const dataMap = new Map<string, string>();
    const lines = content.split('\n');
    for (const line of lines) {
        const parts = line.split('::');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('::').trim();
            dataMap.set(key, value);
        }
    }
    return dataMap;
};

const parseReflectionContent = (content: string): Map<string, string> => {
    const dataMap = new Map<string, string>();
    const lines = content.split('\n');
    let lastKey: string | null = null;
    for (const line of lines) {
        const parts = line.split('::');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('::').trim();
            dataMap.set(key, value);
            lastKey = key;
        } else if (lastKey) {
            const existingValue = dataMap.get(lastKey) || '';
            dataMap.set(lastKey, existingValue + '\n' + line);
        }
    }
    return dataMap;
};

const DataSourceContentModal: React.FC<DataSourceContentModalProps> = ({ student, dataSource, onClose, onPrev, onNext }) => {
    
    const parsedData = useMemo(() => {
        return parseKeyValueContent(dataSource.content);
    }, [dataSource.content]);

    const titleMap = {
        [DataSourceType.ParentSurvey]: `${student.name} 학부모 기초조사서`,
        [DataSourceType.StudentSurvey]: `${student.name} 학생 기초조사서`,
        [DataSourceType.ParentCounseling]: `${student.name} 학부모 상담 기록`,
        [DataSourceType.StudentCounseling]: `${student.name} 학생 상담 기록`,
        [DataSourceType.SchoolViolenceSurvey]: `${student.name} 학교폭력 설문 결과`,
        [DataSourceType.RestorativeReflection]: `${student.name} 회복적 성찰문`,
        [DataSourceType.TeacherObservation]: `${student.name} 교사 관찰 기록`,
        [DataSourceType.StudentReflection]: `${student.name} 학생 성찰 기록`,
    };

    const renderSurveyContent = () => {
        const questions = dataSource.type === DataSourceType.ParentSurvey 
            ? DEFAULT_PARENT_SURVEY_QUESTIONS 
            : DEFAULT_STUDENT_SURVEY_QUESTIONS;

        return (
            <div className="bg-slate-50 p-6 rounded-md shadow-inner space-y-5 border">
                {dataSource.type === DataSourceType.ParentSurvey && (
                    <>
                        {BASIC_INFO_FIELDS.map((field, index) => (
                             <div key={`basic-${index}`}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field}</label>
                                <textarea
                                    rows={1}
                                    disabled
                                    value={parsedData.get(field) || '답변 없음'}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed resize-none"
                                />
                            </div>
                        ))}
                        <hr className="my-6 border-t" />
                    </>
                )}

                {questions.map((q, index) => (
                    <div key={q.id}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {index + 1}. {q.text}
                        </label>
                        <textarea
                            rows={3}
                            disabled
                            value={parsedData.get(q.text) || '답변 없음'}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                ))}
            </div>
        );
    }

    const renderCounselingContent = () => {
        return (
             <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
                    <div>
                        <strong className="text-gray-600 block text-sm">상담일:</strong>
                        <span className="text-gray-800">{parsedData.get('상담일') || '기록 없음'}</span>
                    </div>
                    <div>
                        <strong className="text-gray-600 block text-sm">상담 방법:</strong>
                        <span className="text-gray-800">{parsedData.get('상담 방법') || '기록 없음'}</span>
                    </div>
                     <div className="col-span-1 sm:col-span-2">
                        <strong className="text-gray-600 block text-sm">상담자:</strong>
                        <span className="text-gray-800">{parsedData.get('상담자') || '기록 없음'}</span>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">주요 안건</h4>
                    <p className="text-gray-700 whitespace-pre-wrap p-2 bg-slate-50 rounded">{parsedData.get('주요 안건') || '내용 없음'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">상담 내용</h4>
                    <p className="text-gray-700 whitespace-pre-wrap p-2 bg-slate-50 rounded">{parsedData.get('상담 내용') || dataSource.content}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 조치 및 계획</h4>
                    <p className="text-gray-700 whitespace-pre-wrap p-2 bg-slate-50 rounded">{parsedData.get('교사 조치 및 계획') || '내용 없음'}</p>
                </div>
            </div>
        )
    }
    
    const renderObservationContent = () => {
        const attachmentName = parsedData.get('첨부파일');
        const attachmentType = parsedData.get('첨부파일타입');
        const attachmentData = parsedData.get('첨부파일데이터');

        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
                    <div>
                        <strong className="text-gray-600 block text-sm">관찰일:</strong>
                        <span className="text-gray-800">{parsedData.get('관찰일') || '기록 없음'}</span>
                    </div>
                    <div>
                        <strong className="text-gray-600 block text-sm">관찰 상황:</strong>
                        <span className="text-gray-800">{parsedData.get('관찰 상황') || '기록 없음'}</span>
                    </div>
                </div>
                
                {attachmentData && (
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">첨부 파일: {attachmentName}</h4>
                        <div className="p-3 bg-slate-50 rounded-lg flex justify-center">
                            {attachmentType?.startsWith('image/') && <img src={attachmentData} alt={attachmentName} className="max-w-full max-h-96 object-contain rounded-md" />}
                            {attachmentType?.startsWith('audio/') && <audio controls src={attachmentData} className="w-full" />}
                            {attachmentType?.startsWith('video/') && <video controls src={attachmentData} className="max-w-full max-h-96 rounded-md" />}
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">관찰 내용</h4>
                    <p className="text-gray-700 whitespace-pre-wrap p-2 bg-slate-50 rounded">{parsedData.get('관찰 내용') || (parsedData.size === 0 ? dataSource.content : '내용 없음')}</p>
                </div>
            </div>
        );
    }

    const renderReflectionContent = () => {
        const parsedReflectionData = parseReflectionContent(dataSource.content);
        const keywords = parsedReflectionData.get('주요키워드')?.split(', ') || [];

        return (
            <div className="space-y-5">
                <div className="p-4 border rounded-lg bg-slate-50">
                    <strong className="text-gray-600 block text-sm">제출일:</strong>
                    <span className="text-gray-800">{parsedReflectionData.get('제출일') || '기록 없음'}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">원본 이미지</h4>
                            <div className="p-2 border rounded-md bg-gray-100 flex items-center justify-center">
                                <img src={parsedReflectionData.get('원본이미지')} alt="원본 성찰 기록" className="max-w-full max-h-[50vh] object-contain"/>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 메모</h4>
                            <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-100 rounded min-h-[6rem]">{parsedReflectionData.get('교사메모') || '메모 없음'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">AI 요약문</h4>
                            <p className="text-gray-700 p-3 bg-slate-100 rounded min-h-[5rem]">{parsedReflectionData.get('AI요약') || '요약 없음'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">주요 키워드</h4>
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-md min-h-[40px]">
                            {keywords.map((kw, i) => kw && <span key={i} className="px-2 py-1 bg-sky-200 text-sky-800 text-xs font-semibold rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">추출된 텍스트</h4>
                            <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-100 rounded min-h-[8rem]">{parsedReflectionData.get('텍스트추출') || '추출된 텍스트 없음'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderDefaultContent = () => (
         <pre className="whitespace-pre-wrap font-sans text-gray-700">{dataSource.content}</pre>
    )

    const renderContent = () => {
        switch(dataSource.type) {
            case DataSourceType.ParentSurvey:
            case DataSourceType.StudentSurvey:
                return renderSurveyContent();
            case DataSourceType.ParentCounseling:
            case DataSourceType.StudentCounseling:
                return renderCounselingContent();
            case DataSourceType.TeacherObservation:
                return renderObservationContent();
            case DataSourceType.StudentReflection:
                return renderReflectionContent();
            default:
                return renderDefaultContent();
        }
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            {onPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-50 hidden md:block"
                    aria-label="이전 학생"
                >
                    <ChevronLeftIcon className="w-10 h-10" />
                </button>
            )}
            {onNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-50 hidden md:block"
                    aria-label="다음 학생"
                >
                    <ChevronRightIcon className="w-10 h-10" />
                </button>
            )}

            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{titleMap[dataSource.type] || dataSource.type}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DataSourceContentModal;
