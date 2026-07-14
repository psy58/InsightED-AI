
import React from 'react';
import { SurveyQuestion } from '../types';

interface SurveyPreviewProps {
    questions: SurveyQuestion[];
    basicInfoFields: string[];
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ questions, basicInfoFields }) => {
    return (
        <div className="p-6">
            <h3 className="font-bold text-xl mb-2 text-center text-gray-800">보호자 기초조사서</h3>
            <p className="text-sm text-gray-600 text-center mb-6">학부모님께는 아래와 같이 표시됩니다.</p>
            
            <div className="bg-slate-50 p-6 rounded-md shadow-inner space-y-5 border">
                {/* Basic Info Section */}
                {basicInfoFields.length > 0 ? (
                    basicInfoFields.map((field, index) => (
                        <div key={`basic-${index}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field}</label>
                            <input
                                type="text"
                                disabled
                                placeholder={`${field}을(를) 입력해주세요.`}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic text-center">기초 정보 수집 항목이 없습니다.</p>
                )}

                <hr className="my-6 border-t" />

                {/* Custom Questions Section */}
                {questions.map((q, index) => (
                    <div key={q.id}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {index + 1}. {q.text || "질문 내용..."}
                        </label>
                        {q.type === 'choice' ? (
                            <div className="space-y-2 mt-2">
                                {q.options?.map((opt, optIndex) => (
                                    <label key={optIndex} className="flex items-center gap-2 cursor-not-allowed">
                                        <input type="radio" name={`q-${q.id}`} disabled className="h-4 w-4 text-blue-600 border-gray-300 bg-gray-100" />
                                        <span className="text-gray-700 text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                rows={3}
                                disabled
                                placeholder="답변을 입력해주세요."
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        )}
                    </div>
                ))}

                <div className="pt-4">
                    <button
                        type="button"
                        disabled
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md cursor-not-allowed opacity-70"
                    >
                        제출하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyPreview;
