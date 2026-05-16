import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';
import './CampaignRegistration.css';

const CampaignRegistration = () => {
    const { selectedShop } = useSellerSession();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (selectedShop?.id) {
            fetchCampaigns();
        } else {
            setLoading(false);
        }
    }, [selectedShop?.id]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/seller/campaigns?shop_id=${selectedShop.id}`);
            if (response.data.success) {
                setCampaigns(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (campaignId) => {
        if (!selectedShop?.id) return;
        setProcessingId(campaignId);
        try {
            const response = await api.post('/seller/campaigns/register', {
                campaign_id: campaignId,
                shop_id: selectedShop.id
            });
            if (response.data.success) {
                alert(response.data.message);
                fetchCampaigns();
            }
        } catch (error) {
            console.error("Error registering:", error);
            alert(error.response?.data?.message || "Đăng ký thất bại.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnregister = async (campaignId) => {
        if (!selectedShop?.id) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy tham gia chiến dịch này?")) return;
        
        setProcessingId(campaignId);
        try {
            const response = await api.post('/seller/campaigns/unregister', {
                campaign_id: campaignId,
                shop_id: selectedShop.id
            });
            if (response.data.success) {
                alert(response.data.message);
                fetchCampaigns();
            }
        } catch (error) {
            console.error("Error unregistering:", error);
            alert("Hủy đăng ký thất bại.");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusLabel = (registration) => {
        if (!registration) return { text: "Chưa đăng ký", class: "status-none" };
        
        switch (registration.trang_thai) {
            case 'cho_duyet': return { text: "Đang chờ duyệt", class: "status-pending" };
            case 'da_duyet': return { text: "Đã tham gia", class: "status-joined" };
            case 'tu_choi': return { text: "Đã bị từ chối", class: "status-rejected" };
            default: return { text: "Không xác định", class: "" };
        }
    };

    if (loading) {
        return <div className="loading-container">Đang tải danh sách chiến dịch...</div>;
    }

    return (
        <div className="campaign-registration-container">
            <div className="campaign-header">
                <h2>Chiến dịch Marketing</h2>
                <p>Tham gia các chiến dịch lớn từ ZenGo để nhận voucher hỗ trợ từ sàn và tăng doanh thu.</p>
            </div>

            <div className="campaign-grid">
                {campaigns.length === 0 ? (
                    <div className="no-data">Hiện không có chiến dịch nào đang mở đăng ký.</div>
                ) : (
                    campaigns.map(campaign => {
                        const status = getStatusLabel(campaign.registration);
                        const isRegistered = !!campaign.registration;
                        const isPending = campaign.registration?.trang_thai === 'cho_duyet';

                        return (
                            <div key={campaign.id} className="campaign-card">
                                <div className="card-badge">CHIẾN DỊCH HOT</div>
                                <div className="card-content">
                                    <h3 className="campaign-title">{campaign.ten_chien_dich}</h3>
                                    <div className="campaign-meta">
                                        <span className="campaign-code">Mã: {campaign.ma_chien_dich}</span>
                                        <div className={`campaign-status-tag ${status.class}`}>
                                            {status.text}
                                        </div>
                                    </div>
                                    <p className="campaign-description">{campaign.mo_ta}</p>
                                    
                                    {campaign.vouchers && campaign.vouchers.length > 0 && (
                                        <div className="campaign-vouchers">
                                            <h4>Voucher sàn đi kèm:</h4>
                                            <ul>
                                                {campaign.vouchers.map(v => (
                                                    <li key={v.id}>
                                                        <strong>{v.ma_voucher}</strong>: {v.ten_voucher}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="campaign-info">
                                        <div className="info-item">
                                            <span className="info-label">Bắt đầu:</span>
                                            <span className="info-value">{new Date(campaign.ngay_bat_dau).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Kết thúc:</span>
                                            <span className="info-value">{new Date(campaign.ngay_ket_thuc).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        {!isRegistered ? (
                                            <button 
                                                className="btn-register"
                                                disabled={processingId === campaign.id}
                                                onClick={() => handleRegister(campaign.id)}
                                            >
                                                {processingId === campaign.id ? "Đang xử lý..." : "Đăng ký ngay"}
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn-unregister"
                                                disabled={processingId === campaign.id}
                                                onClick={() => handleUnregister(campaign.id)}
                                            >
                                                {processingId === campaign.id ? "Đang xử lý..." : (isPending ? "Hủy đăng ký" : "Hủy tham gia")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CampaignRegistration;
