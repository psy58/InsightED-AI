
import React, { useState } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, Student, DataSourceType, DataStatus, DataSource } from '../types';
import { EyeIcon, PencilIcon, ChevronLeftIcon } from './icons';
import DataSourceContentModal from './DataSourceContentModal';

const StudentSurveyDashboard = () => {
    const { students, setCurrentView } = useAcroAppContext();
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

    const getStudentSurveyStatus = (student: Student): { status: DataStatus, dataSource?: DataSource } => {
        const surveyData = student.dataSources.find(ds => ds.type === DataSourceType.StudentSurvey);
        if (surveyData) {
            return { status: surveyData.status, dataSource: surveyData };
        }
        return { status: DataStatus.NotSubmitted };
    };

    const getStatusBadge = (status: DataStatus) => {
        switch (status) {
            case DataStatus.Submitted:
            return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">제출 완료</span>;
            case DataStatus.NotSubmitted:
            return <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">미제출</span>;
            default:
            return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
        }
    };
    
    const viewingStudentSurvey = viewingStudent ? getStudentSurveyStatus(viewingStudent).dataSource : undefined;

    // Navigation logic
    const submittedStudents = students.filter(s => getStudentSurveyStatus(s).status === DataStatus.Submitted);
    const viewingIndex = viewingStudent ? submittedStudents.findIndex(s => s.id === viewingStudent.id) : -1;
    
    const handlePrev = viewingIndex > 0 ? () => setViewingStudent(submittedStudents[viewingIndex - 1]) : undefined;
    const handleNext = viewingIndex < submittedStudents.length - 1 ? () => setViewingStudent(submittedStudents[viewingIndex + 1]) : undefined;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">학생 기초조사서 현황</h2>
                </div>
                <button
                    onClick={() => setCurrentView(View.STUDENT_SURVEY_EDITOR)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <PencilIcon className="w-5 h-5" />
                    설문 생성하기
                </button>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제출 상태</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">보기</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => {
                            const { status, dataSource } = getStudentSurveyStatus(student);
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
                                        {getStatusBadge(status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {status === DataStatus.Submitted && dataSource && (
                                            <button onClick={() => setViewingStudent(student)} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900">
                                                <EyeIcon className="w-5 h-5"/>
                                                <span>내용 보기</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {viewingStudent && viewingStudentSurvey && (
                 <DataSourceContentModal
                    student={viewingStudent}
                    dataSource={viewingStudentSurvey} 
                    onClose={() => setViewingStudent(null)} 
                    onPrev={handlePrev}
                    onNext={handleNext}
                 />
            )}
        </div>
    );
};

export default StudentSurveyDashboard;
