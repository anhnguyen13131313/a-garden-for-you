/** Single source of truth for all user-approved romantic copy. Edit here first. */
export interface MemoryFlower {
  id: 'little-things' | 'funny-moment' | 'six-years' | 'wishes' | 'one-more-thing';
  emoji: string;
  label: string;
  englishLabel: string;
  message: string;
}

export const gardenContent = {
  occasion: '20/10/2026',
  heroEyebrow: '20 OCTOBER · MADE WITH LOVE',
  heroTitle: 'For My Favorite Girl.',
  heroSubtitle: 'Anh có một món quà nhỏ dành cho bé iu.',
  invitationHint: 'Chạm vào bông hoa nhé',
  firstBloom: {
    eyebrow: '01 · THE FIRST BLOOM',
    title: 'Anh định tặng em một bó hoa...',
    message: 'Nhưng anh nghĩ, một bó hình như chưa đủ.',
  },
  garden: {
    eyebrow: '02 · YOUR OWN GARDEN',
    title: 'Nên anh tặng em cả một khu vườn.',
    message: 'Ở đây, bông hoa nào cũng là của em hết. 🌷',
  },
  memories: {
    eyebrow: '03 · FIVE LITTLE FLOWERS',
    title: 'Có 5 bông hoa hơi đặc biệt...',
    message: 'Chạm từng bông để nghe anh nói điều này nhé.',
  },
  wish: {
    eyebrow: '04 · MY WISH FOR YOU',
    title: 'Anh mong em luôn hạnh phúc.',
    message: 'Không chỉ hôm nay, mà cả những ngày bình thường nhất. Anh mong bé luôn được yêu thương và làm những điều mình thích.',
  },
  finale: {
    eyebrow: '05 · FOREVER BLOOMING',
    title: 'Happy 20/10, bé iu! 💗',
    message: 'Cảm ơn em vì 6 năm qua. Anh yêu em nhiều lắm.',
    signature: 'Forever, your boy. ♥',
  },
} as const;

export const memoryFlowers: readonly MemoryFlower[] = [
  {
    id: 'little-things', emoji: '🌷', label: 'Điều anh thích ở em',
    englishLabel: 'THE LITTLE THINGS I LOVE',
    message: 'Anh thích cái cách em hay la anh, đôi khi làm anh sợ muốn xỉu luôn =))) Nhưng rồi cuối cùng em vẫn luôn tha thứ và bỏ qua cho anh. Anh thương em vì những điều nhỏ bé như vậy đó. ❤️',
  },
  {
    id: 'funny-moment', emoji: '🌸', label: 'Kỷ niệm của tụi mình',
    englishLabel: 'OUR FUNNY LITTLE MOMENTS',
    message: 'Anh nhớ những lần hai đứa mình đi chơi, đang nói chuyện vui vẻ bình thường, tự nhiên em giận anh ngang =))) Mà anh thì ngơ ngác chẳng hiểu mình đã làm gì sai. Nghĩ lại thấy vừa buồn cười vừa đáng yêu ghê. ❤️',
  },
  {
    id: 'six-years', emoji: '🌹', label: 'Lời cảm ơn',
    englishLabel: 'SIX YEARS WITH YOU',
    message: 'Cảm ơn bé iu vì đã luôn bên cạnh anh suốt 6 năm qua. Sáu năm có biết bao nhiêu chuyện vui buồn, có cả những lần giận dỗi nữa, nhưng cuối cùng tụi mình vẫn có nhau. Anh thật sự trân trọng điều đó. ❤️',
  },
  {
    id: 'wishes', emoji: '🌼', label: 'Lời chúc 20/10',
    englishLabel: 'A SPECIAL DAY FOR YOU',
    message: 'Chúc bé iu của anh một ngày 20/10 thật tuyệt vời nhaaa! 🌷 Anh mong bé lúc nào cũng vui vẻ, hạnh phúc, làm được mọi điều mình muốn và luôn cười thật nhiều. Yêu bé lắmmm! ❤️',
  },
  {
    id: 'one-more-thing', emoji: '💐', label: 'Điều anh muốn nói',
    englishLabel: 'JUST ONE MORE THING',
    message: 'Anh không biết phải nói gì nhiều nữa, chỉ muốn nói là anh yêu em nhiều lắm. Cảm ơn em vì đã là bé iu của anh. Mong rằng tụi mình sẽ còn bên nhau thật lâu, cùng nhau trải qua thật nhiều ngày 20/10 nữa nhé. ❤️',
  },
];
