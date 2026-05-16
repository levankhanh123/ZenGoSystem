import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './ReviewManagement.css';
import ReviewStats from './ReviewStats';
import ReviewList from './ReviewList';
import ReplyModal from './ReplyModal';
import api from '../../../api/axios';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, responded, unresponded
    const [starFilter, setStarFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const shopId = currentUser?.cua_hang?.id || currentUser?.cua_hang_id || 1;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                api.get(`/seller/reviews/shop/${shopId}`, {
                    params: {
                        state: activeTab,
                        stars: starFilter,
                        search: searchQuery
                    }
                }),
                api.get(`/seller/reviews/stats/${shopId}`)
            ]);
            setReviews(reviewsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch review data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, starFilter, searchQuery]); // Re-fetch on filter change

    const handleReplySubmit = async (reviewId, text) => {
        try {
            await api.post(`/seller/reviews/${reviewId}/reply`, { noi_dung_phan_hoi: text });
            fetchData(); // Refresh list and stats
            alert('Đã gửi phản hồi thành công!');
        } catch (error) {
            alert('Gửi phản hồi thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="review-management-container">
            <div className="review-management-header">
                <h2>Quản lý Đánh giá Shop</h2>
                <p>Theo dõi và phản hồi đánh giá từ khách hàng để tăng uy tín của shop.</p>
            </div>

            {stats && <ReviewStats stats={stats} />}

            <div className="review-content-section">
                <div className="review-filters">
                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >Tất cả ({stats?.total_reviews || 0})</button>
                        <button 
                            className={`filter-tab ${activeTab === 'unresponded' ? 'active' : ''}`}
                            onClick={() => setActiveTab('unresponded')}
                        >Chưa phản hồi ({stats ? stats.total_reviews - stats.responded_count : 0})</button>
                        <button 
                            className={`filter-tab ${activeTab === 'responded' ? 'active' : ''}`}
                            onClick={() => setActiveTab('responded')}
                        >Đã phản hồi ({stats?.responded_count || 0})</button>
                    </div>

                    <div style={{display: 'flex', gap: '12px'}}>
                        <select 
                            className="action-btn" 
                            style={{padding: '8px 12px'}}
                            value={starFilter}
                            onChange={(e) => setStarFilter(e.target.value)}
                        >
                            <option value="all">Tất cả số sao</option>
                            <option value="5">5 Sao</option>
                            <option value="4">4 Sao</option>
                            <option value="3">3 Sao</option>
                            <option value="2">2 Sao</option>
                            <option value="1">1 Sao</option>
                        </select>

                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm theo tên SP, mã đơn..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{padding: '50px', textAlign: 'center'}}>Đang tải dữ liệu...</div>
                ) : (
                    <ReviewList reviews={reviews} onReplyClick={setSelectedReview} />
                )}
            </div>

            {selectedReview && (
                <ReplyModal 
                    review={selectedReview} 
                    onClose={() => setSelectedReview(null)} 
                    onSubmit={handleReplySubmit}
                />
            )}
        </div>
    );
};

export default ReviewManagement;
