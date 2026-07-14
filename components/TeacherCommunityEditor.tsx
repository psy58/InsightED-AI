import React, { useState } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View } from '../types';
import { ChevronLeftIcon } from './icons';

const TeacherCommunityEditor = () => {
    const { setCurrentView } = useAcroAppContext();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'생활지도' | '학생 상담' | '학부모 상담'>('생활지도');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSave = () => {
        if (!title || !content || !category) {
            alert('카테고리, 제목, 내용을 모두 입력해주세요.');
            return;
        }
        // In a real app, this would save the post.
        alert('게시글이 등록되었습니다. (시뮬레이션)');
        setCurrentView(View.TEACHER_COMMUNITY_DASHBOARD);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.TEACHER_COMMUNITY_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">경험 공유 글쓰기</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentView(View.TEACHER_COMMUNITY_DASHBOARD)} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50">
                        취소
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        등록하기
                    </button>
                </div>
            </header>

            <div className="space-y-6 max-w-4xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="글의 제목을 입력하세요."
                            className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                        <select
                            id="category"
                            value={category}
                            onChange={e => setCategory(e.target.value as any)}
                            className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"
                        >
                            <option value="생활지도">생활지도</option>
                            <option value="학생 상담">학생 상담</option>
                            <option value="학부모 상담">학부모 상담</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                    <textarea
                        id="content"
                        rows={12}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="다른 선생님들과 공유하고 싶은 학생 지도 및 상담 경험을 자유롭게 작성해주세요."
                        className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                </div>
                 <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                     <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="쉼표(,)로 태그를 구분해주세요. (예: 교우관계, 학습부진, 상담기법)"
                        className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default TeacherCommunityEditor;