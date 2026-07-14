import React, { useState, useRef, useEffect } from 'react';
import { SwitchCameraIcon } from './icons';

interface VideoRecorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (blob: Blob) => void;
}

const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>();

    useEffect(() => {
        let mediaStream: MediaStream | null = null;
        
        const cleanup = () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
             if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setStream(null);
        };

        if (isOpen) {
            const startStream = async () => {
                cleanup();
                setError('');
                try {
                    let devices = videoDevices;
                    if (devices.length === 0) {
                        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        tempStream.getTracks().forEach(track => track.stop());
                        const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
                        devices = enumeratedDevices.filter(d => d.kind === 'videoinput');
                        setVideoDevices(devices);
                    }

                    let deviceId = currentDeviceId;
                    if (!deviceId && devices.length > 0) {
                        const rearCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
                        deviceId = rearCam ? rearCam.deviceId : devices[0].deviceId;
                        setCurrentDeviceId(deviceId);
                        return; // Let effect re-run
                    }

                    if (deviceId) {
                        const constraints = { video: { deviceId: { exact: deviceId } }, audio: true };
                        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                        setStream(mediaStream);
                        if (videoRef.current) {
                            videoRef.current.srcObject = mediaStream;
                        }
                    } else if (devices.length > 0) {
                        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        setStream(mediaStream);
                        if (videoRef.current) {
                           videoRef.current.srcObject = mediaStream;
                       }
                   } else {
                       setError('사용 가능한 카메라가 없습니다.');
                   }
                } catch (err) {
                    console.error("Error accessing media devices.", err);
                    setError('카메라와 마이크에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
                }
            };
            startStream();
        } else {
            cleanup();
        }

        return cleanup;
    }, [isOpen, currentDeviceId, videoDevices]);

    const handleSwitchCamera = () => {
        if (videoDevices.length > 1 && !isRecording) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setCurrentDeviceId(videoDevices[nextIndex].deviceId);
        }
    };

    const handleStartRecording = () => {
        if (!stream) return;
        setIsRecording(true);
        const recordedChunks: Blob[] = [];
        const options = { mimeType: 'video/webm; codecs=vp9,opus' };
        mediaRecorderRef.current = new MediaRecorder(stream, options);

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            onCapture(blob);
        };

        mediaRecorderRef.current.start();
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col p-4 shadow-xl">
                <header className="flex-shrink-0 flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold">영상 녹화</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <main className="flex-grow bg-black rounded-md overflow-hidden relative flex justify-center items-center">
                    {error ? (
                        <p className="text-white text-center">{error}</p>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain"></video>
                    )}
                </main>
                <footer className="flex-shrink-0 flex justify-around items-center pt-4">
                     {videoDevices.length > 1 ? (
                        <button
                            onClick={handleSwitchCamera}
                            disabled={isRecording}
                            className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="카메라 전환"
                        >
                            <SwitchCameraIcon />
                        </button>
                    ) : <div className="w-[52px]"></div>}
                    {!isRecording ? (
                        <button 
                            onClick={handleStartRecording} 
                            disabled={!stream}
                            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:bg-red-700 transition disabled:bg-gray-400"
                        >
                            녹화
                        </button>
                    ) : (
                        <button 
                            onClick={handleStopRecording} 
                            className="w-20 h-20 bg-white border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-bold text-lg shadow-lg hover:bg-red-50 transition"
                        >
                           중지
                        </button>
                    )}
                    <div className="w-[52px]"></div>
                </footer>
            </div>
        </div>
    );
};

export default VideoRecorderModal;
