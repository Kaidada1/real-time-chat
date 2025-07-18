Real-time Chat Application

Ứng dụng chat thời gian thực được xây dựng với TypeScript, Tailwind CSS và Firebase.


✨ Tính năng

💬 Nhắn tin thời gian thực
👥 Hỗ trợ nhiều người dùng
🎨 Giao diện hiện đại với Tailwind CSS
📱 Responsive design
🔐 Xác thực người dùng với Firebase Auth
💾 Lưu trữ tin nhắn trên Firebase Firestore
🔔 Thông báo realtime
👤 Quản lý profile người dùng

🛠️ Công nghệ sử dụng

Frontend: React, TypeScript
Styling: Tailwind CSS, PostCSS
Database: Firebase Firestore
Authentication: Firebase Auth
Real-time: Firebase Firestore Real-time Listeners
Build Tool: Vite
Testing: React Testing Library (setupTests.ts)
Hosting: Firebase Hosting

📋 Yêu cầu hệ thống

Node.js >= 16.0.0
npm >= 7.0.0 hoặc yarn >= 1.22.0
Firebase project đã được setup

🚀 Cài đặt
1. Clone repository
bashgit clone https://github.com/Kaidada1/real-time-chat.git
cd real-time-chat
2. Cài đặt dependencies
bashnpm install
# hoặc
yarn install
3. Cấu hình Firebase
Tạo file .env trong thư mục gốc:
envREACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id



4. Cấu hình Firebase Firestore
Tạo collection messages và users trong Firestore với rules:
javascript// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{document} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

5. Chạy ứng dụng
bash# Development mode với Vite
npm run dev
# hoặc
yarn dev

# Build for production
npm run build
# hoặc
yarn build

# Preview production build
npm run preview
# hoặc
yarn preview
Truy cập ứng dụng tại http://localhost:5173 (Vite default port)

🎯 Cách sử dụng

Đăng ký/Đăng nhập

Mở trình duyệt và truy cập http://localhost:3000
Đăng ký tài khoản mới hoặc đăng nhập bằng tài khoản có sẵn
Hỗ trợ đăng nhập bằng Google/Email


Chat

Chọn người dùng hoặc tham gia phòng chat
Gõ tin nhắn và nhấn Enter để gửi
Tin nhắn sẽ hiển thị ngay lập tức cho tất cả người dùng


Tính năng nâng cao

Tạo phòng chat nhóm
Gửi emoji và sticker



🔧 Scripts
bash# Chạy ứng dụng ở chế độ development với Vite
npm run dev

# Build ứng dụng cho production
npm run build

# Preview production build
npm run preview

# Chạy tests
npm test

# Kiểm tra TypeScript
npm run type-check

# Lint và format code
npm run lint
npm run format

# Deploy lên Firebase
firebase deploy
🔥 Firebase Setup

Tạo Firebase project tại Firebase Console
Bật Authentication và chọn phương thức đăng nhập
Tạo Firestore database
Cấu hình hosting (tùy chọn)
Copy config vào file .env.local
