import type { Metadata, Viewport } from 'next';
import '@fontsource/bagel-fat-one/400.css';
import '@fontsource/gowun-dodum/400.css';
import './globals.css';
export const metadata: Metadata = { title: '눈길 발자국', description: '펭귄과 함께 걷고 듣는 아티큘레이션 학습 놀이터. 스타카토, 레가토, 악센트, 테누토, 마르카토를 배워요.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#E9EEF8' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>;}
