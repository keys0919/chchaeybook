export interface BookInfo {
  title: string;
  author: string;
}

export async function lookupBookByISBN(isbn: string): Promise<BookInfo | null> {
  const clientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch(
    `https://openapi.naver.com/v1/search/book.json?query=isbn:${isbn}&display=1`,
    {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    }
  );
  if (!res.ok) return null;

  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return null;

  // 네이버 응답의 HTML 태그 제거 (<b>, </b> 등)
  const strip = (s: string) => s.replace(/<[^>]+>/g, '').trim();

  return {
    title: strip(item.title ?? ''),
    author: strip(item.author ?? ''),
  };
}
