import React from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { SearchIcon } from './icons';
import { SearchResult } from '../types';

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim() || !text) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


const SearchResults = () => {
    const { searchResults, searchTerm, viewSearchResult } = useAcroAppContext();

    const handleResultClick = (result: SearchResult) => {
        viewSearchResult(result);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    <span className="text-blue-600 font-extrabold">'{searchTerm}'</span>
                    에 대한 전체 검색 결과
                </h2>
                 <p className="text-gray-600 mt-1">
                    총 <span className="font-bold">{searchResults.length}</span>개의 결과를 찾았습니다.
                </p>
            </header>

            {searchResults.length > 0 ? (
                <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                    {searchResults.map((result, index) => (
                        <button 
                            key={`${result.student.id}-${result.dataSource.id}-${index}`} 
                            className="w-full text-left border rounded-lg p-4 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => handleResultClick(result)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img src={result.student.avatar} alt={result.student.name} className="w-9 h-9 rounded-full" />
                                    <span className="font-bold text-gray-800">{result.student.number}. {result.student.name}</span>
                                    <span className="px-2 py-0.5 text-xs font-semibold text-sky-800 bg-sky-100 rounded-full">{result.dataSource.type}</span>
                                </div>
                                <span 
                                    className="px-3 py-1.5 text-sm font-semibold text-blue-600"
                                >
                                    내용 보기 &rarr;
                                </span>
                            </div>
                             <blockquote className="border-l-4 border-gray-200 pl-4 text-gray-600 text-sm">
                                <HighlightedText text={result.snippet} highlight={searchTerm} />
                             </blockquote>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">검색 결과가 없습니다.</h3>
                    <p className="mt-1 text-sm text-gray-500">다른 검색어로 다시 시도해주세요.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;