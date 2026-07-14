import React from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, Student, DataSourceType, DataSource } from '../types';
import { EyeIcon, PlusIcon, ChevronLeftIcon } from './icons';

const TeacherObservationDashboard = () => {
    const { students, setCurrentView, selectStudent } = useAcroAppContext();

    const getObservationRecords = (student: Student): DataSource[] => {
        return student.dataSources.filter(ds => ds.type === DataSourceType.TeacherObservation);
    };

    const getStatusBadge = (count: number) => {
        if (count > 0) {
            return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">{count}건 기록</span>;
        }
        return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full">기록 없음</span>;
    };

    const handleNewObservation = (studentId: number) => {
        selectStudent(studentId);
        setCurrentView(View.TEACHER_OBSERVATION_EDITOR);
    };
    
    const handleViewLogs = (studentId: number) => {
        selectStudent(studentId);
        setCurrentView(View.TEACHER_OBSERVATION_VIEW);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">교사 관찰 기록 현황</h2>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관찰 기록</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">작업</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => {
                            const records = getObservationRecords(student);
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
                                        <button onClick={() => handleNewObservation(student.id)} className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-900">
                                            <PlusIcon className="w-5 h-5"/>
                                            <span>관찰 기록 추가</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherObservationDashboard;