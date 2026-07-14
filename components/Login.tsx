
import React, { useState, FormEvent } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { InformationCircleIcon, XIcon } from './icons';

const WelcomeNotice = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <XIcon className="w-6 h-6" />
            </button>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">학생 데이터 관리 서비스 이용 안내</h3>
                    <div className="mt-2 text-sm text-gray-600 space-y-3">
                        <p>
                            학생 데이터 관리 서비스에 오신 것을 환영합니다!
                        </p>
                        <p>
                            <strong className="font-semibold text-blue-700">1. 예시 계정으로 체험하기:</strong><br />
                            모든 기능이 구현된 예시 데이터를 확인해 보시려면 아래 계정으로 로그인하세요.
                            <div className="mt-1 p-2 bg-slate-100 rounded-md text-center font-mono">
                                아이디: <span className="font-bold">korea0508</span> / 비밀번호: <span className="font-bold">0000</span>
                            </div>
                        </p>
                        <p>
                            <strong className="font-semibold text-teal-700">2. 직접 회원가입하기:</strong><br />
                            '회원가입' 버튼을 눌러 자신만의 계정을 만들고, 초기 상태부터 직접 데이터를 관리해볼 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
             <div className="mt-6 text-right">
                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                    확인
                </button>
            </div>
        </div>
    </div>
);

const ServiceLogo = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
    {/* Blue Document Background */}
    <rect x="22" y="12" width="56" height="76" rx="6" fill="#3B82F6" /> {/* Blue-500 */}
    
    {/* Folded Corner Effect (Top Right) */}
    <path d="M58 12 L78 32 L78 12 Z" fill="#1D4ED8" opacity="0.2" /> 

    {/* Header Lines */}
    <rect x="30" y="24" width="30" height="4" rx="2" fill="white" fillOpacity="0.9" />
    <rect x="30" y="32" width="20" height="4" rx="2" fill="white" fillOpacity="0.6" />

    {/* Bar Chart (Yellow/Amber) */}
    <rect x="32" y="72" width="7" height="16" rx="1" fill="#FBBF24" /> {/* Amber-400 */}
    <rect x="41" y="62" width="7" height="26" rx="1" fill="#FBBF24" />
    <rect x="50" y="52" width="7" height="36" rx="1" fill="#FBBF24" />

    {/* Line Chart (White) */}
    <path d="M35 68 L44 58 L53 48" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="35" cy="68" r="2" fill="white" />
    <circle cx="44" cy="58" r="2" fill="white" />
    <circle cx="53" cy="48" r="2" fill="white" />

    {/* Magnifying Glass (Examining the chart) */}
    <g transform="translate(5, 5)">
        {/* Handle */}
        <rect x="48" y="48" width="6" height="20" rx="3" transform="rotate(-45 51 58)" fill="#22C55E" /> {/* Green-500 */}
        {/* Lens Rim */}
        <circle cx="42" cy="42" r="16" stroke="#F59E0B" strokeWidth="4" fill="white" fillOpacity="0.1" /> {/* Amber-500 Rim, transparent fill */}
        {/* Reflection on Lens */}
        <path d="M36 36 Q 40 32 46 36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  </svg>
);

const Login = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isNoticeOpen, setIsNoticeOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
             {isNoticeOpen && <WelcomeNotice onClose={() => setIsNoticeOpen(false)} />}
             <div className="w-full max-w-md">
                 <div className="flex flex-col justify-center items-center mb-8">
                    <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
                        <ServiceLogo />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">학생 데이터 관리 서비스</h1>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    {view === 'login' ? <LoginForm setView={setView} /> : <RegisterForm setView={setView} />}
                </div>
             </div>
        </div>
    );
};


const LoginForm = ({ setView }: { setView: (v: 'login' | 'register') => void }) => {
    const { login } = useAcroAppContext();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(id, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">로그인</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">아이디</label>
                    <input type="text" value={id} onChange={e => setId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <button onClick={() => setView('register')} className="font-medium text-blue-600 hover:text-blue-500">
                    회원가입
                </button>
            </p>
        </div>
    );
};


const RegisterForm = ({ setView }: { setView: (v: 'login' | 'register') => void }) => {
    const { register } = useAcroAppContext();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [grade, setGrade] = useState('');
    const [classNum, setClassNum] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (!name || !school || !grade || !classNum || !id || !password) {
            setError('모든 필드를 입력해주세요.');
            return;
        }
        setError('');
        setStatus('loading');
        setMessage('GPKI 인증서 확인 및 계정 생성 중...');

        try {
            await register({ id, password, name, school, grade, classNum });
            setStatus('success');
            setMessage('계정이 성공적으로 생성되었습니다. 3초 후 로그인 페이지로 이동합니다.');
            setTimeout(() => {
                setView('login');
            }, 3000);
        } catch (err: any) {
            setStatus('idle');
            setError(err.message || '회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">회원가입</h2>
            
            {status === 'idle' && (
                <>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">성명</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">학교</label>
                        <input type="text" value={school} onChange={e => setSchool(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">학년</label>
                            <input type="number" value={grade} onChange={e => setGrade(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">반</label>
                            <input type="number" value={classNum} onChange={e => setClassNum(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">아이디</label>
                        <input type="text" value={id} onChange={e => setId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none">
                            GPKI로 인증 및 가입하기
                        </button>
                    </div>
                </form>
                </>
            )}

            {status === 'loading' && (
                <div className="flex items-center justify-center p-4">
                     <svg className="animate-spin h-6 w-6 text-teal-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-teal-700 font-semibold">{message}</p>
                </div>
            )}
             {status === 'success' && (
                <div className="p-4 bg-green-100 text-green-800 rounded-md">
                    <p className="font-semibold text-center">{message}</p>
                </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button onClick={() => setView('login')} className="font-medium text-blue-600 hover:text-blue-500">
                    로그인
                </button>
            </p>
        </div>
    );
}

export default Login;
