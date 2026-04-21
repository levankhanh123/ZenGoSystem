import React, { useState } from 'react';

const ReplyModal = ({ review, onClose, onSubmit }) => {
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit(review.id, replyText);
            onClose();
        } catch (error) {
            console.error('Failed to submit reply', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="reply-modal" onClick={e => e.stopPropagation()}>
                <h3>Phản hồi đánh giá</h3>
                <p style={{fontSize: '14px', color: '#666', marginBottom: '16px'}}>
                    Khách hàng: <strong>{review.ten_nguoi_mua}</strong> (Sản phẩm: {review.ten_san_pham})
                </p>
                <form onSubmit={handleSubmit}>
                    <textarea 
                        className="reply-textarea"
                        placeholder="Nhập nội dung phản hồi khách hàng..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                        disabled={isSubmitting}
                    ></textarea>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Hủy</button>
                        <button type="submit" className="reply-btn" disabled={isSubmitting || !replyText.trim()}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReplyModal;
