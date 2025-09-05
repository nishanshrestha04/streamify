import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api'; // Assuming you have an api utility

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        if (query) {
            api.get(`/search/?q=${query}`)
                .then(response => {
                    setResults(response.data);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                });
        }
    }, [query]);

    const highlightMatch = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() ? (
                        <strong key={i}>{part}</strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map(video => (
                        <div key={video.id} className="p-4 border rounded-lg">
                            <h2 className="text-xl font-semibold">
                                <Link to={`/watch/${video.id}`}>{video.title}</Link>
                            </h2>
                            <p className="text-gray-500">by {video.uploader.username}</p>
                            {video.transcript && (
                                <div className="mt-2">
                                    <p>...</p>
                                    {video.transcript.segments.map((segment, index) => {
                                        if (segment.text.toLowerCase().includes(query.toLowerCase())) {
                                            return (
                                                <Link key={index} to={`/watch/${video.id}#t=${segment.start}`}>
                                                    <p className="text-sm text-gray-600 hover:bg-gray-200 p-2 rounded">
                                                        {highlightMatch(segment.text, query)}
                                                    </p>
                                                </Link>
                                            );
                                        }
                                        return null;
                                    })}
                                    <p>...</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
