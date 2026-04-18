import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ReviewStats = ({ stats }) => {
    if (!stats) return null;

    const data = [...stats.distribution].reverse(); // Show 5 stars at top

    const renderStars = (count) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    };

    return (
        <div className="stats-grid">
            <div className="stats-card">
                <h3>Đánh giá trung bình</h3>
                <div className="rating-summary">
                    <div className="big-rating">
                        <div className="rating-value">{stats.avg_rating}</div>
                        <div className="rating-stars">{renderStars(Math.round(stats.avg_rating))}</div>
                        <div className="rating-count">{stats.total_reviews} đánh giá</div>
                    </div>
                    <div className="distribution-chart">
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart
                                layout="vertical"
                                data={data}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="stars" 
                                    type="category" 
                                    tick={{fontSize: 12, fill: '#666'}} 
                                    width={40}
                                    tickFormatter={(value) => `${value} sao`}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.stars >= 4 ? '#fca120' : '#d1d1d1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="stats-card">
                <h3>Hiệu quả phản hồi</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100px'}}>
                    <div style={{textAlign: 'center', flex: 1}}>
                        <div style={{fontSize: '32px', fontWeight: 'bold', color: '#1e8e3e'}}>{stats.response_rate}%</div>
                        <div style={{fontSize: '14px', color: '#666'}}>Tỉ lệ phản hồi</div>
                    </div>
                    <div style={{width: '2px', height: '60px', backgroundColor: '#eee'}}></div>
                    <div style={{textAlign: 'center', flex: 1}}>
                        <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{stats.responded_count}</div>
                        <div style={{fontSize: '14px', color: '#666'}}>Đã phản hồi</div>
                    </div>
                </div>
                <div style={{marginTop: '20px'}}>
                    <div className="progress-bar-bg" style={{height: '8px', borderRadius: '4px'}}>
                        <div 
                            className="progress-bar-fill" 
                            style={{ 
                                width: `${stats.response_rate}%`, 
                                height: '100%', 
                                backgroundColor: '#1e8e3e',
                                borderRadius: '4px'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStats;
