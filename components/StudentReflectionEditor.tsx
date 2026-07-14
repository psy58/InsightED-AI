import React, { useState, useRef, DragEvent } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, DataSourceType } from '../types';
import { ChevronLeftIcon, PaperClipIcon, CameraIcon } from './icons';
import CameraCaptureModal from './CameraCaptureModal';
import { blobToBase64 } from '../utils';
import { analyzeReflectionDocument } from '../services/geminiService';

const StudentReflectionEditor = () => {
    const { selectedStudent, setCurrentView, addDataSource } = useAcroAppContext();
    const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().slice(0, 10));
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [summary, setSummary] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [teacherMemo, setTeacherMemo] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState('');
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!selectedStudent) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p>기록을 추가할 학생을 선택해주세요.</p>
                <button onClick={() => setCurrentView(View.STUDENT_REFLECTION_DASHBOARD)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    돌아가기
                </button>
            </div>
        );
    }
    
    const processImage = async (file: File) => {
        setIsProcessing(true);
        setProcessingError('');
        setOriginalImage(URL.createObjectURL(file));
        try {
            const base64Image = await blobToBase64(file);
            const result = await analyzeReflectionDocument(base64Image, file.type);
            setExtractedText(result.extractedText);
            setSummary(result.summary);
            setKeywords(result.keywords);
        } catch (error) {
            console.error(error);
            setProcessingError('이미지 분석 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };
    
    const handlePhotoCaptured = (imageBlob: Blob) => {
        setIsCameraModalOpen(false);
        const imageFile = new File([imageBlob], "captured_reflection.jpeg", { type: "image/jpeg" });
        processImage(imageFile);
    };

    const handleSave = () => {
        if (!selectedStudent || !originalImage) {
            alert('학생을 선택하고 문서를 업로드해주세요.');
            return;
        }
        
        const content = `제출일::${submissionDate}\n원본이미지::${originalImage}\n텍스트추출::${extractedText}\nAI요약::${summary}\n주요키워드::${keywords.join(', ')}\n교사메모::${teacherMemo}`;
        
        addDataSource(selectedStudent.id, {
            type: DataSourceType.StudentReflection,
            content: content,
        });

        alert(`${selectedStudent.name} 학생의 성찰 기록이 저장되었습니다.`);
        setCurrentView(View.STUDENT_REFLECTION_DASHBOARD);
    };

    const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        } else {
            setProcessingError('이미지 파일만 업로드할 수 있습니다.');
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.STUDENT_REFLECTION_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{selectedStudent.number}. {selectedStudent.name} 학생 성찰 기록 추가</h2>
                    </div>
                    <button onClick={handleSave} disabled={!originalImage || isProcessing} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-300">
                        저장하기
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Uploader and Original Image */}
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제출 날짜</label>
                            <input type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} className="w-full md:w-2/3 shadow-sm block sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div 
                            className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-slate-50 hover:bg-slate-100'}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragEvents}
                            onDrop={handleDrop}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <p className="font-semibold text-gray-700">문서 이미지 파일 선택</p>
                            <p className="text-sm text-gray-500">클릭하거나 파일을 여기로 끌어다 놓으세요.</p>
                        </div>
                        <button onClick={() => setIsCameraModalOpen(true)} className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <CameraIcon /> 사진 찍어 올리기
                        </button>
                        
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-800 mb-2">원본 보기</h4>
                            <div className="p-2 border rounded-md bg-gray-100 min-h-[200px] flex items-center justify-center">
                                {isProcessing && <p className="text-blue-600">AI 분석 중...</p>}
                                {processingError && <p className="text-red-600">{processingError}</p>}
                                {originalImage && !isProcessing && <img src={originalImage} alt="원본 성찰 기록" className="max-w-full max-h-[60vh] object-contain"/>}
                                {!originalImage && !isProcessing && <p className="text-gray-400">이미지를 업로드하세요</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Analysis & Memo */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">텍스트 추출 결과 (수정 가능)</label>
                            <textarea rows={10} value={extractedText} onChange={e => setExtractedText(e.target.value)} className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">AI 요약문</label>
                            <div className="p-3 bg-slate-100 rounded-md text-gray-800 text-sm min-h-[80px] whitespace-pre-wrap">{summary}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">주요 키워드</label>
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-md min-h-[40px]">
                                {keywords.map((kw, i) => <span key={i} className="px-2 py-1 bg-sky-200 text-sky-800 text-xs font-semibold rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">교사 메모</label>
                            <textarea rows={4} value={teacherMemo} onChange={e => setTeacherMemo(e.target.value)} placeholder="분석 결과에 대한 교사의 의견이나 추가 기록" className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            {isCameraModalOpen && <CameraCaptureModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handlePhotoCaptured} />}
        </>
    );
};

export default StudentReflectionEditor;