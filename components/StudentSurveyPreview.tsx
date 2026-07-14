
import React from 'react';
import { SurveyQuestion } from '../types';

interface StudentSurveyPreviewProps {
    questions: SurveyQuestion[];
}

const StudentSurveyPreview: React.FC<StudentSurveyPreviewProps> = ({ questions }) => {
    return (
        <div className="p-6">
            <h3 className="font-bold text-xl mb-2 text-center text-gray-800">학생 기초조사서</h3>
            <p className="text-sm text-gray-600 text-center mb-6">학생에게는 아래와 같이 표시됩니다.</p>
            
            <div className="bg-slate-50 p-6 rounded-md shadow-inner space-y-5 border">
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

export default StudentSurveyPreview;
