-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS fine_the_answer

-- 사용자 테이블 생성
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    name VARCHAR(10) NOT NULL,           
    play_time INT NOT NULL DEFAULT 0     
);

-- 퀴즈 테이블 생성
CREATE TABLE quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem VARCHAR(255) NOT NULL,
    quiz_type ENUM('normal', 'horror') NOT NULL,
    choices TEXT,
    answer VARCHAR(255)
);

-- 퀴즈 데이터 삽입
INSERT INTO quiz (id, problem, quiz_type, choices, answer) VALUES
(1, '이집트의 수도는?', 'normal', '알렉산드리아,카이로,룩소르,아스완', '카이로'),
(2, '세계에서 가장 큰 사막은?', 'normal', '사하라,고비,칼라하리,남극', '남극'),
(3, 'e-mail에서 e는 무엇의 약자?', 'normal', 'electronic,easy,effirient,express', 'electronic'),
(4, '태양계에서 가장 큰 행성은?', 'normal', '지구,화성,목성,금성', '목성'),
(5, '우리나라에서 가장 긴 강은?', 'normal', '한강,낙동강,금강,영산강', '낙동강'),
(6, '지금 뒤에 서 있는 것은 몇 명?', 'horror', '아무도 없다,1명,2명,네가 보기 전까지 알 수 없다.', '네가 보기 전까지 알 수 없다.'),
(7, '자고 일어났을 때 가장 두려운 상황?', 'horror', '창문에 누군가가 당신을 기다린다,모두가 나를 바라보고 있다,천장에 있는 내 얼굴,방 안에서 시체 냄새가 난다', '나를 바라보고 있다'),
(8, '화장실 거울 앞', 'horror', '내 눈이 검게 변해있다,뒤에서 숨소리가 들린다,수도꼭지에서 검붉은 것이 나온다,칸 안에서 웃음소리가 들린다', '뒤에서 숨소리가 들린다'),
(9, 'Open the Door!', 'horror', NULL, NULL),
(10, 'Please answer me!', 'horror', NULL, NULL),
(11, '방금 들린 소리?', 'horror', '네 번 두드리는 소리,낮게 웃는 소리,이름을 부르는 소리,바닥을 기어다니는 소리', '바닥을 기어다니는 소리'),
(12, '제 말이 들리시나요? 살려줘', 'horror', '그들이 오고 있습니다,,저 말을 믿지 마세요,', '그들이 오고 있습니다'),
(13, '문제를 읽는 동안, 자리를 옮긴 것?', 'horror', '창문 앞에 있던 사람,방문 옆에 걸린 그림자,화면 속에서 눈을 깜빡인 인물,책상 밑에서 움직이는 무언가', '창문 앞에 있던 사람'),
(14, '다음 중, 아직도 이 방에 있는 것?', 'horror', '아무도 없다,너의 그림자,밖에서 들리던 발자국 소리,꺼진 TV 속 사람', '아무도 없다'),
(15, '이 문제에서 잘못된 것', 'horror', '선택지가 하나 더 있는 것같다,당신이 이미 선택을 끝낸거같다,أحتاج إلى التبرز,문제를 보는 것이 아닌 벽을 보고 있다', '문제를 보는 것이 아닌 벽을 보고 있다');

-- 에셋 테이블 생성
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL,
    category ENUM('image', 'jump_scare', 'audio', 'scary-audio') NOT NULL,
    file_name VARCHAR(100) NOT NULL
);

-- 에셋 데이터 삽입
INSERT INTO assets (id, file_path, category, file_name) VALUES
(1, '/assets/images/main-page.png', 'image', 'main-page.png'),
(2, '/assets/images/kitty-main.png', 'image', 'kitty-main.png'),
(3, '/assets/images/quiz-background.png', 'image', 'quiz-background.png'),
(4, '/assets/images/kitty-crying.png', 'image', 'kitty-crying.png'),
(5, '/assets/images/main-page-weird.png', 'image', 'main-page-weird.png'),
(6, '/assets/images/quiz-noise.png', 'image', 'quiz-noise.png'),
(7, '/assets/images/telephone.png', 'image', 'telephone.png'),
(8, '/assets/images/door.png', 'image', 'door.png'),
(9, '/assets/images/horror-background-01.png', 'image', 'horror-background-01.png'),
(10, '/assets/images/horror-background-02.png', 'image', 'horror-background-02.png'),
(11, '/assets/images/horror-background-03.png', 'image', 'horror-background-03.png'),
(12, '/assets/images/horror-background-04.png', 'image', 'horror-background-04.png'),
(13, '/assets/jump-scares/Calling-man.png', 'jump_scare', 'Calling-man.png'),
(14, '/assets/jump-scares/Door-man.png', 'jump_scare', 'Door-man.png'),
(15, '/assets/jump-scares/ending-jump-scare.png', 'jump_scare', 'ending-jump-scare.png'),
(16, '/assets/jump-scares/jump-scare-1.png', 'jump_scare', 'jump-scare-1.png'),
(17, '/assets/jump-scares/jump-scare-2.png', 'jump_scare', 'jump-scare-2.png'),
(18, '/assets/jump-scares/jump-scare-3.png', 'jump_scare', 'jump-scare-3.png'),
(19, '/assets/jump-scares/jump-scare-4.png', 'jump_scare', 'jump-scare-4.png'),
(20, '/assets/jump-scares/jump-scare-5.png', 'jump_scare', 'jump-scare-5.png'),
(21, '/assets/jump-scares/jump-scare-6.png', 'jump_scare', 'jump-scare-6.png'),
(22, '/assets/jump-scares/jump-scare-7.png', 'jump_scare', 'jump-scare-7.png'),
(23, '/assets/jump-scares/jump-scare-8.png', 'jump_scare', 'jump-scare-8.png'),
(24, '/assets/jump-scares/jump-scare-9.png', 'jump_scare', 'jump-scare-9.png'),
(25, '/assets/audios/Baby-crying.mp3', 'audio', 'Baby-crying.mp3'),
(26, '/assets/audios/click.mp3', 'audio', 'click.mp3'),
(27, '/assets/audios/door-knocking.mp3', 'audio', 'door-knocking.mp3'),
(28, '/assets/audios/horror-sound.mp3', 'audio', 'horror-sound.mp3'),
(29, '/assets/audios/main-sound.mp3', 'audio', 'main-sound.mp3'),
(30, '/assets/audios/telephone.mp3', 'audio', 'telephone.mp3'),
(31, '/assets/audios/Sound2.mp3', 'scary-audio', 'Sound2.mp3'),
(32, '/assets/audios/Sound3.mp3', 'scary-audio', 'Sound3.mp3');
