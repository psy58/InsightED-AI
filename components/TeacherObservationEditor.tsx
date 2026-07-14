import React, { useState, useRef, DragEvent } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, DataSourceType } from '../types';
import { ChevronLeftIcon, MicrophoneIcon, PaperClipIcon, VideoCameraIcon, CameraIcon } from './icons';
import TeacherObservationPreview from './TeacherObservationPreview';
import VideoRecorderModal from './VideoRecorderModal';
import CameraCaptureModal from './CameraCaptureModal';
import { blobToBase64 } from '../utils';
import { transcribeAndSummarizeAudio, analyzeImage } from '../services/geminiService';

const TeacherObservationEditor = () => {
    const { selectedStudent, setCurrentView, addDataSource } = useAcroAppContext();
    const [observationDate, setObservationDate] = useState(new Date().toISOString().slice(0, 10));
    const [observationContext, setObservationContext] = useState('수업 시간');
    const [observationContent, setObservationContent] = useState('');
    const [teacherOpinion, setTeacherOpinion] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [processingError, setProcessingError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [mediaAttachment, setMediaAttachment] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!selectedStudent) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p>관찰 기록을 추가할 학생을 선택해주세요.</p>
                <button onClick={() => setCurrentView(View.TEACHER_OBSERVATION_DASHBOARD)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    관찰 기록 현황으로 돌아가기
                </button>
            </div>
        );
    }
    
    const appendContent = (newContent: string) => {
        setObservationContent(prev => prev ? `${prev}\n\n${newContent}` : newContent);
    };

    const processMedia = async (file: Blob, sourceName: string) => {
        setIsProcessing(true);
        setProcessingError('');
        setProcessingMessage(`'${sourceName}' 파일 분석 중...`);
        
        try {
            const base64Data = await blobToBase64(file);
            if (file.type.startsWith('image/')) {
                const result = await analyzeImage(base64Data, file.type);
                appendContent(result);
            } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                const result = await transcribeAndSummarizeAudio(base64Data, file.type);
                let contentToAppend = '';
                if (file.type.startsWith('video/') && result.visualDescription) {
                    contentToAppend += `### 영상 분석 결과\n${result.visualDescription}\n\n`;
                }
                if(result.transcription) {
                    contentToAppend += `### 내용 전체 (음성 전사)\n${result.transcription}\n\n`;
                }
                if(result.summary) {
                    contentToAppend += `### 핵심 요약\n${result.summary}`;
                }
                appendContent(contentToAppend.trim());
            } else {
                throw new Error('지원하지 않는 파일 형식입니다.');
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setMediaAttachment({
                    name: sourceName,
                    type: file.type,
                    dataUrl: reader.result as string
                });
            };

        } catch (error) {
            console.error(error);
            setProcessingError('미디어 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processMedia(file, file.name);
        }
    };
    
    const handleDragEvents = (e: DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent<HTMLTextAreaElement>) => {
        handleDragEvents(e);
        setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLTextAreaElement>) => {
        handleDragEvents(e);
        setDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
        handleDragEvents(e);
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processMedia(file, file.name);
        }
    };


    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            setProcessingError('');
            audioChunksRef.current = [];
            
            const options = { mimeType: 'audio/webm' };
            mediaRecorderRef.current = new MediaRecorder(stream, options);

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                processMedia(audioBlob, '음성 녹음.webm');
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();

        } catch (err) {
            setProcessingError('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleVideoCaptured = (videoBlob: Blob) => {
        setIsVideoModalOpen(false);
        processMedia(videoBlob, '영상 녹화.webm');
    };
    
    const handlePhotoCaptured = (imageBlob: Blob) => {
        setIsCameraModalOpen(false);
        processMedia(imageBlob, '촬영된 사진.jpeg');
    };

    const handleSave = () => {
        if (!selectedStudent) return;
        
        let content = `관찰일::${observationDate}\n관찰 상황::${observationContext}\n관찰 내용::${observationContent}\n교사 의견::${teacherOpinion}`;
        if (mediaAttachment) {
            content += `\n첨부파일::${mediaAttachment.name}`;
            content += `\n첨부파일타입::${mediaAttachment.type}`;
            content += `\n첨부파일데이터::${mediaAttachment.dataUrl}`;
        }
        
        addDataSource(selectedStudent.id, {
            type: DataSourceType.TeacherObservation,
            content: content,
        });

        alert(`${selectedStudent.name} 학생의 관찰 기록이 저장되었습니다.`);
        setCurrentView(View.TEACHER_OBSERVATION_DASHBOARD);
    };
    
    const formData = {
        studentName: `${selectedStudent.number}. ${selectedStudent.name}`,
        observationDate,
        observationContext,
        observationContent,
        teacherOpinion,
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.TEACHER_OBSERVATION_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{selectedStudent.number}. ${selectedStudent.name} 교사 관찰 기록</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50">미리보기</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">저장하기</button>
                    </div>
                </header>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">관찰일</label>
                            <input type="date" value={observationDate} onChange={e => setObservationDate(e.target.value)} className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">관찰 상황</label>
                            <input type="text" value={observationContext} onChange={e => setObservationContext(e.target.value)} placeholder="예: 수업 시간, 쉬는 시간, 점심 시간 등" className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">관찰 내용</label>
                             <div className="flex items-center gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*,image/*" className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"><PaperClipIcon />파일</button>
                                {!isRecording ? 
                                    (<button onClick={handleStartRecording} disabled={isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"><MicrophoneIcon />녹음</button>) : 
                                    (<button onClick={handleStopRecording} className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>중지</button>)
                                }
                                <button onClick={() => setIsCameraModalOpen(true)} disabled={isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"><CameraIcon/>사진</button>
                                <button onClick={() => setIsVideoModalOpen(true)} disabled={isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"><VideoCameraIcon/>영상</button>
                            </div>
                        </div>
                        {processingMessage && <div className="text-sm text-blue-600 mb-2 p-2 bg-blue-50 rounded-md flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{processingMessage}</span></div>}
                        {processingError && <p className="text-sm text-red-500 mb-2">{processingError}</p>}
                        {mediaAttachment && (
                             <div className="mb-2 p-2 bg-gray-100 rounded-md text-sm text-gray-700">
                                ✓ 첨부 완료: {mediaAttachment.name}
                                {mediaAttachment.type.startsWith('image/') && <img src={mediaAttachment.dataUrl} alt="preview" className="max-h-20 mt-2 rounded" />}
                            </div>
                        )}
                        <textarea 
                            rows={10} 
                            value={observationContent} 
                            onChange={e => setObservationContent(e.target.value)} 
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragEvents}
                            onDrop={handleDrop}
                            placeholder="학생의 행동, 발언, 표정, 상호작용 등을 객관적으로 기록하세요. 사진, 영상, 녹음 파일을 첨부 또는 끌어다 놓아 AI 분석을 요청할 수 있습니다." 
                            className={`w-full shadow-sm block sm:text-sm border-gray-300 rounded-md transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : ''}`}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">교사 의견</label>
                        <textarea
                            rows={4}
                            value={teacherOpinion}
                            onChange={e => setTeacherOpinion(e.target.value)}
                            placeholder="관찰 내용에 대한 교사의 주관적인 생각이나 느낌, 해석 등을 자유롭게 기록하세요."
                            className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                    </div>
                </div>
            </div>
            {isPreviewOpen && <TeacherObservationPreview formData={formData} onClose={() => setIsPreviewOpen(false)} />}
            {isVideoModalOpen && <VideoRecorderModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} onCapture={handleVideoCaptured} />}
            {isCameraModalOpen && <CameraCaptureModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handlePhotoCaptured} />}
        </>
    );
};

export default TeacherObservationEditor;