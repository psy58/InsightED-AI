import React from 'react';
import { SurveyQuestion } from '../types';

interface PreviewProps {
    isOpen: boolean;
    onClose: () => void;
    customQuestions: SurveyQuestion[];
}

const ParentCounselingRequestPreview: React.FC<PreviewProps> = ({ isOpen, onClose, customQuestions }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">상담 신청 설문 미리보기</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="bg-slate-50 p-6 rounded-md shadow-inner space-y-6 border">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">학생 이름</label>
                            <input type="text" disabled placeholder="학생 이름을 입력해주세요." className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">상담 신청자 관계</label>
                            <select disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
                                <option>어머니</option>
                                <option>아버지</option>
                                <option>기타</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">상담 방법</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center"><input type="radio" name="method" disabled className="h-4 w-4" /> <span className="ml-2">전화</span></label>
                                <label className="flex items-center"><input type="radio" name="method" disabled className="h-4 w-4" /> <span className="ml-2">대면</span></label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">상담 신청 이유</label>
                            <textarea
                                rows={4}
                                disabled
                                placeholder="예시: 학업 성취도 관련 문의, 친구 관계 관련 문의, 진로 상담 희망 등 구체적으로 기입해 주십시오."
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        
                        {customQuestions.length > 0 && <hr className="my-6 border-t" />}
                        
                        {customQuestions.map((q, index) => (
                            <div key={q.id}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    {index + 1}. {q.text || "질문 내용..."}
                                </label>
                                <textarea
                                    rows={3}
                                    disabled
                                    placeholder="답변을 입력해주세요."
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        ))}

                        <div className="pt-4">
                            <button type="button" disabled className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md cursor-not-allowed opacity-70">
                                제출하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentCounselingRequestPreview;