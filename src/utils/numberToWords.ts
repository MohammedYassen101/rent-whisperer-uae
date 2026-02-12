const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const onesAr = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
const tensAr = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];

function convertHundredsEn(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${tens[t]}-${ones[o]}` : tens[t];
  }
  const h = Math.floor(n / 100);
  const rem = n % 100;
  return `${ones[h]} Hundred${rem ? ` and ${convertHundredsEn(rem)}` : ""}`;
}

function convertHundredsAr(n: number): string {
  if (n === 0) return "";
  if (n < 20) return onesAr[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${onesAr[o]} و${tensAr[t]}` : tensAr[t];
  }
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const hWord = h === 1 ? "مائة" : h === 2 ? "مائتان" : `${onesAr[h]} مائة`;
  return rem ? `${hWord} و${convertHundredsAr(rem)}` : hWord;
}

export function numberToWordsEn(amount: number): string {
  if (amount === 0) return "Zero AED";

  const whole = Math.floor(amount);
  const fils = Math.round((amount - whole) * 100);

  const scales = ["", "Thousand", "Million", "Billion"];
  let num = whole;
  const parts: string[] = [];
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const word = convertHundredsEn(chunk);
      parts.unshift(scales[scaleIndex] ? `${word} ${scales[scaleIndex]}` : word);
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  let result = parts.join(", ") + " AED";
  if (fils > 0) {
    result += ` and ${convertHundredsEn(fils)} Fils`;
  }
  return result;
}

export function numberToWordsAr(amount: number): string {
  if (amount === 0) return "صفر درهم";

  const whole = Math.floor(amount);
  const fils = Math.round((amount - whole) * 100);

  const scalesAr: string[][] = [
    [""],
    ["ألف", "ألفان", "آلاف", "ألف"],
    ["مليون", "مليونان", "ملايين", "مليون"],
    ["مليار", "ملياران", "مليارات", "مليار"],
  ];

  function getScaleAr(scaleIdx: number, chunk: number): string {
    if (scaleIdx === 0) return "";
    const s = scalesAr[scaleIdx];
    if (chunk === 1) return s[0];
    if (chunk === 2) return s[1];
    if (chunk >= 3 && chunk <= 10) return s[2];
    return s[3];
  }

  let num = whole;
  const parts: string[] = [];
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const scaleName = getScaleAr(scaleIndex, chunk);
      if (scaleIndex > 0 && chunk === 1) {
        parts.unshift(scaleName);
      } else if (scaleIndex > 0 && chunk === 2) {
        parts.unshift(scaleName);
      } else if (scaleName) {
        const word = convertHundredsAr(chunk);
        parts.unshift(`${word} ${scaleName}`);
      } else {
        parts.unshift(convertHundredsAr(chunk));
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  let result = parts.join(" و") + " درهم إماراتي";
  if (fils > 0) {
    result += ` و${convertHundredsAr(fils)} فلس`;
  }
  return result;
}
