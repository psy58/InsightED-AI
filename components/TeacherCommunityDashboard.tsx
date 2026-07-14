import React, { useState, useMemo } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, CommunityPost } from '../types';
import { ChevronLeftIcon, PencilIcon, SearchIcon } from './icons';
import { MOCK_COMMUNITY_POSTS } from '../constants';

const categories = ['전체', '생활지도', '학생 상담', '학부모 상담'];

const TeacherCommunityDashboard = () => {
    const { setCurrentView } = useAcroAppContext();
    const [activeCategory, setActiveCategory] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');

    const handlePostClick = (post: CommunityPost) => {
        sessionStorage.setItem('selectedCommunityPost', JSON.stringify(post));
        setCurrentView(View.TEACHER_COMMUNITY_POST);
    };

    const filteredPosts = useMemo(() => {
        return MOCK_COMMUNITY_POSTS
            .filter(post => activeCategory === '전체' || post.category === activeCategory)
            .filter(post => {
                if (!searchTerm.trim()) return true;
                const lowerTerm = searchTerm.toLowerCase();
                return (
                    post.title.toLowerCase().includes(lowerTerm) ||
                    post.content.toLowerCase().includes(lowerTerm) ||
                    post.author.toLowerCase().includes(lowerTerm) ||
                    post.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
                );
            });
    }, [activeCategory, searchTerm]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">교사 경험 공유 게시판</h2>
                </div>
                <button
                    onClick={() => setCurrentView(View.TEACHER_COMMUNITY_EDITOR)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                >
                    <PencilIcon className="w-5 h-5" />
                    글쓰기
                </button>
            </header>

            <div className="mb-5">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`${
                                        activeCategory === category
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {category}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="키워드 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                {filteredPosts.length > 0 ? filteredPosts.map(post => (
                    <button key={post.id} onClick={() => handlePostClick(post)} className="w-full text-left border rounded-lg p-4 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <div className="flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        post.category === '생활지도' ? 'bg-green-100 text-green-800' :
                                        post.category === '학생 상담' ? 'bg-blue-100 text-blue-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>{post.category}</span>
                                    <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>작성자: {post.author}</span>
                                    <span>작성일: {post.date}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex gap-1.5 mt-1">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 text-xs font-semibold text-sky-800 bg-sky-100 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {post.content}
                        </p>
                    </button>
                )) : (
                     <div className="text-center py-16 text-gray-500">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherCommunityDashboard;