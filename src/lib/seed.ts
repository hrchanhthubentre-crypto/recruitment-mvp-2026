import type { Application, Catalogs, Company, Job, JobStatus, Profile, Settings, User, Activity, ModLog } from "./types";
import { daysFromNow } from "./utils";

const cat = (names: string[], p: string) => names.map((name, i) => ({ id: `${p}${i + 1}`, name, active: true }));

export const CATEGORY_NAMES = ["Công nghệ thông tin", "Kinh doanh – Bán hàng", "Marketing – Truyền thông", "Kế toán – Tài chính", "Nhân sự – Hành chính", "Thiết kế – Sáng tạo", "Vận hành – Logistics", "Giáo dục – Đào tạo", "Dịch vụ – Khách sạn", "Sản xuất – Kỹ thuật"];

export const seedCatalogs = (): Catalogs => ({
  categories: cat(CATEGORY_NAMES, "cat"),
  locations: cat(["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Bình Dương", "Làm việc từ xa"], "loc"),
  types: cat(["Toàn thời gian", "Bán thời gian", "Thực tập", "Hợp đồng thời vụ"], "typ"),
  levels: cat(["Thực tập sinh", "Nhân viên", "Chuyên viên", "Trưởng nhóm", "Quản lý"], "lvl"),
  experiences: cat(["Chưa có kinh nghiệm", "Dưới 1 năm", "1 – 3 năm", "3 – 5 năm", "Trên 5 năm"], "exp"),
});

export const seedSettings = (): Settings => ({ siteName: "Nắng Việc", supportEmail: "ho-tro@nangviec.example", perPage: 8, accent: "butter", radius: "md" });

export const SIZES = ["Dưới 50 nhân sự", "50 – 200 nhân sự", "200 – 500 nhân sự", "500 – 1.000 nhân sự", "Trên 1.000 nhân sự"];

/* Toàn bộ doanh nghiệp, tên và mã số thuế là HƯ CẤU (mã số thuế chỉ là chuỗi mẫu, không tương ứng doanh nghiệp thật). */
export const seedCompanies = (): Company[] => [
  { id: "c-saomai", name: "Sao Mai Tech", industry: "Công nghệ thông tin", size: SIZES[2], address: "Tầng 12, Tòa nhà Bình Minh, 88 Đường Láng", city: "Hà Nội", website: "saomaitech.example", email: "tuyendung@saomaitech.example", taxCode: "9900000101", tone: 0, status: "approved",
    about: "Sao Mai Tech xây dựng phần mềm quản trị và ứng dụng di động cho doanh nghiệp vừa và nhỏ. Đội ngũ làm việc theo mô hình sản phẩm, đề cao việc học hỏi và chia sẻ kiến thức.\n\nChúng tôi tin rằng một môi trường minh bạch, ít họp hành và nhiều trách nhiệm sẽ giúp mỗi người phát triển nhanh hơn." },
  { id: "c-luavang", name: "Lúa Vàng Foods", industry: "Sản xuất – Kỹ thuật", size: SIZES[4], address: "KCN Tân Hòa, Phường Tân Phú", city: "Bình Dương", website: "luavangfoods.example", email: "nhansu@luavangfoods.example", taxCode: "9900000102", tone: 1, status: "approved",
    about: "Lúa Vàng Foods chế biến và phân phối thực phẩm đóng gói đến hơn 20.000 điểm bán trên cả nước. Chúng tôi chú trọng an toàn thực phẩm và phát triển bền vững cùng nông dân vùng nguyên liệu." },
  { id: "c-haidang", name: "Hải Đăng Logistics", industry: "Vận hành – Logistics", size: SIZES[3], address: "25 Nguyễn Văn Linh, Quận Hải Châu", city: "Đà Nẵng", website: "haidanglogistics.example", email: "career@haidanglogistics.example", taxCode: "9900000103", tone: 2, status: "approved",
    about: "Hải Đăng Logistics cung cấp dịch vụ kho vận và giao hàng chặng cuối với mạng lưới trung tâm khai thác tại ba miền." },
  { id: "c-binhan", name: "Bình An Retail", industry: "Kinh doanh – Bán hàng", size: SIZES[4], address: "120 Nguyễn Thị Minh Khai, Quận 3", city: "TP. Hồ Chí Minh", website: "binhanretail.example", email: "tuyendung@binhanretail.example", taxCode: "9900000104", tone: 3, status: "approved",
    about: "Bình An Retail vận hành chuỗi cửa hàng tiện lợi và siêu thị mini tại các đô thị lớn, hướng đến trải nghiệm mua sắm gần gũi và nhanh gọn." },
  { id: "c-thanhtam", name: "Thanh Tâm Education", industry: "Giáo dục – Đào tạo", size: SIZES[1], address: "15 Trần Phú, Quận Ninh Kiều", city: "Cần Thơ", website: "thanhtam.example", email: "hr@thanhtam.example", taxCode: "9900000105", tone: 0, status: "approved",
    about: "Thanh Tâm Education là hệ thống trung tâm ngoại ngữ và kỹ năng cho học sinh, sinh viên với lộ trình học cá nhân hóa." },
  { id: "c-phuongnam", name: "Phương Nam Digital", industry: "Marketing – Truyền thông", size: SIZES[1], address: "45 Phạm Ngọc Thạch, Quận 1", city: "TP. Hồ Chí Minh", website: "phuongnamdigital.example", email: "hello@phuongnamdigital.example", taxCode: "9900000106", tone: 1, status: "approved",
    about: "Phương Nam Digital là agency tiếp thị số tích hợp: chiến lược thương hiệu, nội dung, quảng cáo hiệu suất và sản xuất video." },
  { id: "c-xanhviet", name: "Xanh Việt Energy", industry: "Sản xuất – Kỹ thuật", size: SIZES[2], address: "Lô B5, KCN Đình Vũ", city: "Hải Phòng", website: "xanhvietenergy.example", email: "tuyendung@xanhvietenergy.example", taxCode: "9900000107", tone: 2, status: "approved",
    about: "Xanh Việt Energy thiết kế, lắp đặt và vận hành các hệ thống điện mặt trời áp mái cho nhà máy và khu công nghiệp." },
  { id: "c-mocvan", name: "Mộc Lan Hospitality", industry: "Dịch vụ – Khách sạn", size: SIZES[3], address: "8 Trần Hưng Đạo, Hoàn Kiếm", city: "Hà Nội", website: "moclanhospitality.example", email: "tuyendung@moclanhospitality.example", taxCode: "9900000108", tone: 3, status: "approved",
    about: "Mộc Lan Hospitality quản lý chuỗi khách sạn boutique và nhà hàng, nơi mỗi vị trí đều là một phần của trải nghiệm khách hàng." },
  { id: "c-daiduong", name: "Đại Dương Finance", industry: "Kế toán – Tài chính", size: SIZES[2], address: "36 Lê Duẩn, Quận 1", city: "TP. Hồ Chí Minh", website: "daiduongfinance.example", email: "nhansu@daiduongfinance.example", taxCode: "9900000109", tone: 0, status: "approved",
    about: "Đại Dương Finance cung cấp giải pháp tài chính tiêu dùng và dịch vụ kế toán thuế cho doanh nghiệp nhỏ." },
  { id: "c-trevet", name: "Tre Việt Studio", industry: "Thiết kế – Sáng tạo", size: SIZES[0], address: "22 Xuân Diệu, Tây Hồ", city: "Hà Nội", website: "trevietstudio.example", email: "studio@trevietstudio.example", taxCode: "9900000110", tone: 1, status: "approved",
    about: "Tre Việt Studio là studio thiết kế thương hiệu và sản phẩm số với đội ngũ nhỏ, làm việc sát với khách hàng." },
  { id: "c-anphat", name: "An Phát Solar", industry: "Sản xuất – Kỹ thuật", size: SIZES[0], address: "12 Nguyễn Huệ, Phường Bến Nghé", city: "TP. Hồ Chí Minh", website: "anphatsolar.example", email: "hr@anphatsolar.example", taxCode: "9900000111", tone: 2, status: "pending",
    about: "An Phát Solar là doanh nghiệp mới thành lập, cung cấp thiết bị điện năng lượng mặt trời cho hộ gia đình." },
  { id: "c-kimlong", name: "Kim Long Trading", industry: "Kinh doanh – Bán hàng", size: SIZES[0], address: "5 Lê Lợi, Quận Hồng Bàng", city: "Hải Phòng", website: "kimlongtrading.example", email: "info@kimlongtrading.example", taxCode: "9900000112", tone: 3, status: "pending",
    about: "Kim Long Trading phân phối vật tư và thiết bị văn phòng cho khách hàng doanh nghiệp khu vực Hải Phòng." },
  { id: "c-vanhoa", name: "Vạn Hòa Media", industry: "Marketing – Truyền thông", size: SIZES[0], address: "9 Hoàng Diệu, Quận Hải Châu", city: "Đà Nẵng", website: "vanhoamedia.example", email: "contact@vanhoamedia.example", taxCode: "9900000113", tone: 0, status: "rejected", rejectReason: "Thông tin mã số thuế chưa khớp với tên doanh nghiệp, vui lòng cập nhật và gửi lại.", about: "Vạn Hòa Media là đơn vị sản xuất nội dung và truyền thông địa phương." },
];

/* ---------- Việc làm ---------- */
const DESC: Record<string, { d: string[]; r: string[]; b: string[] }> = {
  "Công nghệ thông tin": {
    d: ["Tham gia phân tích yêu cầu, thiết kế và phát triển tính năng cho sản phẩm đang vận hành.", "Viết mã sạch, có kiểm thử và tham gia đánh giá mã nguồn cùng đồng đội.", "Phối hợp với thiết kế và quản lý sản phẩm để chia nhỏ công việc theo từng chu kỳ hai tuần.", "Theo dõi, xử lý sự cố và cải thiện hiệu năng hệ thống."],
    r: ["Nắm vững nền tảng lập trình và cấu trúc dữ liệu.", "Có kinh nghiệm làm việc với Git và quy trình phát triển theo nhóm.", "Tư duy giải quyết vấn đề tốt, chủ động đặt câu hỏi.", "Đọc hiểu tài liệu kỹ thuật tiếng Anh."],
    b: ["Thưởng tháng 13 và thưởng theo hiệu quả dự án.", "Bảo hiểm sức khỏe mở rộng cho nhân viên.", "Ngân sách học tập 10 triệu đồng mỗi năm.", "Linh hoạt giờ làm, hỗ trợ làm việc từ xa 2 ngày mỗi tuần."] },
  "Kinh doanh – Bán hàng": {
    d: ["Tìm kiếm, chăm sóc và phát triển danh mục khách hàng theo khu vực được giao.", "Tư vấn giải pháp, lập báo giá và đàm phán hợp đồng.", "Báo cáo doanh số, phản hồi thị trường định kỳ cho quản lý trực tiếp.", "Phối hợp bộ phận vận hành để bảo đảm trải nghiệm sau bán."],
    r: ["Kỹ năng giao tiếp, thuyết phục và đàm phán tốt.", "Chịu được áp lực chỉ tiêu, có tinh thần cầu tiến.", "Sử dụng thành thạo Excel và công cụ quản lý khách hàng cơ bản.", "Ưu tiên ứng viên có kinh nghiệm trong ngành hàng tiêu dùng."],
    b: ["Lương cứng cạnh tranh cùng hoa hồng không giới hạn.", "Thưởng quý, thưởng nóng theo chiến dịch.", "Được đào tạo kỹ năng bán hàng bài bản.", "Hỗ trợ chi phí đi lại và điện thoại."] },
  "Marketing – Truyền thông": {
    d: ["Lên kế hoạch và triển khai chiến dịch trên các kênh số và truyền thông xã hội.", "Sản xuất nội dung phù hợp với từng nhóm khách hàng mục tiêu.", "Theo dõi số liệu, phân tích hiệu quả và đề xuất tối ưu.", "Làm việc cùng đội thiết kế, sản xuất video và đối tác truyền thông."],
    r: ["Khả năng viết tốt, nhạy bén với xu hướng.", "Biết sử dụng công cụ phân tích như bảng tính và báo cáo quảng cáo.", "Tư duy sáng tạo và có trách nhiệm với tiến độ.", "Có portfolio hoặc sản phẩm thực tế là một lợi thế."],
    b: ["Môi trường trẻ, cởi mở, khuyến khích thử nghiệm.", "Thưởng dự án theo hiệu quả chiến dịch.", "Gói chăm sóc sức khỏe và du lịch hằng năm.", "Thiết bị làm việc do công ty cung cấp."] },
  "Kế toán – Tài chính": {
    d: ["Hạch toán, đối chiếu chứng từ và lập báo cáo tài chính theo quy định hiện hành.", "Theo dõi công nợ, thu chi và dòng tiền hằng tuần.", "Kê khai thuế, làm việc với cơ quan thuế khi cần thiết.", "Hỗ trợ kiểm toán nội bộ và độc lập."],
    r: ["Tốt nghiệp chuyên ngành kế toán, tài chính hoặc liên quan.", "Nắm vững chuẩn mực kế toán Việt Nam.", "Thành thạo Excel và một phần mềm kế toán phổ biến.", "Cẩn thận, trung thực và giữ bí mật thông tin."],
    b: ["Thưởng tháng 13 và thưởng cuối năm.", "Bảo hiểm đầy đủ theo quy định, khám sức khỏe định kỳ.", "Lộ trình thăng tiến rõ ràng.", "Hỗ trợ chi phí chứng chỉ nghề nghiệp."] },
  "Nhân sự – Hành chính": {
    d: ["Triển khai quy trình tuyển dụng: đăng tin, sàng lọc hồ sơ, sắp xếp phỏng vấn.", "Quản lý hồ sơ nhân sự, hợp đồng và các chế độ theo quy định.", "Tổ chức hoạt động gắn kết và chào đón nhân viên mới.", "Phối hợp các bộ phận để theo dõi nhu cầu nhân lực."],
    r: ["Kỹ năng giao tiếp và lắng nghe tốt.", "Hiểu biết cơ bản về Luật Lao động.", "Có tổ chức, bảo mật thông tin tốt.", "Sử dụng thành thạo bộ công cụ văn phòng."],
    b: ["Thưởng lễ tết, sinh nhật, du lịch hằng năm.", "Bảo hiểm sức khỏe và tai nạn 24/7.", "Giờ làm việc cố định, nghỉ thứ Bảy, Chủ nhật.", "Được tham gia các khóa đào tạo nghiệp vụ nhân sự."] },
  "Thiết kế – Sáng tạo": {
    d: ["Thiết kế giao diện, bộ nhận diện hoặc ấn phẩm truyền thông theo định hướng của dự án.", "Xây dựng và duy trì hệ thống thiết kế dùng chung.", "Trình bày ý tưởng, nhận phản hồi và hoàn thiện sản phẩm.", "Cộng tác sát với đội nội dung và lập trình."],
    r: ["Thành thạo Figma và bộ công cụ thiết kế phổ biến.", "Có portfolio thể hiện tư duy thiết kế rõ ràng.", "Hiểu nguyên tắc bố cục, màu sắc và typography.", "Biết nhận và phản hồi góp ý một cách xây dựng."],
    b: ["Không gian làm việc sáng tạo, cởi mở.", "Cấp thiết bị và bản quyền phần mềm.", "Thưởng theo dự án, du lịch cùng đội.", "Cơ hội làm việc với nhiều ngành hàng."] },
  "Vận hành – Logistics": {
    d: ["Điều phối đơn hàng, kho và đội giao nhận theo ca làm việc.", "Theo dõi tiến độ, xử lý phát sinh và phản hồi khách hàng.", "Kiểm soát tồn kho, chất lượng và an toàn vận hành.", "Tổng hợp báo cáo hiệu suất hằng ngày."],
    r: ["Có khả năng tổ chức và xử lý tình huống nhanh.", "Sử dụng tốt Excel; biết hệ thống quản lý kho là lợi thế.", "Sức khỏe tốt, chấp nhận làm theo ca.", "Trung thực, có trách nhiệm với tài sản."],
    b: ["Phụ cấp ca, phụ cấp ăn trưa.", "Thưởng chuyên cần và thưởng hiệu suất.", "Đồng phục, bảo hộ lao động đầy đủ.", "Cơ hội trở thành quản lý ca sau 12 tháng."] },
  "Giáo dục – Đào tạo": {
    d: ["Giảng dạy theo giáo trình và lộ trình của trung tâm.", "Theo dõi tiến bộ, phản hồi định kỳ đến học viên và phụ huynh.", "Tham gia xây dựng học liệu, hoạt động ngoại khóa.", "Tham dự các buổi đào tạo chuyên môn nội bộ."],
    r: ["Tốt nghiệp sư phạm hoặc chuyên ngành phù hợp.", "Phát âm và kỹ năng sư phạm tốt.", "Kiên nhẫn, yêu thích làm việc với học sinh.", "Có chứng chỉ giảng dạy là một lợi thế."],
    b: ["Thu nhập theo giờ dạy, thưởng theo kết quả học viên.", "Được đào tạo phương pháp giảng dạy.", "Lịch làm việc linh hoạt theo ca.", "Môi trường thân thiện, hỗ trợ lẫn nhau."] },
  "Dịch vụ – Khách sạn": {
    d: ["Đón tiếp và hỗ trợ khách hàng, bảo đảm chuẩn mực dịch vụ của thương hiệu.", "Phối hợp các bộ phận để xử lý yêu cầu nhanh chóng.", "Giữ gìn không gian, trang thiết bị và hình ảnh cơ sở.", "Ghi nhận phản hồi của khách để cải thiện dịch vụ."],
    r: ["Ngoại hình gọn gàng, thái độ nhiệt tình.", "Giao tiếp tiếng Anh cơ bản.", "Làm việc theo ca, kể cả cuối tuần và ngày lễ.", "Có kinh nghiệm ngành dịch vụ là một lợi thế."],
    b: ["Phí dịch vụ chia đều hằng tháng.", "Bao ăn ca, đồng phục và giặt ủi.", "Ưu đãi lưu trú cho nhân viên và người thân.", "Đào tạo nghiệp vụ và cơ hội luân chuyển."] },
  "Sản xuất – Kỹ thuật": {
    d: ["Giám sát vận hành dây chuyền, bảo đảm sản lượng và chất lượng.", "Lập kế hoạch bảo trì phòng ngừa và xử lý sự cố thiết bị.", "Tuân thủ quy trình an toàn lao động và môi trường.", "Đề xuất cải tiến để giảm hao phí."],
    r: ["Tốt nghiệp kỹ thuật, cơ khí, điện hoặc chuyên ngành liên quan.", "Đọc hiểu bản vẽ kỹ thuật.", "Có tinh thần trách nhiệm cao với an toàn.", "Sẵn sàng làm việc theo ca."],
    b: ["Xe đưa đón, bữa ăn ca miễn phí.", "Thưởng sản lượng và thưởng an toàn.", "Bảo hiểm tai nạn bổ sung.", "Đào tạo nâng cao tay nghề định kỳ."] },
};

type J = [string, string, string, string, string, string, string, number, number, number, number, JobStatus?];
// [id, tiêu đề, công ty, ngành, địa điểm, hình thức, cấp bậc, lương min, lương max, đăng cách đây (ngày), hạn nộp sau (ngày), trạng thái]
const L: J[] = [
  ["j01", "Lập trình viên React (Frontend)", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Toàn thời gian", "Chuyên viên", 20, 35, 1, 28],
  ["j02", "Kỹ sư Backend Node.js", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Toàn thời gian", "Chuyên viên", 25, 40, 2, 25],
  ["j03", "Chuyên viên kiểm thử phần mềm (QA)", "c-saomai", "Công nghệ thông tin", "Làm việc từ xa", "Toàn thời gian", "Nhân viên", 15, 25, 4, 30],
  ["j04", "Thực tập sinh phát triển ứng dụng di động", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Thực tập", "Thực tập sinh", 4, 6, 6, 40],
  ["j05", "Trưởng nhóm sản phẩm số", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Toàn thời gian", "Trưởng nhóm", 45, 70, 9, 20, "pending"],
  ["j06", "Chuyên viên phân tích dữ liệu", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Toàn thời gian", "Chuyên viên", 22, 32, 12, 35, "draft"],
  ["j07", "Nhân viên hỗ trợ khách hàng kỹ thuật", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Bán thời gian", "Nhân viên", 8, 12, 15, 12, "rejected"],
  ["j08", "Quản trị hệ thống (DevOps)", "c-saomai", "Công nghệ thông tin", "Hà Nội", "Toàn thời gian", "Chuyên viên", 30, 50, 40, -5, "closed"],
  ["j09", "Giám sát kinh doanh khu vực miền Nam", "c-luavang", "Kinh doanh – Bán hàng", "TP. Hồ Chí Minh", "Toàn thời gian", "Quản lý", 25, 40, 1, 21],
  ["j10", "Kỹ sư quản lý chất lượng (QA/QC)", "c-luavang", "Sản xuất – Kỹ thuật", "Bình Dương", "Toàn thời gian", "Chuyên viên", 15, 22, 3, 30],
  ["j11", "Công nhân vận hành máy đóng gói", "c-luavang", "Sản xuất – Kỹ thuật", "Bình Dương", "Hợp đồng thời vụ", "Nhân viên", 9, 13, 5, 18],
  ["j12", "Nhân viên kinh doanh kênh siêu thị", "c-luavang", "Kinh doanh – Bán hàng", "Hà Nội", "Toàn thời gian", "Nhân viên", 10, 18, 7, 26],
  ["j13", "Điều phối viên vận chuyển", "c-haidang", "Vận hành – Logistics", "Đà Nẵng", "Toàn thời gian", "Nhân viên", 10, 15, 1, 22],
  ["j14", "Quản lý kho trung tâm khai thác", "c-haidang", "Vận hành – Logistics", "Đà Nẵng", "Toàn thời gian", "Quản lý", 22, 32, 4, 30],
  ["j15", "Nhân viên chứng từ xuất nhập khẩu", "c-haidang", "Vận hành – Logistics", "Hải Phòng", "Toàn thời gian", "Nhân viên", 11, 16, 8, 25],
  ["j16", "Cửa hàng trưởng cửa hàng tiện lợi", "c-binhan", "Kinh doanh – Bán hàng", "TP. Hồ Chí Minh", "Toàn thời gian", "Quản lý", 16, 24, 2, 20],
  ["j17", "Nhân viên bán hàng bán thời gian", "c-binhan", "Kinh doanh – Bán hàng", "TP. Hồ Chí Minh", "Bán thời gian", "Nhân viên", 5, 8, 3, 15],
  ["j18", "Chuyên viên tuyển dụng", "c-binhan", "Nhân sự – Hành chính", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 15, 22, 6, 28],
  ["j19", "Giáo viên tiếng Anh giao tiếp", "c-thanhtam", "Giáo dục – Đào tạo", "Cần Thơ", "Toàn thời gian", "Nhân viên", 12, 20, 2, 30],
  ["j20", "Tư vấn tuyển sinh", "c-thanhtam", "Giáo dục – Đào tạo", "Cần Thơ", "Toàn thời gian", "Nhân viên", 8, 14, 5, 24],
  ["j21", "Trợ giảng bán thời gian", "c-thanhtam", "Giáo dục – Đào tạo", "Cần Thơ", "Bán thời gian", "Thực tập sinh", 3, 5, 10, 33],
  ["j22", "Chuyên viên quảng cáo hiệu suất", "c-phuongnam", "Marketing – Truyền thông", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 18, 28, 1, 27],
  ["j23", "Biên tập nội dung (Content Creator)", "c-phuongnam", "Marketing – Truyền thông", "Làm việc từ xa", "Toàn thời gian", "Nhân viên", 12, 18, 3, 29],
  ["j24", "Nhà thiết kế đồ họa", "c-phuongnam", "Thiết kế – Sáng tạo", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 14, 22, 6, 31],
  ["j25", "Quản lý tài khoản khách hàng (Account Manager)", "c-phuongnam", "Marketing – Truyền thông", "TP. Hồ Chí Minh", "Toàn thời gian", "Trưởng nhóm", 25, 38, 11, 19],
  ["j26", "Kỹ sư thiết kế hệ thống điện mặt trời", "c-xanhviet", "Sản xuất – Kỹ thuật", "Hải Phòng", "Toàn thời gian", "Chuyên viên", 18, 30, 2, 32],
  ["j27", "Kỹ thuật viên lắp đặt và bảo trì", "c-xanhviet", "Sản xuất – Kỹ thuật", "Hải Phòng", "Toàn thời gian", "Nhân viên", 10, 16, 5, 21],
  ["j28", "Chuyên viên kinh doanh dự án năng lượng", "c-xanhviet", "Kinh doanh – Bán hàng", "Hà Nội", "Toàn thời gian", "Chuyên viên", 20, 40, 8, 27],
  ["j29", "Lễ tân khách sạn", "c-mocvan", "Dịch vụ – Khách sạn", "Hà Nội", "Toàn thời gian", "Nhân viên", 8, 12, 1, 17],
  ["j30", "Bếp phó nhà hàng Á – Âu", "c-mocvan", "Dịch vụ – Khách sạn", "Hà Nội", "Toàn thời gian", "Chuyên viên", 18, 28, 4, 23],
  ["j31", "Nhân viên phục vụ bàn (ca xoay)", "c-mocvan", "Dịch vụ – Khách sạn", "Hà Nội", "Bán thời gian", "Nhân viên", 6, 9, 7, 14],
  ["j32", "Kế toán tổng hợp", "c-daiduong", "Kế toán – Tài chính", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 18, 28, 2, 26],
  ["j33", "Chuyên viên thẩm định tín dụng", "c-daiduong", "Kế toán – Tài chính", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 20, 35, 5, 30],
  ["j34", "Kế toán thuế (làm việc từ xa)", "c-daiduong", "Kế toán – Tài chính", "Làm việc từ xa", "Hợp đồng thời vụ", "Chuyên viên", 12, 18, 9, 22],
  ["j35", "Thiết kế trải nghiệm người dùng (UX/UI)", "c-trevet", "Thiết kế – Sáng tạo", "Hà Nội", "Toàn thời gian", "Chuyên viên", 20, 32, 3, 28],
  ["j36", "Họa sĩ minh họa thương hiệu", "c-trevet", "Thiết kế – Sáng tạo", "Hà Nội", "Hợp đồng thời vụ", "Nhân viên", 0, 0, 6, 30],
  ["j37", "Thực tập sinh thiết kế", "c-trevet", "Thiết kế – Sáng tạo", "Hà Nội", "Thực tập", "Thực tập sinh", 3, 5, 10, 35],
  ["j38", "Chuyên viên hành chính – nhân sự", "c-kimlong", "Nhân sự – Hành chính", "Hải Phòng", "Toàn thời gian", "Nhân viên", 9, 13, 1, 20, "pending"],
  ["j39", "Nhân viên kinh doanh thiết bị văn phòng", "c-kimlong", "Kinh doanh – Bán hàng", "Hải Phòng", "Toàn thời gian", "Nhân viên", 9, 15, 2, 24, "pending"],
  ["j40", "Kỹ sư tư vấn giải pháp điện mặt trời", "c-anphat", "Sản xuất – Kỹ thuật", "TP. Hồ Chí Minh", "Toàn thời gian", "Chuyên viên", 15, 25, 1, 29, "pending"],
  ["j41", "Quản lý cộng đồng mạng xã hội", "c-vanhoa", "Marketing – Truyền thông", "Đà Nẵng", "Toàn thời gian", "Nhân viên", 10, 15, 3, 26, "pending"],
  ["j42", "Tài xế giao hàng (xe tải nhẹ)", "c-haidang", "Vận hành – Logistics", "Đà Nẵng", "Hợp đồng thời vụ", "Nhân viên", 9, 14, 12, 20, "hidden"],
];
const EXP_BY_LEVEL: Record<string, string> = { "Thực tập sinh": "Chưa có kinh nghiệm", "Nhân viên": "Dưới 1 năm", "Chuyên viên": "1 – 3 năm", "Trưởng nhóm": "3 – 5 năm", "Quản lý": "Trên 5 năm" };

export const seedJobs = (): Job[] => L.map(([id, title, companyId, category, location, type, level, salaryMin, salaryMax, ago, left, status = "approved"]) => {
  const t = DESC[category];
  const job: Job = { id, title, companyId, category, location, type, level, experience: EXP_BY_LEVEL[level], salaryMin, salaryMax,
    postedAt: daysFromNow(-ago), deadline: daysFromNow(left), description: t.d, requirements: t.r, benefits: t.b, status, headcount: 1 + (title.length % 4) };
  if (status === "rejected") job.rejectReason = "Nội dung chưa nêu rõ quyền lợi và địa điểm làm việc cụ thể. Vui lòng bổ sung rồi gửi duyệt lại.";
  if (status === "hidden") job.hiddenReason = "Tin có nội dung trùng lặp với một tin khác của doanh nghiệp.";
  return job;
});

/* ---------- Người dùng ---------- */
export const DEMO = { candidate: "u-cand", employer: "u-emp", admin: "u-admin" } as const;
export const seedUsers = (): User[] => [
  { id: "u-cand", name: "Nguyễn Minh Anh", email: "ungvien@demo.example", role: "candidate", status: "active", createdAt: daysFromNow(-120) },
  { id: "u-emp", name: "Trần Hoài Phương", email: "nhatuyendung@demo.example", role: "employer", status: "active", companyId: "c-saomai", createdAt: daysFromNow(-200) },
  { id: "u-admin", name: "Quản trị viên mẫu", email: "quantri@demo.example", role: "admin", status: "active", createdAt: daysFromNow(-365) },
  { id: "u-c2", name: "Lê Quang Huy", email: "huy.le@mail.example", role: "candidate", status: "active", createdAt: daysFromNow(-60) },
  { id: "u-c3", name: "Phạm Thu Hà", email: "ha.pham@mail.example", role: "candidate", status: "active", createdAt: daysFromNow(-45) },
  { id: "u-c4", name: "Đỗ Gia Bảo", email: "bao.do@mail.example", role: "candidate", status: "locked", createdAt: daysFromNow(-30) },
  { id: "u-c5", name: "Vũ Khánh Linh", email: "linh.vu@mail.example", role: "candidate", status: "active", createdAt: daysFromNow(-12) },
  { id: "u-e2", name: "Ngô Thanh Sơn", email: "son.ngo@luavangfoods.example", role: "employer", status: "active", companyId: "c-luavang", createdAt: daysFromNow(-150) },
  { id: "u-e3", name: "Bùi Mai Chi", email: "chi.bui@phuongnamdigital.example", role: "employer", status: "active", companyId: "c-phuongnam", createdAt: daysFromNow(-90) },
  { id: "u-e4", name: "Hoàng Đức Thịnh", email: "thinh.hoang@anphatsolar.example", role: "employer", status: "active", companyId: "c-anphat", createdAt: daysFromNow(-3) },
  { id: "u-e5", name: "Trịnh Bảo Ngọc", email: "ngoc.trinh@kimlongtrading.example", role: "employer", status: "active", companyId: "c-kimlong", createdAt: daysFromNow(-5) },
];

export const seedProfile = (): Profile => ({
  fullName: "Nguyễn Minh Anh", email: "ungvien@demo.example", phone: "0901 000 111", birthYear: "1999", city: "Hà Nội",
  summary: "Lập trình viên frontend với hơn 3 năm kinh nghiệm xây dựng ứng dụng web cho doanh nghiệp. Yêu thích giao diện gọn gàng, dễ dùng và làm việc theo nhóm.",
  skills: ["React", "TypeScript", "Tailwind CSS", "Git", "Figma", "Tiếng Anh giao tiếp"],
  experiences: [
    { id: "x1", company: "Công ty TNHH Giải pháp Số Hoa Sen", title: "Lập trình viên Frontend", from: "2023-03", to: "", desc: "Phát triển cổng thông tin khách hàng, tối ưu tốc độ tải trang và xây dựng thư viện thành phần giao diện dùng chung." },
    { id: "x2", company: "Studio Mây Trắng", title: "Thực tập sinh Frontend", from: "2022-06", to: "2023-02", desc: "Chuyển đổi bản thiết kế sang giao diện web responsive; hỗ trợ kiểm thử trên nhiều thiết bị." },
  ],
  education: [{ id: "e1", school: "Đại học Công nghệ Thông tin Hà Nội (hư cấu)", major: "Công nghệ thông tin", from: "2017", to: "2021" }],
  desiredTitle: "Lập trình viên Frontend", desiredCategory: "Công nghệ thông tin", desiredLocation: "Hà Nội", desiredSalary: "25 – 35 triệu", desiredType: "Toàn thời gian", openToWork: true,
  cv: { name: "CV_NguyenMinhAnh_mau.pdf", size: 248000, uploadedAt: daysFromNow(-20) },
});

export const blankProfile = (name: string, email: string): Profile => ({
  fullName: name, email, phone: "", birthYear: "", city: "", summary: "", skills: [], experiences: [], education: [],
  desiredTitle: "", desiredCategory: "", desiredLocation: "", desiredSalary: "", desiredType: "Toàn thời gian", openToWork: true, cv: null,
});

/* ---------- Hồ sơ ứng tuyển ---------- */
const mk = (id: string, jobId: string, candidateId: string, name: string, email: string, headline: string, ago: number, status: Application["status"], years: number, skills: string[], location: string, note = ""): Application => ({
  id, jobId, candidateId, name, email, phone: "09" + String(10000000 + Math.abs(id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 89999999).slice(0, 8), headline,
  appliedAt: daysFromNow(-ago), status, note, cvName: `CV_${name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").replace(/\s+/g, "")}_mau.pdf`,
  cover: "Em đã tìm hiểu về công ty và thấy vị trí này phù hợp với định hướng của mình. Mong có cơ hội trao đổi thêm với anh/chị.",
  skills, years, location,
  timeline: [{ at: daysFromNow(-ago), text: "Hồ sơ được gửi" }, ...(status !== "new" ? [{ at: daysFromNow(-ago + 1), text: "Nhà tuyển dụng đang xem xét hồ sơ" }] : []), ...(status === "interview" ? [{ at: daysFromNow(-ago + 2), text: "Được mời phỏng vấn" }] : []), ...(status === "closed" ? [{ at: daysFromNow(-ago + 3), text: "Quy trình tuyển dụng kết thúc" }] : [])],
});
export const seedApplications = (): Application[] => [
  mk("a01", "j01", "u-cand", "Nguyễn Minh Anh", "ungvien@demo.example", "Lập trình viên Frontend", 6, "interview", 3, ["React", "TypeScript", "Tailwind CSS"], "Hà Nội", "Ứng viên có portfolio tốt, hẹn phỏng vấn kỹ thuật thứ Năm."),
  mk("a02", "j13", "u-cand", "Nguyễn Minh Anh", "ungvien@demo.example", "Lập trình viên Frontend", 14, "closed", 3, ["React", "Git"], "Hà Nội"),
  mk("a03", "j35", "u-cand", "Nguyễn Minh Anh", "ungvien@demo.example", "Lập trình viên Frontend", 3, "reviewing", 3, ["Figma", "React"], "Hà Nội"),
  mk("a04", "j22", "u-cand", "Nguyễn Minh Anh", "ungvien@demo.example", "Lập trình viên Frontend", 1, "new", 3, ["Tiếng Anh giao tiếp"], "Hà Nội"),
  mk("a05", "j01", "u-c2", "Lê Quang Huy", "huy.le@mail.example", "Frontend Developer", 2, "new", 2, ["React", "JavaScript", "CSS"], "Hà Nội"),
  mk("a06", "j01", "u-c3", "Phạm Thu Hà", "ha.pham@mail.example", "Kỹ sư phần mềm", 4, "reviewing", 4, ["Vue", "React", "Node.js"], "Hà Nội"),
  mk("a07", "j01", "u-c5", "Vũ Khánh Linh", "linh.vu@mail.example", "Lập trình viên web", 5, "closed", 1, ["HTML", "CSS", "JavaScript"], "Hải Phòng", "Chưa đủ kinh nghiệm cho vị trí này, lưu hồ sơ cho đợt thực tập."),
  mk("a08", "j02", "u-c2", "Lê Quang Huy", "huy.le@mail.example", "Backend Developer", 3, "new", 2, ["Node.js", "PostgreSQL"], "Hà Nội"),
  mk("a09", "j02", "x1", "Mai Thế Vinh", "vinh.mai@mail.example", "Kỹ sư Backend", 7, "interview", 5, ["Node.js", "Docker", "AWS"], "Hà Nội"),
  mk("a10", "j02", "x2", "Đinh Ngọc Trâm", "tram.dinh@mail.example", "Lập trình viên", 1, "new", 3, ["TypeScript", "NestJS"], "Đà Nẵng"),
  mk("a11", "j03", "u-c3", "Phạm Thu Hà", "ha.pham@mail.example", "QA Engineer", 8, "reviewing", 4, ["Kiểm thử thủ công", "Cypress"], "Hà Nội"),
  mk("a12", "j03", "x3", "Cao Văn Lâm", "lam.cao@mail.example", "Tester", 2, "new", 1, ["Kiểm thử thủ công", "SQL"], "Làm việc từ xa"),
  mk("a13", "j04", "x4", "Trần Bảo Châu", "chau.tran@mail.example", "Sinh viên năm cuối CNTT", 5, "new", 0, ["Kotlin", "Flutter"], "Hà Nội"),
  mk("a14", "j04", "x5", "Lương Anh Dũng", "dung.luong@mail.example", "Sinh viên năm cuối", 9, "reviewing", 0, ["Flutter", "Dart"], "Hà Nội"),
  mk("a15", "j08", "x6", "Hồ Nhật Nam", "nam.ho@mail.example", "DevOps Engineer", 30, "closed", 4, ["Docker", "Kubernetes", "CI/CD"], "Hà Nội"),
  mk("a16", "j09", "u-c2", "Lê Quang Huy", "huy.le@mail.example", "Nhân viên kinh doanh", 4, "new", 3, ["Đàm phán", "Excel"], "TP. Hồ Chí Minh"),
];

export const seedActivity = (): Activity[] => [
  { id: "ac1", at: daysFromNow(-1), kind: "apply", text: "Ứng viên Đinh Ngọc Trâm vừa ứng tuyển vị trí Kỹ sư Backend Node.js" },
  { id: "ac2", at: daysFromNow(-2), kind: "apply", text: "Ứng viên Lê Quang Huy vừa ứng tuyển vị trí Lập trình viên React (Frontend)" },
  { id: "ac3", at: daysFromNow(-4), kind: "job", text: "Tin “Lập trình viên React (Frontend)” đã được quản trị viên duyệt" },
  { id: "ac4", at: daysFromNow(-9), kind: "job", text: "Bạn đã gửi duyệt tin “Trưởng nhóm sản phẩm số”" },
  { id: "ac5", at: daysFromNow(-15), kind: "job", text: "Tin “Nhân viên hỗ trợ khách hàng kỹ thuật” bị từ chối: cần bổ sung quyền lợi" },
];
export const seedModLog = (): ModLog[] => [
  { id: "m1", at: daysFromNow(0), jobId: "j13", action: "approved" },
  { id: "m2", at: daysFromNow(0), jobId: "j22", action: "approved" },
  { id: "m3", at: daysFromNow(-1), jobId: "j07", action: "rejected", reason: "Thiếu quyền lợi" },
];

/* ===== UI 2.0: dữ liệu bổ sung (hồ sơ trải đều theo thời gian để biểu đồ có ý nghĩa) ===== */
const EXTRA: [string, string, string, string[]][] = [
  ["Trần Gia Hân", "Frontend Developer", "Hà Nội", ["React", "Vue", "CSS"]], ["Nguyễn Đức Long", "Kỹ sư phần mềm", "Hà Nội", ["JavaScript", "Node.js"]], ["Phan Thúy Quỳnh", "Lập trình viên web", "Hải Phòng", ["HTML", "React"]],
  ["Lý Hoàng Nam", "Backend Developer", "Hà Nội", ["Node.js", "MongoDB"]], ["Bùi Khánh Vy", "QA Engineer", "Hà Nội", ["Kiểm thử", "SQL"]], ["Đặng Minh Quân", "Fullstack Developer", "Đà Nẵng", ["React", "Node.js", "Docker"]],
  ["Hồ Thanh Tùng", "Lập trình viên", "Hà Nội", ["TypeScript", "Git"]], ["Vương Ngọc Ánh", "Sinh viên CNTT", "Hà Nội", ["Flutter", "Dart"]], ["Châu Bảo Trân", "Business Analyst", "Hà Nội", ["Phân tích", "SQL"]],
  ["Tạ Quốc Việt", "DevOps", "Hà Nội", ["Docker", "Linux"]], ["Lưu Mỹ Linh", "UI Developer", "Hà Nội", ["React", "Figma"]], ["Kiều Anh Tuấn", "Backend Engineer", "Hà Nội", ["Java", "Spring"]],
  ["Dương Thu Thảo", "Kiểm thử viên", "Làm việc từ xa", ["Cypress", "Jira"]], ["Mạc Văn Hòa", "Lập trình viên mobile", "Hà Nội", ["Kotlin", "Swift"]], ["Quách Tố Uyên", "Frontend Developer", "Hà Nội", ["React", "Redux"]],
  ["Trương Hải Đăng", "Software Engineer", "Hà Nội", ["Go", "PostgreSQL"]], ["Ninh Diệu Hương", "QA Lead", "Hà Nội", ["Kiểm thử", "Selenium"]], ["Âu Gia Bình", "Thực tập sinh", "Hà Nội", ["Flutter"]],
];
export const seedExtraApplications = (): Application[] => EXTRA.flatMap(([name, headline, location, skills], i) => {
  const jobs = ["j01", "j02", "j03", "j04", "j08", "j01", "j02", "j03"];
  const n = i % 3 === 0 ? 2 : 1;
  return Array.from({ length: n }, (_, k) => {
    const jobId = jobs[(i + k * 3) % jobs.length]; const ago = 2 + ((i * 7 + k * 11) % 56);
    const st: Application["status"] = ago > 40 ? "closed" : ago > 24 ? (i % 2 ? "interview" : "reviewing") : ago > 8 ? (i % 3 ? "reviewing" : "new") : "new";
    return mk(`ax${i}-${k}`, jobId, `xc${i}`, name, `${name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/\s+/g, ".")}@mail.example`, headline, ago, st, 1 + (i % 6), skills, location);
  });
});

import type { Notification, Report, Prefs } from "./types";
export const defaultPrefs = (): Prefs => ({ emailStatus: true, emailJobs: true, emailNews: false, inApp: true });
export const seedNotifications = (): Notification[] => [
  { id: "n1", userId: "u-cand", at: daysFromNow(0), kind: "status", read: false, title: "Hồ sơ được mời phỏng vấn", body: "Sao Mai Tech mời bạn phỏng vấn vị trí Lập trình viên React (Frontend). Nhà tuyển dụng sẽ liên hệ qua số điện thoại bạn đã cung cấp." },
  { id: "n2", userId: "u-cand", at: daysFromNow(-1), kind: "apply", read: false, title: "Đã gửi hồ sơ thành công", body: "Hồ sơ ứng tuyển vị trí Chuyên viên quảng cáo hiệu suất đã được gửi tới Phương Nam Digital." },
  { id: "n3", userId: "u-cand", at: daysFromNow(-3), kind: "status", read: true, title: "Hồ sơ đang được xem xét", body: "Tre Việt Studio đang xem xét hồ sơ vị trí Thiết kế trải nghiệm người dùng (UX/UI)." },
  { id: "n4", userId: "u-cand", at: daysFromNow(-5), kind: "job", read: true, title: "Việc làm phù hợp với bạn", body: "Có 3 tin mới thuộc ngành Công nghệ thông tin tại Hà Nội vừa được đăng." },
  { id: "n5", userId: "u-cand", at: daysFromNow(-14), kind: "status", read: true, title: "Quy trình tuyển dụng đã kết thúc", body: "Hải Đăng Logistics đã kết thúc quy trình cho vị trí Điều phối viên vận chuyển." },
];
export const seedReports = (): Report[] => [
  { id: "r1", targetType: "job", targetId: "j31", targetLabel: "Nhân viên phục vụ bàn (ca xoay)", reason: "Thông tin không chính xác", detail: "Mức lương trong tin khác với mức được trao đổi khi liên hệ.", reporter: "Lê Quang Huy", at: daysFromNow(-1), status: "open" },
  { id: "r2", targetType: "job", targetId: "j11", targetLabel: "Công nhân vận hành máy đóng gói", reason: "Nghi ngờ lừa đảo", detail: "Tin yêu cầu nộp phí hồ sơ trước khi phỏng vấn.", reporter: "Phạm Thu Hà", at: daysFromNow(-2), status: "open" },
  { id: "r3", targetType: "user", targetId: "u-c4", targetLabel: "Đỗ Gia Bảo", reason: "Spam hồ sơ", detail: "Tài khoản nộp hàng loạt hồ sơ giống nhau trong thời gian ngắn.", reporter: "Hệ thống (mẫu)", at: daysFromNow(-6), status: "resolved", resolution: "Đã khóa tài khoản tạm thời." },
  { id: "r4", targetType: "job", targetId: "j22", targetLabel: "Chuyên viên quảng cáo hiệu suất", reason: "Nội dung trùng lặp", detail: "Tin giống một tin đăng trước đó.", reporter: "Vũ Khánh Linh", at: daysFromNow(-8), status: "dismissed", resolution: "Đã kiểm tra, hai tin thuộc hai chi nhánh khác nhau." },
];
