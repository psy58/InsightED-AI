
import React from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { SurveyQuestion } from '../types';

interface PeerRelationshipSurveyPreviewProps {
    customQuestions: SurveyQuestion[];
}

const PeerRelationshipSurveyPreview: React.FC<PeerRelationshipSurveyPreviewProps> = ({ customQuestions }) => {
    const { students } = useAcroAppContext();
    // For preview purposes, let's assume '강지우' is taking the survey
    const surveyTaker = students.find(s => s.name === '강지우') || students[0];
    const classmates = students.filter(s => s.id !== surveyTaker?.id);

    return (
        <div className="p-6">
            <h3 className="font-bold text-xl mb-2 text-center text-gray-800">교우 관계 설문</h3>
            <p className="text-sm text-gray-600 text-center mb-6">학생에게는 아래와 같이 표시됩니다. (예: {surveyTaker?.name} 학생 화면)</p>
            
            <div className="bg-slate-50 p-6 rounded-md shadow-inner space-y-8 border">
                {/* Mandatory Question Section */}
                <div>
                    <h4 className="block text-md font-semibold text-gray-800 mb-1.5">
                        1. 나를 제외한 모든 친구들과 얼마나 친한가요?
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                        (1점: 전혀 안 친함, 2점: 안 친함, 3점: 보통, 4점: 친함, 5점: 매우 친함)
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {classmates.map(student => (
                            <div key={student.id} className="grid grid-cols-12 items-center gap-2 p-2 bg-white rounded-md border">
                                <div className="col-span-4 flex items-center gap-2">
                                    <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium text-gray-700">{student.name}</span>
                                </div>
                                <div className="col-span-8 flex justify-around">
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <label key={score} className="flex flex-col items-center cursor-not-allowed opacity-70">
                                            <input type="radio" name={`student-${student.id}`} value={score} disabled className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-xs mt-1">{score}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Questions Section */}
                {customQuestions.map((q, index) => (
                    <div key={q.id}>
                        <label className="block text-md font-semibold text-gray-800 mb-2">
                            {index + 2}. {q.text || "질문 내용..."}
                        </label>
                        <input
                            type="text"
                            disabled
                            placeholder="친구 이름을 입력해주세요."
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                        {q.askReason && (
                            <input
                                type="text"
                                disabled
                                placeholder="그 친구를 선택한 이유를 적어주세요."
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm cursor-not-allowed"
                            />
                        )}
                         <p className="text-xs text-gray-500 mt-1">
                            (실제 화면에서는 학생 목록에서 선택하는 방식으로 제공될 수 있습니다.)
                        </p>
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

export default PeerRelationshipSurveyPreview;
