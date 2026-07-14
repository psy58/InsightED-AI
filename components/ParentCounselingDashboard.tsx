import React from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, Student, DataSourceType, DataSource } from '../types';
import { EyeIcon, PlusIcon, PencilIcon, ChevronLeftIcon } from './icons';

const ParentCounselingDashboard = () => {
    const { students, setCurrentView, selectStudent, newCounselingRequests, processCounselingRequest } = useAcroAppContext();

    const getCounselingRecords = (student: Student): DataSource[] => {
        return student.dataSources.filter(ds => ds.type === DataSourceType.ParentCounseling);
    };

    const getStatusBadge = (count: number) => {
        if (count > 0) {
            return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">{count}회 기록</span>;
        }
        return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full">기록 없음</span>;
    };

    const handleNewCounseling = (studentId: number) => {
        selectStudent(studentId);
        setCurrentView(View.PARENT_COUNSELING_EDITOR);
    };

    const handleViewLogs = (studentId: number) => {
        selectStudent(studentId);
        setCurrentView(View.PARENT_COUNSELING_VIEW);
    };
    
    const findStudentForRequest = (request: DataSource) => {
        return students.find(s => s.dataSources.some(ds => ds.id === request.id));
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <header className="flex items-center justify-between border-b pb-4">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">학부모 상담 관리</h2>
                </div>
            </header>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">새로운 상담 신청 현황 ({newCounselingRequests.length}건)</h3>
                    <button
                        onClick={() => setCurrentView(View.PARENT_COUNSELING_REQUEST_EDITOR)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm"
                    >
                        <PencilIcon className="w-4 h-4" />
                        상담 신청 설문 관리
                    </button>
                </div>
                <div className="space-y-3">
                    {newCounselingRequests.length > 0 ? newCounselingRequests.map(req => {
                        const student = findStudentForRequest(req);
                        const content = new Map(req.content.split('\n').map(line => line.split('::') as [string, string]));
                        if (!student) return null;
                        
                        return (
                            <div key={req.id} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-blue-800">{student.name} ({content.get('상담 신청자 관계')}) - {content.get('상담 방법')} 상담 요청</p>
                                    <p className="text-sm text-blue-700 mt-1">사유: {content.get('상담 신청 이유')}</p>
                                </div>
                                <button
                                    onClick={() => processCounselingRequest(req)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 border border-blue-300 font-semibold rounded-lg shadow-sm hover:bg-blue-100 transition-colors text-sm whitespace-nowrap"
                                >
                                    <PlusIcon className="w-4 h-4"/>
                                    상담 내용 기록하기
                                </button>
                            </div>
                        )
                    }) : <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-lg">새로운 상담 신청이 없습니다.</p>}
                </div>
            </section>

            <section>
                 <h3 className="text-lg font-bold text-gray-800 mb-4 border-t pt-8">전체 상담 기록 현황</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상담 기록</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">작업</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => {
                                const records = getCounselingRecords(student);
                                return (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={student.avatar} alt={student.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{student.number}. {student.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(records.length)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            {records.length > 0 && (
                                                <button onClick={() => handleViewLogs(student.id)} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900">
                                                    <EyeIcon className="w-5 h-5"/>
                                                    <span>내용 보기</span>
                                                </button>
                                            )}
                                            <button onClick={() => handleNewCounseling(student.id)} className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-900">
                                                <PlusIcon className="w-5 h-5"/>
                                                <span>상담 기록 추가</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ParentCounselingDashboard;