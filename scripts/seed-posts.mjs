import Post from '../src/lib/models/post.model.js';
import { connect } from '../src/lib/mongodb/mongoose.js';

const seedPosts = [
  {
    title: 'Con Nguoi Giua Nhip Song Cham: Cach Chung Ta Tim Lai Su Lang Nghe',
    slug: 'con-nguoi-giua-nhip-song-cham-cach-chung-ta-tim-lai-su-lang-nghe',
    category: 'people',
    image: '/blog-images/people-editorial.svg',
    content: `
      <h1>Con nguoi giua nhip song cham: cach chung ta tim lai su lang nghe</h1>
      <p>Giua mot thoi dai ma moi thong bao deu tranh nhau su chu y, lang nghe da tro thanh mot ky nang hien quy. Chung ta noi nhieu hon, phan hoi nhanh hon, nhung khong phai luc nao cung thuc su hieu nhau sau hon. O trung tam cua moi moi quan he ben vung, du la trong gia dinh, cong so hay cong dong, van la kha nang dung lai de nghe du dieu nguoi khac dang noi va ca dieu ho chua kip noi thanh loi.</p>
      <p>Con nguoi hien dai thuong bi cuon vao nhip song nang suat, noi ma toc do duoc ton vinh hon su sau sac. Dieu nay tao ra mot nghich ly: chung ta ket noi lien tuc tren nen tang so, nhung de xay dung su dong cam ngoai doi thuc lai can nhieu thoi gian hon bao gio het. Mot cuoc tro chuyen co chat luong khong can qua dai, nhung can su hien dien tron ven, can anh mat tap trung, can su kien nhan va can ca su ton trong doi voi trai nghiem cua nguoi doi dien.</p>
      <p>Lang nghe khong chi la ky nang giao tiep, ma con la mot thai do song. Khi mot dua tre duoc lang nghe, em hoc cach tin vao gia tri cua tieng noi ban than. Khi nguoi gia duoc lang nghe, ho cam nhan ro hon rang ky uc va kinh nghiem song cua minh van con duoc tran trong. Khi nhung con nguoi trong mot tap the biet lang nghe nhau, xung dot khong bien mat, nhung co them co hoi duoc hoa giai bang su hieu biet thay vi phan xet.</p>
      <p>Trong boi canh do, song cham khong co nghia la song cham tien do, ma la cham lai dung luc de khong danh mat pham chat cua cac moi lien he. Mot bua com khong dien thoai, mot cuoc di bo khong vo i, mot gio ngoi cung nhau ma khong can lap tuc dua ra loi khuyen, do la nhung khoanh khac nho nhung co kha nang han gan lon. Chung nhac chung ta rang con nguoi can duoc thay, duoc nghe va duoc hieu de that su cam thay minh thuoc ve mot noi nao do.</p>
      <p>Co le, gia tri quan trong nhat cua viec lang nghe la no tao ra khong gian cho su tu te xuat hien. Trong mot the gioi de bi chia cat boi quan diem, toc do va ap luc, kha nang lang nghe tro thanh nen tang cho doi thoai van minh va cho mot xa hoi nhan van hon. Bat dau tu nhung dieu rat nho, chung ta co the dua su lang nghe tro lai thanh mot phan tu nhien trong doi song hang ngay, va tu do, dua con nguoi den gan nhau hon mot cach that su ben vung.</p>
    `,
  },
  {
    title: 'Dong Vat Hoang Da Va Bai Hoc Ve Su Chung Song Co Trach Nhiem',
    slug: 'dong-vat-hoang-da-va-bai-hoc-ve-su-chung-song-co-trach-nhiem',
    category: 'animals',
    image: '/blog-images/animals-editorial.svg',
    content: `
      <h1>Dong vat hoang da va bai hoc ve su chung song co trach nhiem</h1>
      <p>Dong vat hoang da khong chi la mot phan cua canh quan tu nhien ma con la thanh phan cot loi giu can bang cho he sinh thai. Moi loai deu dam nhan mot vai tro rieng: co loai phat tan hat giong, co loai kiem soat quan the con moi, co loai tao dieu kien cho dat, rung va nguon nuoc duoc tai tao theo cach ma con nguoi kho co the thay the. Khi mot mat xich bien mat, nhung xao tron sinh thai thuong lan rong va de lai hau qua lau dai.</p>
      <p>Nhung nam gan day, nhan thuc cua cong chung ve bao ton da co nhieu chuyen bien tich cuc, song nhieu thach thuc van hien huu. Mat sinh canh, o nhiem moi truong, buon ban dong vat trai phep va su mo rong do thi dang ep nhieu loai vao tinh the mong manh. Dieu dang lo la nhung ton that nay thuong dien ra am tham, khong tao thanh tieng dong lon, nhung tich tuy dan thanh mot su suy giam kho dao nguoc.</p>
      <p>De chung song co trach nhiem voi dong vat, viec dau tien la thay doi cach nhin. Chung khong ton tai de trang tri cho nhu cau cua con nguoi, ma la nhung sinh the co gia tri noi tai va quyen duoc sinh ton trong moi truong phu hop voi tap tinh cua chung. Khi ta ton trong khoang cach an toan voi dong vat hoang da, han che tieu thu cac san pham co nguy co tiep tay cho khai thac, va ung ho cac mo hinh du lich co dao duc, ta dang gop phan vao mot he thong ton trong su song theo nghia that.</p>
      <p>Ben canh do, giao duc ve bao ton can bat dau tu doi song thuong nhat. Tre em can duoc nhin thay dong vat khong chi qua hinh anh de thuong, ma qua nhung cau chuyen ve moi lien he giua chung voi rung, song, bien va khi hau. Nguoi lon cung can duoc cap nhat de hieu rang moi lua chon tieu dung, moi cach xu ly rac thai, hay moi hanh vi voi thien nhien deu co the tac dong toi khong gian song cua muon loai khac.</p>
      <p>Chung song co trach nhiem, suy cho cung, la mot hinh thuc truong thanh cua van minh. No the hien o kha nang con nguoi biet tiet che quyen luc, biet ton trong gioi han va biet chap nhan rang hanh tinh nay khong chi thuoc ve rieng minh. Khi hoc cach song can bang hon voi dong vat, chung ta dong thoi hoc cach song khiem nhuong va ben vung hon voi chinh the gioi tu nhien ma minh dang phu thuoc vao moi ngay.</p>
    `,
  },
  {
    title: 'Thien Nhien Sau Con Mua: Ve Dep Goi Ra Y Thuc Bao Ve Moi Truong',
    slug: 'thien-nhien-sau-con-mua-ve-dep-goi-ra-y-thuc-bao-ve-moi-truong',
    category: 'environment',
    image: '/blog-images/nature-editorial.svg',
    content: `
      <h1>Thien nhien sau con mua: ve dep goi ra y thuc bao ve moi truong</h1>
      <p>Sau mot con mua lon, canh vat thuong hien ra voi mot dien mao khac. Mat dat diu lai, khong khi trong hon, tan la sang len duoi anh sang moi, va nhung am thanh nho cua su song tro nen ro ret den bat ngo. Chinh trong khoanh khac ay, nhieu nguoi nhan ra rang thien nhien khong chi dep o nhung diem den noi tieng, ma dep ngay trong cach no am tham hoi phuc va tai tao moi ngay.</p>
      <p>Ve dep cua thien nhien, tuy nhien, khong nen chi duoc ngam nhin nhu mot phong nen de thu gian. No cung la loi nhac nho ve tinh de ton thuong cua moi truong. Mot dong suoi trong se de dang bien thanh dong nuoc duc neu rac thai va nuoc thai khong duoc xu ly dung cach. Mot khu rung xanh co the nhanh chong tro nen mong manh truoc suc ep cua khai thac qua muc, xay dung thieu kiem soat va nhung bien doi khi hau dien ra ngay cang cuc doan.</p>
      <p>Ly do bao ve moi truong khong chi nam o nhung con so khoa hoc, ma con nam trong trai nghiem song rat doi thuong. Moi nguoi can khong khi sach de tho, can cay xanh de giam nong, can nguon nuoc on dinh de sinh hoat, va can nhung he sinh thai lanh manh de ho tro nong nghiep, suc khoe va sinh ke. Khi mot canh quan bi suy thoai, dieu mat di khong chi la my quan, ma la chat luong song cua ca cong dong.</p>
      <p>Vi vay, y thuc bao ve moi truong can duoc nuoi duong tu nhung hanh dong nho nhat. Giam rac thai nhua dung mot lan, ton trong khong gian xanh cong cong, lua chon cac san pham than thien hon, tiet kiem nuoc va nang luong, hay don gian la khong vo tinh pha vo mot khoang xanh nho trong xom pho, tat ca deu co gia tri. Moi thay doi nho, khi duoc lap lai boi nhieu nguoi, se tro thanh mot chuyen dong lon hon.</p>
      <p>Thien nhien sau con mua dep boi no nhac ta ve kha nang tai sinh cua trai dat. Nhung kha nang ay khong vo han. Neu biet dung lai de quan sat, con nguoi se thay ro rang viec bao ve moi truong khong phai la mot lua chon xa xi, ma la dieu kien can thiet de giu lai nhung dang dep, nhung nguon song va nhung co hoi phat trien ben vung cho hien tai va ca tuong lai.</p>
    `,
  },
];

async function seed() {
  await connect();

  for (const post of seedPosts) {
    await Post.findOneAndUpdate(
      { slug: post.slug },
      {
        $set: {
          title: post.title,
          content: post.content,
          image: post.image,
          category: post.category,
        },
        $setOnInsert: {
          slug: post.slug,
          userId: 'seed-script',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${post.slug}`);
  }

  console.log('Done seeding 3 blog posts.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
