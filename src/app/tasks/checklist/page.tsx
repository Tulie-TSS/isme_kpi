'use client';
import { CheckSquare } from 'lucide-react';

export default function ChecklistPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Checklist Công việc</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>Quản lý danh sách các đầu mục cần hoàn thành</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ background: 'var(--gray-50)', padding: 40, borderRadius: 24, border: '1px dashed var(--gray-300)', maxWidth: 480 }}>
          <CheckSquare size={48} color="var(--gray-400)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>Tính năng đang phát triển</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
            Giao diện Checklist tổng hợp công việc để theo dõi nhanh tiến độ hàng ngày đang được xây dựng và sẽ sớm ra mắt.
          </p>
        </div>
      </div>
    </div>
  );
}
