import React, { useState, useRef, useEffect } from 'react';
import { HardDrive, RefreshCw, Copy, Eraser, Info } from 'lucide-react';

export default function App() {
  const [inputLink, setInputLink] = useState('');
  const [outputLink, setOutputLink] = useState('');
  const [extractedId, setExtractedId] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const extractGoogleDriveId = (url: string) => {
    const regex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|id=)([a-zA-Z0-9_-]{25,})/;
    const match = url.match(regex);
    
    if (match && match[1]) {
        return match[1];
    }
    
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
        return url;
    }

    return null;
  };

  const processConversion = () => {
    const rawUrl = inputLink.trim();
    
    if (!rawUrl) {
        showMessage('Vui lòng nhập link chia sẻ Google Drive vào ô trên!', 'error');
        setOutputLink('');
        setExtractedId('');
        return;
    }

    const driveId = extractGoogleDriveId(rawUrl);

    if (driveId) {
        const directLink = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
        setOutputLink(directLink);
        setExtractedId(driveId);
        showMessage('Chuyển đổi thành công!', 'success');
    } else {
        setOutputLink('');
        setExtractedId('');
        showMessage('Không tìm thấy ID trong link. Vui lòng kiểm tra lại định dạng link Google Drive!', 'error');
    }
  };

  const copyToClipboard = () => {
    const textToCopy = outputLink.trim();
    
    if (!textToCopy) {
        showMessage('Không có link nào để copy!', 'error');
        return;
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showMessage('Đã copy link vào bộ nhớ tạm!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(textToCopy);
        });
    } else {
        fallbackCopyTextToClipboard(textToCopy);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('Đã copy link vào bộ nhớ tạm!', 'success');
        } else {
            showMessage('Copy thất bại, vui lòng copy thủ công.', 'error');
        }
    } catch (err) {
        showMessage('Trình duyệt không hỗ trợ copy tự động.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const clearFields = () => {
    setInputLink('');
    setOutputLink('');
    setExtractedId('');
    setMessage(null);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#1E1E1E] text-[#CCCCCC] font-sans">
      <div className="bg-[#2D2D30] w-full max-w-4xl rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-700 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                <HardDrive className="text-[#0061FF] w-8 h-8 md:w-10 md:h-10" /> 
                Tạo Link Tải Trực Tiếp GDrive
            </h1>
            <p className="text-gray-400 text-lg">Chuyển đổi link chia sẻ (Share link) thành link tải xuống trực tiếp (Direct link)</p>
        </div>

        {/* Khung Nhập Link Gốc */}
        <div className="flex flex-col gap-2">
            <label htmlFor="inputLink" className="text-lg font-semibold text-gray-300">Nhập Link Chia Sẻ (Share Link):</label>
            <textarea 
                id="inputLink" 
                rows={3} 
                ref={inputRef}
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-gray-600 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-[#0E639C] focus:ring-1 focus:ring-[#0E639C] transition-colors resize-none placeholder-gray-500"
                placeholder="Ví dụ: https://drive.google.com/file/d/1BvtEhUBKrve.../view?usp=drive_link"
            />
        </div>

        {/* Message Box */}
        {message && (
            <div className={`rounded-lg p-4 text-center font-medium transition-all text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {message.text}
            </div>
        )}

        {/* Nút Chức Năng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <button 
                onClick={processConversion} 
                className="bg-[#0E639C] hover:bg-[#1177BB] text-white text-xl font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <RefreshCw className="w-6 h-6" /> CHUYỂN ĐỔI
            </button>
            <button 
                onClick={copyToClipboard} 
                className="bg-[#388A34] hover:bg-[#43A047] text-white text-xl font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <Copy className="w-6 h-6" /> COPY LINK
            </button>
            <button 
                onClick={clearFields} 
                className="bg-[#1E1E1E] hover:bg-gray-700 border-2 border-gray-600 text-white text-xl font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <Eraser className="w-6 h-6" /> XÓA TRẮNG
            </button>
        </div>

        {/* Khung Xuất Link Tải */}
        <div className="flex flex-col gap-2 mt-2">
            <label htmlFor="outputLink" className="text-lg font-semibold text-gray-300 flex justify-between items-center">
                <span>Link Tải Trực Tiếp (Direct Link):</span>
                {extractedId && (
                    <span className="text-sm text-yellow-500 bg-[#1E1E1E] px-3 py-1 rounded-md border border-yellow-700">
                        ID: <span className="font-mono">{extractedId}</span>
                    </span>
                )}
            </label>
            <textarea 
                id="outputLink" 
                rows={3} 
                readOnly
                value={outputLink}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl p-4 text-green-400 font-mono text-lg focus:outline-none resize-none cursor-text"
                placeholder="Kết quả sẽ hiển thị tại đây..."
            />
        </div>

        {/* Hướng dẫn ngắn */}
        <div className="mt-4 bg-[#1E1E1E] p-4 rounded-xl border border-gray-700">
            <h3 className="font-bold text-gray-300 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" /> Cách hoạt động:
            </h3>
            <ol className="list-decimal list-inside text-gray-400 space-y-1 text-sm md:text-base">
                <li>Trích xuất ID từ link gốc (đoạn mã nằm giữa <code className="bg-gray-700 px-1 rounded">/d/</code> và <code className="bg-gray-700 px-1 rounded">/view</code>).</li>
                <li>Ghép ID vào định dạng: <code className="bg-gray-700 text-green-300 px-1 rounded break-all">https://drive.usercontent.google.com/download?id=[ID_CỦA_BẠN]&export=download&confirm=t</code></li>
            </ol>
        </div>
      </div>
    </div>
  );
}
