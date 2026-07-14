import React from 'react';

interface CounselingFormData {
    studentName: string;
    counselingDate: string;
    counselingMethod: string;
    counselor: string;
    mainIssues: string;
    summary: string;
    transcription: string;
    teacherAction: string;
}

interface PreviewProps {
    formData: CounselingFormData;
    onClose: () => void;
}

const ParentCounselingPreview: React.FC<PreviewProps> = ({ formData, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{formData.studentName} 학부모 상담 기록 미리보기</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-5">
                    <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-slate-50">
                        <div><strong className="text-gray-600">학생명:</strong> {formData.studentName}</div>
                        <div><strong className="text-gray-600">상담일:</strong> {formData.counselingDate}</div>
                        <div><strong className="text-gray-600">상담방법:</strong> {formData.counselingMethod}</div>
                        <div className="col-span-3"><strong className="text-gray-600">상담자:</strong> {formData.counselor}</div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">주요 안건</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[4rem]">{formData.mainIssues || '내용 없음'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">AI 핵심 요약</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[6rem]">{formData.summary || '내용 없음'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">음성 전사</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[8rem]">{formData.transcription || '내용 없음'}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 조치 및 계획</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[6rem]">{formData.teacherAction || '내용 없음'}</p>
                    </div>
                </div>
                 <footer className="p-4 bg-gray-50 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        닫기
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ParentCounselingPreview;