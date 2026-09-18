import type { LineId } from '../types';

/** 수도권 전철 노선 공식 색상 */
export const LINE_COLORS: Record<LineId, string> = {
  '1': '#0052A4',
  '2': '#00A84D',
  '3': '#EF7C1C',
  '4': '#00A5DE',
  '5': '#996CAC',
  '6': '#CD7C2F',
  '7': '#747F00',
  '8': '#E6186C',
  '9': '#BDB092',
  신분당: '#D4003B',
  수인분당: '#F5A200',
  경의중앙: '#77C4A3',
  공항: '#0090D2',
  인천1: '#7CA8D5',
  우이신설: '#B7C452',
  신림선: '#6789CA',
  김포골드: '#A17800',
  'GTX-A': '#9A6292',
  SRT: '#651C5C',
  경춘: '#0C8E72',
};

const LINE_SHORT: Record<LineId, string> = {
  신분당: '신분',
  수인분당: '분당',
  경의중앙: '경의',
  인천1: '인천',
  우이신설: '우이',
  신림선: '신림',
  김포골드: '김포',
  'GTX-A': 'GTX',
};

export const lineShort = (id: LineId) => LINE_SHORT[id] ?? id;
export const lineColor = (id: LineId) => LINE_COLORS[id] ?? '#777777';
export const lineLabel = (id: LineId) => (/^\d$/.test(id) ? `${id}호선` : id === '공항' ? '공항철도' : `${id}선`);

/** 멤버 아바타 색 — 노선색에서 가져와 "각자 자기 노선" 느낌을 준다 */
export const MEMBER_COLORS = [
  '#0052A4',
  '#EF7C1C',
  '#996CAC',
  '#E6186C',
  '#0090D2',
  '#747F00',
  '#CD7C2F',
  '#D4003B',
  '#0C8E72',
  '#651C5C',
] as const;

export const MAX_MEMBERS = MEMBER_COLORS.length;
