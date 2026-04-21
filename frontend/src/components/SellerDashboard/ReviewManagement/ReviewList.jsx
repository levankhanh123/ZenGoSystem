import React from 'react';

const ReviewList = ({ reviews, onReplyClick }) => {
    const renderStars = (count) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="review-list">
            {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className="review-item">
                    <div className="review-user-info">
                        <div className="user-profile">
                            <img 
                                src={review.anh_nguoi_mua || 'https://via.placeholder.com/40'} 
                                alt={review.ten_nguoi_mua} 
                                className="user-avatar" 
                            />
                            <div>
                                <div className="user-name">{review.ten_nguoi_mua}</div>
                                <div className="review-date">{formatDate(review.created_at)}</div>
                            </div>
                        </div>
                        <div className="review-rating-stars">{renderStars(review.so_sao)}</div>
                    </div>

                    <div className="reviewed-product">
                        <img src={review.san_pham_hinh} alt="" className="product-thumb" />
                        <div>
                            <div style={{fontSize: '12px', color: '#666'}}>Sản phẩm:</div>
                            <a href="#" className="product-name-link">{review.ten_san_pham}</a>
                        </div>
                    </div>

                    <div className="review-text">
                        {review.noi_dung || <i style={{color: '#999'}}>Người dùng không để lại bình luận.</i>}
                    </div>

                    {review.noi_dung_phan_hoi ? (
                        <div className="shop-reply-box">
                            <div className="shop-reply-header">
                                <span>Phản hồi của Shop</span>
                                <span style={{fontSize: '12px', color: '#999', fontWeight: 'normal'}}>
                                    {formatDate(review.thoi_gian_phan_hoi)}
                                </span>
                            </div>
                            <div className="reply-content">{review.noi_dung_phan_hoi}</div>
                        </div>
                    ) : (
                        <button className="reply-btn" onClick={() => onReplyClick(review)}>
                            Phản hồi ngay
                        </button>
                    )}
                </div>
            )) : (
                <div style={{textAlign: 'center', padding: '100px 0', color: '#999'}}>
                    Không tìm thấy đánh giá nào phù hợp.
                </div>
            )}
        </div>
    );
};

export default ReviewList;
