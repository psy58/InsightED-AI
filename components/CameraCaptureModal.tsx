import React, { useState, useRef, useEffect } from 'react';
import { SwitchCameraIcon } from './icons';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (blob: Blob) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
                        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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
                        const constraints = { video: { deviceId: { exact: deviceId } }, audio: false };
                        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                        setStream(mediaStream);
                        if (videoRef.current) {
                            videoRef.current.srcObject = mediaStream;
                        }
                    } else if (devices.length > 0) {
                         mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                         setStream(mediaStream);
                         if (videoRef.current) {
                            videoRef.current.srcObject = mediaStream;
                        }
                    } else {
                        setError('사용 가능한 카메라가 없습니다.');
                    }
                } catch (err) {
                    console.error("Error accessing camera.", err);
                    setError('카메라에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
                }
            };
            startStream();
        } else {
            cleanup();
        }

        return cleanup;
    }, [isOpen, currentDeviceId, videoDevices]);

    const handleSwitchCamera = () => {
        if (videoDevices.length > 1) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setCurrentDeviceId(videoDevices[nextIndex].deviceId);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current || !stream) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob((blob) => {
                if (blob) {
                    onCapture(blob);
                }
                onClose();
            }, 'image/jpeg', 0.9);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center"  onClick={onClose}>
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold">사진 촬영</h2>
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
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </main>
                <footer className="flex-shrink-0 flex justify-around items-center pt-4">
                     {videoDevices.length > 1 ? (
                        <button
                            onClick={handleSwitchCamera}
                            className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                            aria-label="카메라 전환"
                        >
                           <SwitchCameraIcon />
                        </button>
                    ) : <div className="w-[52px]"></div>}
                    <button 
                        onClick={handleCapture} 
                        disabled={!stream}
                        className="w-20 h-20 bg-white rounded-full border-4 border-slate-400 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:border-blue-500 transition disabled:bg-gray-400 disabled:border-gray-500"
                        aria-label="사진 촬영"
                    >
                        <div className="w-16 h-16 bg-white rounded-full"></div>
                    </button>
                    <div className="w-[52px]"></div>
                </footer>
            </div>
        </div>
    );
};

export default CameraCaptureModal;
