import React, { useState, MouseEvent, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { Student } from '../types';
import { TrashIcon } from './icons';

const StudentList = () => {
  const { students, selectedStudent, selectStudent, requestStudentDeletion } = useAcroAppContext();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, student: Student } | null>(null);

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>, student: Student) => {
    event.preventDefault();
    setContextMenu({ x: event.pageX, y: event.pageY, student });
  };
  
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => {
      window.removeEventListener('click', closeContextMenu);
    };
  }, []);
  
  const handleDelete = () => {
    if (contextMenu) {
      requestStudentDeletion(contextMenu.student);
    }
  };

  return (
    <aside data-tutorial-id="step-2" className="w-full h-[calc(100vh-6rem)] bg-white rounded-xl shadow-lg p-4 flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-3">학생 바로가기</h2>
      <ul className="space-y-1 flex-1 overflow-y-auto">
        {students.map(student => (
          <li key={student.id}>
            <button
              onClick={() => selectStudent(student.id)}
              onContextMenu={(e) => handleContextMenu(e, student)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-base font-medium flex items-center gap-3 ${
                selectedStudent?.id === student.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full bg-gray-200" />
              <span className="font-semibold w-6 text-right">{student.number}.</span>
              <span>{student.name}</span>
            </button>
          </li>
        ))}
      </ul>
       {contextMenu && (
        <div 
            style={{ top: contextMenu.y, left: contextMenu.x }} 
            className="absolute z-50 bg-white rounded-md shadow-lg border w-40"
            onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="w-5 h-5" />
            <span>학생 삭제</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default StudentList;