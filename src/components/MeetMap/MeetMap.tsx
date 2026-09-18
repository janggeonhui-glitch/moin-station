import 'leaflet/dist/leaflet.css';
import './MeetMap.css';
import L from 'leaflet';
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { MEMBER_COLORS } from '../../data/lines';
import { STATIONS } from '../../data/stations';
import type { ResolvedTheme } from '../../hooks/useTheme';
import type { Candidate, LatLng, Member } from '../../types';

/**
 * OpenStreetMap 표준 타일 (API 키 불필요).
 * 원본 타일은 색이 강해서 CSS 필터로 채도를 낮추고, 다크 모드는 반전해 앱 톤에 맞춘다 — MeetMap.css 참고
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const SEOUL: [number, number] = [37.55, 126.99];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const memberIcon = (m: Member) =>
  L.divIcon({
    className: 'mm-member',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<span class="mm-member__dot" style="background:${MEMBER_COLORS[m.colorIndex]}">${escapeHtml(m.name.slice(0, 1))}</span><span class="mm-label">${escapeHtml(m.name)} · ${escapeHtml(m.station)}</span>`,
  });

const areaIcon = (name: string, selected: boolean) => {
  const size = selected ? 26 : 16;
  return L.divIcon({
    className: selected ? 'mm-area is-selected' : 'mm-area',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="mm-area__dot"></span><span class="mm-label">${escapeHtml(name)}</span>`,
  });
};

const minutesIcon = (text: string) =>
  L.divIcon({ className: 'mm-min', iconSize: [0, 0], html: `<span>${escapeHtml(text)}</span>` });

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 멤버·후보 좌표가 바뀌면 화면 범위를 다시 맞춘다 (배열 참조가 아니라 좌표 시그니처로 비교).
 * 레이아웃 변화로 지도 컨테이너 크기가 바뀌어도 Leaflet은 스스로 알지 못하므로
 * ResizeObserver로 invalidateSize 후 다시 맞춘다.
 */
function FitBounds({ points }: { points: readonly LatLng[] }) {
  const map = useMap();
  const signature = points.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
  const latest = useRef(points);

  useEffect(() => {
    latest.current = points;
  });

  const fit = useCallback(
    (animate: boolean) => {
      const pts = latest.current;
      if (!pts.length) return;
      const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: 13, animate });
    },
    [map],
  );

  // 첫 배치는 애니메이션 없이 바로 맞추고(초기 줌 튐 방지), 이후 변경만 부드럽게 이동
  const hasFitted = useRef(false);
  useEffect(() => {
    fit(hasFitted.current && !prefersReducedMotion());
    hasFitted.current = true;
  }, [fit, signature]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
      fit(false);
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, fit]);

  return null;
}

interface Props {
  members: readonly Member[];
  candidates: readonly Candidate[];
  selected: Candidate | undefined;
  onSelect: (areaId: string) => void;
  theme: ResolvedTheme;
}

export default function MeetMap({ members, candidates, selected, onSelect, theme }: Props) {
  const located = useMemo(
    () =>
      members.flatMap((member) => {
        const pos = STATIONS.get(member.station);
        return pos ? [{ member, pos, icon: memberIcon(member) }] : [];
      }),
    [members],
  );
  const points = useMemo(() => [...located.map((x) => x.pos), ...candidates.map((c) => c.area)], [located, candidates]);
  const selectedId = selected?.area.id;
  const areaMarkers = useMemo(
    () => candidates.map((c) => ({ area: c.area, icon: areaIcon(c.area.name, c.area.id === selectedId) })),
    [candidates, selectedId],
  );

  return (
    <MapContainer className="meet-map" center={SEOUL} zoom={11} scrollWheelZoom={false}>
      <TileLayer key={theme} url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} className={`mm-tiles mm-tiles--${theme}`} />
      <FitBounds points={points} />

      {selected &&
        located.map(({ member, pos }) => {
          const leg = selected.legs.find((l) => l.member.id === member.id);
          // 소요 시간 라벨은 출발지 쪽(40% 지점)에 둬서 도착역 이름과 겹치지 않게
          const labelAt: [number, number] = [
            pos.lat + (selected.area.lat - pos.lat) * 0.4,
            pos.lng + (selected.area.lng - pos.lng) * 0.4,
          ];
          return (
            <Fragment key={member.id}>
              <Polyline
                positions={[
                  [pos.lat, pos.lng],
                  [selected.area.lat, selected.area.lng],
                ]}
                interactive={false}
                pathOptions={{
                  color: MEMBER_COLORS[member.colorIndex],
                  weight: 4,
                  opacity: 0.85,
                  lineCap: 'round',
                  dashArray: leg?.walk ? '2 8' : undefined,
                }}
              />
              {leg && !leg.walk && (
                <Marker position={labelAt} icon={minutesIcon(`${leg.minutes}분`)} interactive={false} keyboard={false} />
              )}
            </Fragment>
          );
        })}

      {areaMarkers.map(({ area, icon }) => (
        <Marker
          key={area.id}
          position={[area.lat, area.lng]}
          icon={icon}
          title={area.name}
          alt={`${area.name} 선택`}
          zIndexOffset={area.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(area.id) }}
        />
      ))}

      {located.map(({ member, pos, icon }) => (
        <Marker
          key={member.id}
          position={[pos.lat, pos.lng]}
          icon={icon}
          zIndexOffset={500}
          interactive={false}
          keyboard={false}
        />
      ))}
    </MapContainer>
  );
}
