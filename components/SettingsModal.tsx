import React from 'react';
import { XIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">설정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Profile Information */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">프로필 정보</h4>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-600">이름</label>
                                <input type="text" value="홍길동" disabled className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600">소속</label>
                                <input type="text" value="한국초등학교 5학년 8반" disabled className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">비밀번호 변경</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">현재 비밀번호</label>
                                <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">새 비밀번호</label>
                                <input type="password" placeholder="새 비밀번호 입력" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600">새 비밀번호 확인</label>
                                <input type="password" placeholder="새 비밀번호 다시 입력" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                     <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">알림 설정</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">새로운 설문 제출 시 이메일 알림</span>
                                <input type="checkbox" className="toggle-checkbox" defaultChecked />
                            </label>
                             <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">상담이 필요한 학생 알림</span>
                                <input type="checkbox" className="toggle-checkbox" defaultChecked />
                            </label>
                        </div>
                    </div>
                </div>
                 <footer className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                        취소
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                        변경사항 저장
                    </button>
                </footer>
            </div>
             <style>{`
                .toggle-checkbox {
                    appearance: none;
                    width: 40px;
                    height: 20px;
                    background-color: #cbd5e1;
                    border-radius: 9999px;
                    position: relative;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out;
                }
                .toggle-checkbox:checked {
                    background-color: #3b82f6;
                }
                .toggle-checkbox::before {
                    content: '';
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background-color: white;
                    border-radius: 9999px;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s ease-in-out;
                }
                .toggle-checkbox:checked::before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};

export default SettingsModal;