Hướng dẫn đóng góp (Contributing Guide)
Chào mừng bạn đến với dự án blog-kp23! Chúng tôi rất trân trọng sự quan tâm và đóng góp của bạn để dự án ngày càng hoàn thiện hơn.
Để đảm bảo quá trình cộng tác diễn ra suôn sẻ, vui lòng dành ít phút để đọc qua hướng dẫn dưới đây trước khi bắt đầu.
📝 Mục lục
Quy tắc ứng xử
Làm sao để đóng góp?
Quy trình gửi Pull Request
Tiêu chuẩn mã nguồn (Coding Standards)
Quy tắc đặt tên Commit
🤝 Quy tắc ứng xử
Chúng tôi hướng tới xây dựng một cộng đồng văn minh và tích cực. Vui lòng tôn trọng lẫn nhau, thảo luận mang tính xây dựng và hỗ trợ các thành viên khác trong quá trình đóng góp.
💡 Làm sao để đóng góp?
Bạn có thể đóng góp cho dự án theo nhiều cách:
Báo cáo lỗi (Bug Report): Nếu bạn phát hiện lỗi, hãy tạo một Issue với mô tả chi tiết, các bước tái hiện và môi trường gặp lỗi.
Đề xuất tính năng (Feature Request): Gửi ý tưởng về các tính năng mới mà bạn nghĩ là cần thiết qua Issue.
Sửa lỗi hoặc thêm tính năng: Trực tiếp tham gia viết code thông qua Pull Request.
Cải thiện tài liệu (Documentation): Sửa lỗi chính tả hoặc làm rõ nội dung trong các file .md.
🚀 Quy trình gửi Pull Request
Để đóng góp code, vui lòng thực hiện theo các bước sau:
Fork repository này về tài khoản cá nhân của bạn.
Clone repo từ tài khoản của bạn về máy cục bộ:
code
Bash
git clone https://github.com/username/blog-kp23.git
Tạo nhánh mới (Branch) để làm việc. Đặt tên nhánh theo cấu trúc: prefix/ten-nhánh.
feat/: Tính năng mới.
fix/: Sửa lỗi.
docs/: Chỉnh sửa tài liệu.
refactor/: Tối ưu hóa code.
Ví dụ: git checkout -b feat/add-dark-mode
Viết code và đảm bảo code chạy ổn định ở môi trường local.
Commit thay đổi của bạn (xem Quy tắc đặt tên Commit).
Push nhánh lên repository của bạn:
code
Bash
git push origin feat/add-dark-mode
Truy cập vào repo gốc trên GitHub và nhấn nút Compare & pull request.
Mô tả chi tiết những gì bạn đã thay đổi trong PR và chờ đợi maintainer review.
💻 Tiêu chuẩn mã nguồn
Để giữ cho dự án đồng nhất, vui lòng tuân thủ:
Sử dụng ESLint và Prettier (nếu dự án có sẵn cấu hình) để format code.
Đảm bảo code sạch (Clean Code), dễ đọc và có comment ở các xử lý phức tạp.
Kiểm tra kỹ các biến môi trường hoặc dependencies mới nếu có thêm vào.
📌 Quy tắc đặt tên Commit
Chúng tôi tuân theo tiêu chuẩn Conventional Commits. Một thông điệp commit nên có dạng:
<type>(<scope>): <description>
Các loại (type) phổ biến:
feat: Một tính năng mới cho người dùng.
fix: Sửa một lỗi (bug).
docs: Thay đổi về tài liệu.
style: Thay đổi về format (khoảng trắng, dấu phẩy...) không ảnh hưởng đến logic code.
refactor: Thay đổi code nhưng không sửa lỗi cũng không thêm tính năng.
perf: Cải thiện hiệu suất.
chore: Các thay đổi nhỏ về build process hoặc công cụ hỗ trợ.
Ví dụ:
feat(ui): add search bar to header
fix(auth): resolve login issue on mobile
docs: update setup instructions in README
Cảm ơn bạn đã góp phần giúp blog-kp23 trở nên tốt hơn! ❤️
