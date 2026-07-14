import React, { useState, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, CommunityPost } from '../types';
import { ChevronLeftIcon } from './icons';

const TeacherCommunityPostViewer = () => {
    const { setCurrentView } = useAcroAppContext();
    const [post, setPost] = useState<CommunityPost | null>(null);

    useEffect(() => {
        const postData = sessionStorage.getItem('selectedCommunityPost');
        if (postData) {
            setPost(JSON.parse(postData));
        }
    }, []);

    if (!post) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                게시글을 불러오는 중...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center gap-4 border-b pb-4 mb-6">
                <button onClick={() => setCurrentView(View.TEACHER_COMMUNITY_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            post.category === '생활지도' ? 'bg-green-100 text-green-800' :
                            post.category === '학생 상담' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                        }`}>{post.category}</span>
                        <h2 className="text-xl font-bold text-gray-800">{post.title}</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span><strong>작성자:</strong> {post.author}</span>
                        <span><strong>작성일:</strong> {post.date}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                <div className="prose prose-slate max-w-none prose-p:text-gray-700 prose-p:leading-relaxed">
                    <p>{post.content}</p>
                </div>
            </main>

            <footer className="mt-8 border-t pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">태그:</span>
                    {post.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-100 rounded-full">{tag}</span>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default TeacherCommunityPostViewer;