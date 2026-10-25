CREATE DATABASE IF NOT EXISTS `YUNSEUL-HOME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `YUNSEUL-HOME`;

CREATE TABLE IF NOT EXISTS CONFIG (
  id TINYINT NOT NULL PRIMARY KEY,
  admin VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO CONFIG (id, admin) VALUES (1, '1324')
ON DUPLICATE KEY UPDATE admin = admin;

CREATE TABLE IF NOT EXISTS portfolio (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300) NOT NULL DEFAULT '',
  body MEDIUMTEXT NOT NULL,
  images TEXT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '💼',
  tone VARCHAR(80) NOT NULL DEFAULT '#d6e8ff,#e5d9ff',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  display CHAR(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300) NOT NULL DEFAULT '',
  body MEDIUMTEXT NOT NULL,
  images TEXT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#ffe3ec',
  emoji VARCHAR(16) NOT NULL DEFAULT '📌',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  display CHAR(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS qna (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL DEFAULT '익명',
  title VARCHAR(200) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  images TEXT NULL,
  answer MEDIUMTEXT NULL,
  answer_images TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL,
  display CHAR(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guestbook (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL DEFAULT '익명',
  body MEDIUMTEXT NOT NULL,
  images TEXT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '🐥',
  answer MEDIUMTEXT NULL,
  answer_images TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL,
  display CHAR(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO portfolio (title, subtitle, body, images, emoji, tone, created_at)
SELECT * FROM (
  SELECT '유튜브 영상 자동 생성·등록' AS title, '주제만 입력하면 대본·영상 제작부터 업로드까지' AS subtitle,
    '<p>주제 키워드만 입력하면 대본 작성, 음성·영상 편집, 썸네일 제작, 채널 업로드까지 이어서 처리하는 자동화 시스템이에요.</p><ul><li>주제 입력 한 번으로 대본 자동 생성</li><li>자막·음성·배경 영상 자동 편집</li><li>예약 시간에 맞춰 채널에 자동 업로드</li></ul>' AS body,
    '[]' AS images, '🎬' AS emoji, '#ffd1d1,#ffe9b8' AS tone, '2026-10-20 10:00:00' AS created_at
  UNION ALL SELECT '전자책 300쪽 자동 출판', '기획·집필·편집·표지까지 한 번에',
    '<p>기획, 목차, 집필, 교정, 편집, 표지까지 한 번에 진행해 300쪽 분량의 전자책을 완성하는 출판 파이프라인이에요.</p>',
    '[]', '📚', '#d6e8ff,#e5d9ff', '2026-10-21 10:00:00'
  UNION ALL SELECT '인스타·스레드 자동 게시', '문구와 이미지를 만들어 정해진 시간에 등록',
    '<p>문구와 이미지를 만들어 정해진 시간에 인스타그램과 스레드에 자동으로 올려 주는 예약 발행 시스템이에요.</p>',
    '[]', '📸', '#ffd6ea,#ffe3c2', '2026-10-22 10:00:00'
  UNION ALL SELECT '맞춤형 그룹웨어', '결재·일정·메신저를 한곳에',
    '<p>전자결재, 일정, 메신저를 한곳에 모은 사내 협업 시스템이에요. 회사의 업무 흐름에 맞춰 화면과 권한을 설계해요.</p>',
    '[]', '🏢', '#c9f1e4,#d6ecff', '2026-10-23 10:00:00'
  UNION ALL SELECT 'LIMS 실험실 정보 관리', '시료 접수부터 성적서 발행까지',
    '<p>시료 접수부터 시험 배정, 결과 입력, 성적서 발행까지 실험실의 전 과정을 이력으로 남기는 정보 관리 시스템이에요.</p>',
    '[]', '🧪', '#e2f5c8,#cfeeea', '2026-10-24 10:00:00'
  UNION ALL SELECT '보안 솔루션', '접근 통제와 로그 감사를 한눈에',
    '<p>접근 통제와 로그 감사를 한눈에 볼 수 있는 관제 대시보드예요. 누가 언제 무엇을 했는지 바로 확인할 수 있어요.</p>',
    '[]', '🛡️', '#d9dcff,#ffd9f0', '2026-10-25 10:00:00'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM portfolio LIMIT 1);

INSERT INTO board (title, subtitle, body, images, color, emoji, created_at)
SELECT * FROM (
  SELECT '홈페이지 오픈!' AS title, '작은 지구에 놀러 오신 것을 환영해요' AS subtitle,
    '<p>천천히 둘러보세요. 게시판 글을 누르면 이렇게 내용과 이미지가 보여요.</p><p><img src="/uploads/20261025/welcome.png" alt="환영 이미지" style="max-width:100%;height:auto;border-radius:12px"></p>' AS body,
    '["/uploads/20261025/welcome.png"]' AS images, '#ffe3ec' AS color, '🎉' AS emoji, '2026-10-23 09:00:00' AS created_at
  UNION ALL SELECT '쇼핑몰 오픈 이벤트', '오픈 기념 이야기를 영상으로도 남겨 두었어요',
    '<p>오픈 기념으로 전 상품 10% 할인 쿠폰을 드려요. 유튜브 링크를 넣으면 글 아래에서 영상이 재생돼요.</p><div class="yt-wrap"><iframe src="https://www.youtube-nocookie.com/embed/jNQXAC9IVRw?rel=0" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>',
    '[]', '#fff3b8', '🛍️', '2026-10-25 11:00:00'
  UNION ALL SELECT '정기 점검 안내', '새벽 사이 짧은 점검이 있을 수 있어요',
    '<p>11월 1일 새벽 2시부터 4시 사이 짧은 점검이 있을 수 있어요. 이용에 참고해 주세요.</p>',
    '[]', '#d6f1ff', '🔧', '2026-11-01 08:00:00'
  UNION ALL SELECT '꽃밭에 나비가 날아왔어요', '지구 곳곳에 꽃이 피었어요',
    '<p>나비와 고양이도 만나 보세요. 포스트잇을 누르면 이 내용이 열려요.</p>',
    '[]', '#e4ddff', '🦋', '2026-11-03 15:00:00'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM board LIMIT 1);

INSERT INTO qna (name, title, body, images, answer, answer_images, created_at, answered_at)
SELECT * FROM (
  SELECT '민수' AS name, '견적은 어떻게 받나요?' AS title,
    '<p>그룹웨어를 만들고 싶은데 견적은 어떻게 받나요?</p>' AS body, '[]' AS images,
    '<p>메일로 요구사항을 보내주시면 이틀 안에 견적서를 보내드려요.</p>' AS answer, '[]' AS answer_images,
    '2026-10-24 13:00:00' AS created_at, '2026-10-24 18:00:00' AS answered_at
  UNION ALL SELECT '하늘', '유지보수도 가능한가요?',
    '<p>납품 후 유지보수도 해 주시나요?</p>', '[]',
    '<p>네, 납품 후 3개월 무상 유지보수를 기본으로 드려요.</p>', '[]',
    '2026-10-26 10:00:00', '2026-10-26 16:00:00'
  UNION ALL SELECT '별이', '전자책 자동 출판이 궁금해요',
    '<p>300페이지 전자책은 얼마나 걸려서 만들어지나요?</p>', '[]',
    NULL, NULL,
    '2026-11-02 09:30:00', NULL
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM qna LIMIT 1);

INSERT INTO guestbook (name, body, images, emoji, created_at)
SELECT * FROM (
  SELECT '구름이' AS name, '<p>지구가 너무 귀여워요! 강아지랑 고양이도 좋아요.</p>' AS body, '[]' AS images, '☁️' AS emoji, '2026-10-25 12:00:00' AS created_at
  UNION ALL SELECT '바다', '<p>파도 소리 들으면서 구경했어요. 힐링 되네요.</p>', '[]', '🌊', '2026-10-27 19:00:00'
  UNION ALL SELECT '별똥별', '<p>UFO 보고 깜짝 놀랐어요. 또 올게요!</p>', '[]', '⭐', '2026-11-01 21:00:00'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM guestbook LIMIT 1);

ALTER TABLE qna ADD COLUMN IF NOT EXISTS display CHAR(1) NOT NULL DEFAULT 'Y';
ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS display CHAR(1) NOT NULL DEFAULT 'Y';
ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS answer MEDIUMTEXT NULL;
ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS answer_images TEXT NULL;
ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS answered_at DATETIME NULL;
ALTER TABLE board ADD COLUMN IF NOT EXISTS display CHAR(1) NOT NULL DEFAULT 'Y';
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS display CHAR(1) NOT NULL DEFAULT 'Y';

CREATE TABLE IF NOT EXISTS shop_stock (
  item_key VARCHAR(32) NOT NULL PRIMARY KEY,
  stock TINYINT NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS world_fx (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  item_key VARCHAR(32) NOT NULL,
  target VARCHAR(16) NULL,
  nx DOUBLE NULL,
  ny DOUBLE NULL,
  nz DOUBLE NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at DATETIME NOT NULL,
  KEY idx_end (ends_at)
);
INSERT IGNORE INTO shop_stock (item_key, stock) VALUES
('shell',1),('candle',1),('towel',1),('hat',1),('juice',1),('pop',1),('fluff',1);

CREATE TABLE IF NOT EXISTS shop_goods (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price INT NOT NULL,
  sale_price INT NULL,
  sale_from DATE NULL,
  sale_to DATE NULL,
  images TEXT NULL,
  link VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  display CHAR(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shop_consult (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  goods_id INT NOT NULL,
  goods_name VARCHAR(200) NOT NULL,
  contact VARCHAR(200) NOT NULL,
  name VARCHAR(80) NOT NULL,
  job_title VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen CHAR(1) NOT NULL DEFAULT 'N',
  KEY idx_seen (seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
